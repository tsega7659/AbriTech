const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

const { authenticateToken, authorizeRole } = require('../middleware/auth.middleware');
const { authLimiter, registerLimiter } = require('../middleware/rateLimit.middleware');

const { validate } = require('../middleware/validation.middleware');
const { 
  loginSchema, 
  studentRegisterSchema, 
  parentRegisterSchema, 
  teacherRegisterSchema 
} = require('../schemas/user.schema');

// Auth endpoints protected by 5 attempts / 15 min rate limiter
router.post('/login', authLimiter, validate(loginSchema), authController.login);
router.post('/logout', authController.logout);
router.post('/register/student', registerLimiter, validate(studentRegisterSchema), authController.registerStudent);
router.post('/register/parent', registerLimiter, validate(parentRegisterSchema), authController.registerParent);
router.post('/register/admin', authController.registerAdmin);
router.post('/register/teacher', authenticateToken, authorizeRole('admin'), validate(teacherRegisterSchema), authController.registerTeacher);
router.put('/update-credentials', authenticateToken, authController.updateCredentials);
router.post('/forgot-password', authLimiter, authController.forgotPassword);
router.post('/verify-otp', authLimiter, authController.verifyOtp);
router.post('/reset-password', authLimiter, authController.resetPassword);

module.exports = router;
