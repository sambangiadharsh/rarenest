const reviewService = require('../services/reviewService');
const sellerService = require('../services/sellerService');
const reviewSchema = require('../models/reviewModel');

// @desc    Create a review for a seller
// @route   POST /api/reviews/:seller_id
exports.createReview = async (req, res) => {
    try {
        const { error } = reviewSchema.create.validate(req.body);
        if (error) {
            return res.status(400).json({ success: false, message: error.details[0].message });
        }

        const sellerId = req.params.seller_id;
        const buyerId = req.user.id;

        if (buyerId === sellerId) {
            return res.status(400).json({ success: false, message: 'You cannot review yourself' });
        }

        // Check if seller exists
        const seller = await sellerService.getSellerProfile(sellerId);
        if (!seller) {
            return res.status(404).json({ success: false, message: 'Seller not found' });
        }

        // Create review via Service
        await reviewService.createReview({
            seller_id: sellerId,
            buyer_id: buyerId,
            rating: req.body.rating,
            comment: req.body.comment
        });

        // Update Seller Stats via Service
        await sellerService.updateSellerStats(sellerId);

        res.status(201).json({
            success: true,
            message: 'Review submitted successfully'
        });
    } catch (err) {
        console.error(err);
        res.status(err.statusCode || 500).json({ 
            success: false, 
            message: err.statusCode ? err.message : 'Server Error' 
        });
    }
};

// @desc    Get reviews for a seller
// @route   GET /api/reviews/:seller_id
exports.getSellerReviews = async (req, res) => {
    try {
        const reviews = await reviewService.getSellerReviews(req.params.seller_id);
        res.status(200).json({
            success: true,
            count: reviews.length,
            data: reviews
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
