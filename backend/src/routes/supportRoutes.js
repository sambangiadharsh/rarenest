const express = require('express');
const {
    createTicket,
    getMyTickets,
    getTicket,
    sendTicketMessage,
    getTicketMessages,
} = require('../controllers/supportTicketController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(protect);

router.post('/tickets', createTicket);
router.get('/tickets', getMyTickets);
router.get('/tickets/:id', getTicket);
router.get('/tickets/:id/messages', getTicketMessages);
router.post('/tickets/:id/messages', sendTicketMessage);

module.exports = router;
