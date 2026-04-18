const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

router.post('/telebirr', authenticateToken, paymentController.payWithTelebirr);

module.exports = router;
