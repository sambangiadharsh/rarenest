const faqService = require('../services/faqService');
const faqSchema = require('../models/faqModel');

exports.getActiveFaqs = async (req, res) => {
    try {
        const faqs = await faqService.getActiveFaqs();
        res.status(200).json({ success: true, count: faqs.length, data: faqs });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.getAllFaqs = async (req, res) => {
    try {
        const faqs = await faqService.getAllFaqs();
        res.status(200).json({ success: true, count: faqs.length, data: faqs });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.createFaq = async (req, res) => {
    try {
        const { error } = faqSchema.create.validate(req.body);
        if (error) {
            return res.status(400).json({ success: false, message: error.details[0].message });
        }

        const faq = await faqService.createFaq(req.body);
        res.status(201).json({ success: true, data: faq });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.updateFaq = async (req, res) => {
    try {
        const { error } = faqSchema.update.validate(req.body);
        if (error) {
            return res.status(400).json({ success: false, message: error.details[0].message });
        }

        const faq = await faqService.updateFaq(req.params.id, req.body);
        res.status(200).json({ success: true, data: faq });
    } catch (err) {
        if (err.statusCode === 404) {
            return res.status(404).json({ success: false, message: err.message });
        }
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.deleteFaq = async (req, res) => {
    try {
        await faqService.deleteFaq(req.params.id);
        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        if (err.statusCode === 404) {
            return res.status(404).json({ success: false, message: err.message });
        }
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
