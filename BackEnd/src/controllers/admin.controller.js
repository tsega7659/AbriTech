const pool = require('../config/db');

const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        // Check if user exists
        const [existing] = await pool.execute('SELECT id, username, email FROM user WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Disable FK checks and delete
        await pool.execute('SET FOREIGN_KEY_CHECKS = 0');
        await pool.execute('DELETE FROM user WHERE id = ?', [id]);
        await pool.execute('SET FOREIGN_KEY_CHECKS = 1');

        res.json({ message: `User ${existing[0].username} (ID: ${id}) deleted successfully` });
    } catch (error) {
        console.error('Delete User Error:', error);
        res.status(500).json({ message: 'Failed to delete user', error: error.message });
    }
};

const getAllUsers = async (req, res) => {
    try {
        const [users] = await pool.execute(`
            SELECT u.id, u.fullName, u.username, u.email, r.name as role 
            FROM user u 
            JOIN role r ON u.roleId = r.id
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
        const [[{ totalStudents }]] = await pool.execute('SELECT COUNT(*) as totalStudents FROM student');
        const [[{ totalTeachers }]] = await pool.execute('SELECT COUNT(*) as totalTeachers FROM teacher');
        const [[{ totalCourses }]] = await pool.execute('SELECT COUNT(*) as totalCourses FROM course');
        const [[{ totalEnrollments }]] = await pool.execute('SELECT COUNT(*) as totalEnrollments FROM enrollment');
        const [[{ totalParents }]] = await pool.execute('SELECT COUNT(*) as totalParents FROM parent');
        const [[{ pendingReviews }]] = await pool.execute('SELECT COUNT(*) as pendingReviews FROM assignmentsubmission WHERE status = "pending"');

        // Enrollment Trend (Current month vs Last month)
        const [[{ currentMonthEnrollments }]] = await pool.execute(`
            SELECT COUNT(*) as count FROM enrollment 
            WHERE enrolledAt >= DATE_FORMAT(NOW() ,'%Y-%m-01')
        `);
        const [[{ lastMonthEnrollments }]] = await pool.execute(`
            SELECT COUNT(*) as count FROM enrollment 
            WHERE enrolledAt >= DATE_SUB(DATE_FORMAT(NOW() ,'%Y-%m-01'), INTERVAL 1 MONTH) 
            AND enrolledAt < DATE_FORMAT(NOW() ,'%Y-%m-01')
        `);

        let enrollmentChange = '+0% this month';
        if (lastMonthEnrollments > 0) {
            const change = ((currentMonthEnrollments - lastMonthEnrollments) / lastMonthEnrollments) * 100;
            enrollmentChange = `${change >= 0 ? '+' : ''}${change.toFixed(0)}% this month`;
        } else if (currentMonthEnrollments > 0) {
            enrollmentChange = `+100% this month`;
        }

        // Completion Rate
        const [[{ rate: completionRateVal }]] = await pool.execute(`
            SELECT IFNULL((SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) / COUNT(*)) * 100, 0) as rate 
            FROM enrollment
        `);
        const completionRate = `${Math.round(completionRateVal)}% completion rate`;

        // Top Courses
        const [topCourses] = await pool.execute(`
            SELECT c.name, COUNT(e.id) as value
            FROM course c
            LEFT JOIN enrollment e ON c.id = e.courseId
            GROUP BY c.id, c.name
            ORDER BY value DESC
            LIMIT 5
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
                (SELECT u.fullName as user, CONCAT('enrolled in ', c.name) as action, e.enrolledAt as time 
                 FROM enrollment e 
                 JOIN student s ON e.studentId = s.id 
                 JOIN user u ON s.userId = u.id 
                 JOIN course c ON e.courseId = c.id
                 WHERE e.enrolledAt >= DATE_SUB(NOW(), INTERVAL 2 DAY))
                UNION
                (SELECT u.fullName as user, CONCAT('submitted ', a.title) as action, sub.submittedAt as time 
                 FROM assignmentsubmission sub 
                 JOIN student s ON sub.studentId = s.id 
                 JOIN user u ON s.userId = u.id 
                 JOIN assignment a ON sub.assignmentId = a.id
                 WHERE sub.submittedAt >= DATE_SUB(NOW(), INTERVAL 2 DAY))
                UNION
                (SELECT fullName as user, 'joined the platform' as action, createdAt as time 
                 FROM user
                 WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 2 DAY))
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
                ROUND(IFNULL(SUM(CASE WHEN e.status = 'completed' THEN 1 ELSE 0 END) / COUNT(e.id) * 100, 0), 1) as rate
            FROM course c
            LEFT JOIN enrollment e ON c.id = e.courseId
            GROUP BY c.id, c.name
            ORDER BY enr DESC
            LIMIT 5
        `);

        res.json({
            totalStudents,
            totalTeachers,
            totalCourses,
            totalEnrollments,
            totalParents,
            pendingReviews,
            enrollmentChange,
            completionRate,
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

module.exports = {
    deleteUser,
    getAllUsers,
    getDashboardStats
};
