const express = require('express');
const router = express.Router();

const courseController = require('../controllers/course.controller');
const { authenticateToken, authorizeRole } = require('../middleware/auth.middleware');

router.get('/', authenticateToken, courseController.getAllCourses);

module.exports = router;