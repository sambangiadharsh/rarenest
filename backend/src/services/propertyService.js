const propertyRepository = require('../repositories/propertyRepository');
const mediaService = require('./mediaService');

class PropertyService {
    async getPropertyById(id) {
        const property = await propertyRepository.findById(id);
        if (!property) return null;

        property.media = await propertyRepository.findMediaByPropertyId(id);
        this._parseSpecialFeatures(property);
        return property;
    }

    _parseSpecialFeatures(property) {
        if (property?.special_features && typeof property.special_features === 'string') {
            try {
                property.special_features = JSON.parse(property.special_features);
            } catch {
                // keep as string
            }
        }
    }

    async getAllProperties(filters = {}) {
        const properties = await propertyRepository.findAll(filters);
        for (const p of properties) {
            this._parseSpecialFeatures(p);
            if (filters.seller_id) {
                p.media = await propertyRepository.findMediaByPropertyId(p.id);
            }
        }
        return properties;
    }

    async createProperty(propertyData) {
        return propertyRepository.create(propertyData);
    }

    async updateProperty(id, propertyData) {
        return propertyRepository.update(id, propertyData);
    }

    async deleteProperty(id) {
        mediaService.deletePropertyUploads(id);
        return propertyRepository.delete(id);
    }

    async checkOwnership(propertyId, userId) {
        const sellerId = await propertyRepository.findSellerIdByPropertyId(propertyId);
        if (sellerId === null) return null;
        return sellerId === userId;
    }

    async verifyProperty(id, isVerified) {
        return propertyRepository.setVerified(id, isVerified);
    }
}

module.exports = new PropertyService();
