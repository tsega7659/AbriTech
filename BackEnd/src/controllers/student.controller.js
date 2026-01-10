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

const getDashboard = async (req, res) => {
  try {
    const { userId } = req.user; // From auth middleware

    // Get enrolled courses count
    const [enrolledCourses] = await pool.execute(
      'SELECT COUNT(*) as count FROM enrollment WHERE studentId = ?',
      [userId]
    );

    // Get completed lessons count (assuming you have a lesson completion tracking)
    // For now, we'll use a placeholder
    const lessonsCompleted = 0;

    // Get average score (placeholder for now)
    const averageScore = 0;

    // Get learning time (placeholder for now)
    const learningTime = '0h';

    res.json({
      enrolledCourses: enrolledCourses[0].count,
      lessonsCompleted,
      averageScore,
      learningTime
    });
  } catch (error) {
    console.error('Get Student Dashboard Error:', error);
    res.status(500).json({ message: 'Failed to fetch dashboard data', error: error.message });
  }
};

const getEnrolledCourses = async (req, res) => {
  try {
    const { userId } = req.user; // From auth middleware

    const [courses] = await pool.execute(`
      SELECT 
        c.id,
        c.name,
        c.description,
        c.image,
        c.level,
        e.progressPercentage as progress,
        e.enrolledAt
      FROM course c
      JOIN enrollment e ON c.id = e.courseId
      WHERE e.studentId = ?
      ORDER BY e.enrolledAt DESC
    `, [userId]);

    res.json(courses);
  } catch (error) {
    console.error('Get Enrolled Courses Error:', error);
    res.status(500).json({ message: 'Failed to fetch enrolled courses', error: error.message });
  }
};

module.exports = {
  getAllStudents,
  getDashboard,
  getEnrolledCourses
};