const express = require('express');
const router = express.Router();

const blogController = require('../controllers/blog.controller');
const { authenticateToken, authorizeRole } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

// Public route to get all blogs
router.get('/', blogController.getAllBlogs);

// Protected route to create a blog (Admin only)
// Note: Frontend should send 'image' field for the file
router.post('/', authenticateToken, authorizeRole('admin'), upload('blog_covers').single('image'), blogController.createBlog);
router.put('/:id', authenticateToken, authorizeRole('admin'), upload('blog_covers').single('image'), blogController.updateBlog);
router.delete('/:id', authenticateToken, authorizeRole('admin'), blogController.deleteBlog);

router.get('/:id', blogController.getBlogById);

module.exports = router;