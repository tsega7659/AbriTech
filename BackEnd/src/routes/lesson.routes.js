const express = require('express');
const router = express.Router();
const lessonController = require('../controllers/lesson.controller');
const { authenticateToken, authorizeRole } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

// Public/Student routes (but authenticated)
router.get('/course/:courseId', authenticateToken, lessonController.getLessons);
router.get('/:id', authenticateToken, lessonController.getLessonById);
router.post('/:id/complete', authenticateToken, authorizeRole('student'), lessonController.markLessonComplete);
router.post('/:id/quiz/submit', authenticateToken, authorizeRole('student'), lessonController.submitQuiz);

// Admin/Teacher routes
router.post(
    '/',
    authenticateToken,
    authorizeRole('admin', 'teacher'),
    upload('lessons').any(), // Allow multiple resources
    lessonController.createLesson
);

router.put(
    '/:id',
    authenticateToken,
    authorizeRole('admin', 'teacher'),
    upload('lessons').any(),
    lessonController.updateLesson
);

router.delete(
    '/:id',
    authenticateToken,
    authorizeRole('admin', 'teacher'),
    lessonController.deleteLesson
);

module.exports = router;