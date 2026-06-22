const propertyFeatureRepository = require('../repositories/propertyFeatureRepository');

class PropertyFeatureService {
    // ─── CATEGORIES ───

    async getAllCategories() {
        return propertyFeatureRepository.findAllCategories();
    }

    async getActiveCategories() {
        return propertyFeatureRepository.findActiveCategories();
    }

    async createCategory({ name, display_order, created_by }) {
        return propertyFeatureRepository.createCategory({ name, display_order, created_by });
    }

    async updateCategory(id, data) {
        const category = await propertyFeatureRepository.findCategoryById(id);
        if (!category) {
            const err = new Error('Category not found');
            err.statusCode = 404;
            throw err;
        }
        return propertyFeatureRepository.updateCategory(id, data);
    }

    // ─── FEATURES ───

    async getAllFeatures() {
        return propertyFeatureRepository.findAllFeatures();
    }

    async getActiveGroupedFeatures() {
        const rows = await propertyFeatureRepository.findActiveGrouped();
        const grouped = [];
        const categoryMap = {};

        for (const row of rows) {
            const catId = row.CategoryId;
            if (!categoryMap[catId]) {
                const categoryNode = {
                    id: catId,
                    name: row.CategoryName,
                    display_order: row.CategoryDisplayOrder,
                    features: []
                };
                categoryMap[catId] = categoryNode;
                grouped.push(categoryNode);
            }
            categoryMap[catId].features.push({
                id: row.Id,
                name: row.Name,
                is_popular: row.IsPopular === true || row.IsPopular === 1,
                display_order: row.DisplayOrder
            });
        }
        return grouped;
    }

    async createFeature({ category_id, name, is_popular, display_order, is_active, created_by }) {
        // Verify category exists
        const category = await propertyFeatureRepository.findCategoryById(category_id);
        if (!category) {
            const err = new Error('Category not found');
            err.statusCode = 400;
            throw err;
        }
        return propertyFeatureRepository.createFeature({ category_id, name, is_popular, display_order, is_active, created_by });
    }

    async updateFeature(id, data) {
        const feature = await propertyFeatureRepository.findFeatureById(id);
        if (!feature) {
            const err = new Error('Feature not found');
            err.statusCode = 404;
            throw err;
        }
        if (data.category_id) {
            const category = await propertyFeatureRepository.findCategoryById(data.category_id);
            if (!category) {
                const err = new Error('Category not found');
                err.statusCode = 400;
                throw err;
            }
        }
        return propertyFeatureRepository.updateFeature(id, data);
    }

    // ─── MAPPINGS ───

    async getPropertyFeatures(propertyId) {
        return propertyFeatureRepository.findFeaturesByPropertyId(propertyId);
    }

    async savePropertyFeatures(propertyId, featureIds) {
        return propertyFeatureRepository.savePropertyMappings(propertyId, featureIds);
    }
}

module.exports = new PropertyFeatureService();
