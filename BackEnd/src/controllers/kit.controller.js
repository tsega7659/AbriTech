const prisma = require('../config/prisma');
const crypto = require('crypto');

// Safe character set excluding ambiguous characters (0, O, 1, I)
const CHARSET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

/**
 * Generate a single unique, human-friendly key formatted as ATK1-XXXX-XXXX
 */
const generateFormattedKey = () => {
    let part1 = '';
    let part2 = '';
    const bytes = crypto.randomBytes(8);
    for (let i = 0; i < 4; i++) {
        part1 += CHARSET[bytes[i] % CHARSET.length];
        part2 += CHARSET[bytes[i + 4] % CHARSET.length];
    }
    return `ATK1-${part1}-${part2}`;
};

/**
 * STUDENT: Redeem an activation key
 * POST /api/kits/activate
 */
const activateKey = async (req, res) => {
    try {
        const { key } = req.body;
        const userId = req.user?.userId;

        if (!key) {
            return res.status(400).json({ message: 'Activation key is required' });
        }

        const cleanKey = key.trim().toUpperCase();

        // 1. Find the student record for this user
        const student = await prisma.student.findUnique({
            where: { userId: BigInt(userId) }
        });

        if (!student) {
            return res.status(403).json({ message: 'Only registered students can activate kits' });
        }

        // 2. Atomic Transaction
        const result = await prisma.$transaction(async (tx) => {
            const keyRecord = await tx.activationKey.findUnique({
                where: { key: cleanKey },
                include: {
                    kit: { include: { course: true } },
                },
            });

            if (!keyRecord) {
                throw { status: 404, message: "Invalid activation key. Please check your spelling." };
            }

            if (keyRecord.status === "redeemed") {
                throw { status: 400, message: "This activation key has already been redeemed." };
            }

            if (keyRecord.status === "revoked") {
                throw { status: 400, message: "This activation key has been revoked by an administrator." };
            }

            if (keyRecord.expiresAt && keyRecord.expiresAt < new Date()) {
                throw { status: 400, message: "This activation key has expired." };
            }

            if (!keyRecord.kit?.course) {
                throw { status: 400, message: "This kit is not currently linked to an active course. Please contact support or your instructor." };
            }

            // Check if student is already enrolled in this course
            const existingEnrollment = await tx.enrollment.findFirst({
                where: {
                    studentId: student.id,
                    courseId: keyRecord.kit.course.id,
                    status: "active",
                },
            });

            if (existingEnrollment) {
                throw { status: 400, message: "You are already enrolled in this course! This key was not used." };
            }

            // Mark key as redeemed
            await tx.activationKey.update({
                where: { id: keyRecord.id },
                data: {
                    status: "redeemed",
                    redeemedByStudentId: student.id,
                    redeemedAt: new Date(),
                },
            });

            // Create active enrollment
            await tx.enrollment.create({
                data: {
                    studentId: student.id,
                    courseId: keyRecord.kit.course.id,
                    status: "active",
                },
            });

            return { course: keyRecord.kit.course };
        });

        return res.status(200).json({
            success: true,
            message: 'Kit activated successfully! You are now enrolled in the course.',
            course: {
                id: result.course.id.toString(),
                name: result.course.name,
            }
        });
    } catch (error) {
        console.error('Error activating kit:', error);
        return res.status(error.status || 500).json({ message: error.message || 'Server error during activation' });
    }
};

/**
 * ADMIN: Create a new physical kit definition
 * POST /api/kits
 */
const createKit = async (req, res) => {
    try {
        const { name, description, courseId } = req.body;
        if (!name || !courseId) {
            return res.status(400).json({ message: 'Kit name and courseId are required' });
        }

        const course = await prisma.course.findUnique({
            where: { id: BigInt(courseId) }
        });

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        const newKit = await prisma.kit.create({
            data: {
                name: name.trim(),
                description: (description || '').trim(),
                course: {
                    connect: { id: BigInt(courseId) }
                }
            },
            include: { course: true }
        });

        return res.status(201).json({
            success: true,
            kit: {
                id: newKit.id.toString(),
                name: newKit.name,
                description: newKit.description,
                courseId: newKit.courseId.toString(),
                courseName: newKit.course.name,
                createdAt: newKit.createdAt
            }
        });
    } catch (error) {
        console.error('Error creating kit:', error);
        return res.status(500).json({ message: 'Failed to create kit', error: error.message });
    }
};

