const sellerService = require('../services/sellerService');
const propertyService = require('../services/propertyService');
const reviewService = require('../services/reviewService');
const sellerSchema = require('../models/sellerModel');

// @desc    Get seller profile
// @route   GET /api/sellers/:id
exports.getSellerProfile = async (req, res) => {
    try {
        const seller = await sellerService.getSellerProfile(req.params.id);

        if (!seller) {
            return res.status(404).json({ success: false, message: 'Seller not found' });
        }

        // Get properties listed by this seller via propertyService
        seller.properties = await propertyService.getAllProperties({ seller_id: req.params.id });

        // Get latest reviews for this seller via reviewService
        seller.recent_reviews = await reviewService.getSellerReviews(req.params.id, 5);

        res.status(200).json({ success: true, data: seller });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @route   POST /api/sellers/profile
exports.updateProfile = async (req, res) => {
    try {
        const { error } = sellerSchema.updateProfile.validate(req.body);
        if (error) {
            return res.status(400).json({ success: false, message: error.details[0].message });
        }

        const profile = await sellerService.updateSellerProfile(req.user.id, req.body.bio);

        res.status(200).json({ success: true, data: profile });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
