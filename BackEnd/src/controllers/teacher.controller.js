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

module.exports = {
    getAllTeachers
};
