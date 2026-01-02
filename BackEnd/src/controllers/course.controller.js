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

module.exports = {
  getAllCourses,
  createCourse
};