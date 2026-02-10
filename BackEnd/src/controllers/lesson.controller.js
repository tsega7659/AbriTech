const pool = require('../config/db');

// Helper to determine content URL based on type
const getContentUrl = (req, type) => {
  if (type === 'link') {
    return req.body.contentUrl; // Expected to be passed in body
  }
  if (req.file) {
    return req.file.path; // From cloudinary/multer
  }
  return null;
};

const createLesson = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { courseId, title, description, summaryText, orderNumber, contentType, resources: resourcesJson, quiz: quizJson } = req.body;

    // Validate required fields
    if (!courseId || !title || !description || !orderNumber) {
      return res.status(400).json({ message: 'CourseId, Title, Description, and OrderNumber are required.' });
    }

    let resources = [];
    if (resourcesJson && contentType !== 'quiz') {
      try {
        resources = JSON.parse(resourcesJson);
      } catch (e) {
        console.error('Failed to parse resources JSON:', e);
      }
    }

    // Insert Lesson first
    const [lessonResult] = await connection.execute(
      'INSERT INTO lesson (courseId, title, description, summaryText, orderNumber, contentType) VALUES (?, ?, ?, ?, ?, ?)',
      [courseId, title, description, summaryText || null, orderNumber, contentType || 'lesson']
    );

    const lessonId = lessonResult.insertId;

    // Handle Resources
    if (resources.length > 0) {
      for (let i = 0; i < resources.length; i++) {
        const resItem = resources[i];
        let contentUrl = resItem.contentUrl || null;

        if (['video', 'image', 'file'].includes(resItem.type) && !contentUrl) {
          const file = req.files && req.files.find(f => f.fieldname === `file_${i}` || f.fieldname === 'file');
          if (file) {
            contentUrl = file.path;
          }
        }

        await connection.execute(
          'INSERT INTO lesson_resource (lessonId, type, contentUrl, textContent, orderNumber) VALUES (?, ?, ?, ?, ?)',
          [lessonId, resItem.type, contentUrl, resItem.textContent || null, i + 1]
        );
      }
    }

    // Handle Quiz
    let quizQuestions = [];
    if (quizJson && (contentType === 'quiz' || contentType === 'lesson')) {
      try {
        quizQuestions = JSON.parse(quizJson);
      } catch (e) {
        console.error('Failed to parse quiz JSON:', e);
      }
    }

    if (quizQuestions.length > 0) {
      for (const q of quizQuestions) {
        await connection.execute(
          'INSERT INTO lessonquiz (lessonId, question, optionA, optionB, optionC, optionD, correctOption) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [lessonId, q.question, q.optionA, q.optionB, q.optionC, q.optionD, q.correctOption]
        );
      }
    }

    await connection.commit();

    res.status(201).json({
      message: 'Lesson created successfully',
      lessonId: lessonId,
      lesson: {
        id: lessonId,
        courseId,
        title,
        description,
        orderNumber,
        contentType: contentType || 'lesson',
        resourcesCount: resources.length,
        quizQuestionsCount: quizQuestions.length
      }
    });

  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Create Lesson Error:', error);
    res.status(500).json({ message: 'Failed to create lesson', error: error.message });
  } finally {
    if (connection) connection.release();
  }
};

