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
  try {
    const { courseId, title, description, summaryText, orderNumber, type, textContent, contentUrl: linkUrl } = req.body;

    // Validate required fields
    if (!courseId || !title || !description || !orderNumber) {
      return res.status(400).json({ message: 'CourseId, Title, Description, and OrderNumber are required.' });
    }

    let finalContentUrl = null;
    if (type === 'link') {
      finalContentUrl = linkUrl;
    } else if (req.file) {
      finalContentUrl = req.file.path;
    }

    // Default type if not provided but file exists
    let finalType = type || 'text';
    if (req.file) {
      if (req.file.mimetype.startsWith('image/')) finalType = 'image';
      else if (req.file.mimetype.startsWith('video/')) finalType = 'video';
      else finalType = 'file';
    } else if (linkUrl) {
      finalType = 'link';
    }

    const [result] = await pool.execute(
      'INSERT INTO lesson (courseId, title, description, summaryText, orderNumber, type, contentUrl, textContent) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [courseId, title, description, summaryText || null, orderNumber, finalType, finalContentUrl, textContent || null]
    );

    res.status(201).json({
      message: 'Lesson created successfully',
      lessonId: result.insertId,
      lesson: {
        id: result.insertId,
        courseId,
        title,
        description,
        type: finalType,
        contentUrl: finalContentUrl,
        orderNumber
      }
    });

  } catch (error) {
    console.error('Create Lesson Error:', error);
    res.status(500).json({ message: 'Failed to create lesson', error: error.message });
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
    console.log(`[getLessons] Request from UserID: ${userId}, Role: ${role}, CourseID: ${courseId}`);

    if (role === 'student' && userId) {
      const [students] = await pool.execute('SELECT id FROM student WHERE userId = ?', [userId]);
      if (students.length > 0) studentId = students[0].id;
      console.log(`[getLessons] Resolved StudentID: ${studentId}`);
    }

    // Fetch lessons ordered by orderNumber
    const [lessons] = await pool.execute(
      'SELECT * FROM lesson WHERE courseId = ? ORDER BY orderNumber ASC',
      [courseId]
    );

    // If not a student or no studentId found (e.g. admin/teacher), return all lessons unlocked
    if (!studentId) {
      return res.json({ lessons: lessons.map(l => ({ ...l, isLocked: false, isCompleted: false })) });
    }

    // Fetch progress for this student and course lessons
    const [progress] = await pool.execute(
      `SELECT lessonId, completed FROM lessonprogress 
       WHERE studentId = ? AND lessonId IN (SELECT id FROM lesson WHERE courseId = ?)`,
      [studentId, courseId]
    );

    const progressMap = {};
    progress.forEach(p => {
      progressMap[p.lessonId] = p.completed === 1;
    });

    // Calculate locked status:
    // Lesson N is locked if Lesson N-1 is NOT completed.
    // Lesson 1 is always unlocked.
    const processedLessons = [];
    let previousCompleted = true; // First lesson is accessible

    for (let i = 0; i < lessons.length; i++) {
      const l = lessons[i];
      const isCompleted = !!progressMap[l.id];

      // Locked if previous is not completed
      const isLocked = !previousCompleted;

      processedLessons.push({
        ...l,
        isCompleted,
        isLocked
      });

      // Update previousCompleted for next iteration
      // Logic: To unlock N+1, N must be completed.
      // But what if N is not completed? Then N+1 is locked.
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

    res.json(lessons[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching lesson', error: error.message });
  }
};

const updateLesson = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, summaryText, orderNumber, type, textContent, contentUrl: linkUrl } = req.body;

    let updateFields = [];
    let updateValues = [];

    if (title) { updateFields.push('title = ?'); updateValues.push(title); }
    if (description) { updateFields.push('description = ?'); updateValues.push(description); }
    if (summaryText) { updateFields.push('summaryText = ?'); updateValues.push(summaryText); }
    if (orderNumber) { updateFields.push('orderNumber = ?'); updateValues.push(orderNumber); }
    if (textContent) { updateFields.push('textContent = ?'); updateValues.push(textContent); }

    // Handle type and content updates
    if (type) { updateFields.push('type = ?'); updateValues.push(type); }

    if (linkUrl && type === 'link') {
      updateFields.push('contentUrl = ?'); updateValues.push(linkUrl);
    } else if (req.file) {
      updateFields.push('contentUrl = ?'); updateValues.push(req.file.path);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    updateValues.push(id);
    const query = `UPDATE lesson SET ${updateFields.join(', ')} WHERE id = ?`;

    await pool.execute(query, updateValues);

    const [updated] = await pool.execute('SELECT * FROM lesson WHERE id = ?', [id]);
    res.json({ message: 'Lesson updated', lesson: updated[0] });

  } catch (error) {
    console.error('Update Lesson Error:', error);
    res.status(500).json({ message: 'Failed to update lesson', error: error.message });
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

    // Update Course Progress (Optional but good for UX)
    // logic to calc % can be added here or separate

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