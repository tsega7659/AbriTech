const paymentController = require('../src/controllers/payment.controller');
const paymentService = require('../src/services/payment.service');

console.log('Payment Controller exports:', Object.keys(paymentController));
console.log('Payment Service exports:', Object.keys(paymentService));

// Basic test for processSuccessfulPayment exists
if (typeof paymentController.chapaWebhook === 'function') {
  console.log('✅ chapaWebhook is a function');
} else {
  console.error('❌ chapaWebhook is NOT a function');
}

if (typeof paymentService.verifyWebhookSignature === 'function') {
  console.log('✅ verifyWebhookSignature is a function');
} else {
  console.error('❌ verifyWebhookSignature is NOT a function');
}
