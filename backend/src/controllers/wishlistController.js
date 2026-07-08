const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const wishlistService = require('../services/wishlistService');
const propertyService = require('../services/propertyService');

// @desc    Add property to wishlist
// @route   POST /api/wishlist/:property_id
exports.addToWishlist = asyncHandler(async (req, res) => {
        // Check if property exists
        const property = await propertyService.getPropertyById(req.params.property_id);
        if (!property) {
            throw new AppError('Property not found', 404);
        }

        const result = await wishlistService.addToWishlist(req.user.id, req.params.property_id);

        if (result.error === 'own_property') {
            throw new AppError('You cannot add your own listing to your wishlist', 400);
        }

        res.status(200).json({
            success: true,
            message: 'Property added to wishlist'
        });
});

// @desc    Get wishlisted property IDs
// @route   GET /api/wishlist/ids
exports.getWishlistIds = asyncHandler(async (req, res) => {
        const ids = await wishlistService.getWishlistIds(req.user.id);
        res.status(200).json({
            success: true,
            count: ids.length,
            data: ids,
        });
});

// @desc    Get user wishlist
// @route   GET /api/wishlist
exports.getWishlist = asyncHandler(async (req, res) => {
        const properties = await wishlistService.getWishlist(req.user.id);
        res.status(200).json({
            success: true,
            count: properties.length,
            data: properties
        });
});

// @desc    Remove property from wishlist
// @route   DELETE /api/wishlist/:property_id
exports.removeFromWishlist = asyncHandler(async (req, res) => {
        await wishlistService.removeFromWishlist(req.user.id, req.params.property_id);
        res.status(200).json({
            success: true,
            message: 'Property removed from wishlist'
        });
});
