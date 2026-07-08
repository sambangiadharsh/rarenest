const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const userService = require('../services/userService');
const userRepository = require('../repositories/userRepository');
const userSchema = require('../models/userModel');
const builderRepository = require('../repositories/builderRepository');

// @desc    Get current user profile
// @route   GET /api/users/profile
exports.getProfile = asyncHandler(async (req, res) => {
        const user = await userService.getProfile(req.user.id);
        res.status(200).json({ success: true, data: user });
});

// @desc    Update role (deprecated/disabled)
// @route   PATCH /api/users/role
exports.updateRole = asyncHandler(async (req, res) => {
        throw new AppError('Role updates are disabled. Please apply as a builder if you wish to become a builder.', 400);
});

// @desc    Update user profile
// @route   PUT /api/users/profile
exports.updateProfile = asyncHandler(async (req, res) => {
        const { error } = userSchema.updateProfile.validate(req.body);
        if (error) {
            throw new AppError(error.details[0].message, 400);
        }

        const user = await userService.updateProfile(req.user.id, req.body);
        res.status(200).json({ success: true, data: user });
});
