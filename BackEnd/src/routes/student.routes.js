const express = require('express');
const router = express.Router();

const studentController = require('../controllers/student.controller');
const { authenticateToken, authorizeRole } = require('../middleware/auth.middleware');

router.get('/', authenticateToken, authorizeRole('admin'), studentController.getAllStudents);
router.get('/dashboard', authenticateToken, authorizeRole('student'), studentController.getDashboard);
router.get('/courses', authenticateToken, authorizeRole('student'), studentController.getEnrolledCourses);
router.get('/grades', authenticateToken, authorizeRole('student'), studentController.getStudentGrades);
router.delete('/:id', authenticateToken, authorizeRole('admin'), studentController.deleteStudent);

module.exports = router;