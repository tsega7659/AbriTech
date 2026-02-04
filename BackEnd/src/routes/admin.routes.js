const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { authenticateToken, authorizeRole } = require('../middleware/auth.middleware');

// All routes here are protected and require admin role
router.use(authenticateToken);
router.use(authorizeRole('admin'));

router.get('/users', adminController.getAllUsers);
router.get('/dashboard', adminController.getDashboardStats);
router.delete('/users/:id', adminController.deleteUser);

module.exports = router;