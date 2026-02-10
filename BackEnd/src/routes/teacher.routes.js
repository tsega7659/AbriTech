const express = require('express');
const router = express.Router();

const teacherController = require('../controllers/teacher.controller');
const { authenticateToken, authorizeRole } = require('../middleware/auth.middleware');

router.get('/', authenticateToken, authorizeRole('admin'), teacherController.getAllTeachers);
router.get('/dashboard', authenticateToken, authorizeRole('teacher'), teacherController.getDashboard);
router.get('/courses', authenticateToken, authorizeRole('teacher'), teacherController.getAssignedCourses);
router.get('/students', authenticateToken, authorizeRole('teacher'), teacherController.getEnrolledStudents);
router.get('/submissions', authenticateToken, authorizeRole('teacher'), teacherController.getAllSubmissions);
router.get('/students/:studentId/course/:courseId', authenticateToken, authorizeRole('teacher'), teacherController.getStudentCourseDetail);
router.delete('/:id', authenticateToken, authorizeRole('admin'), teacherController.deleteTeacher);


module.exports = router;