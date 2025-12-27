const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

const { authenticateToken, authorizeRole } = require('../middleware/auth.middleware');

router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.post('/register/student', authController.registerStudent);
router.post('/register/parent', authController.registerParent);
router.post('/register/teacher', authenticateToken, authorizeRole('admin'), authController.registerTeacher);

module.exports = router;