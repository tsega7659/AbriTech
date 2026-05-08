const pool = require('../config/db');

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
            recentActivity
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
            SELECT ROUND(((COUNT(DISTINCT p."studentId")::FLOAT / NULLIF((SELECT COUNT(*) FROM student), 0)) * 100)::numeric, 1) as value 
            FROM payment p WHERE p.status = 'success'
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

        if (student.length === 0) return res.status(404).json({ message: 'Student not found' });

        const [enrollments] = await pool.execute(`
            SELECT c.name as "courseName", e."enrolledAt", e."progressPercentage", e.status
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
    reviewProject
};
