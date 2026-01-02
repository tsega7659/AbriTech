const express = require('express');
const router = express.Router();

const courseController = require('../controllers/course.controller');
const { authenticateToken, authorizeRole } = require('../middleware/auth.middleware');

const upload = require('../middleware/upload.middleware');
router.get('/', courseController.getAllCourses);
router.post('/', authenticateToken, authorizeRole('admin'), upload.single('image'), courseController.createCourse);

module.exports = router;