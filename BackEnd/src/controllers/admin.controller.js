const pool = require('../config/db');
const bcrypt = require('bcrypt');


const getAllUsers = async (req, res) => {
    try {
        const [users] = await pool.execute(`
            SELECT u.id, u."fullName", u.username, u.email, r.name as role 
            FROM "user" u 
            JOIN role r ON u."roleId" = r.id
            ORDER BY u.id
        `);
        res.json(users);
    } catch (error) {
        console.error('Get All Users Error:', error);
        res.status(500).json({ message: 'Failed to fetch users', error: error.message });
    }
};

const getDashboardStats = async (req, res) => {
    try {
        // Optimized: Fetch all basic counts and simple metrics in ONE query
        const [[stats]] = await pool.execute(`
            SELECT 
                (SELECT COUNT(*) FROM student) as "totalStudents",
                (SELECT COUNT(*) FROM teacher) as "totalTeachers",
                (SELECT COUNT(*) FROM course) as "totalCourses",
                (SELECT COUNT(*) FROM enrollment) as "totalEnrollments",
                (SELECT COUNT(*) FROM parent) as "totalParents",
                (SELECT COUNT(*) FROM assignmentsubmission WHERE status = 'pending') as "pendingReviews",
                (SELECT COALESCE(SUM(amount), 0) FROM payment WHERE status = 'success') as "totalRevenue",
                (SELECT COUNT(*) FROM "user" WHERE "createdAt" >= NOW() - INTERVAL '7 days') as "newRegistrationsThisWeek",
                (SELECT COUNT(*) FROM enrollment WHERE "enrolledAt" >= CURRENT_DATE) as "newEnrollmentsToday",
                (SELECT COUNT(*) FROM "user" WHERE "lastLogin" >= CURRENT_DATE) as "activeUsersToday",
                (SELECT COALESCE(SUM(amount), 0) FROM payment WHERE status = 'success' AND "createdAt" >= NOW() - INTERVAL '30 days') as "mrr",
                (SELECT COALESCE(AVG("timeSpentSeconds"), 0) FROM enrollment) as "avgLearningTime",
                (SELECT COUNT(*) FROM enrollment WHERE "enrolledAt" >= DATE_TRUNC('month', NOW())) as "currentMonthEnrollments",
                (SELECT COUNT(*) FROM enrollment WHERE "enrolledAt" >= DATE_TRUNC('month', NOW()) - INTERVAL '1 month' AND "enrolledAt" < DATE_TRUNC('month', NOW())) as "lastMonthEnrollments",
                (SELECT COALESCE((SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END)::FLOAT / NULLIF(COUNT(*), 0)) * 100, 0) FROM enrollment) as "completionRateVal"
        `);

        let enrollmentChange = '+0% this month';
        const curr = Number(stats.currentMonthEnrollments || 0);
        const last = Number(stats.lastMonthEnrollments || 0);

        if (last > 0) {
            const change = ((curr - last) / last) * 100;
            enrollmentChange = `${change >= 0 ? '+' : ''}${change.toFixed(0)}% this month`;
        } else if (curr > 0) {
            enrollmentChange = `+100% this month`;
        }

        const completionRate = `${Math.round(stats.completionRateVal)}% completion rate`;

        // Top Courses (Still separate as it returns multiple rows)
        const [topCourses] = await pool.execute(`
            SELECT c.name, COUNT(e.id) as value
            FROM course c
            LEFT JOIN enrollment e ON c.id = e."courseId"
            GROUP BY c.id, c.name
            ORDER BY value DESC
            Limit 5
        `);

        // Category Stats
        const [categoryStatsRaw] = await pool.execute(`
            SELECT category as name, COUNT(*) as value
            FROM course
            GROUP BY category
        `);

        const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#a855f7', '#f43f5e', '#6366f1'];
        const categoryStats = categoryStatsRaw.map((stat, index) => ({
            ...stat,
            value: Number(stat.value),
            color: colors[index % colors.length]
        }));

        // Combined activity query
        const [recentActivity] = await pool.execute(`
            SELECT * FROM (
                (SELECT u."fullName" as user, CONCAT('enrolled in ', c.name) as action, e."enrolledAt" as time 
                 FROM enrollment e 
                 JOIN student s ON e."studentId" = s.id 
                 JOIN "user" u ON s."userId" = u.id 
                 JOIN course c ON e."courseId" = c.id
                 WHERE e."enrolledAt" >= NOW() - INTERVAL '2 days')
                UNION ALL
                (SELECT u."fullName" as user, CONCAT('submitted ', a.title) as action, sub."submittedAt" as time 
                 FROM assignmentsubmission sub 
                 JOIN student s ON sub."studentId" = s.id 
                 JOIN "user" u ON s."userId" = u.id 
                 JOIN assignment a ON sub."assignmentId" = a.id
                 WHERE sub."submittedAt" >= NOW() - INTERVAL '2 days')
                UNION ALL
                (SELECT u."fullName" as user, 'joined the platform' as action, u."createdAt" as time 
                 FROM "user" u
                 WHERE u."createdAt" >= NOW() - INTERVAL '2 days')
                UNION ALL
                (SELECT u."fullName" as user, CONCAT('paid ', p.amount, ' ETB for a course') as action, p."createdAt" as time 
                 FROM payment p
                 JOIN student s ON p."userId" = s."userId"
                 JOIN "user" u ON s."userId" = u.id
                 WHERE p.status = 'success' AND p."createdAt" >= NOW() - INTERVAL '2 days')
            ) AS combined
            ORDER BY time DESC
            LIMIT 10
        `);

        // Top Performing Students
        const [topPerformingStudentsRaw] = await pool.execute(`
            SELECT u."fullName" as name, COALESCE(ROUND(AVG(e."progressPercentage")), 0) as score
            FROM "user" u
            JOIN student s ON u.id = s."userId"
            JOIN enrollment e ON s.id = e."studentId"
            WHERE e."progressPercentage" > 0
            GROUP BY u.id, u."fullName"
            ORDER BY score DESC
            LIMIT 5
        `);
        const topPerformingStudents = topPerformingStudentsRaw.map(s => ({ ...s, score: Number(s.score) }));

        // Most Difficult Courses (lowest average progress)
        const [mostDifficultCoursesRaw] = await pool.execute(`
            SELECT c.name as title, 
                   COALESCE(ROUND(100 - AVG(e."progressPercentage")), 100) as rate
            FROM course c
            JOIN enrollment e ON c.id = e."courseId"
            GROUP BY c.id, c.name
            ORDER BY rate DESC
            LIMIT 5
        `);
        const mostDifficultCourses = mostDifficultCoursesRaw.map(c => ({ ...c, rate: Number(c.rate) }));

        res.json({
            totalStudents: Number(stats.totalStudents),
            totalTeachers: Number(stats.totalTeachers),
            totalCourses: Number(stats.totalCourses),
            totalEnrollments: Number(stats.totalEnrollments),
            totalParents: Number(stats.totalParents),
            pendingReviews: Number(stats.pendingReviews),
            enrollmentChange,
            completionRate,
            totalRevenue: Number(stats.totalRevenue),
            newRegistrationsThisWeek: Number(stats.newRegistrationsThisWeek),
            newEnrollmentsToday: Number(stats.newEnrollmentsToday),
            activeUsersToday: Number(stats.activeUsersToday),
            monthlyRecurringRevenue: Number(stats.mrr),
            averageLearningTime: Number(stats.avgLearningTime),
            topCourses: topCourses.map(c => ({ ...c, value: Number(c.value) })),
            categoryStats,
            recentActivity,
            topPerformingStudents,
            mostDifficultCourses
        });
    } catch (error) {
        console.error('Get Dashboard Stats Error:', error);
        res.status(500).json({ message: 'Failed to fetch dashboard stats', error: error.message });
    }
};

