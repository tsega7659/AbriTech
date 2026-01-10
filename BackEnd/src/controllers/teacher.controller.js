const pool = require('../config/db');

const getAllTeachers = async (req, res) => {
    try {
        const [teachers] = await pool.execute(`
      SELECT 
        u.id, 
        u.fullName, 
        u.email, 
        u.username, 
        u.phoneNumber, 
        u.gender, 
        u.address, 
        t.specialization,
        JSON_ARRAYAGG(c.name) as assignedCourses
      FROM user u
      JOIN teacher t ON u.id = t.userId
      LEFT JOIN teachercourse tc ON u.id = tc.teacherId
      LEFT JOIN course c ON tc.courseId = c.id
      GROUP BY u.id
    `);
        res.json(teachers);
    } catch (error) {
        console.error('Get All Teachers Error:', error);
        res.status(500).json({ message: 'Failed to fetch teachers', error: error.message });
    }
};

const getDashboard = async (req, res) => {
    try {
        const { userId } = req.user; // From auth middleware

        // Get assigned courses count
        const [assignedCourses] = await pool.execute(
            'SELECT COUNT(*) as count FROM teachercourse WHERE teacherId = ?',
            [userId]
        );

        // Get total students across all assigned courses
        const [totalStudents] = await pool.execute(`
            SELECT COUNT(DISTINCT e.studentId) as count
            FROM teachercourse tc
            JOIN enrollment e ON tc.courseId = e.courseId
            WHERE tc.teacherId = ?
        `, [userId]);

        // Placeholders for now
        const activeAssignments = 0;
        const averageCompletion = 0;

        res.json({
            assignedCourses: assignedCourses[0].count,
            totalStudents: totalStudents[0].count,
            activeAssignments,
            averageCompletion
        });
    } catch (error) {
        console.error('Get Teacher Dashboard Error:', error);
        res.status(500).json({ message: 'Failed to fetch dashboard data', error: error.message });
    }
};

const getAssignedCourses = async (req, res) => {
    try {
        const { userId } = req.user; // From auth middleware

        const [courses] = await pool.execute(`
            SELECT 
                c.id,
                c.name,
                c.description,
                c.image,
                c.level,
                c.category,
                COUNT(DISTINCT e.studentId) as enrolledStudents
            FROM course c
            JOIN teachercourse tc ON c.id = tc.courseId
            LEFT JOIN enrollment e ON c.id = e.courseId
            WHERE tc.teacherId = ?
            GROUP BY c.id
            ORDER BY c.name
        `, [userId]);

        res.json(courses);
    } catch (error) {
        console.error('Get Assigned Courses Error:', error);
        res.status(500).json({ message: 'Failed to fetch assigned courses', error: error.message });
    }
};

module.exports = {
    getAllTeachers,
    getDashboard,
    getAssignedCourses
};
