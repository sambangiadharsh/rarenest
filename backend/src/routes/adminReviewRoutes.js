const express = require('express');
const router = express.Router();
const {
    getPendingReviews,
    getApprovedReviews,
    getRejectedReviews,
    approveReview,
    rejectReview,
} = require('../controllers/adminReviewController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.use(protect, authorize('Admin'));

router.get('/pending', getPendingReviews);
router.get('/approved', getApprovedReviews);
router.get('/rejected', getRejectedReviews);
router.put('/:reviewId/approve', approveReview);
router.put('/:reviewId/reject', rejectReview);

module.exports = router;
