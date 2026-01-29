const express = require('express');
const router = express.Router();
const assignmentController = require('../controllers/assignment.controller');
const { authenticateToken, authorizeRole } = require('../middleware/auth.middleware');

router.post('/', authenticateToken, authorizeRole('teacher'), assignmentController.createAssignment);
router.get('/', authenticateToken, assignmentController.getAssignments);
router.get('/:id', authenticateToken, assignmentController.getAssignmentById);

module.exports = router;