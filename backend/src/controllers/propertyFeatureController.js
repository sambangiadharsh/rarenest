const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const propertyFeatureService = require('../services/propertyFeatureService');
const propertyService = require('../services/propertyService');
const { categorySchema, featureSchema } = require('../models/propertyFeatureModel');

// @desc    Get all feature categories
// @route   GET /api/property-feature-categories
exports.getCategories = asyncHandler(async (req, res) => {
        const { active } = req.query;
        let categories;
        if (active === 'true' || active === true) {
            categories = await propertyFeatureService.getActiveCategories();
        } else {
            categories = await propertyFeatureService.getAllCategories();
        }
        res.status(200).json({
            success: true,
            count: categories.length,
            data: categories,
        });
});

// @desc    Get active grouped features
// @route   GET /api/property-features/grouped
exports.getGroupedFeatures = asyncHandler(async (req, res) => {
        const grouped = await propertyFeatureService.getActiveGroupedFeatures();
        res.status(200).json({
            success: true,
            count: grouped.length,
            data: grouped,
        });
});

// @desc    Get all features (flat list for admin)
// @route   GET /api/property-features
exports.getFeatures = asyncHandler(async (req, res) => {
        const features = await propertyFeatureService.getAllFeatures();
        res.status(200).json({
            success: true,
            count: features.length,
            data: features,
        });
});

// @desc    Get mapped features of a property
// @route   GET /api/properties/:propertyId/features
exports.getPropertyFeatures = asyncHandler(async (req, res) => {
        const features = await propertyFeatureService.getPropertyFeatures(req.params.propertyId);
        res.status(200).json({
            success: true,
            count: features.length,
            data: features,
        });
});

// @desc    Create a category
// @route   POST /api/property-feature-categories
exports.createCategory = asyncHandler(async (req, res) => {
        const { error } = categorySchema.create.validate(req.body);
        if (error) {
            throw new AppError(error.details[0].message, 400);
        }

        const category = await propertyFeatureService.createCategory({
            name: req.body.name.trim(),
            display_order: req.body.display_order,
            created_by: req.user.id,
        });

        res.status(201).json({ success: true, data: category });
});

// @desc    Update a category
// @route   PUT /api/property-feature-categories/:id
exports.updateCategory = asyncHandler(async (req, res) => {
        const { error } = categorySchema.update.validate(req.body);
        if (error) {
            throw new AppError(error.details[0].message, 400);
        }

        const updates = { updated_by: req.user.id };
        if (req.body.name !== undefined) updates.name = req.body.name.trim();
        if (req.body.is_active !== undefined) updates.is_active = req.body.is_active;
        if (req.body.display_order !== undefined) updates.display_order = req.body.display_order;

        const category = await propertyFeatureService.updateCategory(req.params.id, updates);
        res.status(200).json({ success: true, data: category });
});

// @desc    Create a feature
// @route   POST /api/property-features
exports.createFeature = asyncHandler(async (req, res) => {
        const { error } = featureSchema.create.validate(req.body);
        if (error) {
            throw new AppError(error.details[0].message, 400);
        }

        const feature = await propertyFeatureService.createFeature({
            category_id: req.body.category_id,
            name: req.body.name.trim(),
            is_popular: req.body.is_popular,
            display_order: req.body.display_order,
            is_active: req.body.is_active,
            created_by: req.user.id,
        });

        res.status(201).json({ success: true, data: feature });
});

// @desc    Update a feature
// @route   PUT /api/property-features/:id
exports.updateFeature = asyncHandler(async (req, res) => {
        const { error } = featureSchema.update.validate(req.body);
        if (error) {
            throw new AppError(error.details[0].message, 400);
        }

        const updates = { updated_by: req.user.id };
        if (req.body.category_id !== undefined) updates.category_id = req.body.category_id;
        if (req.body.name !== undefined) updates.name = req.body.name.trim();
        if (req.body.is_popular !== undefined) updates.is_popular = req.body.is_popular;
        if (req.body.is_active !== undefined) updates.is_active = req.body.is_active;
        if (req.body.display_order !== undefined) updates.display_order = req.body.display_order;

        const feature = await propertyFeatureService.updateFeature(req.params.id, updates);
        res.status(200).json({ success: true, data: feature });
});

// @desc    Save feature mappings for a property
// @route   POST /api/properties/:propertyId/features
exports.savePropertyFeatures = asyncHandler(async (req, res) => {
        const { propertyId } = req.params;
        const { selectedFeatureIds } = req.body;

        if (!Array.isArray(selectedFeatureIds)) {
            throw new AppError('selectedFeatureIds must be an array', 400);
        }

        const property = await propertyService.getPropertyById(propertyId);
        if (!property) {
            throw new AppError('Property not found', 404);
        }

        const isOwner = await propertyService.checkOwnership(propertyId, req.user.id);
        if (!isOwner && req.user.role !== 'Admin') {
            throw new AppError('Not authorized', 403);
        }

        await propertyFeatureService.savePropertyFeatures(propertyId, selectedFeatureIds);
        res.status(200).json({ success: true, message: 'Property features updated' });
});
