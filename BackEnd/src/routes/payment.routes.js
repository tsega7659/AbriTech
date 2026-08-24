const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { authenticateToken } = require('../middleware/auth.middleware');
const { paymentLimiter } = require('../middleware/rateLimit.middleware');

router.post('/chapa/initialize', authenticateToken, paymentLimiter, paymentController.payWithChapa);
router.get('/chapa/verify/:tx_ref', paymentController.verifyChapaTransaction);
router.post('/chapa/webhook', paymentController.chapaWebhook);
router.post('/payments/chapa', authenticateToken, paymentLimiter, paymentController.payWithChapa);
router.post('/payments/chapa/webhook', paymentController.chapaWebhook);

module.exports = router;
