const propertyTypeRepository = require('../repositories/propertyTypeRepository');

class PropertyTypeService {
    async getAllPropertyTypes() {
        return propertyTypeRepository.findAll();
    }

    async getActivePropertyTypes() {
        return propertyTypeRepository.findActive();
    }

    async createPropertyType({ name, created_by }) {
        return propertyTypeRepository.create({ name, created_by });
    }

    async updatePropertyType(id, data) {
        const propertyType = await propertyTypeRepository.findById(id);
        if (!propertyType) {
            const err = new Error('Property type not found');
            err.statusCode = 404;
            throw err;
        }
        return propertyTypeRepository.update(id, data);
    }
}

module.exports = new PropertyTypeService();
