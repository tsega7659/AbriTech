const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contact.controller');
const { authenticateToken, authorizeRole } = require('../middleware/auth.middleware');

// Public route
router.post('/', contactController.submitMessage);

// Admin routes
router.get('/admin/messages', authenticateToken, authorizeRole('admin'), contactController.getMessages);
router.patch('/admin/messages/:id/status', authenticateToken, authorizeRole('admin'), contactController.updateMessageStatus);
router.post('/admin/messages/:id/reply', authenticateToken, authorizeRole('admin'), contactController.replyToMessage);

module.exports = router;