const getLessons = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { userId, role } = req.user || {};

    if (!courseId) {
      return res.status(400).json({ message: 'Course ID is required' });
    }

    let studentId = null;
    if (role === 'student' && userId) {
      const [students] = await pool.execute('SELECT id FROM student WHERE userId = ?', [userId]);
      if (students.length > 0) studentId = students[0].id;
    }

    const [lessons] = await pool.execute(
      'SELECT * FROM lesson WHERE courseId = ? ORDER BY orderNumber ASC',
      [courseId]
    );

    if (lessons.length === 0) {
      return res.json({ lessons: [] });
    }

    const lessonIds = lessons.map(l => l.id);
    const [resources] = await pool.execute(
      `SELECT * FROM lesson_resource WHERE lessonId IN (${lessonIds.join(',')}) ORDER BY lessonId, orderNumber ASC`
    );

    const resourcesMap = {};
    resources.forEach(r => {
      if (!resourcesMap[r.lessonId]) resourcesMap[r.lessonId] = [];
      resourcesMap[r.lessonId].push(r);
    });

    let progressMap = {};
    if (studentId) {
      const [progress] = await pool.execute(
        `SELECT lessonId, completed FROM lessonprogress 
         WHERE studentId = ? AND lessonId IN (${lessonIds.join(',')})`,
        [studentId]
      );
      progress.forEach(p => {
        progressMap[p.lessonId] = p.completed === 1;
      });
    }

    const [quizzes] = await pool.execute(
      `SELECT * FROM lessonquiz WHERE lessonId IN (${lessonIds.join(',')})`
    );

    // Fetch Quiz Results for the student
    let quizResultsMap = {};
    if (studentId) {
      const [results] = await pool.execute(`
          SELECT 
            lq.lessonId,
            SUM(qa.isCorrect) as correctCount,
            COUNT(qa.id) as totalQuestions
          FROM quizattempt qa
          JOIN lessonquiz lq ON qa.quizId = lq.id
          WHERE qa.studentId = ? AND lq.lessonId IN (${lessonIds.join(',')})
          GROUP BY lq.lessonId
      `, [studentId]);

      results.forEach(r => {
        quizResultsMap[r.lessonId] = {
          correctCount: r.correctCount,
          totalQuestions: r.totalQuestions,
          passed: r.correctCount === r.totalQuestions // Or whatever pass criteria
        };
      });
    }

    const quizMap = {};
    quizzes.forEach(q => {
      if (!quizMap[q.lessonId]) quizMap[q.lessonId] = [];
      quizMap[q.lessonId].push(q);
    });

    const processedLessons = [];
    let previousCompleted = true;

    for (let i = 0; i < lessons.length; i++) {
      const l = lessons[i];
      l.resources = resourcesMap[l.id] || [];
      l.quiz = quizMap[l.id] || [];

      const isCompleted = !!progressMap[l.id];
      const isLocked = studentId ? !previousCompleted : false;

      processedLessons.push({
        ...l,
        isCompleted,
        isLocked,
        quizResult: quizResultsMap[l.id] || null
      });

      previousCompleted = isCompleted;
    }

    res.json({ lessons: processedLessons });

  } catch (error) {
    console.error('Get Lessons Error:', error);
    res.status(500).json({ message: 'Failed to fetch lessons', error: error.message });
  }
};

const getLessonById = async (req, res) => {
  try {
    const { id } = req.params;
    const [lessons] = await pool.execute('SELECT * FROM lesson WHERE id = ?', [id]);

    if (lessons.length === 0) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    const lesson = lessons[0];
    const [resources] = await pool.execute(
      'SELECT * FROM lesson_resource WHERE lessonId = ? ORDER BY orderNumber ASC',
      [id]
    );
    lesson.resources = resources;

    const [quiz] = await pool.execute(
      'SELECT * FROM lessonquiz WHERE lessonId = ?',
      [id]
    );
    lesson.quiz = quiz;

    res.json(lesson);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching lesson', error: error.message });
  }
};

