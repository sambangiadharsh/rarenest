const faqRepository = require('../repositories/faqRepository');

class FaqService {
    getActiveFaqs() {
        return faqRepository.findAll({ activeOnly: true });
    }

    getAllFaqs() {
        return faqRepository.findAll();
    }

    async createFaq(data) {
        return faqRepository.create(data);
    }

    async updateFaq(id, data) {
        const faq = await faqRepository.findById(id);
        if (!faq) {
            const err = new Error('FAQ not found');
            err.statusCode = 404;
            throw err;
        }
        return faqRepository.update(id, data);
    }

    async deleteFaq(id) {
        const faq = await faqRepository.findById(id);
        if (!faq) {
            const err = new Error('FAQ not found');
            err.statusCode = 404;
            throw err;
        }
        await faqRepository.delete(id);
    }
}

module.exports = new FaqService();
