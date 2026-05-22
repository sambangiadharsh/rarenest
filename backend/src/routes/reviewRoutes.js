const express = require('express');
const router = express.Router();
const {
    createReview,
    getSellerReviews
} = require('../controllers/reviewController');

const { protect } = require('../middlewares/authMiddleware');

router.get('/:seller_id', getSellerReviews);
router.post('/:seller_id', protect, createReview);

module.exports = router;
