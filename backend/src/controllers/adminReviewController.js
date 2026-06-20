const builderReviewService = require('../services/builderReviewService');

// @desc    Get all pending reviews
// @route   GET /api/admin/reviews/pending
exports.getPendingReviews = async (req, res) => {
    try {
        const reviews = await builderReviewService.getReviewsByStatus('Pending');
        res.status(200).json({ success: true, count: reviews.length, data: reviews });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get all approved reviews
// @route   GET /api/admin/reviews/approved
exports.getApprovedReviews = async (req, res) => {
    try {
        const reviews = await builderReviewService.getReviewsByStatus('Approved');
        res.status(200).json({ success: true, count: reviews.length, data: reviews });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get all rejected reviews
// @route   GET /api/admin/reviews/rejected
exports.getRejectedReviews = async (req, res) => {
    try {
        const reviews = await builderReviewService.getReviewsByStatus('Rejected');
        res.status(200).json({ success: true, count: reviews.length, data: reviews });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Approve a review
// @route   PUT /api/admin/reviews/:reviewId/approve
exports.approveReview = async (req, res) => {
    try {
        await builderReviewService.approveReview(req.params.reviewId, req.user.id);
        res.status(200).json({ success: true, message: 'Review approved successfully' });
    } catch (err) {
        console.error(err);
        res.status(err.statusCode || 500).json({
            success: false,
            message: err.statusCode ? err.message : 'Server Error',
        });
    }
};

// @desc    Reject a review
// @route   PUT /api/admin/reviews/:reviewId/reject
exports.rejectReview = async (req, res) => {
    try {
        await builderReviewService.rejectReview(req.params.reviewId, req.user.id);
        res.status(200).json({ success: true, message: 'Review rejected successfully' });
    } catch (err) {
        console.error(err);
        res.status(err.statusCode || 500).json({
            success: false,
            message: err.statusCode ? err.message : 'Server Error',
        });
    }
};