const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        // Check if user exists
        const [existing] = await pool.execute('SELECT id, username, email FROM "user" WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Delete (Dependencies are handled by ON DELETE CASCADE in schema)
        await pool.execute('DELETE FROM "user" WHERE id = ?', [id]);

        res.json({ message: `User ${existing[0].username} (ID: ${id}) deleted successfully` });
    } catch (error) {
        console.error('Delete User Error:', error);
        res.status(500).json({ message: 'Failed to delete user', error: error.message });
    }
};

const getAnalyticsData = async (req, res) => {
    try {
        const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#a855f7', '#f43f5e', '#6366f1'];

        // 1. Demographics
        const [genderDistribution] = await pool.execute(`
            SELECT gender as name, COUNT(*) as value 
            FROM "user" u JOIN student s ON u.id = s."userId" 
            GROUP BY gender
        `);
        const [gradeDistribution] = await pool.execute(`
            SELECT "classLevel" as label, COUNT(*) as value FROM student GROUP BY "classLevel"
        `);
        const [schoolDistribution] = await pool.execute(`
            SELECT "schoolName" as label, COUNT(*) as value 
            FROM student GROUP BY "schoolName" ORDER BY value DESC LIMIT 5
        `);

        // 2. Learning Engagement
        const [weeklyActive] = await pool.execute(`
            SELECT DATE_TRUNC('day', "lastLogin") as date, COUNT(*) as value 
            FROM "user" WHERE "lastLogin" >= NOW() - INTERVAL '7 days' 
            GROUP BY date ORDER BY date
        `);
        const [completionRates] = await pool.execute(`
            SELECT c.name as label, ROUND(AVG("progressPercentage")::numeric, 1) as value 
            FROM course c LEFT JOIN enrollment e ON c.id = e."courseId" GROUP BY c.id, c.name
        `);
        const [timeSpent] = await pool.execute(`
            SELECT c.name as label, ROUND(AVG("timeSpentSeconds") / 60.0, 1) as value 
            FROM course c LEFT JOIN enrollment e ON c.id = e."courseId" GROUP BY c.id, c.name
        `);

        // 3. Course Analytics
        const [dropOffRates] = await pool.execute(`
            SELECT c.name as label, ROUND(((SUM(CASE WHEN e."progressPercentage" = 0 THEN 1 ELSE 0 END)::FLOAT / NULLIF(COUNT(e.id), 0)) * 100)::numeric, 1) as value 
            FROM course c JOIN enrollment e ON c.id = e."courseId" GROUP BY c.id, c.name
        `);

        // 4. Revenue Analytics
        const [enrollmentTypes] = await pool.execute(`
            SELECT CASE WHEN "isFree" THEN 'Free' ELSE 'Paid' END as name, COUNT(*) as value 
            FROM enrollment e JOIN course c ON e."courseId" = c.id 
            GROUP BY "isFree"
        `);
        const [revenueByCourse] = await pool.execute(`
            SELECT c.name as label, SUM(p.amount) as value 
            FROM course c 
            JOIN payment p ON c.id = p."courseId" 
            WHERE p.status = 'success' GROUP BY c.id, c.name
        `);
        const [monthlyRevenueTrend] = await pool.execute(`
            SELECT DATE_TRUNC('month', "createdAt") as month, SUM(amount) as value 
            FROM payment WHERE status = 'success' GROUP BY month ORDER BY month LIMIT 6
        `);
        const [conversionRate] = await pool.execute(`
            SELECT ROUND(
                (COUNT(DISTINCT p."userId")::FLOAT / 
                NULLIF((SELECT COUNT(DISTINCT e3."studentId") FROM enrollment e3 JOIN course c3 ON e3."courseId" = c3.id WHERE c3."isFree" = true), 0) 
                * 100)::numeric, 1) as value 
            FROM payment p
            JOIN student s ON p."userId" = s."userId"
            WHERE p.status = 'success'
            AND EXISTS (
                SELECT 1 FROM enrollment e2
                JOIN course c2 ON e2."courseId" = c2.id
                WHERE e2."studentId" = s.id AND c2."isFree" = true
            )
        `);

        // 5. Project Analytics
        const [projectStatus] = await pool.execute(`
            SELECT status as label, COUNT(*) as value FROM project GROUP BY status
        `);
        const [innovationIndex] = await pool.execute(`
            SELECT u."fullName" as label, ROUND(AVG(p.score)::numeric, 1) as value 
            FROM "user" u JOIN student s ON u.id = s."userId" JOIN project p ON s.id = p."studentId" 
            WHERE p.status = 'approved' GROUP BY u.id, u."fullName" ORDER BY value DESC LIMIT 5
        `);

        res.json({
            demographics: {
                gender: genderDistribution.map(d => ({ ...d, value: Number(d.value) })),
                grade: gradeDistribution.map(d => ({ ...d, value: Number(d.value) })),
                school: schoolDistribution.map(d => ({ ...d, value: Number(d.value) }))
            },
            engagement: {
                weeklyActive: weeklyActive.map(d => ({ ...d, value: Number(d.value) })),
                completionRates: completionRates.map(d => ({ ...d, value: Number(d.value) })),
                timeSpent: timeSpent.map(d => ({ ...d, value: Number(d.value) }))
            },
            courses: {
                dropOffRates: dropOffRates.map(d => ({ ...d, value: Number(d.value) })),
                popularity: (await pool.execute(`SELECT name as label, COUNT(e.id) as value FROM course c LEFT JOIN enrollment e ON c.id = e."courseId" GROUP BY c.id, c.name ORDER BY value DESC LIMIT 5`))[0].map(d => ({ ...d, value: Number(d.value) }))
            },
            revenue: {
                enrollmentTypes: enrollmentTypes.map(d => ({ ...d, value: Number(d.value) })),
                revenueByCourse: revenueByCourse.map(d => ({ ...d, value: Number(d.value) })),
                monthlyTrend: monthlyRevenueTrend.map(d => ({ ...d, value: Number(d.value) })),
                conversionRate: Number(conversionRate[0]?.value || 0)
            },
            projects: {
                status: projectStatus.map(d => ({ ...d, value: Number(d.value) })),
                innovationIndex: innovationIndex.map(d => ({ ...d, value: Number(d.value) })),
                quizParticipation: (await pool.execute(`
                    SELECT c.name as label, COUNT(qa.id) as value 
                    FROM course c 
                    JOIN lesson l ON c.id = l."courseId" 
                    JOIN lessonquiz lq ON l.id = lq."lessonId" 
                    JOIN quizattempt qa ON lq.id = qa."quizId" 
                    GROUP BY c.id, c.name
                    ORDER BY value DESC LIMIT 5
                `))[0].map(d => ({ ...d, value: Number(d.value) }))
            }
        });
    } catch (error) {
        console.error('Get Analytics Data Error:', error);
        res.status(500).json({ message: 'Failed to fetch analytics data', error: error.message });
    }
};

