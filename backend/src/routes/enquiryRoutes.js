const express = require('express');
const { createEnquiry, createGuestEnquiry } = require('../controllers/enquiryController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/guest', createGuestEnquiry);
router.post('/', protect, createEnquiry);

module.exports = router;
