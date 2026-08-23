const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { authenticateToken, authorizeRole } = require('../middleware/auth.middleware');

// All routes here are protected and require admin role
router.use(authenticateToken);
router.use(authorizeRole('admin'));

router.get('/users', adminController.getAllUsers);
router.get('/dashboard', adminController.getDashboardStats);
router.get('/analytics', adminController.getAnalyticsData);
router.get('/activity-logs', adminController.getActivityLogs);
router.delete('/users/:id', adminController.deleteUser);
router.put('/teachers/:id/specialization', adminController.updateTeacherSpecialization);
router.get('/payments', adminController.getPayments);



// Detail routes
router.get('/students/:id', adminController.getStudentDetails);
router.get('/instructors/:id', adminController.getInstructorDetails);
router.put('/instructors/:id/courses', adminController.assignInstructorCourses);
router.get('/parents/:id', adminController.getParentDetails);
router.get('/projects', adminController.getAllProjects);
router.put('/projects/:id/review', adminController.reviewProject);

// Admin management routes
router.get('/admins', adminController.getAdmins);
router.get('/admins/:id', adminController.getAdminDetails);
router.delete('/admins/:id', adminController.deleteAdmin);

// Database management routes
router.get('/data-stats', adminController.getDataStats);
router.post('/clear-data', adminController.clearData);

module.exports = router;
