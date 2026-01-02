const express = require('express');
const router = express.Router();

const blogController = require('../controllers/blog.controller');
const { authenticateToken, authorizeRole } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

// Public route to get all blogs
router.get('/', blogController.getAllBlogs);

// Protected route to create a blog (Admin only)
// Note: Frontend should send 'coverImage' field for the file
router.post('/', authenticateToken, authorizeRole('admin'), upload.single('coverImage'), blogController.createBlog);

router.get('/:id', blogController.getBlogById);

module.exports = router;