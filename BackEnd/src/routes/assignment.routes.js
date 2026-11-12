const express = require('express');
const router = express.Router();
const assignmentController = require('../controllers/assignment.controller');
const { authenticateToken, authorizeRole } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

// --- Admin: Create, Update, Delete Assignments (Projects) ---
router.post('/', authenticateToken, authorizeRole('admin'), assignmentController.createAssignment);
router.put('/:id', authenticateToken, authorizeRole('admin'), assignmentController.updateAssignment);
router.delete('/:id', authenticateToken, authorizeRole('admin'), assignmentController.deleteAssignment);

// --- Shared: Get Assignments (students, teachers, admin) ---
router.get('/', authenticateToken, assignmentController.getAssignments);
router.get('/by-course', authenticateToken, assignmentController.getAssignmentsByCourse);
router.get('/:id', authenticateToken, assignmentController.getAssignmentById);

// --- Student: Submit Assignment ---
router.post(
    '/:id/submit',
    authenticateToken,
    authorizeRole('student'),
    assignmentController.requirePreviousLessonsCompleted,
    upload('assignments').fields([
        { name: 'files', maxCount: 10 },
        { name: 'file', maxCount: 1 }
    ]),
    assignmentController.submitAssignment
);

// --- Instructor: Assess/Grade Submission ---
router.post('/submissions/:id/assess', authenticateToken, authorizeRole('teacher'), assignmentController.assessSubmission);

module.exports = router;
