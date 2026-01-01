const pool = require('../config/db');

const getAllCourses = async (req, res) => {
  try {
    const [courses] = await pool.execute('SELECT * FROM course');
    res.json(courses);
  } catch (error) {
    console.error('Get All Courses Error:', error);
    res.status(500).json({ message: 'Failed to fetch courses', error: error.message });
  }
};

module.exports = {
  getAllCourses
};