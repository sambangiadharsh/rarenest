const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const propertyTypeService = require('../services/propertyTypeService');
const propertyTypeSchema = require('../models/propertyTypeModel');

// @desc    Get active property types (public, for listing form)
// @route   GET /api/property-types/active
exports.getActivePropertyTypes = asyncHandler(async (req, res) => {
        const propertyTypes = await propertyTypeService.getActivePropertyTypes();
        res.status(200).json({
            success: true,
            count: propertyTypes.length,
            data: propertyTypes,
        });
});

// @desc    Get all property types
// @route   GET /api/property-types
exports.getPropertyTypes = asyncHandler(async (req, res) => {
        const propertyTypes = await propertyTypeService.getAllPropertyTypes();
        res.status(200).json({
            success: true,
            count: propertyTypes.length,
            data: propertyTypes,
        });
});

// @desc    Create property type
// @route   POST /api/property-types
exports.createPropertyType = asyncHandler(async (req, res) => {
        const { error } = propertyTypeSchema.create.validate(req.body);
        if (error) {
            throw new AppError(error.details[0].message, 400);
        }

        const propertyType = await propertyTypeService.createPropertyType({
            name: req.body.name.trim(),
            created_by: req.user.id,
        });

        res.status(201).json({
            success: true,
            data: propertyType,
        });
});

// @desc    Update property type
// @route   PUT /api/property-types/:id
exports.updatePropertyType = asyncHandler(async (req, res) => {
        const { error } = propertyTypeSchema.update.validate(req.body);
        if (error) {
            throw new AppError(error.details[0].message, 400);
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
});
