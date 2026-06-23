const wishlistRepository = require('../repositories/wishlistRepository');
const propertyMediaRepository = require('../repositories/propertyMediaRepository');
const propertyRepository = require('../repositories/propertyRepository');

class WishlistService {
    async addToWishlist(userId, propertyId) {
        const sellerId = await propertyRepository.findSellerIdByPropertyId(propertyId);
        if (sellerId === null) {
            return { error: 'not_found' };
        }
        if (sellerId === userId) {
            return { error: 'own_property' };
        }
        await wishlistRepository.addIfNotExists(userId, propertyId);
        return { success: true };
    }

    async getWishlistIds(userId) {
        return wishlistRepository.findPropertyIdsByUserId(userId);
    }

    async getWishlist(userId) {
        const properties = await wishlistRepository.findPropertiesByUserId(userId);
        if (properties.length === 0) return properties;

        const mediaByPropertyId = await propertyMediaRepository.findByPropertyIds(
            properties.map((p) => p.id),
        );

        for (const p of properties) {
            const key = String(p.id).toLowerCase();
            p.media = mediaByPropertyId[key] || [];
        }
        return properties;
    }

    async removeFromWishlist(userId, propertyId) {
        return wishlistRepository.remove(userId, propertyId);
    }
}

module.exports = new WishlistService();