const getActivityLogs = async (req, res) => {
    try {
        const [logs] = await pool.execute(`
            SELECT * FROM (
                (SELECT 'Enrollment' as type, u."fullName" as user, CONCAT('Enrolled in ', c.name) as action, e."enrolledAt" as time, 
                        JSON_BUILD_OBJECT('course', c.name, 'category', c.category, 'status', e.status) as details
                 FROM enrollment e 
                 JOIN student s ON e."studentId" = s.id 
                 JOIN "user" u ON s."userId" = u.id 
                 JOIN course c ON e."courseId" = c.id)
                UNION ALL
                (SELECT 'Project' as type, u."fullName" as user, CONCAT('Submitted project: ', p.title) as action, p."submittedAt" as time,
                        JSON_BUILD_OBJECT('title', p.title, 'description', p.description, 'github', p."githubLink", 'status', p.status) as details
                 FROM project p
                 JOIN student s ON p."studentId" = s.id
                 JOIN "user" u ON s."userId" = u.id)
                UNION ALL
                (SELECT 'Assignment' as type, u."fullName" as user, CONCAT('Submitted ', a.title) as action, sub."submittedAt" as time,
                        JSON_BUILD_OBJECT('assignment', a.title, 'submissionType', sub."submissionType", 'status', sub.status) as details
                 FROM assignmentsubmission sub 
                 JOIN student s ON sub."studentId" = s.id 
                 JOIN "user" u ON s."userId" = u.id 
                 JOIN assignment a ON sub."assignmentId" = a.id)
                UNION ALL
                (SELECT 'User Registration' as type, u."fullName" as user, 'Joined the platform' as action, u."createdAt" as time,
                        JSON_BUILD_OBJECT('username', u.username, 'email', u.email, 'role', r.name) as details
                 FROM "user" u
                 JOIN role r ON u."roleId" = r.id)
                UNION ALL
                (SELECT 'Payment' as type, u."fullName" as user, CONCAT('Paid ', p.amount, ' ETB for ', c.name) as action, p."createdAt" as time,
                        JSON_BUILD_OBJECT('amount', p.amount, 'course', c.name, 'transactionId', p."transactionId", 'status', p.status) as details
                 FROM payment p
                 JOIN student s ON p."userId" = s."userId"
                 JOIN "user" u ON s."userId" = u.id
                 JOIN course c ON p."courseId" = c.id
                 WHERE p.status = 'success')
            ) AS combined
            ORDER BY time DESC
            LIMIT 100
        `);
        res.json(logs);
    } catch (error) {
        console.error('Get Activity Logs Error:', error);
        res.status(500).json({ message: 'Failed to fetch activity logs', error: error.message });
    }
};

const getStudentDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const [student] = await pool.execute(`
            SELECT u.id, u."fullName" as "fullName", u.email, u.username, u."phoneNumber" as "phoneNumber", u.gender, u.address,
                   s."schoolName" as "schoolName", s."educationLevel" as "educationLevel", s."classLevel" as "classLevel", s."isCurrentStudent" as "isCurrentStudent", s."referralCode" as "referralCode",
                   pu."fullName" as "parentName", pu.email as "parentEmail"
            FROM "user" u
            JOIN student s ON u.id = s."userId"
            LEFT JOIN parentstudent ps ON s.id = ps."studentId"
            LEFT JOIN parent p ON ps."parentId" = p.id
            LEFT JOIN "user" pu ON p."userId" = pu.id
            WHERE u.id = ?
        `, [id]);

        if (student.length === 0) {
            console.log(`[DEBUG] Student not found or missing profile for ID: ${id}`);
            return res.status(404).json({ message: 'Student or student profile not found' });
        }

        const [enrollments] = await pool.execute(`
            SELECT c.name as "courseName", e."enrolledAt", e."progressPercentage", e.status, c.id as "courseId"
            FROM enrollment e
            JOIN course c ON e."courseId" = c.id
            JOIN student s ON e."studentId" = s.id
            WHERE s."userId" = ?
        `, [id]);

        res.json({ ...student[0], enrollments });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch student details', error: error.message });
    }
};

const getInstructorDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const [instructor] = await pool.execute(`
            SELECT u.id, u."fullName" as "fullName", u.email, u.username, u."phoneNumber" as "phoneNumber", u.gender, u.address,
                   t.specialization
            FROM "user" u
            JOIN teacher t ON u.id = t."userId"
            WHERE u.id = ?
        `, [id]);

        if (instructor.length === 0) return res.status(404).json({ message: 'Instructor not found' });

        const [courses] = await pool.execute(`
            SELECT c.id, c.name
            FROM teachercourse tc
            JOIN course c ON tc."courseId" = c.id
            JOIN teacher t ON tc."teacherId" = t.id
            WHERE t."userId" = ?
        `, [id]);

        res.json({ ...instructor[0], assignedCourses: courses });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch instructor details', error: error.message });
    }
};

const getParentDetails = async (req, res) => {
    try {
        const { id } = req.params; // This is the userId from the frontend
        const [parents] = await pool.execute(`
            SELECT u.id, u."fullName", u.email, u.username, u."phoneNumber", u.gender, u.address, u."createdAt", p.id as "parentId"
            FROM "user" u
            JOIN parent p ON u.id = p."userId"
            WHERE u.id = ?
        `, [id]);

        if (parents.length === 0) return res.status(404).json({ message: 'Parent not found' });

        const parentId = parents[0].parentId;

        const [students] = await pool.execute(`
            SELECT u."fullName", u.email, s.id as "studentId", s."classLevel", u.username
            FROM parentstudent ps
            JOIN student s ON ps."studentId" = s.id
            JOIN "user" u ON s."userId" = u.id
            WHERE ps."parentId" = ?
        `, [parentId]);

        // Add some stats for the premium modal
        const [[{ totalEnrollments }]] = await pool.execute(`
            SELECT COUNT(*) as "totalEnrollments"
            FROM enrollment e
            JOIN parentstudent ps ON e."studentId" = ps."studentId"
            WHERE ps."parentId" = ?
        `, [parentId]);

        const [[{ avgProgress }]] = await pool.execute(`
            SELECT COALESCE(AVG(e."progressPercentage"), 0) as "avgProgress"
            FROM enrollment e
            JOIN parentstudent ps ON e."studentId" = ps."studentId"
            WHERE ps."parentId" = ?
        `, [parentId]);

        res.json({
            ...parents[0],
            students,
            totalEnrollments: Number(totalEnrollments),
            avgProgress: Math.round(Number(avgProgress))
        });
    } catch (error) {
        console.error('Get Parent Details Error:', error);
        res.status(500).json({ message: 'Failed to fetch parent details' });
    }
};

const getAllProjects = async (req, res) => {
    try {
        const [projects] = await pool.execute(`
            SELECT 
                p.id, p.title, p.description, p.status, p.score, p.feedback, p."submittedAt",
                p.image, p.video, p.files, p."githubLink",
                u."fullName" as "studentName",
                c.name as "courseName"
            FROM project p
            JOIN student s ON p."studentId" = s.id
            JOIN "user" u ON s."userId" = u.id
            LEFT JOIN course c ON p."courseId" = c.id
            ORDER BY p."submittedAt" DESC
        `);
        res.json(projects);
    } catch (error) {
        console.error('Get Projects Error:', error);
        res.status(500).json({ message: 'Failed to fetch projects', error: error.message });
    }
};

