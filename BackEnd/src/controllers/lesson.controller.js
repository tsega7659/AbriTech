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

    const { courseId, title, description, summaryText, orderNumber, resources: resourcesJson } = req.body;

    // Validate required fields
    if (!courseId || !title || !description || !orderNumber) {
      return res.status(400).json({ message: 'CourseId, Title, Description, and OrderNumber are required.' });
    }

    let resources = [];
    if (resourcesJson) {
      try {
        resources = JSON.parse(resourcesJson);
      } catch (e) {
        console.error('Failed to parse resources JSON:', e);
      }
    }

    // Insert Lesson first (Keeping old columns for backward compatibility using first resource if available)
    const firstResource = resources[0] || {};
    const [lessonResult] = await connection.execute(
      'INSERT INTO lesson (courseId, title, description, summaryText, orderNumber) VALUES (?, ?, ?, ?, ?)',
      [courseId, title, description, summaryText || null, orderNumber]
    );

    const lessonId = lessonResult.insertId;

    // Handle Resources
    if (resources.length > 0) {
      for (let i = 0; i < resources.length; i++) {
        const resItem = resources[i];
        let contentUrl = resItem.contentUrl || null;

        // If it's a file-based resource and not a link
        if (['video', 'image', 'file'].includes(resItem.type) && !contentUrl) {
          // Look for file in req.files matched by index or fieldname like 'file_0'
          const file = req.files.find(f => f.fieldname === `file_${i}` || f.fieldname === 'file');
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
        resourcesCount: resources.length
      }
    });

  } catch (error) {
    await connection.rollback();
    console.error('Create Lesson Error:', error);
    res.status(500).json({ message: 'Failed to create lesson', error: error.message });
  } finally {
    connection.release();
  }
};

