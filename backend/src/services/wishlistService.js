const wishlistRepository = require('../repositories/wishlistRepository');

class WishlistService {
    async addToWishlist(userId, propertyId) {
        return wishlistRepository.addIfNotExists(userId, propertyId);
    }

    async getWishlist(userId) {
        return wishlistRepository.findPropertiesByUserId(userId);
    }

    async removeFromWishlist(userId, propertyId) {
        return wishlistRepository.remove(userId, propertyId);
    }
}

module.exports = new WishlistService();
