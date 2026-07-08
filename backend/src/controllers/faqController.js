const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const faqService = require('../services/faqService');
const faqSchema = require('../models/faqModel');

exports.getActiveFaqs = asyncHandler(async (req, res) => {
        const faqs = await faqService.getActiveFaqs();
        res.status(200).json({ success: true, count: faqs.length, data: faqs });
});

exports.getAllFaqs = asyncHandler(async (req, res) => {
        const faqs = await faqService.getAllFaqs();
        res.status(200).json({ success: true, count: faqs.length, data: faqs });
});

exports.createFaq = asyncHandler(async (req, res) => {
        const { error } = faqSchema.create.validate(req.body);
        if (error) {
            throw new AppError(error.details[0].message, 400);
        }

        const faq = await faqService.createFaq(req.body);
        res.status(201).json({ success: true, data: faq });
});

exports.updateFaq = asyncHandler(async (req, res) => {
        const { error } = faqSchema.update.validate(req.body);
        if (error) {
            throw new AppError(error.details[0].message, 400);
        }

        const faq = await faqService.updateFaq(req.params.id, req.body);
        res.status(200).json({ success: true, data: faq });
});

exports.deleteFaq = asyncHandler(async (req, res) => {
        await faqService.deleteFaq(req.params.id);
        res.status(200).json({ success: true, data: {} });
});
