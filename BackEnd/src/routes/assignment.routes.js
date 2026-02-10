const express = require('express');
const router = express.Router();
const assignmentController = require('../controllers/assignment.controller');
const { authenticateToken, authorizeRole } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

router.post('/', authenticateToken, authorizeRole('teacher'), assignmentController.createAssignment);
router.get('/', authenticateToken, assignmentController.getAssignments);
router.post('/:id/submit', authenticateToken, authorizeRole('student'), upload('assignments').single('file'), assignmentController.submitAssignment);
router.post('/submissions/:id/assess', authenticateToken, authorizeRole('teacher'), assignmentController.assessSubmission);
router.get('/:id', authenticateToken, assignmentController.getAssignmentById);

module.exports = router;