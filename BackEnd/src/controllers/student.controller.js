const pool = require('../config/db');

const getAllStudents = async (req, res) => {
  try {
    const [students] = await pool.execute(`
      SELECT 
        u.id, 
        u."fullName", 
        u.email, 
        u.username, 
        u."phoneNumber", 
        u.gender, 
        u.address, 
        s."classLevel", 
        s."educationLevel", 
        s."schoolName", 
        s."courseLevel", 
        s."parentEmail", 
        s."isCurrentStudent"
      FROM "user" u
      JOIN student s ON u.id = s."userId"
    `);
    res.json(students);
  } catch (error) {
    console.error('Get All Students Error:', error);
    res.status(500).json({ message: 'Failed to fetch students', error: error.message });
  }
};

const getDashboard = async (req, res) => {
  try {
    const { userId } = req.user;

    const [students] = await pool.execute('SELECT id, "courseLevel" FROM student WHERE "userId" = ?', [userId]);
    if (students.length === 0) return res.status(404).json({ message: 'Student not found' });
    const studentId = students[0].id;
    const studentCourseLevel = students[0].courseLevel;

    // 1. Core Stats
    const [counts] = await pool.execute(`
      SELECT 
        (SELECT COUNT(*) FROM enrollment WHERE "studentId" = ?) as "enrolledCount",
        (SELECT COUNT(*) FROM enrollment WHERE "studentId" = ? AND "progressPercentage" >= 100) as "completedCount",
        (SELECT COUNT(*) FROM enrollment WHERE "studentId" = ? AND "progressPercentage" < 100) as "activeCount"
    `, [studentId, studentId, studentId]);

    // 2. Average Quiz Score
    const [quizResult] = await pool.execute(
      'SELECT AVG(CASE WHEN "isCorrect" THEN 100 ELSE 0 END) as average FROM quizattempt WHERE "studentId" = ?',
      [studentId]
    );
    const averageScore = quizResult[0].average !== null ? Math.round(quizResult[0].average) : 0;

    // 3. Weekly Learning Time
    const [weeklyTime] = await pool.execute(
      'SELECT SUM("secondsSpent") as "totalSeconds" FROM learning_log WHERE "studentId" = ? AND date >= CURRENT_DATE - INTERVAL \'7 days\'',
      [studentId]
    );
    const weeklySeconds = weeklyTime[0].totalSeconds || 0;
    const weeklyHours = (weeklySeconds / 3600).toFixed(1);

    // 4. Upcoming Quizzes
    const [upcomingQuizzes] = await pool.execute(`
      SELECT l.id, l.title, c.name as "courseName"
      FROM lesson l
      JOIN course c ON l."courseId" = c.id
      JOIN enrollment e ON c.id = e."courseId"
      WHERE e."studentId" = ? 
      AND l."contentType" = 'quiz'
      AND l.id NOT IN (SELECT "quizId" FROM quizattempt WHERE "studentId" = ?)
      LIMIT 3
    `, [studentId, studentId]);

    // 5. Pending Projects
    const [pendingProjects] = await pool.execute(`
      SELECT a.id, a.title, c.name as "courseName", a."dueDate"
      FROM assignment a
      JOIN course c ON a."courseId" = c.id
      JOIN enrollment e ON c.id = e."courseId"
      LEFT JOIN assignmentsubmission s ON a.id = s."assignmentId" AND s."studentId" = ?
      WHERE e."studentId" = ? AND (s.id IS NULL OR s.status = 'draft')
      LIMIT 3
    `, [studentId, studentId]);

    // 6. Recommended Courses
    const [recommended] = await pool.execute(`
      SELECT id, name, category, image, level, price, "isFree"
      FROM course
      WHERE id NOT IN (SELECT "courseId" FROM enrollment WHERE "studentId" = ?)
      AND (level = ? OR category IN (SELECT category FROM course c JOIN enrollment e ON c.id = e."courseId" WHERE e."studentId" = ?))
      LIMIT 4
    `, [studentId, studentCourseLevel, studentId]);

    // 7. Achievements
    const [achievements] = await pool.execute(
      'SELECT * FROM achievement WHERE "studentId" = ? ORDER BY "unlockedAt" DESC LIMIT 6',
      [studentId]
    );

    res.json({
      stats: {
        enrolledCourses: counts[0].enrolledCount,
        activeCourses: counts[0].activeCount,
        completedCourses: counts[0].completedCount,
        averageScore,
        weeklyLearningTime: `${weeklyHours}h`
      },
      upcomingQuizzes,
      pendingProjects,
      recommendedCourses: recommended,
      achievements
    });
  } catch (error) {
    console.error('Get Student Dashboard Error:', error);
    res.status(500).json({ message: 'Failed to fetch dashboard data', error: error.message });
  }
};

