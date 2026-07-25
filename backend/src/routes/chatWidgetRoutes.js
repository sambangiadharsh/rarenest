const express = require('express');
const { getChatToken } = require('../controllers/chatWidgetController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/get-support-chat-token', protect, getChatToken);

module.exports = router;
