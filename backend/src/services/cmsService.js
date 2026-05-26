const cmsRepository = require('../repositories/cmsRepository');
const { ALLOWED_PAGE_KEYS } = require('../models/cmsModel');

class CmsService {
    validatePageKey(pageKey) {
        if (!ALLOWED_PAGE_KEYS.includes(pageKey)) {
            const err = new Error('Invalid page key');
            err.statusCode = 400;
            throw err;
        }
    }

    async getPublishedPage(pageKey) {
        this.validatePageKey(pageKey);
        const page = await cmsRepository.findByPageKey(pageKey, { publishedOnly: true });
        if (!page) {
            const err = new Error('Page not found');
            err.statusCode = 404;
            throw err;
        }
        return page;
    }

    async getAdminPage(pageKey) {
        this.validatePageKey(pageKey);
        return cmsRepository.findByPageKey(pageKey);
    }

    async upsertPage(pageKey, data, userId) {
        this.validatePageKey(pageKey);
        return cmsRepository.upsert({
            pageKey,
            title: data.title,
            content: data.content,
            meta_title: data.meta_title,
            meta_description: data.meta_description,
            status: data.status,
            userId,
        });
    }
}

module.exports = new CmsService();
