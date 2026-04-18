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
        // Basic Stats
        const [[{ totalstudents: totalStudents }]] = await pool.execute('SELECT COUNT(*) as totalStudents FROM student');
        const [[{ totalteachers: totalTeachers }]] = await pool.execute('SELECT COUNT(*) as totalTeachers FROM teacher');
        const [[{ totalcourses: totalCourses }]] = await pool.execute('SELECT COUNT(*) as totalCourses FROM course');
        const [[{ totalenrollments: totalEnrollments }]] = await pool.execute('SELECT COUNT(*) as totalEnrollments FROM enrollment');
        const [[{ totalparents: totalParents }]] = await pool.execute('SELECT COUNT(*) as totalParents FROM parent');
        const [[{ pendingreviews: pendingReviews }]] = await pool.execute("SELECT COUNT(*) as pendingReviews FROM assignmentsubmission WHERE status = 'pending'");
        const [[{ totalrevenue: totalRevenue }]] = await pool.execute("SELECT COALESCE(SUM(amount), 0) as totalRevenue FROM payment WHERE status = 'success'");
        
        // Growth Metrics
        const [[{ registrations: newRegistrationsThisWeek }]] = await pool.execute(`
            SELECT COUNT(*) as registrations FROM "user" 
            WHERE "createdAt" >= NOW() - INTERVAL '7 days'
        `);
        const [[{ enrollments: newEnrollmentsToday }]] = await pool.execute(`
            SELECT COUNT(*) as enrollments FROM enrollment 
            WHERE "enrolledAt" >= CURRENT_DATE
        `);
        const [[{ active: activeUsersToday }]] = await pool.execute(`
            SELECT COUNT(*) as active FROM "user" 
            WHERE "lastLogin" >= CURRENT_DATE
        `);
        const [[{ mrr: monthlyRecurringRevenue }]] = await pool.execute(`
            SELECT COALESCE(SUM(amount), 0) as mrr FROM payment 
            WHERE status = 'success' AND "createdAt" >= NOW() - INTERVAL '30 days'
        `);

        // Learning Metrics
        const [[{ avgtime: averageLearningTime }]] = await pool.execute(`
            SELECT COALESCE(AVG("timeSpentSeconds"), 0) as avgtime FROM enrollment
        `);

        // Enrollment Trend (Current month vs Last month)
        const [[{ count: currentMonthEnrollments }]] = await pool.execute(`
            SELECT COUNT(*) as count FROM enrollment 
            WHERE "enrolledAt" >= DATE_TRUNC('month', NOW())
        `);
        const [[{ count: lastMonthEnrollments }]] = await pool.execute(`
            SELECT COUNT(*) as count FROM enrollment 
            WHERE "enrolledAt" >= DATE_TRUNC('month', NOW()) - INTERVAL '1 month'
            AND "enrolledAt" < DATE_TRUNC('month', NOW())
        `);

        let enrollmentChange = '+0% this month';
        const curr = Number(currentMonthEnrollments || 0);
        const last = Number(lastMonthEnrollments || 0);

        if (last > 0) {
            const change = ((curr - last) / last) * 100;
            enrollmentChange = `${change >= 0 ? '+' : ''}${change.toFixed(0)}% this month`;
        } else if (curr > 0) {
            enrollmentChange = `+100% this month`;
        }

        // Completion Rate
        const [[{ rate: completionRateVal }]] = await pool.execute(`
            SELECT COALESCE((SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END)::FLOAT / NULLIF(COUNT(*), 0)) * 100, 0) as rate 
            FROM enrollment
        `);
        const completionRate = `${Math.round(completionRateVal)}% completion rate`;

        // Top Courses
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

        // Colors for pie chart
        const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#a855f7', '#f43f5e', '#6366f1'];
        const categoryStats = categoryStatsRaw.map((stat, index) => ({
            ...stat,
            color: colors[index % colors.length]
        }));

        // Recent Activity (Last 2 days)
        const [recentActivity] = await pool.execute(`
            SELECT * FROM (
                (SELECT u."fullName" as user, CONCAT('enrolled in ', c.name) as action, e."enrolledAt" as time 
                 FROM enrollment e 
                 JOIN student s ON e."studentId" = s.id 
                 JOIN "user" u ON s."userId" = u.id 
                 JOIN course c ON e."courseId" = c.id
                 WHERE e."enrolledAt" >= NOW() - INTERVAL '2 days')
                UNION
                (SELECT u."fullName" as user, CONCAT('submitted ', a.title) as action, sub."submittedAt" as time 
                 FROM assignmentsubmission sub 
                 JOIN student s ON sub."studentId" = s.id 
                 JOIN "user" u ON s."userId" = u.id 
                 JOIN assignment a ON sub."assignmentId" = a.id
                 WHERE sub."submittedAt" >= NOW() - INTERVAL '2 days')
                UNION
                (SELECT u."fullName" as user, CONCAT('joined the platform') as action, u."createdAt" as time 
                 FROM "user" u
                 WHERE u."createdAt" >= NOW() - INTERVAL '2 days')
                UNION
                (SELECT u."fullName" as user, CONCAT('paid ', p.amount, ' ETB for a course') as action, p."createdAt" as time 
                 FROM payment p
                 JOIN enrollment e ON p."studentId" = e."studentId" AND p."courseId" = e."courseId"
                 JOIN student s ON e."studentId" = s.id
                 JOIN "user" u ON s."userId" = u.id
                 WHERE p.status = 'success' AND p."createdAt" >= NOW() - INTERVAL '2 days')
            ) AS combined
            ORDER BY time DESC
            LIMIT 10
        `);

        // Course Performance
        const [coursePerformance] = await pool.execute(`
            SELECT 
                c.name as title, 
                COUNT(e.id) as enr, 
                SUM(CASE WHEN e.status = 'completed' THEN 1 ELSE 0 END) as comp,
                ROUND(COALESCE(SUM(CASE WHEN e.status = 'completed' THEN 1 ELSE 0 END)::NUMERIC / NULLIF(COUNT(e.id), 0) * 100, 0), 1) as rate
            FROM course c
            LEFT JOIN enrollment e ON c.id = e."courseId"
            GROUP BY c.id, c.name
            ORDER BY enr DESC
            LIMIT 5
        `);

        res.json({
            totalStudents: Number(totalStudents),
            totalTeachers: Number(totalTeachers),
            totalCourses: Number(totalCourses),
            totalEnrollments: Number(totalEnrollments),
            totalParents: Number(totalParents),
            pendingReviews: Number(pendingReviews),
            enrollmentChange,
            completionRate,
            totalRevenue: Number(totalRevenue),
            newRegistrationsThisWeek: Number(newRegistrationsThisWeek),
            newEnrollmentsToday: Number(newEnrollmentsToday),
            activeUsersToday: Number(activeUsersToday),
            monthlyRecurringRevenue: Number(monthlyRecurringRevenue),
            averageLearningTime: Number(averageLearningTime),
            
            // Operational Metrics
            topPerformingStudents: (await pool.execute(`
                SELECT u."fullName" as name, ROUND(AVG(p.score)::numeric, 1) as score 
                FROM "user" u 
                JOIN student s ON u.id = s."userId" 
                JOIN project p ON s.id = p."studentId" 
                WHERE p.status = 'approved' 
                GROUP BY u.id, u."fullName" 
                ORDER BY score DESC LIMIT 5
            `))[0],
            mostDifficultCourses: (await pool.execute(`
                SELECT c.name as title, ROUND(AVG(e."progressPercentage")::numeric, 1) as rate 
                FROM course c 
                LEFT JOIN enrollment e ON c.id = e."courseId" 
                GROUP BY c.id, c.name 
                ORDER BY rate ASC LIMIT 5
            `))[0],
            instructorActivityRate: Number((await pool.execute(`
                SELECT COALESCE((COUNT(DISTINCT tc."teacherId")::FLOAT / NULLIF((SELECT COUNT(*) FROM teacher), 0)) * 100, 0) as rate 
                FROM teachercourse tc
            `))[0][0].rate || 0),
            parentEngagementRate: Number((await pool.execute(`
                SELECT COALESCE((COUNT(DISTINCT ps."studentId")::FLOAT / NULLIF((SELECT COUNT(*) FROM student), 0)) * 100, 0) as rate 
                FROM parentstudent ps
            `))[0][0].rate || 0),
            quizCompletionRate: Number((await pool.execute(`
                SELECT COALESCE(AVG(CASE WHEN "isCorrect" THEN 100 ELSE 0 END)::FLOAT, 0) as rate FROM quizattempt
            `))[0][0].rate || 0),

            topCourses,
            categoryStats,
            recentActivity,
            coursePerformance
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
            SELECT gender as label, COUNT(*) as value 
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
            SELECT (CASE WHEN "isFree" THEN 'Free' ELSE 'Paid' END) as label, COUNT(e.id) as value 
            FROM course c JOIN enrollment e ON c.id = e."courseId" GROUP BY "isFree"
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
                gender: genderDistribution,
                grade: gradeDistribution,
                school: schoolDistribution
            },
            engagement: {
                weeklyActive,
                completionRates,
                timeSpent
            },
            courses: {
                dropOffRates,
                popularity: (await pool.execute(`SELECT name as label, COUNT(e.id) as value FROM course c LEFT JOIN enrollment e ON c.id = e."courseId" GROUP BY c.id, c.name ORDER BY value DESC LIMIT 5`))[0]
            },
            revenue: {
                enrollmentTypes,
                revenueByCourse,
                monthlyTrend: monthlyRevenueTrend,
                conversionRate: conversionRate[0]?.value || 0
            },
            projects: {
                status: projectStatus,
                innovationIndex,
                quizParticipation: (await pool.execute(`
                    SELECT c.name as label, COUNT(qa.id) as value 
                    FROM course c 
                    JOIN lesson l ON c.id = l."courseId" 
                    JOIN lessonquiz lq ON l.id = lq."lessonId" 
                    JOIN quizattempt qa ON lq.id = qa."quizId" 
                    GROUP BY c.id, c.name
                    ORDER BY value DESC LIMIT 5
                `))[0]
            }
        });
    } catch (error) {
        console.error('Get Analytics Data Error:', error);
        res.status(500).json({ message: 'Failed to fetch analytics data', error: error.message });
    }
};

module.exports = {
    deleteUser,
    getAllUsers,
    getDashboardStats,
    getAnalyticsData
};
