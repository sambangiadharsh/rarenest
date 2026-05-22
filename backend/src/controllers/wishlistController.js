const wishlistService = require('../services/wishlistService');
const propertyService = require('../services/propertyService');

// @desc    Add property to wishlist
// @route   POST /api/wishlist/:property_id
exports.addToWishlist = async (req, res) => {
    try {
        // Check if property exists
        const property = await propertyService.getPropertyById(req.params.property_id);
        if (!property) {
            return res.status(404).json({ success: false, message: 'Property not found' });
        }

        await wishlistService.addToWishlist(req.user.id, req.params.property_id);

        res.status(200).json({
            success: true,
            message: 'Property added to wishlist'
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get user wishlist
// @route   GET /api/wishlist
exports.getWishlist = async (req, res) => {
    try {
        const properties = await wishlistService.getWishlist(req.user.id);
        res.status(200).json({
            success: true,
            count: properties.length,
            data: properties
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Remove property from wishlist
// @route   DELETE /api/wishlist/:property_id
exports.removeFromWishlist = async (req, res) => {
    try {
        await wishlistService.removeFromWishlist(req.user.id, req.params.property_id);
        res.status(200).json({
            success: true,
            message: 'Property removed from wishlist'
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
