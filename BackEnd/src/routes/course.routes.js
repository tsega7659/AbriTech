const express = require('express');
const router = express.Router();

const courseController = require('../controllers/course.controller');
const { authenticateToken, authorizeRole } = require('../middleware/auth.middleware');

const upload = require('../middleware/upload.middleware');
router.get('/', courseController.getAllCourses);
router.post('/', authenticateToken, authorizeRole('admin'), upload('course_images').single('image'), courseController.createCourse);
router.put('/:id', authenticateToken, authorizeRole('admin'), upload('course_images').single('image'), courseController.updateCourse);
router.post('/enroll', authenticateToken, authorizeRole('student'), courseController.enrollCourse);
router.delete('/:id', authenticateToken, authorizeRole('admin'), courseController.deleteCourse);

module.exports = router;