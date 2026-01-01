const pool = require('../config/db');

const getAllStudents = async (req, res) => {
  try {
    const [students] = await pool.execute(`
      SELECT 
        u.id, 
        u.fullName, 
        u.email, 
        u.username, 
        u.phoneNumber, 
        u.gender, 
        u.address, 
        s.classLevel, 
        s.educationLevel, 
        s.schoolName, 
        s.courseLevel, 
        s.parentEmail, 
        s.isCurrentStudent
      FROM user u
      JOIN student s ON u.id = s.userId
    `);
    res.json(students);
  } catch (error) {
    console.error('Get All Students Error:', error);
    res.status(500).json({ message: 'Failed to fetch students', error: error.message });
  }
};

module.exports = {
  getAllStudents
};