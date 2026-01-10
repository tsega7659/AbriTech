const express = require('express');
const router = express.Router();
const parentController = require('../controllers/parent.controller');
const { authenticateToken, authorizeRole } = require('../middleware/auth.middleware');

// Protect these routes. Assuming 'authenticateToken' adds user info to req.user.
// Note: You need to ensure auth.middleware exists. I will check/create it next if needed.
// For now, I'll assume standard middleware pattern.
router.post('/link-student', authenticateToken, authorizeRole('parent'), parentController.linkStudent);
router.get('/dashboard', authenticateToken, authorizeRole('parent'), parentController.getDashboard);
router.get('/linked-students', authenticateToken, authorizeRole('parent'), parentController.getLinkedStudents);

module.exports = router;