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
