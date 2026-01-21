const express = require('express');
const router = express.Router();
const lessonController = require('../controllers/lesson.controller');
const { authenticateToken, authorizeRole } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

// Public/Student routes (but authenticated)
router.get('/course/:courseId', authenticateToken, lessonController.getLessons);
router.get('/:id', authenticateToken, lessonController.getLessonById);
router.post('/:id/complete', authenticateToken, authorizeRole('student'), lessonController.markLessonComplete);

// Admin/Teacher routes
router.post(
    '/',
    authenticateToken,
    authorizeRole('admin', 'teacher'),
    upload('lessons').single('file'), // 'file' is the field name for upload
    lessonController.createLesson
);

router.put(
    '/:id',
    authenticateToken,
    authorizeRole('admin', 'teacher'),
    upload('lessons').single('file'),
    lessonController.updateLesson
);

router.delete(
    '/:id',
    authenticateToken,
    authorizeRole('admin', 'teacher'),
    lessonController.deleteLesson
);

module.exports = router;