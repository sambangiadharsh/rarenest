const express = require('express');
const { openPropertyChat } = require('../controllers/propertyChatController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/open', protect, openPropertyChat);

module.exports = router;
