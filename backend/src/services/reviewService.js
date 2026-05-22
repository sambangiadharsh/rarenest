const reviewRepository = require('../repositories/reviewRepository');

class ReviewService {
    async createReview(reviewData) {
        const { seller_id, buyer_id } = reviewData;

        const existingReview = await reviewRepository.findBySellerAndBuyer(seller_id, buyer_id);
        if (existingReview) {
            const error = new Error('You have already submitted a review for this seller');
            error.statusCode = 400;
            throw error;
        }

        await reviewRepository.create(reviewData);
    }

    async getSellerReviews(sellerId, limit = null) {
        return reviewRepository.findBySellerId(sellerId, limit);
    }
}

module.exports = new ReviewService();
