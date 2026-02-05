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
    const coverImage = req.files && req.files['image'] ? req.files['image'][0].path : null;
    const sectionFiles = req.files && req.files['sectionMedia'] ? req.files['sectionMedia'] : [];
    const createdBy = req.user.userId;

    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }

    // Parse content and attach media URLs
    let parsedContent;
    try {
      parsedContent = JSON.parse(content);
      if (Array.isArray(parsedContent)) {
        let fileIndex = 0;
        parsedContent = parsedContent.map(section => {
          // If section expects a file upload (mediaType is image or video and it's not a link)
          if ((section.mediaType === 'image' || section.mediaType === 'video') && !section.mediaUrl && fileIndex < sectionFiles.length) {
            section.mediaUrl = sectionFiles[fileIndex].path;
            fileIndex++;
          }
          return section;
        });
      }
    } catch (e) {
      parsedContent = content; // Fallback to plain text
    }

    const finalContent = typeof parsedContent === 'string' ? parsedContent : JSON.stringify(parsedContent);

    const [result] = await pool.execute(
      'INSERT INTO blog (title, content, coverImage, createdBy) VALUES (?, ?, ?, ?)',
      [title, finalContent, coverImage, createdBy]
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

const updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;
    const coverImage = req.files && req.files['image'] ? req.files['image'][0].path : undefined;
    const sectionFiles = req.files && req.files['sectionMedia'] ? req.files['sectionMedia'] : [];

    console.log('Update Blog Hit:', { id, title, content, coverImage });

    // Check if blog exists
    const [existing] = await pool.execute('SELECT * FROM blog WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    // Process Content
    let finalContent = content;
    if (content) {
      try {
        let parsedContent = JSON.parse(content);
        if (Array.isArray(parsedContent)) {
          let fileIndex = 0;
          parsedContent = parsedContent.map(section => {
            // If section is image/video and HAS NO mediaUrl, it's a new upload
            if ((section.mediaType === 'image' || section.mediaType === 'video') && !section.mediaUrl && fileIndex < sectionFiles.length) {
              section.mediaUrl = sectionFiles[fileIndex].path;
              fileIndex++;
            }
            return section;
          });
          finalContent = JSON.stringify(parsedContent);
        }
      } catch (e) {
        finalContent = content;
      }
    }

    // Prepare update query
    let query = 'UPDATE blog SET ';
    const params = [];

    if (title) {
      query += 'title = ?, ';
      params.push(title);
    }
    if (finalContent) {
      query += 'content = ?, ';
      params.push(finalContent);
    }
    if (coverImage) {
      query += 'coverImage = ?, ';
      params.push(coverImage);
    }

    // If no fields to update
    if (params.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    // Remove trailing comma and space
    query = query.slice(0, -2);
    query += ' WHERE id = ?';
    params.push(id);

    console.log('Update Blog Query:', query, params);

    await pool.execute(query, params);
    const [updatedBlog] = await pool.execute('SELECT * FROM blog WHERE id = ?', [id]);

    res.json(updatedBlog[0]);
  } catch (error) {
    console.error('Update Blog Error:', error);
    res.status(500).json({ message: 'Failed to update blog', error: error.message });
  }
};

const deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if blog exists
    const [existing] = await pool.execute('SELECT * FROM blog WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    await pool.execute('DELETE FROM blog WHERE id = ?', [id]);

    res.json({ message: 'Blog deleted successfully' });
  } catch (error) {
    console.error('Delete Blog Error:', error);
    res.status(500).json({ message: 'Failed to delete blog', error: error.message });
  }
};

module.exports = {
  getAllBlogs,
  createBlog,
  getBlogById,
  updateBlog,
  deleteBlog
};