const express = require('express');
const router = express.Router();

const studentController = require('../controllers/student.controller');
const { authenticateToken, authorizeRole } = require('../middleware/auth.middleware');

router.get('/', authenticateToken, authorizeRole('admin'), studentController.getAllStudents);

module.exports = router;