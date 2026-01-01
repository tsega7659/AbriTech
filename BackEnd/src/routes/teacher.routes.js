const express = require('express');
const router = express.Router();

const teacherController = require('../controllers/teacher.controller');
const { authenticateToken, authorizeRole } = require('../middleware/auth.middleware');

router.get('/', authenticateToken, authorizeRole('admin'), teacherController.getAllTeachers);

module.exports = router;