const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

const { authenticateToken, authorizeRole } = require('../middleware/auth.middleware');

const { validate } = require('../middleware/validation.middleware');
const { 
  loginSchema, 
  studentRegisterSchema, 
  parentRegisterSchema, 
  teacherRegisterSchema 
} = require('../schemas/user.schema');

router.post('/login', validate(loginSchema), authController.login);
router.post('/logout', authController.logout);
router.post('/register/student', validate(studentRegisterSchema), authController.registerStudent);
router.post('/register/parent', validate(parentRegisterSchema), authController.registerParent);
router.post('/register/admin', authController.registerAdmin);
router.post('/register/teacher', authenticateToken, authorizeRole('admin'), validate(teacherRegisterSchema), authController.registerTeacher);
router.put('/update-credentials', authenticateToken, authController.updateCredentials);
router.post('/forgot-password', authController.forgotPassword);
router.post('/verify-otp', authController.verifyOtp);
router.post('/reset-password', authController.resetPassword);

module.exports = router;
