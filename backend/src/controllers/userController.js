const userService = require('../services/userService');
const userRepository = require('../repositories/userRepository');
const userSchema = require('../models/userModel');
const builderRepository = require('../repositories/builderRepository');

// @desc    Get current user profile
// @route   GET /api/users/profile
exports.getProfile = async (req, res) => {
    try {
        const user = await userService.getProfile(req.user.id);
        res.status(200).json({ success: true, data: user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Update role (deprecated/disabled)
// @route   PATCH /api/users/role
exports.updateRole = async (req, res) => {
    try {
        return res.status(400).json({
            success: false,
            message: 'Role updates are disabled. Please apply as a builder if you wish to become a builder.'
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
exports.updateProfile = async (req, res) => {
    try {
        const { error } = userSchema.updateProfile.validate(req.body);
        if (error) {
            return res.status(400).json({ success: false, message: error.details[0].message });
        }

        const user = await userService.updateProfile(req.user.id, req.body);
        res.status(200).json({ success: true, data: user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
