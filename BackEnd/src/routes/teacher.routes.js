const express = require('express');
const router = express.Router();

const teacherController = require('../controllers/teacher.controller');
const { authenticateToken, authorizeRole } = require('../middleware/auth.middleware');

router.get('/', authenticateToken, authorizeRole('admin'), teacherController.getAllTeachers);
router.get('/dashboard', authenticateToken, authorizeRole('teacher'), teacherController.getDashboard);
router.get('/courses', authenticateToken, authorizeRole('teacher'), teacherController.getAssignedCourses);

module.exports = router;