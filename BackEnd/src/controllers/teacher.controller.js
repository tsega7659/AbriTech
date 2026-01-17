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

const deleteTeacher = async (req, res) => {
    const conn = await pool.getConnection();
    try {
        const { id } = req.params; // This is the user ID

        await conn.beginTransaction();

        // Check if teacher exists
        const [teacher] = await conn.execute('SELECT id FROM teacher WHERE userId = ?', [id]);
        if (teacher.length === 0) {
            await conn.rollback();
            return res.status(404).json({ message: 'Teacher not found' });
        }

        // 1. Delete teacher courses
        await conn.execute('DELETE FROM teachercourse WHERE teacherId = ?', [id]);

        // 2. Delete teacher record
        await conn.execute('DELETE FROM teacher WHERE userId = ?', [id]);

        // 3. Delete user record
        await conn.execute('DELETE FROM user WHERE id = ?', [id]);

        await conn.commit();
        res.json({ message: 'Teacher and associated records deleted successfully' });
    } catch (error) {
        await conn.rollback();
        console.error('Delete Teacher Error:', error);
        res.status(500).json({ message: 'Failed to delete teacher', error: error.message });
    } finally {
        conn.release();
    }
};

const getEnrolledStudents = async (req, res) => {
    try {
        const { userId } = req.user; // Teacher's userId

        const [students] = await pool.execute(`
            SELECT 
                u.id,
                u.fullName,
                u.email,
                JSON_ARRAYAGG(c.name) as enrolledCourses,
                AVG(e.progressPercentage) as avgProgress
            FROM user u
            JOIN student s ON u.id = s.userId
            JOIN enrollment e ON s.id = e.studentId
            JOIN course c ON e.courseId = c.id
            JOIN teachercourse tc ON c.id = tc.courseId
            WHERE tc.teacherId = ?
            GROUP BY u.id
        `, [userId]);

        res.json(students);
    } catch (error) {
        console.error('Get Enrolled Students Error:', error);
        res.status(500).json({ message: 'Failed to fetch students', error: error.message });
    }
};

module.exports = {
    getAllTeachers,
    getDashboard,
    getAssignedCourses,
    getEnrolledStudents,
    deleteTeacher
};

