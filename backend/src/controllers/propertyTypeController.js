const propertyTypeService = require('../services/propertyTypeService');
const propertyTypeSchema = require('../models/propertyTypeModel');

// @desc    Get active property types (public, for listing form)
// @route   GET /api/property-types/active
exports.getActivePropertyTypes = async (req, res) => {
    try {
        const propertyTypes = await propertyTypeService.getActivePropertyTypes();
        res.status(200).json({
            success: true,
            count: propertyTypes.length,
            data: propertyTypes,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get all property types
// @route   GET /api/property-types
exports.getPropertyTypes = async (req, res) => {
    try {
        const propertyTypes = await propertyTypeService.getAllPropertyTypes();
        res.status(200).json({
            success: true,
            count: propertyTypes.length,
            data: propertyTypes,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Create property type
// @route   POST /api/property-types
exports.createPropertyType = async (req, res) => {
    try {
        const { error } = propertyTypeSchema.create.validate(req.body);
        if (error) {
            return res.status(400).json({ success: false, message: error.details[0].message });
        }

        const propertyType = await propertyTypeService.createPropertyType({
            name: req.body.name.trim(),
            created_by: req.user.id,
        });

        res.status(201).json({
            success: true,
            data: propertyType,
        });
    } catch (err) {
        if (err.statusCode === 400) {
            return res.status(400).json({ success: false, message: err.message });
        }
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Update property type
// @route   PUT /api/property-types/:id
exports.updatePropertyType = async (req, res) => {
    try {
        const { error } = propertyTypeSchema.update.validate(req.body);
        if (error) {
            return res.status(400).json({ success: false, message: error.details[0].message });
        }

        const updates = { updated_by: req.user.id };
        if (req.body.name !== undefined) {
            updates.name = req.body.name.trim();
        }
        if (req.body.is_active !== undefined) {
            updates.is_active = req.body.is_active;
        }
        if (req.body.display_order !== undefined) {
            updates.display_order = req.body.display_order;
        }

        const propertyType = await propertyTypeService.updatePropertyType(req.params.id, updates);

        res.status(200).json({
            success: true,
            data: propertyType,
        });
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
