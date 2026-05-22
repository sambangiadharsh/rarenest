const sellerProfileRepository = require('../repositories/sellerProfileRepository');

class SellerService {
    async getSellerProfile(sellerId) {
        return sellerProfileRepository.findSellerWithProfile(sellerId);
    }

    async updateSellerProfile(userId, bio) {
        return sellerProfileRepository.upsertBio(userId, bio);
    }

    async updateSellerStats(sellerId) {
        return sellerProfileRepository.recalculateStats(sellerId);
    }
}

module.exports = new SellerService();
