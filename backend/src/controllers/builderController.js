const builderService = require('../services/builderService');
const builderReviewService = require('../services/builderReviewService');
const reviewSchema = require('../models/reviewModel');

// @desc    Get all builders
// @route   GET /api/builders
exports.getAllBuilders = async (req, res) => {
    try {
        const builders = await builderService.getAllBuilders(req.query);
        res.status(200).json({ success: true, count: builders.length, data: builders });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get builder profile by BuilderProfiles.id
// @route   GET /api/builders/:builderId
exports.getBuilderProfile = async (req, res) => {
    try {
        const builder = await builderService.getBuilderProfile(req.params.builderId);
        if (!builder) {
            return res.status(404).json({ success: false, message: 'Builder not found' });
        }
        res.status(200).json({ success: true, data: builder });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get builder profile by Users.id (for property detail lookup)
// @route   GET /api/builders/by-user/:userId
exports.getBuilderByUser = async (req, res) => {
    try {
        const builder = await builderService.getBuilderProfileByUserId(req.params.userId);
        if (!builder) {
            return res.status(404).json({ success: false, message: 'Builder not found' });
        }
        res.status(200).json({ success: true, data: builder });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Submit a review for a builder
// @route   POST /api/builders/:builderId/reviews
exports.submitReview = async (req, res) => {
    try {
        const { error } = reviewSchema.create.validate(req.body);
        if (error) {
            return res.status(400).json({ success: false, message: error.details[0].message });
        }

        const builderId = req.params.builderId;
        const reviewerId = req.user.id;

        const builder = await builderService.getBuilderProfile(builderId);
        if (!builder) {
            return res.status(404).json({ success: false, message: 'Builder not found' });
        }

        if (String(builder.user_id) === String(reviewerId)) {
            return res.status(400).json({ success: false, message: 'You cannot review yourself' });
        }

        await builderReviewService.submitReview({
            builder_id: builderId,
            reviewer_id: reviewerId,
            rating: req.body.rating,
            comment: req.body.comment,
        });

        res.status(201).json({
            success: true,
            message: 'Review submitted successfully. It will be visible after admin approval.',
        });
    } catch (err) {
        console.error(err);
        res.status(err.statusCode || 500).json({
            success: false,
            message: err.statusCode ? err.message : 'Server Error',
        });
    }
};

// @desc    Get approved reviews for a builder
// @route   GET /api/builders/:builderId/reviews
exports.getBuilderReviews = async (req, res) => {
    try {
        const reviews = await builderReviewService.getApprovedReviews(req.params.builderId);
        res.status(200).json({ success: true, count: reviews.length, data: reviews });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Toggle builder featured status
// @route   PATCH /api/builders/:builderId/featured
exports.toggleFeatured = async (req, res) => {
    try {
        const isFeatured = await builderService.toggleFeatured(req.params.builderId);
        res.status(200).json({ success: true, data: { is_featured: isFeatured } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
