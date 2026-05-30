const express = require('express');
const {
    createEnquiry,
    createGuestEnquiry,
    getMyEnquiries,
} = require('../controllers/enquiryController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/guest', createGuestEnquiry);
router.get('/', protect, getMyEnquiries);
router.post('/', protect, createEnquiry);

module.exports = router;
