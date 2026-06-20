const builderRepository = require('../repositories/builderRepository');

class BuilderService {
    async getAllBuilders(filters = {}) {
        return builderRepository.findAll(filters);
    }

    async getBuilderProfile(builderId) {
        return builderRepository.findProfileById(builderId);
    }

    async getBuilderProfileByUserId(userId) {
        return builderRepository.findProfileByUserId(userId);
    }

    async toggleFeatured(builderId) {
        return builderRepository.toggleFeatured(builderId);
    }

    async updateBuilderStatus(builderId, status) {
        return builderRepository.updateBuilderStatus(builderId, status);
    }

    async recalculateStats(builderId) {
        return builderRepository.recalculateStats(builderId);
    }
}

module.exports = new BuilderService();
