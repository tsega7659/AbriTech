const pool = require('../config/db');

// Link a parent to a student using a referral code
const linkStudent = async (req, res) => {
  // Ensure req.body exists (in case middleware didn't parse it)
  if (!req.body) {
    return res.status(400).json({ message: "Request body is missing. Ensure you are sending JSON and Content-Type: application/json header." });
  }

  const { referralCode } = req.body;
  const currentUserId = req.user.userId;

  if (!referralCode) {
    return res.status(400).json({ message: "Referral code is required" });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // 1. Get Parent ID
    const [parents] = await conn.execute('SELECT id FROM parent WHERE userId = ?', [currentUserId]);
    if (parents.length === 0) {
      await conn.rollback();
      return res.status(403).json({ message: "Access denied. Not a parent account." });
    }
    const parentId = parents[0].id;

    // 2. Find Student by Referral Code
    const [students] = await conn.execute('SELECT id, isCurrentStudent FROM student WHERE referralCode = ?', [referralCode]);
    if (students.length === 0) {
      await conn.rollback();
      return res.status(404).json({ message: "Invalid referral code" });
    }
    const studentId = students[0].id;

    // 3. Check if already linked
    const [existingLink] = await conn.execute(
      'SELECT id FROM parentstudent WHERE parentId = ? AND studentId = ?',
      [parentId, studentId]
    );
    if (existingLink.length > 0) {
      await conn.rollback();
      return res.status(400).json({ message: "Student already linked to this parent" });
    }

    // 4. Create Link
    await conn.execute(
      'INSERT INTO parentstudent (parentId, studentId) VALUES (?, ?)',
      [parentId, studentId]
    );

    await conn.commit();
    res.status(200).json({ message: "Student linked successfully" });

  } catch (error) {
    await conn.rollback();
    console.error("Link Student Error:", error);
    res.status(500).json({ message: "Failed to link student" });
  } finally {
    conn.release();
  }
};

const getDashboard = async (req, res) => {
  try {
    const { userId } = req.user; // From auth middleware

    // Get parent ID
    const [parents] = await pool.execute('SELECT id FROM parent WHERE userId = ?', [userId]);
    if (parents.length === 0) {
      return res.status(403).json({ message: "Access denied. Not a parent account." });
    }
    const parentId = parents[0].id;

    // Get linked students count
    const [linkedStudents] = await pool.execute(
      'SELECT COUNT(*) as count FROM parentstudent WHERE parentId = ?',
      [parentId]
    );

    // Get total course enrollments for all linked students
    const [courseEnrollments] = await pool.execute(`
      SELECT COUNT(*) as count 
      FROM enrollment e
      JOIN parentstudent ps ON e.studentId = ps.studentId
      WHERE ps.parentId = ?
    `, [parentId]);

    // Placeholders for now
    const totalLessonsCompleted = 0;
    const averageQuizScore = 0;

    res.json({
      linkedStudents: linkedStudents[0].count,
      totalCourseEnrollments: courseEnrollments[0].count,
      totalLessonsCompleted,
      averageQuizScore
    });
  } catch (error) {
    console.error('Get Parent Dashboard Error:', error);
    res.status(500).json({ message: 'Failed to fetch dashboard data', error: error.message });
  }
};

const getLinkedStudents = async (req, res) => {
  try {
    const { userId } = req.user; // From auth middleware

    // Get parent ID
    const [parents] = await pool.execute('SELECT id FROM parent WHERE userId = ?', [userId]);
    if (parents.length === 0) {
      return res.status(403).json({ message: "Access denied. Not a parent account." });
    }
    const parentId = parents[0].id;

    // Get linked students with their data
    const [students] = await pool.execute(`
      SELECT 
        u.id,
        u.fullName,
        u.email,
        s.classLevel,
        s.schoolName,
        (SELECT COUNT(*) FROM enrollment WHERE studentId = s.id) as enrolledCourses,
        (SELECT AVG(progressPercentage) FROM enrollment WHERE studentId = s.id) as averageProgress
      FROM user u
      JOIN student s ON u.id = s.userId
      JOIN parentstudent ps ON s.id = ps.studentId
      WHERE ps.parentId = ?
    `, [parentId]);

    res.json(students);
  } catch (error) {
    console.error('Get Linked Students Error:', error);
    res.status(500).json({ message: 'Failed to fetch linked students', error: error.message });
  }
};

const getParents = async (req, res) => {
  // Placeholder/Future implementation
  res.status(501).json({ message: "Not Implemented" });
};

const getParentById = async (req, res) => {
  // Placeholder/Future implementation
  res.status(501).json({ message: "Not Implemented" });
};

module.exports = {
  getParents,
  getParentById,
  linkStudent,
  getDashboard,
  getLinkedStudents
};