const express = require('express');
const {
    getConversations,
    getConversation,
    getMessages,
    sendMessage,
    uploadAttachment,
    markRead,
    archiveConversation,
} = require('../controllers/conversationController');
const { protect } = require('../middlewares/authMiddleware');
const { uploadMessageAttachment } = require('../middlewares/uploadMiddleware');

const router = express.Router();

router.use(protect);

router.get('/', getConversations);
router.get('/:id', getConversation);
router.get('/:id/messages', getMessages);
router.post('/:id/messages', sendMessage);
router.post('/:id/attachments', uploadMessageAttachment, uploadAttachment);
router.patch('/:id/read', markRead);
router.patch('/:id/archive', archiveConversation);

module.exports = router;
