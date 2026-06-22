const propertyFeatureService = require('../services/propertyFeatureService');
const propertyService = require('../services/propertyService');
const { categorySchema, featureSchema } = require('../models/propertyFeatureModel');

// @desc    Get all feature categories
// @route   GET /api/property-feature-categories
exports.getCategories = async (req, res) => {
    try {
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
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get active grouped features
// @route   GET /api/property-features/grouped
exports.getGroupedFeatures = async (req, res) => {
    try {
        const grouped = await propertyFeatureService.getActiveGroupedFeatures();
        res.status(200).json({
            success: true,
            count: grouped.length,
            data: grouped,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get all features (flat list for admin)
// @route   GET /api/property-features
exports.getFeatures = async (req, res) => {
    try {
        const features = await propertyFeatureService.getAllFeatures();
        res.status(200).json({
            success: true,
            count: features.length,
            data: features,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get mapped features of a property
// @route   GET /api/properties/:propertyId/features
exports.getPropertyFeatures = async (req, res) => {
    try {
        const features = await propertyFeatureService.getPropertyFeatures(req.params.propertyId);
        res.status(200).json({
            success: true,
            count: features.length,
            data: features,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Create a category
// @route   POST /api/property-feature-categories
exports.createCategory = async (req, res) => {
    try {
        const { error } = categorySchema.create.validate(req.body);
        if (error) {
            return res.status(400).json({ success: false, message: error.details[0].message });
        }

        const category = await propertyFeatureService.createCategory({
            name: req.body.name.trim(),
            display_order: req.body.display_order,
            created_by: req.user.id,
        });

        res.status(201).json({ success: true, data: category });
    } catch (err) {
        if (err.statusCode === 400) {
            return res.status(400).json({ success: false, message: err.message });
        }
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Update a category
// @route   PUT /api/property-feature-categories/:id
exports.updateCategory = async (req, res) => {
    try {
        const { error } = categorySchema.update.validate(req.body);
        if (error) {
            return res.status(400).json({ success: false, message: error.details[0].message });
        }

        const updates = { updated_by: req.user.id };
        if (req.body.name !== undefined) updates.name = req.body.name.trim();
        if (req.body.is_active !== undefined) updates.is_active = req.body.is_active;
        if (req.body.display_order !== undefined) updates.display_order = req.body.display_order;

        const category = await propertyFeatureService.updateCategory(req.params.id, updates);
        res.status(200).json({ success: true, data: category });
    } catch (err) {
        if (err.statusCode === 404) {
            return res.status(404).json({ success: false, message: err.message });
        }
        if (err.statusCode === 400) {
            return res.status(400).json({ success: false, message: err.message });
        }
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Create a feature
// @route   POST /api/property-features
exports.createFeature = async (req, res) => {
    try {
        const { error } = featureSchema.create.validate(req.body);
        if (error) {
            return res.status(400).json({ success: false, message: error.details[0].message });
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
    } catch (err) {
        if (err.statusCode === 400) {
            return res.status(400).json({ success: false, message: err.message });
        }
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Update a feature
// @route   PUT /api/property-features/:id
exports.updateFeature = async (req, res) => {
    try {
        const { error } = featureSchema.update.validate(req.body);
        if (error) {
            return res.status(400).json({ success: false, message: error.details[0].message });
        }

        const updates = { updated_by: req.user.id };
        if (req.body.category_id !== undefined) updates.category_id = req.body.category_id;
        if (req.body.name !== undefined) updates.name = req.body.name.trim();
        if (req.body.is_popular !== undefined) updates.is_popular = req.body.is_popular;
        if (req.body.is_active !== undefined) updates.is_active = req.body.is_active;
        if (req.body.display_order !== undefined) updates.display_order = req.body.display_order;

        const feature = await propertyFeatureService.updateFeature(req.params.id, updates);
        res.status(200).json({ success: true, data: feature });
    } catch (err) {
        if (err.statusCode === 404) {
            return res.status(404).json({ success: false, message: err.message });
        }
        if (err.statusCode === 400) {
            return res.status(400).json({ success: false, message: err.message });
        }
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Save feature mappings for a property
// @route   POST /api/properties/:propertyId/features
exports.savePropertyFeatures = async (req, res) => {
    try {
        const { propertyId } = req.params;
        const { selectedFeatureIds } = req.body;

        if (!Array.isArray(selectedFeatureIds)) {
            return res.status(400).json({ success: false, message: 'selectedFeatureIds must be an array' });
        }

        const property = await propertyService.getPropertyById(propertyId);
        if (!property) {
            return res.status(404).json({ success: false, message: 'Property not found' });
        }

        const isOwner = await propertyService.checkOwnership(propertyId, req.user.id);
        if (!isOwner && req.user.role !== 'Admin') {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        await propertyFeatureService.savePropertyFeatures(propertyId, selectedFeatureIds);
        res.status(200).json({ success: true, message: 'Property features updated' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
