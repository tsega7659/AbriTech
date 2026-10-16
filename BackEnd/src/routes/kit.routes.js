const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const {
    activateKey,
    createKit,
    getAllKits,
    generateBatch,
    getAllBatches,
    getBatchKeys,
    exportBatch
} = require('../controllers/kit.controller');
const { authenticateToken, authorizeRole } = require('../middleware/auth.middleware');

// Anti-brute force limiter: max 10 activation attempts per 15 mins per IP
const activationLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    validate: { xForwardedForHeader: false, default: false },
    keyGenerator: (req) => req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1',
    statusCode: 429,
    message: {
        success: false,
        message: 'Too many activation attempts. Please wait 15 minutes before trying again.'
    }
});

// STUDENT ENDPOINT
router.post('/activate', authenticateToken, authorizeRole('student'), activationLimiter, activateKey);

// ADMIN ENDPOINTS
router.use(authenticateToken);
router.use(authorizeRole('admin'));

// Kit catalog
router.post('/', createKit);
router.get('/', getAllKits);

// Batch & key generation
router.post('/batches/generate', generateBatch);
router.get('/batches', getAllBatches);
router.get('/batches/:id/keys', getBatchKeys);
router.get('/batches/:id/export', exportBatch);

module.exports = router;