const reviewProject = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, score, feedback } = req.body;

        if (!status) return res.status(400).json({ message: 'Status is required' });

        await pool.execute(
            'UPDATE project SET status = ?, score = ?, feedback = ?, "updatedAt" = NOW() WHERE id = ?',
            [status, score || null, feedback || null, id]
        );

        res.json({ message: 'Project reviewed successfully' });
    } catch (error) {
        console.error('Review Project Error:', error);
        res.status(500).json({ message: 'Failed to review project', error: error.message });
    }
};

const assignInstructorCourses = async (req, res) => {
    const conn = await pool.getConnection();
    try {
        const { id } = req.params;
        const { courseIds } = req.body;

        await conn.beginTransaction();

        const [teacher] = await conn.execute('SELECT id FROM teacher WHERE "userId" = ?', [id]);
        if (teacher.length === 0) {
            await conn.rollback();
            return res.status(404).json({ message: 'Instructor not found' });
        }
        const teacherId = teacher[0].id;

        await conn.execute('DELETE FROM teachercourse WHERE "teacherId" = ?', [teacherId]);

        if (Array.isArray(courseIds) && courseIds.length > 0) {
            const values = courseIds.map(() => '(?, ?)').join(',');
            const params = courseIds.flatMap(cId => [teacherId, cId]);
            await conn.execute(`INSERT INTO teachercourse ("teacherId", "courseId") VALUES ${values}`, params);
        }

        await conn.commit();
        res.json({ message: 'Instructor courses updated successfully' });
    } catch (error) {
        await conn.rollback();
        console.error('Assign Instructor Courses Error:', error);
        res.status(500).json({ message: 'Failed to assign courses', error: error.message });
    } finally {
        conn.release();
    }
};

const updateTeacherSpecialization = async (req, res) => {
    try {
        const { id } = req.params; // userId
        const { specialization } = req.body;

        if (!specialization) {
            return res.status(400).json({ message: 'Specialization is required' });
        }

        await pool.execute(
            'UPDATE teacher SET specialization = ? WHERE "userId" = ?',
            [specialization, id]
        );

        res.json({ message: 'Specialization updated successfully' });
    } catch (error) {
        console.error('Update Specialization Error:', error);
        res.status(500).json({ message: 'Failed to update specialization', error: error.message });
    }
};