const getEnrolledCourses = async (req, res) => {
  try {
    const { userId } = req.user;
    const [studentsResult] = await pool.execute('SELECT s.id, u."fullName" FROM student s JOIN "user" u ON s."userId" = u.id WHERE s."userId" = ?', [userId]);
    if (studentsResult.length === 0) return res.status(404).json({ message: 'Student not found' });
    const studentId = studentsResult[0].id;

    const [courses] = await pool.execute(`
      SELECT 
        c.id,
        c.name,
        c.description,
        c.image,
        c.level,
        c.duration,
        e."progressPercentage" as progress,
        e."timeSpentSeconds",
        e."enrolledAt",
        (SELECT u."fullName" FROM "user" u JOIN teacher t ON u.id = t."userId" JOIN teachercourse tc ON t.id = tc."teacherId" WHERE tc."courseId" = c.id LIMIT 1) as "instructorName",
        (SELECT MAX(lp."completedAt") FROM lessonprogress lp JOIN lesson l ON lp."lessonId" = l.id WHERE lp."studentId" = ? AND l."courseId" = c.id) as "lastAccessed"
      FROM course c
      JOIN enrollment e ON c.id = e."courseId"
      WHERE e."studentId" = ?
      ORDER BY e."enrolledAt" DESC
    `, [studentId, studentId]);

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
        c.id as "courseId",
        l.title as "lessonTitle",
        SUM(CASE WHEN qa."isCorrect" THEN 1 ELSE 0 END) as "correctAnswers",
        COUNT(qa.id) as "totalQuestions",
        MAX(qa."attemptedAt") as "lastAttempted"
      FROM enrollment e
      JOIN course c ON e."courseId" = c.id
      JOIN lesson l ON c.id = l."courseId"
      JOIN lessonquiz lq ON l.id = lq."lessonId"
      JOIN quizattempt qa ON lq.id = qa."quizId"
      WHERE e."studentId" = ? AND qa."studentId" = ?
      GROUP BY c.id, l.id, l.title
      ORDER BY "lastAttempted" DESC
    `, [studentId, studentId]);

    // Fetch assignment submissions
    const [assignments] = await pool.execute(`
      SELECT 
        c.id as "courseId",
        a.title as "assignmentTitle",
        asub."fileUrl",
        asub."textContent",
        asub.status,
        asub.result,
        asub.score,
        asub."maxScore",
        asub.feedback,
        asub."submittedAt"
      FROM enrollment e
      JOIN course c ON e."courseId" = c.id
      JOIN assignment a ON c.id = a."courseId"
      JOIN assignmentsubmission asub ON a.id = asub."assignmentId"
      WHERE e."studentId" = ? AND asub."studentId" = ?
      ORDER BY asub."submittedAt" DESC
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
    await conn.execute('DELETE FROM student WHERE "userId" = ?', [id]);

    // 3. Delete user record
    await conn.execute('DELETE FROM "user" WHERE id = ?', [id]);

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

const updateCourseTimeSpent = async (req, res) => {
  try {
    const { userId } = req.user;
    const { courseId } = req.params;
    const { seconds } = req.body; // Incremental seconds to add

    if (!seconds || isNaN(seconds)) {
      return res.status(400).json({ message: 'Valid seconds count is required' });
    }

    // Get student ID
    const [students] = await pool.execute('SELECT id FROM student WHERE userId = ?', [userId]);
    if (students.length === 0) return res.status(404).json({ message: 'Student not found' });
    const studentId = students[0].id;

    // Update time spent
    await pool.execute(
      'UPDATE enrollment SET "timeSpentSeconds" = "timeSpentSeconds" + ? WHERE "studentId" = ? AND "courseId" = ?',
      [seconds, studentId, courseId]
    );

    // Update daily learning log (for Weekly Learning metric)
    await pool.execute(
      `INSERT INTO learning_log ("studentId", date, "secondsSpent") 
       VALUES (?, CURRENT_DATE, ?) 
       ON CONFLICT ("studentId", date) 
       DO UPDATE SET "secondsSpent" = learning_log."secondsSpent" + EXCLUDED."secondsSpent"`,
      [studentId, seconds]
    );

    res.json({ message: 'Time spent updated successfully' });
  } catch (error) {
    console.error('Update Time Spent Error:', error);
    res.status(500).json({ message: 'Failed to update time spent', error: error.message });
  }
};

const updateStudentProfile = async (req, res) => {
  try {
    const { userId } = req.user;
    const { bio, age, socialLinks } = req.body;
    let profileImage = req.file ? req.file.path : undefined;

    const [existing] = await pool.execute('SELECT id FROM student WHERE userId = ?', [userId]);
    if (existing.length === 0) return res.status(404).json({ message: 'Student not found' });
    const studentId = existing[0].id;

    let query = 'UPDATE student SET ';
    const params = [];

    if (bio !== undefined) { query += 'bio = ?, '; params.push(bio); }
    if (age !== undefined) { query += 'age = ?, '; params.push(age); }
    if (socialLinks !== undefined) { query += '"socialLinks" = ?, '; params.push(JSON.stringify(socialLinks)); }
    if (profileImage !== undefined) { query += '"profileImage" = ?, '; params.push(profileImage); }

    if (params.length === 0) return res.status(400).json({ message: 'No fields to update' });

    query = query.slice(0, -2) + ' WHERE id = ?';
    params.push(studentId);

    await pool.execute(query, params);
    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Update Profile Error:', error);
    res.status(500).json({ message: 'Failed to update profile', error: error.message });
  }
};

const getStudentAnalytics = async (req, res) => {
  try {
    const { userId } = req.user;
    const [students] = await pool.execute('SELECT id FROM student WHERE "userId" = ?', [userId]);
    if (students.length === 0) return res.status(404).json({ message: 'Student not found' });
    const studentId = students[0].id;

    // Student Stats
    const [studentStats] = await pool.execute(`
      SELECT 
        COALESCE(SUM("timeSpentSeconds"), 0) as "totalTime",
        COALESCE(AVG("progressPercentage"), 0) as "avgProgress",
        (SELECT COALESCE(AVG(CASE WHEN "isCorrect" THEN 100 ELSE 0 END), 0) FROM quizattempt WHERE "studentId" = ?) as "avgQuiz"
      FROM enrollment WHERE "studentId" = ?
    `, [studentId, studentId]);

    // Average Stats
    const [avgStats] = await pool.execute(`
      SELECT 
        COALESCE(AVG("timeSpentSeconds"), 0) as "totalTime",
        COALESCE(AVG("progressPercentage"), 0) as "avgProgress",
        (SELECT COALESCE(AVG(CASE WHEN "isCorrect" THEN 100 ELSE 0 END), 0) FROM quizattempt) as "avgQuiz"
      FROM enrollment
    `);

    const stats = studentStats[0];
    const globalAvg = avgStats[0];

    res.json({
      student: {
        timeSpent: Math.round(Number(stats.totalTime || 0) / 3600),
        quizScore: Math.round(Number(stats.avgQuiz || 0)),
        progress: Math.round(Number(stats.avgProgress || 0))
      },
      average: {
        timeSpent: Math.round(Number(globalAvg.totalTime || 0) / 3600),
        quizScore: Math.round(Number(globalAvg.avgQuiz || 0)),
        progress: Math.round(Number(globalAvg.avgProgress || 0))
      }
    });
  } catch (error) {
    console.error('Get Analytics Error:', error);
    res.status(500).json({ message: 'Failed to fetch analytics', error: error.message });
  }
};

const getPortfolioData = async (req, res) => {
  try {
    const { userId } = req.user;
    const [profile] = await pool.execute(`
      SELECT u."fullName", u.email, s.bio, s.age, s."profileImage", s."socialLinks", s."educationLevel", s."classLevel"
      FROM "user" u
      JOIN student s ON u.id = s."userId"
      WHERE u.id = ?
    `, [userId]);

    if (profile.length === 0) return res.status(404).json({ message: 'Student not found' });

    const studentIdResult = await pool.execute('SELECT id FROM student WHERE "userId" = ?', [userId]);
    const studentId = studentIdResult[0][0].id;

    const [completedCourses] = await pool.execute(`
      SELECT c.name, c.category, e."progressPercentage", e."enrolledAt"
      FROM course c
      JOIN enrollment e ON c.id = e."courseId"
      WHERE e."studentId" = ? AND e."progressPercentage" >= 100
    `, [studentId]);

    const [projects] = await pool.execute(`
      SELECT title, description, "imageUrl", "githubLink", "submittedAt"
      FROM project
      WHERE "studentId" = ? AND status = 'approved'
    `, [studentId]);

    res.json({
      profile: profile[0],
      completedCourses,
      projects,
      certificates: [] // Placeholder for certificates
    });
  } catch (error) {
    console.error('Get Portfolio Error:', error);
    res.status(500).json({ message: 'Failed to fetch portfolio data', error: error.message });
  }
};

const getStudentBadges = async (req, res) => {
  try {
    const { userId } = req.user;
    const [badges] = await pool.execute(`
      SELECT b.*, ub."awardedAt"
      FROM badge b
      JOIN userbadge ub ON b.id = ub."badgeId"
      WHERE ub."userId" = ?
      ORDER BY ub."awardedAt" DESC
    `, [userId]);

    res.json(badges);
  } catch (error) {
    console.error('Get Badges Error:', error);
    res.status(500).json({ message: 'Failed to fetch badges', error: error.message });
  }
};

const getCourseAnalytics = async (req, res) => {
  try {
    const { userId } = req.user;
    const { courseId } = req.params;

    // Get student ID
    const [students] = await pool.execute('SELECT id FROM student WHERE "userId" = ?', [userId]);
    if (students.length === 0) return res.status(404).json({ message: 'Student not found' });
    const studentId = students[0].id;

    // 1. Enrollment stats
    const [enrollment] = await pool.execute(`
      SELECT "progressPercentage", "timeSpentSeconds", "enrolledAt"
      FROM enrollment
      WHERE "studentId" = ? AND "courseId" = ?
    `, [studentId, courseId]);

    if (enrollment.length === 0) {
      return res.status(404).json({ message: 'Enrollment not found for this course' });
    }

    // 2. Quiz Stats for this course
    const [quizStats] = await pool.execute(`
      SELECT 
        COUNT(qa.id) as "totalAttempts",
        AVG(CASE WHEN qa."isCorrect" THEN 100 ELSE 0 END) as "avgScore",
        COUNT(DISTINCT lq.id) as "quizzesAttempted"
      FROM lessonquiz lq
      JOIN quizattempt qa ON lq.id = qa."quizId"
      JOIN lesson l ON lq."lessonId" = l.id
      WHERE qa."studentId" = ? AND l."courseId" = ?
    `, [studentId, courseId]);

    // 3. Assignment Stats for this course
    const [assignmentStats] = await pool.execute(`
      SELECT 
        COUNT(s.id) as "submissions",
        AVG(s.score) as "avgScore",
        COUNT(CASE WHEN s.status = 'approved' THEN 1 END) as "completed"
      FROM assignmentsubmission s
      JOIN assignment a ON s."assignmentId" = a.id
      WHERE s."studentId" = ? AND a."courseId" = ?
    `, [studentId, courseId]);

    // 4. Lesson Progress
    const [lessons] = await pool.execute(`
      SELECT COUNT(*) as "total" FROM lesson WHERE "courseId" = ?
    `, [courseId]);

    const [completedLessons] = await pool.execute(`
      SELECT COUNT(*) as "completed" 
      FROM lessonprogress lp
      JOIN lesson l ON lp."lessonId" = l.id
      WHERE lp."studentId" = ? AND l."courseId" = ? AND lp.completed = TRUE
    `, [studentId, courseId]);

    res.json({
      overview: {
        progress: Math.round(enrollment[0].progressPercentage),
        hoursSpent: (enrollment[0].timeSpentSeconds / 3600).toFixed(1),
        enrolledAt: enrollment[0].enrolledAt
      },
      quizzes: {
        totalAttempts: parseInt(quizStats[0].totalAttempts || 0),
        avgScore: Math.round(quizStats[0].avgScore || 0),
        attemptedCount: parseInt(quizStats[0].quizzesAttempted || 0)
      },
      assignments: {
        totalSubmissions: parseInt(assignmentStats[0].submissions || 0),
        avgScore: Math.round(assignmentStats[0].avgScore || 0),
        approvedCount: parseInt(assignmentStats[0].completed || 0)
      },
      lessons: {
        total: parseInt(lessons[0].total || 0),
        completed: parseInt(completedLessons[0].completed || 0)
      }
    });
  } catch (error) {
    console.error('Get Course Analytics Error:', error);
    res.status(500).json({ message: 'Failed to fetch course analytics', error: error.message });
  }
};

module.exports = {
  getAllStudents,
  getDashboard,
  getEnrolledCourses,
  getStudentGrades,
  deleteStudent,
  updateCourseTimeSpent,
  updateStudentProfile,
  getStudentAnalytics,
  getPortfolioData,
  getStudentBadges,
  getCourseAnalytics
};