/**
 * ADMIN: Fetch all kits with their course and statistics
 * GET /api/kits
 */
const getAllKits = async (req, res) => {
    try {
        const kits = await prisma.kit.findMany({
            include: {
                course: true,
                keys: {
                    select: { status: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        const formatted = kits.map(k => {
            const totalKeys = k.keys.length;
            const redeemedKeys = k.keys.filter(key => key.status === 'redeemed').length;
            const unusedKeys = k.keys.filter(key => key.status === 'unused').length;
            return {
                id: k.id.toString(),
                name: k.name,
                description: k.description,
                courseId: k.courseId ? k.courseId.toString() : null,
                courseName: k.course?.name || 'Unlinked (No Course)',
                createdAt: k.createdAt,
                stats: {
                    totalKeys,
                    redeemedKeys,
                    unusedKeys
                }
            };
        });

        return res.status(200).json(formatted);
    } catch (error) {
        console.error('Error fetching kits:', error);
        return res.status(500).json({ message: 'Failed to fetch kits', error: error.message });
    }
};

/**
 * ADMIN: Update a kit (e.g. re-link to a new course, change name/description)
 * PATCH /api/kits/:id
 */
const updateKit = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, courseId } = req.body;

        const kit = await prisma.kit.findUnique({
            where: { id: BigInt(id) }
        });

        if (!kit) {
            return res.status(404).json({ message: 'Kit not found' });
        }

        const dataToUpdate = {};
        if (name) dataToUpdate.name = name.trim();
        if (description !== undefined) dataToUpdate.description = description.trim();

        if (courseId !== undefined) {
            if (courseId) {
                const course = await prisma.course.findUnique({
                    where: { id: BigInt(courseId) }
                });
                if (!course) {
                    return res.status(404).json({ message: 'Target course not found' });
                }
                dataToUpdate.course = { connect: { id: BigInt(courseId) } };
            } else {
                dataToUpdate.course = { disconnect: true };
            }
        }

        const updated = await prisma.kit.update({
            where: { id: BigInt(id) },
            data: dataToUpdate,
            include: { course: true }
        });

        // If newly linked to a course, also sync any unassigned batches containing this kit's keys
        if (courseId) {
            await prisma.batch.updateMany({
                where: {
                    keys: { some: { kitId: BigInt(id) } },
                    courseId: null
                },
                data: { courseId: BigInt(courseId) }
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Kit updated successfully',
            kit: {
                id: updated.id.toString(),
                name: updated.name,
                description: updated.description,
                courseId: updated.courseId ? updated.courseId.toString() : null,
                courseName: updated.course?.name || 'Unlinked (No Course)',
                createdAt: updated.createdAt
            }
        });
    } catch (error) {
        console.error('Error updating kit:', error);
        return res.status(500).json({ message: 'Failed to update kit', error: error.message });
    }
};

/**
 * ADMIN: Generate a batch of keys for a kit
 * POST /api/kits/batches/generate
 */
const generateBatch = async (req, res) => {
    try {
        const { kitId, name, description, quantity, expiresAt } = req.body;

        const count = parseInt(quantity, 10);
        if (!kitId || !count || count < 1 || count > 1000) {
            return res.status(400).json({ message: 'Valid kitId and quantity between 1 and 1000 are required' });
        }

        const kit = await prisma.kit.findUnique({
            where: { id: BigInt(kitId) },
            include: { course: true }
        });

        if (!kit) {
            return res.status(404).json({ message: 'Kit not found' });
        }

        // Generate batch inside transaction
        const result = await prisma.$transaction(async (tx) => {
            // 1. Create Batch record
            const batch = await tx.batch.create({
                data: {
                    name: (name || `Batch for ${kit.name}`).trim(),
                    description: (description || '').trim(),
                    course: {
                        connect: { id: kit.courseId }
                    }
                }
            });

            // 2. Generate unique keys
            const keysToCreate = [];
            const keySet = new Set();

            while (keySet.size < count) {
                const candidate = generateFormattedKey();
                if (!keySet.has(candidate)) {
                    keySet.add(candidate);
                }
            }

            const parsedExpiry = expiresAt ? new Date(expiresAt) : null;

            for (const keyStr of keySet) {
                keysToCreate.push({
                    key: keyStr,
                    kitId: kit.id,
                    batchId: batch.id,
                    status: 'unused',
                    expiresAt: parsedExpiry
                });
            }

            // 3. Bulk insert keys
            await tx.activationKey.createMany({
                data: keysToCreate
            });

            return { batch, generatedCount: keysToCreate.length };
        });

        return res.status(201).json({
            success: true,
            message: `Successfully generated ${result.generatedCount} keys!`,
            batchId: result.batch.id.toString(),
            batchName: result.batch.name
        });
    } catch (error) {
        console.error('Error generating batch:', error);
        return res.status(500).json({ message: 'Failed to generate key batch', error: error.message });
    }
};

/**
 * ADMIN: Fetch all batches
 * GET /api/kits/batches
 */
const getAllBatches = async (req, res) => {
    try {
        const batches = await prisma.batch.findMany({
            include: {
                course: { select: { id: true, name: true } },
                keys: {
                    select: { id: true, status: true, kitId: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        const formatted = batches.map(b => {
            const total = b.keys.length;
            const redeemed = b.keys.filter(k => k.status === 'redeemed').length;
            const unused = b.keys.filter(k => k.status === 'unused').length;
            const kitId = b.keys[0]?.kitId ? b.keys[0].kitId.toString() : null;

            return {
                id: b.id.toString(),
                name: b.name,
                description: b.description,
                courseId: b.courseId ? b.courseId.toString() : null,
                courseName: b.course?.name || 'Unassigned (No Course)',
                kitId,
                createdAt: b.createdAt,
                stats: { total, redeemed, unused }
            };
        });

        return res.status(200).json(formatted);
    } catch (error) {
        console.error('Error fetching batches:', error);
        return res.status(500).json({ message: 'Failed to fetch batches', error: error.message });
    }
};

/**
 * ADMIN: Fetch keys in a specific batch
 * GET /api/kits/batches/:id/keys
 */
const getBatchKeys = async (req, res) => {
    try {
        const batchId = BigInt(req.params.id);
        const keys = await prisma.activationKey.findMany({
            where: { batchId },
            include: {
                redeemedByStudent: {
                    include: {
                        user: { select: { fullName: true, email: true } }
                    }
                }
            },
            orderBy: { id: 'asc' }
        });

        const formatted = keys.map(k => ({
            id: k.id.toString(),
            key: k.key,
            status: k.status,
            expiresAt: k.expiresAt,
            redeemedAt: k.redeemedAt,
            redeemedBy: k.redeemedByStudent ? {
                id: k.redeemedByStudent.id.toString(),
                fullName: k.redeemedByStudent.user?.fullName,
                email: k.redeemedByStudent.user?.email
            } : null,
            createdAt: k.createdAt
        }));

        return res.status(200).json(formatted);
    } catch (error) {
        console.error('Error fetching batch keys:', error);
        return res.status(500).json({ message: 'Failed to fetch batch keys', error: error.message });
    }
};

/**
 * ADMIN: Export batch keys as CSV or QR-ready links
 * GET /api/kits/batches/:id/export
 */
const exportBatch = async (req, res) => {
    try {
        const batchId = BigInt(req.params.id);
        const batch = await prisma.batch.findUnique({
            where: { id: batchId },
            include: {
                course: true,
                keys: {
                    include: {
                        kit: true
                    },
                    orderBy: { id: 'asc' }
                }
            }
        });

        if (!batch) {
            return res.status(404).json({ message: 'Batch not found' });
        }

        const frontendUrl = process.env.FRONTEND_URL || 'https://www.abritechet.com';

        // Build CSV
        const header = 'Key,Kit,Course,Status,QR_Redeem_URL\n';
        const rows = batch.keys.map(k => {
            const qrUrl = `${frontendUrl.replace(/\/+$/, '')}/activate?code=${k.key}`;
            return `"${k.key}","${k.kit?.name || 'N/A'}","${batch.course?.name || 'N/A'}","${k.status}","${qrUrl}"`;
        }).join('\n');

        const csv = header + rows;

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=batch-${batch.id}-${batch.name.replace(/[^a-zA-Z0-9]/g, '_')}.csv`);
        return res.status(200).send(csv);
    } catch (error) {
        console.error('Error exporting batch:', error);
        return res.status(500).json({ message: 'Failed to export batch', error: error.message });
    }
};

module.exports = {
    activateKey,
    createKit,
    updateKit,
    getAllKits,
    generateBatch,
    getAllBatches,
    getBatchKeys,
    exportBatch
};
