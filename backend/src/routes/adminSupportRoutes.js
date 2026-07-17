const express = require('express');
const {
    getAllTickets,
    getTicket,
    assignTicket,
    updateStatus,
    updatePriority,
    addInternalNote,
    getTicketMessages,
    sendTicketMessage,
    getAdmins,
} = require('../controllers/adminSupportController');
const { protect, authorize } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(protect, authorize('Admin'));

router.get('/admins', getAdmins);
router.get('/tickets', getAllTickets);
router.get('/tickets/:id', getTicket);
router.patch('/tickets/:id/assign', assignTicket);
router.patch('/tickets/:id/status', updateStatus);
router.patch('/tickets/:id/priority', updatePriority);
router.post('/tickets/:id/internal-notes', addInternalNote);
router.get('/tickets/:id/messages', getTicketMessages);
router.post('/tickets/:id/messages', sendTicketMessage);

module.exports = router;
