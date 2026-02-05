const express = require('express');
const router = express.Router();

const blogController = require('../controllers/blog.controller');
const { authenticateToken, authorizeRole } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

// Public route to get all blogs
router.get('/', blogController.getAllBlogs);

// Protected route to create a blog (Admin only)
router.post('/', authenticateToken, authorizeRole('admin'), upload('blog_media').fields([{ name: 'image', maxCount: 1 }, { name: 'sectionMedia', maxCount: 10 }]), blogController.createBlog);
router.put('/:id', authenticateToken, authorizeRole('admin'), upload('blog_media').fields([{ name: 'image', maxCount: 1 }, { name: 'sectionMedia', maxCount: 10 }]), blogController.updateBlog);
router.delete('/:id', authenticateToken, authorizeRole('admin'), blogController.deleteBlog);

router.get('/:id', blogController.getBlogById);

module.exports = router;