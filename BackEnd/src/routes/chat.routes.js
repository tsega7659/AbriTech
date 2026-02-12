const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');

// Chat with Gemini AI
// POST /api/chat
router.post('/', chatController.chatWithAI);

module.exports = router;
