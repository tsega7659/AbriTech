const pool = require('../config/db');

const getAllBlogs = async (req, res) => {
  try {
    const [blogs] = await pool.execute(
      'SELECT b.*, u.fullName as authorName FROM blog b LEFT JOIN user u ON b.createdBy = u.id ORDER BY b.createdAt DESC'
    );
    res.json(blogs);
  } catch (error) {
    console.error('Get All Blogs Error:', error);
    res.status(500).json({ message: 'Failed to fetch blogs', error: error.message });
  }
};

const createBlog = async (req, res) => {
  try {
    const { title, content } = req.body;
    const coverImage = req.file ? `/uploads/${req.file.filename}` : null;
    const createdBy = req.user.userId; // Assumes authenticateToken middleware adds user to req

    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }

    const [result] = await pool.execute(
      'INSERT INTO blog (title, content, coverImage, createdBy) VALUES (?, ?, ?, ?)',
      [title, content, coverImage, createdBy]
    );

    const newBlogId = result.insertId;
    const [newBlog] = await pool.execute('SELECT * FROM blog WHERE id = ?', [newBlogId]);

    res.status(201).json(newBlog[0]);
  } catch (error) {
    console.error('Create Blog Error:', error);
    res.status(500).json({ message: 'Failed to create blog', error: error.message });
  }
};

const getBlogById = async (req, res) => {
  try {
    const { id } = req.params;
    const [blogs] = await pool.execute(
      'SELECT b.*, u.fullName as authorName FROM blog b LEFT JOIN user u ON b.createdBy = u.id WHERE b.id = ?',
      [id]
    );

    if (blogs.length === 0) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    res.json(blogs[0]);
  } catch (error) {
    console.error('Get Blog By ID Error:', error);
    res.status(500).json({ message: 'Failed to fetch blog', error: error.message });
  }
};

module.exports = {
  getAllBlogs,
  createBlog,
  getBlogById
};