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

    // Get student ID from userId
    const [students] = await pool.execute('SELECT id FROM student WHERE userId = ?', [userId]);
    if (students.length === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }
    const studentId = students[0].id;

    // Get enrolled courses count
    const [enrolledCourses] = await pool.execute(
      'SELECT COUNT(*) as count FROM enrollment WHERE studentId = ?',
      [studentId]
    );

    // Get completed lessons count
    const [completedLessonsResult] = await pool.execute(
      'SELECT COUNT(*) as count FROM lessonprogress WHERE studentId = ? AND completed = 1',
      [studentId]
    );
    const lessonsCompleted = completedLessonsResult[0].count;

    // Get average quiz score
    const [quizResult] = await pool.execute(
      'SELECT AVG(isCorrect * 100) as average FROM quizattempt WHERE studentId = ?',
      [studentId]
    );
    const averageScore = quizResult[0].average !== null ? Math.round(quizResult[0].average) : 0;

    // Placeholder for learning time (can be estimated later)
    const learningTime = 'Est. 2h';

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
    // Get student ID from userId
    const [studentsResult] = await pool.execute('SELECT id FROM student WHERE userId = ?', [userId]);
    if (studentsResult.length === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }
    const studentId = studentsResult[0].id;

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
    `, [studentId]);

    res.json(courses);
  } catch (error) {
    console.error('Get Enrolled Courses Error:', error);
    res.status(500).json({ message: 'Failed to fetch enrolled courses', error: error.message });
  }
};

const getStudentGrades = async (req, res) => {
  try {
    const { userId } = req.user;
    const [students] = await pool.execute('SELECT id FROM student WHERE userId = ?', [userId]);
    if (students.length === 0) return res.status(404).json({ message: 'Student not found' });
    const studentId = students[0].id;

    // Fetch all enrolled courses first to ensure they are all listed
    const [enrollments] = await pool.execute(`
      SELECT c.id, c.name 
      FROM enrollment e
      JOIN course c ON e.courseId = c.id
      WHERE e.studentId = ?
    `, [studentId]);

    const courseGrades = {};
    enrollments.forEach(e => {
      courseGrades[e.id] = { courseId: e.id, courseName: e.name, quizzes: [], assignments: [] };
    });

    // Fetch quiz results grouped by course
    const [quizzes] = await pool.execute(`
      SELECT 
        c.id as courseId,
        l.title as lessonTitle,
        SUM(qa.isCorrect) as correctAnswers,
        COUNT(qa.id) as totalQuestions,
        MAX(qa.attemptedAt) as lastAttempted
      FROM enrollment e
      JOIN course c ON e.courseId = c.id
      JOIN lesson l ON c.id = l.courseId
      JOIN lessonquiz lq ON l.id = lq.lessonId
      JOIN quizattempt qa ON lq.id = qa.quizId
      WHERE e.studentId = ? AND qa.studentId = ?
      GROUP BY c.id, l.id
      ORDER BY lastAttempted DESC
    `, [studentId, studentId]);

    // Fetch assignment submissions
    const [assignments] = await pool.execute(`
      SELECT 
        c.id as courseId,
        a.title as assignmentTitle,
        asub.status,
        asub.result,
        asub.score,
        asub.maxScore,
        asub.feedback,
        asub.submittedAt
      FROM enrollment e
      JOIN course c ON e.courseId = c.id
      JOIN assignment a ON c.id = a.courseId
      JOIN assignmentsubmission asub ON a.id = asub.assignmentId
      WHERE e.studentId = ? AND asub.studentId = ?
      ORDER BY asub.submittedAt DESC
    `, [studentId, studentId]);

    // Process Quizzes
    quizzes.forEach(q => {
      if (courseGrades[q.courseId]) {
        courseGrades[q.courseId].quizzes.push({
          lessonTitle: q.lessonTitle,
          score: Math.round((Number(q.correctAnswers) / Number(q.totalQuestions)) * 100),
          date: q.lastAttempted
        });
      }
    });

    // Process Assignments
    assignments.forEach(a => {
      if (courseGrades[a.courseId]) {
        courseGrades[a.courseId].assignments.push({
          title: a.assignmentTitle,
          status: a.status,
          result: a.result,
          score: a.score,
          maxScore: a.maxScore,
          feedback: a.feedback,
          date: a.submittedAt
        });
      }
    });

    res.json(Object.values(courseGrades));
  } catch (error) {
    console.error('Get Student Grades Error:', error);
    res.status(500).json({ message: 'Failed to fetch grades', error: error.message });
  }
};

const deleteStudent = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const { id } = req.params; // This is the user ID from the join

    await conn.beginTransaction();

    // 1. Get student ID if needed (though we usually delete by userId for user records)
    const [student] = await conn.execute('SELECT id FROM student WHERE userId = ?', [id]);

    if (student.length === 0) {
      await conn.rollback();
      return res.status(404).json({ message: 'Student not found' });
    }

    // 2. Delete student record (should trigger cascade if configured, but let's be explicit)
    await conn.execute('DELETE FROM student WHERE userId = ?', [id]);

    // 3. Delete user record
    await conn.execute('DELETE FROM user WHERE id = ?', [id]);

    await conn.commit();
    res.json({ message: 'Student and associated user deleted successfully' });
  } catch (error) {
    await conn.rollback();
    console.error('Delete Student Error:', error);
    res.status(500).json({ message: 'Failed to delete student', error: error.message });
  } finally {
    conn.release();
  }
};

module.exports = {
  getAllStudents,
  getDashboard,
  getEnrolledCourses,
  getStudentGrades,
  deleteStudent
};