const updateLesson = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { id } = req.params;
    const { title, description, summaryText, orderNumber, contentType, resources: resourcesJson, quiz: quizJson } = req.body;

    let updateFields = [];
    let updateValues = [];

    if (title) { updateFields.push('title = ?'); updateValues.push(title); }
    if (description) { updateFields.push('description = ?'); updateValues.push(description); }
    if (summaryText) { updateFields.push('summaryText = ?'); updateValues.push(summaryText); }
    if (orderNumber) { updateFields.push('orderNumber = ?'); updateValues.push(orderNumber); }
    if (contentType) { updateFields.push('contentType = ?'); updateValues.push(contentType); }

    if (updateFields.length > 0) {
      updateValues.push(id);
      const query = `UPDATE lesson SET ${updateFields.join(', ')} WHERE id = ?`;
      await connection.execute(query, updateValues);
    }

    if (resourcesJson) {
      let resources = [];
      try {
        resources = JSON.parse(resourcesJson);
      } catch (e) {
        console.error('Failed to parse resources JSON:', e);
      }

      // If switching to quiz, we might want to keep or clear resources.
      // For now, let's just process if provided.
      if (resources.length > 0) {
        await connection.execute('DELETE FROM lesson_resource WHERE lessonId = ?', [id]);

        for (let i = 0; i < resources.length; i++) {
          const resItem = resources[i];
          let contentUrl = resItem.contentUrl || null;

          const file = req.files && req.files.find(f => f.fieldname === `file_${i}` || (resources.length === 1 && f.fieldname === 'file'));
          if (file) {
            contentUrl = file.path;
          }

          await connection.execute(
            'INSERT INTO lesson_resource (lessonId, type, contentUrl, textContent, orderNumber) VALUES (?, ?, ?, ?, ?)',
            [id, resItem.type, contentUrl, resItem.textContent || null, i + 1]
          );
        }
      }
    }

    if (quizJson) {
      let quizQuestions = [];
      try {
        quizQuestions = JSON.parse(quizJson);
      } catch (e) {
        console.error('Failed to parse quiz JSON:', e);
      }

      await connection.execute('DELETE FROM lessonquiz WHERE lessonId = ?', [id]);
      if (quizQuestions.length > 0) {
        for (const q of quizQuestions) {
          await connection.execute(
            'INSERT INTO lessonquiz (lessonId, question, optionA, optionB, optionC, optionD, correctOption) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [id, q.question, q.optionA, q.optionB, q.optionC, q.optionD, q.correctOption]
          );
        }
      }
    }

    await connection.commit();

    const [updated] = await connection.execute('SELECT * FROM lesson WHERE id = ?', [id]);
    const [newResources] = await connection.execute('SELECT * FROM lesson_resource WHERE lessonId = ? ORDER BY orderNumber ASC', [id]);

    const finalLesson = updated[0];
    finalLesson.resources = newResources;

    res.json({ message: 'Lesson updated', lesson: finalLesson });

  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Update Lesson Error:', error);
    res.status(500).json({ message: 'Failed to update lesson', error: error.message });
  } finally {
    if (connection) connection.release();
  }
};

const deleteLesson = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.execute('DELETE FROM lesson WHERE id = ?', [id]);
    res.json({ message: 'Lesson deleted successfully' });
  } catch (error) {
    console.error('Delete Lesson Error:', error);
    res.status(500).json({ message: 'Failed to delete lesson', error: error.message });
  }
};

const markLessonComplete = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.user;

    const [students] = await pool.execute('SELECT id FROM student WHERE userId = ?', [userId]);
    if (students.length === 0) {
      return res.status(403).json({ message: 'Not a student' });
    }
    const studentId = students[0].id;

    // Check if it's a quiz content type. If so, completion might be handled via submitQuiz.
    // However, keeping this for manual completion if needed, but usually quizzes are auto-completed on pass.
    const [lessonInfo] = await pool.execute('SELECT contentType FROM lesson WHERE id = ?', [id]);
    if (lessonInfo.length > 0 && lessonInfo[0].contentType === 'quiz') {
      // For quizzes, we might require passing before allowing this endpoint to work manually?
      // Or just allow it. Let's allow it for now.
    }

    const [existing] = await pool.execute(
      'SELECT id FROM lessonprogress WHERE studentId = ? AND lessonId = ?',
      [studentId, id]
    );

    if (existing.length > 0) {
      await pool.execute(
        'UPDATE lessonprogress SET completed = 1, completedAt = NOW() WHERE id = ?',
        [existing[0].id]
      );
    } else {
      await pool.execute(
        'INSERT INTO lessonprogress (studentId, lessonId, completed, completedAt) VALUES (?, ?, 1, NOW())',
        [studentId, id]
      );
    }

    const [lessonData] = await pool.execute('SELECT courseId FROM lesson WHERE id = ?', [id]);
    if (lessonData.length > 0) {
      const courseId = lessonData[0].courseId;

      const [totalLessonsResult] = await pool.execute(
        'SELECT COUNT(*) as total FROM lesson WHERE courseId = ?',
        [courseId]
      );
      const totalLessons = totalLessonsResult[0].total;

      const [completedLessonsResult] = await pool.execute(
        `SELECT COUNT(*) as completed 
         FROM lessonprogress lp
         JOIN lesson l ON lp.lessonId = l.id
         WHERE lp.studentId = ? AND l.courseId = ? AND lp.completed = 1`,
        [studentId, courseId]
      );
      const completedLessons = completedLessonsResult[0].completed;

      const progressPercentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;
      const status = progressPercentage === 100 ? 'completed' : 'active';

      await pool.execute(
        'UPDATE enrollment SET progressPercentage = ?, status = ? WHERE studentId = ? AND courseId = ?',
        [progressPercentage, status, studentId, courseId]
      );
    }

    res.json({ message: 'Lesson marked as complete' });

  } catch (error) {
    console.error('Complete Lesson Error:', error);
    res.status(500).json({ message: 'Error marking lesson complete', error: error.message });
  }
};

