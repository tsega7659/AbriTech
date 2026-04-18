const express = require('express');
const router = express.Router();

const studentController = require('../controllers/student.controller');
const { authenticateToken, authorizeRole } = require('../middleware/auth.middleware');

const upload = require('../middleware/upload.middleware');

router.get('/', authenticateToken, authorizeRole('admin'), studentController.getAllStudents);
router.get('/dashboard', authenticateToken, authorizeRole('student'), studentController.getDashboard);
router.get('/courses', authenticateToken, authorizeRole('student'), studentController.getEnrolledCourses);
router.patch('/courses/:courseId/time', authenticateToken, authorizeRole('student'), studentController.updateCourseTimeSpent);
router.get('/grades', authenticateToken, authorizeRole('student'), studentController.getStudentGrades);
router.get('/analytics', authenticateToken, authorizeRole('student'), studentController.getStudentAnalytics);
router.get('/courses/:courseId/analytics', authenticateToken, authorizeRole('student'), studentController.getCourseAnalytics);
router.get('/badges', authenticateToken, authorizeRole('student'), studentController.getStudentBadges);
router.get('/portfolio', authenticateToken, authorizeRole('student'), studentController.getPortfolioData);
router.put('/profile', authenticateToken, authorizeRole('student'), upload('profile_images').single('profileImage'), studentController.updateStudentProfile);
router.delete('/:id', authenticateToken, authorizeRole('admin'), studentController.deleteStudent);

module.exports = router;