const getLessons = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { userId, role } = req.user || {};

    if (!courseId) {
      return res.status(400).json({ message: 'Course ID is required' });
    }

    // specific handling for student
    let studentId = null;
    if (role === 'student' && userId) {
      const [students] = await pool.execute('SELECT id FROM student WHERE userId = ?', [userId]);
      if (students.length > 0) studentId = students[0].id;
    }

    // Fetch lessons ordered by orderNumber
    const [lessons] = await pool.execute(
      'SELECT * FROM lesson WHERE courseId = ? ORDER BY orderNumber ASC',
      [courseId]
    );

    if (lessons.length === 0) {
      return res.json({ lessons: [] });
    }

    // Fetch resources for all these lessons
    const lessonIds = lessons.map(l => l.id);
    const [resources] = await pool.execute(
      `SELECT * FROM lesson_resource WHERE lessonId IN (${lessonIds.join(',')}) ORDER BY lessonId, orderNumber ASC`
    );

    // Map resources to lessons
    const resourcesMap = {};
    resources.forEach(r => {
      if (!resourcesMap[r.lessonId]) resourcesMap[r.lessonId] = [];
      resourcesMap[r.lessonId].push(r);
    });

    // Handle progress for students
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

    const processedLessons = [];
    let previousCompleted = true;

    for (let i = 0; i < lessons.length; i++) {
      const l = lessons[i];
      l.resources = resourcesMap[l.id] || [];

      const isCompleted = !!progressMap[l.id];
      const isLocked = studentId ? !previousCompleted : false;

      processedLessons.push({
        ...l,
        isCompleted,
        isLocked
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
    const { title, description, summaryText, orderNumber, resources: resourcesJson } = req.body;

    let updateFields = [];
    let updateValues = [];

    if (title) { updateFields.push('title = ?'); updateValues.push(title); }
    if (description) { updateFields.push('description = ?'); updateValues.push(description); }
    if (summaryText) { updateFields.push('summaryText = ?'); updateValues.push(summaryText); }
    if (orderNumber) { updateFields.push('orderNumber = ?'); updateValues.push(orderNumber); }

    if (updateFields.length > 0) {
      updateValues.push(id);
      const query = `UPDATE lesson SET ${updateFields.join(', ')} WHERE id = ?`;
      await connection.execute(query, updateValues);
    }

    // Handle Resources Update
    if (resourcesJson) {
      let resources = [];
      try {
        resources = JSON.parse(resourcesJson);
      } catch (e) {
        console.error('Failed to parse resources JSON:', e);
      }

      if (resources.length > 0) {
        // Simple approach: Delete old resources and insert new ones
        // In a production app, we might want to be more surgical, but this is cleaner for now.
        await connection.execute('DELETE FROM lesson_resource WHERE lessonId = ?', [id]);

        for (let i = 0; i < resources.length; i++) {
          const resItem = resources[i];
          let contentUrl = resItem.contentUrl || null;

          // If it has a file (new upload)
          const file = req.files.find(f => f.fieldname === `file_${i}` || (resources.length === 1 && f.fieldname === 'file'));
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

    await connection.commit();

    // Fetch updated lesson with resources
    const [updated] = await connection.execute('SELECT * FROM lesson WHERE id = ?', [id]);
    const [newResources] = await connection.execute('SELECT * FROM lesson_resource WHERE lessonId = ? ORDER BY orderNumber ASC', [id]);

    const finalLesson = updated[0];
    finalLesson.resources = newResources;

    res.json({ message: 'Lesson updated', lesson: finalLesson });

  } catch (error) {
    await connection.rollback();
    console.error('Update Lesson Error:', error);
    res.status(500).json({ message: 'Failed to update lesson', error: error.message });
  } finally {
    connection.release();
  }
}

const deleteLesson = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.execute('DELETE FROM lesson WHERE id = ?', [id]);
    res.json({ message: 'Lesson deleted successfully' });
  } catch (error) {
    console.error('Delete Lesson Error:', error);
    res.status(500).json({ message: 'Failed to delete lesson', error: error.message });
  }
}

const markLessonComplete = async (req, res) => {
  try {
    const { id } = req.params; // Lesson ID
    const { userId } = req.user;

    // Get student ID
    const [students] = await pool.execute('SELECT id FROM student WHERE userId = ?', [userId]);
    if (students.length === 0) {
      return res.status(403).json({ message: 'Not a student' });
    }
    const studentId = students[0].id;

    // Check if record exists
    const [existing] = await pool.execute(
      'SELECT id FROM lessonprogress WHERE studentId = ? AND lessonId = ?',
      [studentId, id]
    );

    if (existing.length > 0) {
      // Update
      await pool.execute(
        'UPDATE lessonprogress SET completed = 1, completedAt = NOW() WHERE id = ?',
        [existing[0].id]
      );
    } else {
      // Insert
      await pool.execute(
        'INSERT INTO lessonprogress (studentId, lessonId, completed, completedAt) VALUES (?, ?, 1, NOW())',
        [studentId, id]
      );
    }

    // --- Update Course Progress ---
    // 1. Get Course ID for this lesson
    const [lessonData] = await pool.execute('SELECT courseId FROM lesson WHERE id = ?', [id]);
    if (lessonData.length > 0) {
      const courseId = lessonData[0].courseId;

      // 2. Count total lessons in this course
      const [totalLessonsResult] = await pool.execute(
        'SELECT COUNT(*) as total FROM lesson WHERE courseId = ?',
        [courseId]
      );
      const totalLessons = totalLessonsResult[0].total;

      // 3. Count completed lessons for this student in this course
      const [completedLessonsResult] = await pool.execute(
        `SELECT COUNT(*) as completed 
         FROM lessonprogress lp
         JOIN lesson l ON lp.lessonId = l.id
         WHERE lp.studentId = ? AND l.courseId = ? AND lp.completed = 1`,
        [studentId, courseId]
      );
      const completedLessons = completedLessonsResult[0].completed;

      // 4. Calculate percentage
      const progressPercentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;
      const status = progressPercentage === 100 ? 'completed' : 'active';

      // 5. Update Enrollment
      await pool.execute(
        'UPDATE enrollment SET progressPercentage = ?, status = ? WHERE studentId = ? AND courseId = ?',
        [progressPercentage, status, studentId, courseId]
      );

      console.log(`[Progress Update] Student: ${studentId}, Course: ${courseId}, Progress: ${progressPercentage}%`);
    }

    res.json({ message: 'Lesson marked as complete' });

  } catch (error) {
    console.error('Complete Lesson Error:', error);
    res.status(500).json({ message: 'Error marking lesson complete', error: error.message });
  }
}

module.exports = {
  getLessons,
  getLessonById,
  createLesson,
  updateLesson,
  deleteLesson,
  markLessonComplete
};