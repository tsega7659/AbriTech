const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

router.post('/telebirr', authenticateToken, paymentController.payWithTelebirr);
router.post('/chapa/initialize', authenticateToken, paymentController.payWithChapa);
router.get('/chapa/verify/:tx_ref', paymentController.verifyChapaTransaction);
router.post('/chapa/webhook', paymentController.chapaWebhook);

module.exports = router;
