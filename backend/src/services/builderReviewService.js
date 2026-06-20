const builderReviewRepository = require('../repositories/builderReviewRepository');
const builderRepository = require('../repositories/builderRepository');

class BuilderReviewService {
    async submitReview(data) {
        const { builder_id, reviewer_id } = data;

        const existing = await builderReviewRepository.findByBuilderAndReviewer(builder_id, reviewer_id);
        if (existing) {
            const err = new Error('You have already submitted a review for this builder');
            err.statusCode = 400;
            throw err;
        }

        await builderReviewRepository.create(data);
    }

    async getApprovedReviews(builderId) {
        return builderReviewRepository.findApprovedByBuilderId(builderId);
    }

    async getReviewsByStatus(status) {
        return builderReviewRepository.findByStatus(status);
    }

    async approveReview(reviewId, adminId) {
        const review = await builderReviewRepository.findById(reviewId);
        if (!review) {
            const err = new Error('Review not found');
            err.statusCode = 404;
            throw err;
        }
        if (review.status !== 'Pending') {
            const err = new Error('Only pending reviews can be approved');
            err.statusCode = 400;
            throw err;
        }
        await builderReviewRepository.updateStatus(reviewId, { status: 'Approved', adminId });
        await builderRepository.recalculateStats(review.builder_id);
    }

    async rejectReview(reviewId, adminId) {
        const review = await builderReviewRepository.findById(reviewId);
        if (!review) {
            const err = new Error('Review not found');
            err.statusCode = 404;
            throw err;
        }
        if (review.status !== 'Pending') {
            const err = new Error('Only pending reviews can be rejected');
            err.statusCode = 400;
            throw err;
        }
        await builderReviewRepository.updateStatus(reviewId, { status: 'Rejected', adminId });
        await builderRepository.recalculateStats(review.builder_id);
    }
}

module.exports = new BuilderReviewService();
