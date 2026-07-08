const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const builderService = require('../services/builderService');
const builderReviewService = require('../services/builderReviewService');
const reviewSchema = require('../models/reviewModel');

// @desc    Get all builders
// @route   GET /api/builders
exports.getAllBuilders = asyncHandler(async (req, res) => {
        const builders = await builderService.getAllBuilders(req.query);
        res.status(200).json({ success: true, count: builders.length, data: builders });
});

// @desc    Get builder profile by BuilderProfiles.id
// @route   GET /api/builders/:builderId
exports.getBuilderProfile = asyncHandler(async (req, res) => {
        const builder = await builderService.getBuilderProfile(req.params.builderId);
        if (!builder) {
            throw new AppError('Builder not found', 404);
        }
        res.status(200).json({ success: true, data: builder });
});

// @desc    Get builder profile by Users.id (for property detail lookup)
// @route   GET /api/builders/by-user/:userId
exports.getBuilderByUser = asyncHandler(async (req, res) => {
        const builder = await builderService.getBuilderProfileByUserId(req.params.userId);
        // Return 200 with null data instead of 404 to avoid frontend query errors
        res.status(200).json({ success: true, data: builder || null });
});

// @desc    Submit a review for a builder
// @route   POST /api/builders/:builderId/reviews
exports.submitReview = asyncHandler(async (req, res) => {
        const { error } = reviewSchema.create.validate(req.body);
        if (error) {
            throw new AppError(error.details[0].message, 400);
        }

        const builderId = req.params.builderId;
        const reviewerId = req.user.id;

        const builder = await builderService.getBuilderProfile(builderId);
        if (!builder) {
            throw new AppError('Builder not found', 404);
        }

        if (String(builder.user_id) === String(reviewerId)) {
            throw new AppError('You cannot review yourself', 400);
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
});

// @desc    Get approved reviews for a builder
// @route   GET /api/builders/:builderId/reviews
exports.getBuilderReviews = asyncHandler(async (req, res) => {
        const reviews = await builderReviewService.getApprovedReviews(req.params.builderId);
        res.status(200).json({ success: true, count: reviews.length, data: reviews });
});

// @desc    Toggle builder featured status
// @route   PATCH /api/builders/:builderId/featured
exports.toggleFeatured = asyncHandler(async (req, res) => {
        const isFeatured = await builderService.toggleFeatured(req.params.builderId);
        res.status(200).json({ success: true, data: { is_featured: isFeatured } });
});
