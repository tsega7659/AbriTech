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

const createCourse = async (req, res) => {
  try {
    const { name, category, level, description } = req.body;

    // Handle Image Upload
    let imageUrl = '';
    if (req.file) {
      // Store relative path like '/uploads/filename.ext'
      imageUrl = `/uploads/${req.file.filename}`;
    }

    // Basic Validation
    if (!name || !category || !level) {
      return res.status(400).json({ message: 'Name, Category, and Level are required.' });
    }

    // Placeholder for youtubeLink as per instruction
    const youtubeLink = '#lesson-video-links';

    const [result] = await pool.execute(
      'INSERT INTO course (name, category, level, youtubeLink, image, description) VALUES (?, ?, ?, ?, ?, ?)',
      [name, category, level, youtubeLink, imageUrl || null, description || null]
    );

    res.status(201).json({
      message: 'Course created successfully',
      courseId: result.insertId,
      course: { id: result.insertId, name, category, level, youtubeLink, image: imageUrl, description }
    });

  } catch (error) {
    console.error('Create Course Error:', error);
    res.status(500).json({ message: 'Failed to create course', error: error.message });
  }
};

const enrollCourse = async (req, res) => {
  try {
    const { courseId } = req.body;
    const { userId } = req.user; // From auth middleware

    if (!courseId) {
      return res.status(400).json({ message: 'Course ID is required' });
    }

    // Get student ID from userId
    const [students] = await pool.execute('SELECT id FROM student WHERE userId = ?', [userId]);
    if (students.length === 0) {
      return res.status(403).json({ message: 'Access denied. Not a student account.' });
    }
    const studentId = students[0].id;

    // Check if already enrolled
    const [existing] = await pool.execute(
      'SELECT id FROM enrollment WHERE studentId = ? AND courseId = ?',
      [studentId, courseId]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: 'Already enrolled in this course' });
    }

    // Enroll student
    await pool.execute(
      'INSERT INTO enrollment (studentId, courseId, progressPercentage, status) VALUES (?, ?, 0, "active")',
      [studentId, courseId]
    );

    res.status(200).json({ message: 'Successfully enrolled in course' });

  } catch (error) {
    console.error('Enroll Course Error:', error);
    res.status(500).json({ message: 'Failed to enroll in course', error: error.message });
  }
};

module.exports = {
  getAllCourses,
  createCourse,
  enrollCourse
};