const getPayments = async (req, res) => {
    try {
        // Use LEFT JOINs to be safe with potentially null fields and join via student table
        const [payments] = await pool.execute(`
            SELECT 
                p.id,
                p.amount,
                p.status,
                p."createdAt",
                p."paymentMethod" as method,
                p."transactionReference" as txRef,
                u."fullName" as "studentName",
                c.name as "courseName"
            FROM payment p
            LEFT JOIN student s ON p."studentId" = s.id
            LEFT JOIN "user" u ON s."userId" = u.id
            LEFT JOIN course c ON p."courseId" = c.id
            ORDER BY p."createdAt" DESC
            LIMIT 200
        `);

        // Revenue summary stats
        const [statsRows] = await pool.execute(`
            SELECT
                COALESCE(SUM(CASE WHEN status = 'success' THEN amount ELSE 0 END), 0) as "totalRevenue",
                COALESCE(SUM(CASE WHEN status = 'success' AND "createdAt" >= NOW() - INTERVAL '7 days' THEN amount ELSE 0 END), 0) as "weeklyRevenue",
                COALESCE(SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END), 0) as "pendingAmount",
                COUNT(CASE WHEN status = 'success' THEN 1 END) as "successCount",
                COUNT(*) as "totalCount"
            FROM payment
        `);

        const stats = statsRows[0] || {
            totalRevenue: 0,
            weeklyRevenue: 0,
            pendingAmount: 0,
            successCount: 0,
            totalCount: 0
        };

        const successRate = stats.totalCount > 0
            ? ((Number(stats.successCount) / Number(stats.totalCount)) * 100).toFixed(1)
            : '0.0';

        res.json({
            payments,
            stats: {
                ...stats,
                successRate,
                totalRevenue: Number(stats.totalRevenue),
                weeklyRevenue: Number(stats.weeklyRevenue),
                pendingAmount: Number(stats.pendingAmount)
            }
        });
    } catch (error) {
        console.error('getPayments Detailed Error:', {
            message: error.message,
            stack: error.stack,
            sql: error.sql
        });
        res.status(500).json({
            message: 'Failed to fetch payments',
            error: error.message,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

const getDataStats = async (req, res) => {
    try {
        const [[counts]] = await pool.execute(`
            SELECT 
                (SELECT COUNT(*) FROM student) as "studentsCount",
                (SELECT COUNT(*) FROM teacher) as "teachersCount",
                (SELECT COUNT(*) FROM parent) as "parentsCount",
                (SELECT COUNT(*) FROM "user" u JOIN role r ON u."roleId" = r.id WHERE r.name = 'admin') as "adminsCount",
                (SELECT COUNT(*) FROM course) as "coursesCount",
                (SELECT COUNT(*) FROM lesson) as "lessonsCount",
                (SELECT COUNT(*) FROM lessonquiz) as "quizzesCount",
                (SELECT COUNT(*) FROM assignment) as "assignmentsCount",
                (SELECT COUNT(*) FROM enrollment) as "enrollmentsCount",
                (SELECT COUNT(*) FROM lessonprogress) as "lessonProgressCount",
                (SELECT COUNT(*) FROM assignmentsubmission) as "submissionsCount",
                (SELECT COUNT(*) FROM quizattempt) as "quizAttemptsCount",
                (SELECT COUNT(*) FROM project) as "projectsCount",
                (SELECT COUNT(*) FROM payment) as "paymentsCount",
                (SELECT COUNT(*) FROM blog) as "blogsCount",
                (SELECT COUNT(*) FROM contactmessage) as "messagesCount",
                (SELECT COUNT(*) FROM aichatlog) as "aiChatLogsCount",
                (SELECT COUNT(*) FROM notification) as "notificationsCount"
        `);

        const categories = [
            {
                id: 'students',
                name: 'Students & Accounts',
                description: 'Student profiles, user accounts, and personal data',
                count: Number(counts.studentsCount || 0),
                subCounts: {
                    students: Number(counts.studentsCount || 0)
                },
                icon: 'GraduationCap',
                color: 'blue'
            },
            {
                id: 'teachers',
                name: 'Instructors & Teachers',
                description: 'Teacher profiles, course assignments, and credentials',
                count: Number(counts.teachersCount || 0),
                subCounts: {
                    teachers: Number(counts.teachersCount || 0)
                },
                icon: 'UserCheck',
                color: 'emerald'
            },
            {
                id: 'parents',
                name: 'Parents & Families',
                description: 'Parent accounts and student link relationships',
                count: Number(counts.parentsCount || 0),
                subCounts: {
                    parents: Number(counts.parentsCount || 0)
                },
                icon: 'Users',
                color: 'violet'
            },
            {
                id: 'courses',
                name: 'Courses & Curriculum',
                description: 'Course catalog, lessons, quizzes, and assignments',
                count: Number(counts.coursesCount || 0) + Number(counts.lessonsCount || 0) + Number(counts.quizzesCount || 0) + Number(counts.assignmentsCount || 0),
                subCounts: {
                    courses: Number(counts.coursesCount || 0),
                    lessons: Number(counts.lessonsCount || 0),
                    quizzes: Number(counts.quizzesCount || 0),
                    assignments: Number(counts.assignmentsCount || 0)
                },
                icon: 'BookOpen',
                color: 'amber'
            },
            {
                id: 'enrollments_progress',
                name: 'Enrollments & Progress',
                description: 'Student course enrollments and lesson progress tracking',
                count: Number(counts.enrollmentsCount || 0) + Number(counts.lessonProgressCount || 0),
                subCounts: {
                    enrollments: Number(counts.enrollmentsCount || 0),
                    progress: Number(counts.lessonProgressCount || 0)
                },
                icon: 'TrendingUp',
                color: 'cyan'
            },
            {
                id: 'submissions_quizzes',
                name: 'Submissions & Assessments',
                description: 'Assignment uploads, quiz attempts, and project submissions',
                count: Number(counts.submissionsCount || 0) + Number(counts.quizAttemptsCount || 0) + Number(counts.projectsCount || 0),
                subCounts: {
                    submissions: Number(counts.submissionsCount || 0),
                    quizAttempts: Number(counts.quizAttemptsCount || 0),
                    projects: Number(counts.projectsCount || 0)
                },
                icon: 'CheckSquare',
                color: 'indigo'
            },
            {
                id: 'payments',
                name: 'Payments & Revenue Records',
                description: 'Transaction history, payment logs, and deposit records',
                count: Number(counts.paymentsCount || 0),
                subCounts: {
                    payments: Number(counts.paymentsCount || 0)
                },
                icon: 'CreditCard',
                color: 'green'
            },
            {
                id: 'blogs',
                name: 'Blogs & Articles',
                description: 'Published and draft blog articles and cover metadata',
                count: Number(counts.blogsCount || 0),
                subCounts: {
                    blogs: Number(counts.blogsCount || 0)
                },
                icon: 'FileText',
                color: 'orange'
            },
            {
                id: 'messages',
                name: 'Contact Messages & Inquiries',
                description: 'Public contact inquiries, support tickets, and replies',
                count: Number(counts.messagesCount || 0),
                subCounts: {
                    messages: Number(counts.messagesCount || 0)
                },
                icon: 'MessageSquare',
                color: 'rose'
            },
            {
                id: 'ai_notifications',
                name: 'AI Chat History & Notifications',
                description: 'User AI conversations and platform notification history',
                count: Number(counts.aiChatLogsCount || 0) + Number(counts.notificationsCount || 0),
                subCounts: {
                    aiChats: Number(counts.aiChatLogsCount || 0),
                    notifications: Number(counts.notificationsCount || 0)
                },
                icon: 'Bot',
                color: 'fuchsia'
            }
        ];

        const totalRecords = categories.reduce((sum, c) => sum + c.count, 0);

        res.json({
            categories,
            totalRecords,
            adminsCount: Number(counts.adminsCount || 0),
            counts: {
                students: Number(counts.studentsCount || 0),
                teachers: Number(counts.teachersCount || 0),
                parents: Number(counts.parentsCount || 0),
                admins: Number(counts.adminsCount || 0),
                courses: Number(counts.coursesCount || 0),
                lessons: Number(counts.lessonsCount || 0),
                quizzes: Number(counts.quizzesCount || 0),
                assignments: Number(counts.assignmentsCount || 0),
                enrollments: Number(counts.enrollmentsCount || 0),
                lessonProgress: Number(counts.lessonProgressCount || 0),
                submissions: Number(counts.submissionsCount || 0),
                quizAttempts: Number(counts.quizAttemptsCount || 0),
                projects: Number(counts.projectsCount || 0),
                payments: Number(counts.paymentsCount || 0),
                blogs: Number(counts.blogsCount || 0),
                messages: Number(counts.messagesCount || 0),
                aiChatLogs: Number(counts.aiChatLogsCount || 0),
                notifications: Number(counts.notificationsCount || 0)
            }
        });
    } catch (error) {
        console.error('Get Data Stats Error:', error);
        res.status(500).json({ message: 'Failed to fetch database statistics', error: error.message });
    }
};

const clearData = async (req, res) => {
    const conn = await pool.getConnection();
    try {
        const { mode, targets = [] } = req.body;
        const currentUserId = req.user?.userId;

        await conn.beginTransaction();

        let clearedSummary = {};

        if (mode === 'all') {
            // 1. Delete dependent leaf/child tables first:
            await conn.execute('DELETE FROM assignmentsubmission');
            await conn.execute('DELETE FROM quizattempt');
            await conn.execute('DELETE FROM project');
            await conn.execute('DELETE FROM lessonprogress');
            await conn.execute('DELETE FROM enrollment');
            await conn.execute('DELETE FROM payment');
            await conn.execute('DELETE FROM aichatlog');
            await conn.execute('DELETE FROM notification');
            await conn.execute('DELETE FROM contactmessage');

            try { await conn.execute('DELETE FROM learning_log'); } catch (e) {}
            try { await conn.execute('DELETE FROM achievement'); } catch (e) {}
            try { await conn.execute('DELETE FROM lesson_resource'); } catch (e) {}
            try { await conn.execute('DELETE FROM lessonaisummary'); } catch (e) {}
            try { await conn.execute('DELETE FROM userbadge'); } catch (e) {}
            try { await conn.execute('DELETE FROM eventregistration'); } catch (e) {}
            try { await conn.execute('DELETE FROM certificate'); } catch (e) {}
            try { await conn.execute('DELETE FROM portfolio'); } catch (e) {}

            // 2. Delete curriculum:
            await conn.execute('DELETE FROM lessonquiz');
            await conn.execute('DELETE FROM lesson');
            await conn.execute('DELETE FROM assignment');
            await conn.execute('DELETE FROM teachercourse');
            await conn.execute('DELETE FROM course');

            // 3. Delete user relationships and role-specific rows:
            await conn.execute('DELETE FROM parentstudent');
            await conn.execute('DELETE FROM student');
            await conn.execute('DELETE FROM parent');
            await conn.execute('DELETE FROM teacher');
            await conn.execute('DELETE FROM blog');

            // 4. Delete all users EXCEPT admin users and current user:
            const [adminRoleRows] = await conn.execute('SELECT id FROM role WHERE name = ?', ['admin']);
            const adminRoleId = adminRoleRows[0]?.id;

            if (adminRoleId) {
                await conn.execute('DELETE FROM "user" WHERE "roleId" != ? AND id != ?', [adminRoleId, currentUserId || 0]);
            } else {
                await conn.execute('DELETE FROM "user" WHERE id != ?', [currentUserId || 0]);
            }

            clearedSummary = { mode: 'all', message: 'All database data successfully wiped (admin accounts preserved).' };
        } else if (mode === 'selected' && Array.isArray(targets) && targets.length > 0) {
            // Process selected targets
            for (const target of targets) {
                switch (target) {
                    case 'students':
                        await conn.execute('DELETE FROM assignmentsubmission');
                        await conn.execute('DELETE FROM quizattempt');
                        await conn.execute('DELETE FROM project');
                        await conn.execute('DELETE FROM lessonprogress');
                        await conn.execute('DELETE FROM enrollment');
                        await conn.execute('DELETE FROM parentstudent');
                        try { await conn.execute('DELETE FROM learning_log'); } catch (e) {}
                        try { await conn.execute('DELETE FROM achievement'); } catch (e) {}

                        const [studentUsers] = await conn.execute('SELECT "userId" FROM student');
                        await conn.execute('DELETE FROM student');
                        if (studentUsers.length > 0) {
                            const uIds = studentUsers.map(s => s.userId).filter(Boolean);
                            for (const uid of uIds) {
                                await conn.execute('DELETE FROM "user" WHERE id = ?', [uid]);
                            }
                        }
                        clearedSummary.students = true;
                        break;

                    case 'teachers':
                        await conn.execute('DELETE FROM teachercourse');
                        const [teacherUsers] = await conn.execute('SELECT "userId" FROM teacher');
                        await conn.execute('DELETE FROM teacher');
                        if (teacherUsers.length > 0) {
                            const uIds = teacherUsers.map(t => t.userId).filter(Boolean);
                            for (const uid of uIds) {
                                await conn.execute('DELETE FROM "user" WHERE id = ?', [uid]);
                            }
                        }
                        clearedSummary.teachers = true;
                        break;

                    case 'parents':
                        await conn.execute('DELETE FROM parentstudent');
                        const [parentUsers] = await conn.execute('SELECT "userId" FROM parent');
                        await conn.execute('DELETE FROM parent');
                        if (parentUsers.length > 0) {
                            const uIds = parentUsers.map(p => p.userId).filter(Boolean);
                            for (const uid of uIds) {
                                await conn.execute('DELETE FROM "user" WHERE id = ?', [uid]);
                            }
                        }
                        clearedSummary.parents = true;
                        break;

                    case 'courses':
                        await conn.execute('DELETE FROM assignmentsubmission');
                        await conn.execute('DELETE FROM quizattempt');
                        await conn.execute('DELETE FROM project');
                        await conn.execute('DELETE FROM lessonprogress');
                        await conn.execute('DELETE FROM enrollment');
                        await conn.execute('DELETE FROM payment');
                        try { await conn.execute('DELETE FROM lesson_resource'); } catch (e) {}
                        try { await conn.execute('DELETE FROM lessonaisummary'); } catch (e) {}
                        await conn.execute('DELETE FROM lessonquiz');
                        await conn.execute('DELETE FROM lesson');
                        await conn.execute('DELETE FROM assignment');
                        await conn.execute('DELETE FROM teachercourse');
                        await conn.execute('DELETE FROM course');
                        clearedSummary.courses = true;
                        break;

                    case 'enrollments_progress':
                        await conn.execute('DELETE FROM lessonprogress');
                        await conn.execute('DELETE FROM enrollment');
                        try { await conn.execute('DELETE FROM learning_log'); } catch (e) {}
                        clearedSummary.enrollments_progress = true;
                        break;

                    case 'submissions_quizzes':
                        await conn.execute('DELETE FROM assignmentsubmission');
                        await conn.execute('DELETE FROM quizattempt');
                        await conn.execute('DELETE FROM project');
                        clearedSummary.submissions_quizzes = true;
                        break;

                    case 'payments':
                        await conn.execute('DELETE FROM payment');
                        clearedSummary.payments = true;
                        break;

                    case 'blogs':
                        await conn.execute('DELETE FROM blog');
                        clearedSummary.blogs = true;
                        break;

                    case 'messages':
                        await conn.execute('DELETE FROM contactmessage');
                        clearedSummary.messages = true;
                        break;

                    case 'ai_notifications':
                        await conn.execute('DELETE FROM aichatlog');
                        await conn.execute('DELETE FROM notification');
                        clearedSummary.ai_notifications = true;
                        break;
                }
            }
            clearedSummary.message = 'Selected categories successfully cleared.';
        } else {
            await conn.rollback();
            return res.status(400).json({ message: 'Invalid clear parameters. Please provide mode or targets.' });
        }

        await conn.commit();
        res.json({
            success: true,
            message: clearedSummary.message || 'Data cleared successfully',
            summary: clearedSummary
        });
    } catch (error) {
        await conn.rollback();
        console.error('Clear Data Error:', error);
        res.status(500).json({ message: 'Failed to clear data', error: error.message });
    } finally {
        conn.release();
    }
};

const getAdmins = async (req, res) => {
    try {
        const [admins] = await pool.execute(`
            SELECT 
                u.id, 
                u."fullName", 
                u.username, 
                u.email, 
                u."phoneNumber", 
                u.gender, 
                u.address, 
                u."createdAt", 
                u."lastLogin",
                r.name as role
            FROM "user" u
            JOIN role r ON u."roleId" = r.id
            WHERE r.name = 'admin'
            ORDER BY u."createdAt" DESC, u.id DESC
        `);
        res.json(admins);
    } catch (error) {
        console.error('Get Admins Error:', error);
        res.status(500).json({ message: 'Failed to fetch administrators', error: error.message });
    }
};

const getAdminDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const [admins] = await pool.execute(`
            SELECT 
                u.id, 
                u."fullName", 
                u.username, 
                u.email, 
                u."phoneNumber", 
                u.gender, 
                u.address, 
                u."createdAt", 
                u."lastLogin",
                r.name as role
            FROM "user" u
            JOIN role r ON u."roleId" = r.id
            WHERE u.id = ? AND r.name = 'admin'
        `, [id]);

        if (admins.length === 0) {
            return res.status(404).json({ message: 'Administrator not found' });
        }

        res.json(admins[0]);
    } catch (error) {
        console.error('Get Admin Details Error:', error);
        res.status(500).json({ message: 'Failed to fetch administrator details', error: error.message });
    }
};

const deleteAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const currentUserId = req.user?.userId;

        if (!id) {
            return res.status(400).json({ message: 'Admin ID is required' });
        }

        if (String(currentUserId) === String(id)) {
            return res.status(400).json({ message: 'You cannot delete your own administrator account while logged in.' });
        }

        // Count total admins to prevent deleting the last admin
        const [[{ adminCount }]] = await pool.execute(`
            SELECT COUNT(*) as "adminCount" 
            FROM "user" u 
            JOIN role r ON u."roleId" = r.id 
            WHERE r.name = 'admin'
        `);

        if (Number(adminCount) <= 1) {
            return res.status(400).json({ message: 'Cannot delete the only remaining administrator account.' });
        }

        const [existing] = await pool.execute(`
            SELECT u.id, u.username, u.email 
            FROM "user" u 
            JOIN role r ON u."roleId" = r.id 
            WHERE u.id = ? AND r.name = 'admin'
        `, [id]);

        if (existing.length === 0) {
            return res.status(404).json({ message: 'Administrator not found' });
        }

        await pool.execute('DELETE FROM "user" WHERE id = ?', [id]);

        res.json({ message: `Administrator ${existing[0].username} deleted successfully` });
    } catch (error) {
        console.error('Delete Admin Error:', error);
        res.status(500).json({ message: 'Failed to delete administrator', error: error.message });
    }
};

module.exports = {
    getAllUsers,
    getDashboardStats,
    getAnalyticsData,
    getActivityLogs,
    deleteUser,
    getStudentDetails,
    getInstructorDetails,
    assignInstructorCourses,
    getParentDetails,
    getAllProjects,
    reviewProject,
    updateTeacherSpecialization,
    getPayments,
    getDataStats,
    clearData,
    getAdmins,
    getAdminDetails,
    deleteAdmin
};