const submitQuiz = async (req, res) => {
  try {
    const { id: lessonId } = req.params;
    const { userId } = req.user;
    const { answers } = req.body;

    const [students] = await pool.execute('SELECT id FROM student WHERE userId = ?', [userId]);
    if (students.length === 0) return res.status(403).json({ message: 'Not a student' });
    const studentId = students[0].id;

    // CHECK FOR EXISTING ATTEMPTS
    // If any question in this lesson has an attempt by this student, block submission.
    const [existingAttempts] = await pool.execute(
      `SELECT qa.id FROM quizattempt qa 
       JOIN lessonquiz lq ON qa.quizId = lq.id 
       WHERE qa.studentId = ? AND lq.lessonId = ? LIMIT 1`,
      [studentId, lessonId]
    );

    if (existingAttempts.length > 0) {
      return res.status(403).json({ message: 'You have already attempted this quiz. Only one attempt is allowed.' });
    }

    const [questions] = await pool.execute('SELECT id, correctOption FROM lessonquiz WHERE lessonId = ?', [lessonId]);

    let correctCount = 0;
    const totalQuestions = questions.length;

    for (const q of questions) {
      const selectedOption = answers[q.id];
      const isCorrect = String(selectedOption) === String(q.correctOption);
      if (isCorrect) correctCount++;

      const [attempts] = await pool.execute(
        'SELECT COALESCE(MAX(attemptNumber), 0) as maxAttempt FROM quizattempt WHERE studentId = ? AND quizId = ?',
        [studentId, q.id]
      );
      const nextAttempt = attempts[0].maxAttempt + 1;

      await pool.execute(
        'INSERT INTO quizattempt (studentId, quizId, selectedOption, isCorrect, attemptNumber, result) VALUES (?, ?, ?, ?, ?, ?)',
        [studentId, q.id, selectedOption || 'NONE', isCorrect ? 1 : 0, nextAttempt, isCorrect ? 'pass' : 'fail']
      );
    }

    const passed = correctCount === totalQuestions;

    // Auto-mark lesson/quiz as complete after any submission
    const [existing] = await pool.execute('SELECT id FROM lessonprogress WHERE studentId = ? AND lessonId = ?', [studentId, lessonId]);
    if (existing.length > 0) {
      await pool.execute('UPDATE lessonprogress SET completed = 1, completedAt = NOW() WHERE id = ?', [existing[0].id]);
    } else {
      await pool.execute('INSERT INTO lessonprogress (studentId, lessonId, completed, completedAt) VALUES (?, ?, 1, NOW())', [studentId, lessonId]);
    }

    // Update Overall Course Progress
    const [lesson] = await pool.execute('SELECT courseId FROM lesson WHERE id = ?', [lessonId]);
    if (lesson.length > 0) {
      const courseId = lesson[0].courseId;
      // ... same progress calculation logic as before ...
      const [totalLessonsResult] = await pool.execute('SELECT COUNT(*) as total FROM lesson WHERE courseId = ?', [courseId]);
      const totalLessons = totalLessonsResult[0].total;
      const [completedLessonsResult] = await pool.execute(
        `SELECT COUNT(*) as completed FROM lessonprogress lp JOIN lesson l ON lp.lessonId = l.id 
           WHERE lp.studentId = ? AND l.courseId = ? AND lp.completed = 1`,
        [studentId, courseId]
      );
      const completedLessons = completedLessonsResult[0].completed;
      const progressPercentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;
      const status = progressPercentage === 100 ? 'completed' : 'active';
      await pool.execute('UPDATE enrollment SET progressPercentage = ?, status = ? WHERE studentId = ? AND courseId = ?', [progressPercentage, status, studentId, courseId]);
    }

    res.json({
      passed,
      correctCount,
      totalQuestions,
      message: 'Quiz submitted successfully. You can now mark this as complete.'
    });

  } catch (error) {
    console.error('Submit Quiz Error:', error);
    res.status(500).json({ message: 'Error submitting quiz', error: error.message });
  }
};

module.exports = {
  getLessons,
  getLessonById,
  createLesson,
  updateLesson,
  deleteLesson,
  markLessonComplete,
  submitQuiz
};