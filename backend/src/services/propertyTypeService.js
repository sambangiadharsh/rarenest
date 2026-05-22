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
}

module.exports = new PropertyTypeService();
