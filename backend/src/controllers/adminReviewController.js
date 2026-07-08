const asyncHandler = require('../utils/asyncHandler');
const builderReviewService = require('../services/builderReviewService');

// @desc    Get all pending reviews
// @route   GET /api/admin/reviews/pending
exports.getPendingReviews = asyncHandler(async (req, res) => {
        const reviews = await builderReviewService.getReviewsByStatus('Pending');
        res.status(200).json({ success: true, count: reviews.length, data: reviews });
});

// @desc    Get all approved reviews
// @route   GET /api/admin/reviews/approved
exports.getApprovedReviews = asyncHandler(async (req, res) => {
        const reviews = await builderReviewService.getReviewsByStatus('Approved');
        res.status(200).json({ success: true, count: reviews.length, data: reviews });
});

// @desc    Get all rejected reviews
// @route   GET /api/admin/reviews/rejected
exports.getRejectedReviews = asyncHandler(async (req, res) => {
        const reviews = await builderReviewService.getReviewsByStatus('Rejected');
        res.status(200).json({ success: true, count: reviews.length, data: reviews });
});

// @desc    Approve a review
// @route   PUT /api/admin/reviews/:reviewId/approve
exports.approveReview = asyncHandler(async (req, res) => {
        await builderReviewService.approveReview(req.params.reviewId, req.user.id);
        res.status(200).json({ success: true, message: 'Review approved successfully' });
});

// @desc    Reject a review
// @route   PUT /api/admin/reviews/:reviewId/reject
exports.rejectReview = asyncHandler(async (req, res) => {
        await builderReviewService.rejectReview(req.params.reviewId, req.user.id);
        res.status(200).json({ success: true, message: 'Review rejected successfully' });
});
