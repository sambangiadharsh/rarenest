const crypto = require('crypto');
const authService = require('../services/authService');
const sendEmail = require('../utils/sendEmail');
const userSchema = require('../models/userModel');
const { hashPassword, comparePassword, generateToken } = require('../utils/authUtils');
const builderRepository = require('../repositories/builderRepository');

// @desc    Register a new user
// @route   POST /api/auth/register
exports.register = async (req, res) => {
    try {
        // 1. Validate Input
        const { error } = userSchema.register.validate(req.body);
        if (error) {
            return res.status(400).json({ success: false, message: error.details[0].message });
        }

        const { email, password, first_name, last_name, phone, address, role } = req.body;

        // 2. Check if user exists
        const userExists = await authService.findUserByEmail(email);
        if (userExists) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        // 3. Hash password
        const hashedPassword = await hashPassword(password);

        // 4. Create user via Service
        const newUser = await authService.createUser({
            email,
            password_hash: hashedPassword,
            first_name,
            last_name,
            phone,
            address,
            role: 'User'
        });

        const token = generateToken(newUser.id);

        const options = {
            expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
            httpOnly: true
        };
        
        if (process.env.NODE_ENV === 'production') {
            options.secure = true;
        }

        res.status(201).cookie('token', token, options).json({
            success: true,
            token,
            user: newUser
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
exports.login = async (req, res) => {
    try {
        // 1. Validate Input
        const { error } = userSchema.login.validate(req.body);
        if (error) {
            return res.status(400).json({ success: false, message: error.details[0].message });
        }

        const { email, password } = req.body;

        // 2. Find User
        const user = await authService.findUserByEmail(email);

        if (!user || !(await comparePassword(password, user.password_hash))) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const token = generateToken(user.id);

        const options = {
            expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            httpOnly: true
        };
        
        if (process.env.NODE_ENV === 'production') {
            options.secure = true;
        }

        res.status(200).cookie('token', token, options).json({
            success: true,
            token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                first_name: user.first_name,
                last_name: user.last_name
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Change password (authenticated user)
// @route   PUT /api/auth/changepassword
exports.changePassword = async (req, res) => {
    try {
        const { error } = userSchema.changePassword.validate(req.body);
        if (error) {
            return res.status(400).json({ success: false, message: error.details[0].message });
        }

        const { current_password, new_password } = req.body;

        const user = await authService.findUserById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const isMatch = await comparePassword(current_password, user.password_hash);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Current password is incorrect' });
        }

        const hashedPassword = await hashPassword(new_password);
        await authService.updatePassword(user.id, hashedPassword);

        res.status(200).json({ success: true, message: 'Password changed successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Forgot password — send reset link
// @route   POST /api/auth/forgot-password
exports.forgotPassword = async (req, res) => {
    try {
        const { error } = userSchema.forgotPassword.validate(req.body);
        if (error) {
            return res.status(400).json({ success: false, message: error.details[0].message });
        }

        const user = await authService.findUserByEmail(req.body.email.trim().toLowerCase());

        // Always return generic response to prevent email enumeration
        if (!user) {
            return res.status(200).json({ success: true, message: 'If that email is registered, a reset link has been sent.' });
        }

        // Generate raw token, store its SHA-256 hash
        const rawToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
        const expireDate = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

        await authService.updateResetToken(user.id, hashedToken, expireDate);

        const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password?token=${rawToken}`;

        try {
            await sendEmail({
                email: user.email,
                subject: 'Reset your RareNest password',
                text: `You requested a password reset. This link expires in 15 minutes:\n\n${resetUrl}\n\nIf you did not request this, ignore this email.`,
                html: sendEmail.passwordResetHtml({ resetUrl }),
            });
        } catch (mailErr) {
            console.error('Reset email failed:', mailErr);
            await authService.updateResetToken(user.id, null, null);
            return res.status(500).json({ success: false, message: 'Email could not be sent. Please try again later.' });
        }

        return res.status(200).json({ success: true, message: 'If that email is registered, a reset link has been sent.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Reset password using token
// @route   POST /api/auth/reset-password
exports.resetPassword = async (req, res) => {
    try {
        const { error } = userSchema.resetPassword.validate(req.body);
        if (error) {
            return res.status(400).json({ success: false, message: error.details[0].message });
        }

        const { token, password } = req.body;

        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
        const user = await authService.findUserByResetToken(hashedToken);

        if (!user) {
            return res.status(400).json({ success: false, message: 'Reset link is invalid or has expired.' });
        }

        const hashedPassword = await hashPassword(password);
        await authService.updatePassword(user.id, hashedPassword);

        res.status(200).json({ success: true, message: 'Password reset successful. You can now log in.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Log user out / clear cookie
// @route   GET /api/auth/logout
exports.logout = async (req, res) => {
    res.cookie('token', 'none', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });

    res.status(200).json({
        success: true,
        data: {}
    });
};
