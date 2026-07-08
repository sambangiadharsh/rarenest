const crypto = require('crypto');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const authService = require('../services/authService');
const sendEmail = require('../utils/sendEmail');
const userSchema = require('../models/userModel');
const { hashPassword, comparePassword, generateToken } = require('../utils/authUtils');
const builderRepository = require('../repositories/builderRepository');
const { OAuth2Client } = require('google-auth-library');

// @desc    Register a new user
// @route   POST /api/auth/register
exports.register = asyncHandler(async (req, res) => {
        // 1. Validate Input
        const { error } = userSchema.register.validate(req.body);
        if (error) {
            throw new AppError(error.details[0].message, 400);
        }

        const { email, password, first_name, last_name, phone, address, role } = req.body;

        // 2. Check if user exists
        const userExists = await authService.findUserByEmail(email);
        if (userExists) {
            throw new AppError('User already exists', 400);
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
});

// @desc    Login user
// @route   POST /api/auth/login
exports.login = asyncHandler(async (req, res) => {
        // 1. Validate Input
        const { error } = userSchema.login.validate(req.body);
        if (error) {
            throw new AppError(error.details[0].message, 400);
        }

        const { email, password } = req.body;

        // 2. Find User
        const user = await authService.findUserByEmail(email);

        if (!user) {
            throw new AppError('Invalid credentials', 401);
        }

        if (user.password_hash === null || user.password_hash === undefined) {
            throw new AppError('This account was created using Google Sign-In. Please continue with Google or set a password from your account settings.', 400);
        }

        if (!(await comparePassword(password, user.password_hash))) {
            throw new AppError('Invalid credentials', 401);
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
});

// @desc    Change password (authenticated user)
// @route   PUT /api/auth/changepassword
exports.changePassword = asyncHandler(async (req, res) => {
        const { error } = userSchema.changePassword.validate(req.body);
        if (error) {
            throw new AppError(error.details[0].message, 400);
        }

        const { current_password, new_password } = req.body;

        const user = await authService.findUserById(req.user.id);
        if (!user) {
            throw new AppError('User not found', 404);
        }

        const isMatch = await comparePassword(current_password, user.password_hash);
        if (!isMatch) {
            throw new AppError('Current password is incorrect', 400);
        }

        const hashedPassword = await hashPassword(new_password);
        await authService.updatePassword(user.id, hashedPassword);

        res.status(200).json({ success: true, message: 'Password changed successfully' });
});

// @desc    Forgot password — send reset link
// @route   POST /api/auth/forgot-password
exports.forgotPassword = asyncHandler(async (req, res) => {
        const { error } = userSchema.forgotPassword.validate(req.body);
        if (error) {
            throw new AppError(error.details[0].message, 400);
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
            throw new AppError('Email could not be sent. Please try again later.', 500);
        }

        return res.status(200).json({ success: true, message: 'If that email is registered, a reset link has been sent.' });
});

// @desc    Reset password using token
// @route   POST /api/auth/reset-password
exports.resetPassword = asyncHandler(async (req, res) => {
        const { error } = userSchema.resetPassword.validate(req.body);
        if (error) {
            throw new AppError(error.details[0].message, 400);
        }

        const { token, password } = req.body;

        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
        const user = await authService.findUserByResetToken(hashedToken);

        if (!user) {
            throw new AppError('Reset link is invalid or has expired.', 400);
        }

        const hashedPassword = await hashPassword(password);
        await authService.updatePassword(user.id, hashedPassword);

        res.status(200).json({ success: true, message: 'Password reset successful. You can now log in.' });
});

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

// @desc    Google authentication
// @route   POST /api/auth/google
exports.googleLogin = asyncHandler(async (req, res) => {
        const { token } = req.body;
        if (!token) {
            throw new AppError('Token is required', 400);
        }

        const clientId = process.env.GOOGLE_CLIENT_ID;
        if (!clientId) {
            throw new AppError('Google Client ID is not configured on the server', 500);
        }

        const client = new OAuth2Client(clientId);
        let payload;
        try {
            const ticket = await client.verifyIdToken({
                idToken: token,
                audience: clientId,
            });
            payload = ticket.getPayload();
        } catch (verifyErr) {
            console.error('Google ID Token verification failed:', verifyErr);
            throw new AppError('Invalid Google token', 400);
        }

        const { email, name, picture, sub: google_id } = payload;
        if (!email) {
            throw new AppError('Email address not provided by Google account', 400);
        }

        let user = await authService.findUserByEmail(email.trim().toLowerCase());

        if (user) {
            // Case 2: User exists
            if (!user.google_id) {
                // Link Google authentication
                user = await authService.linkGoogleAccount(user.id, google_id, picture);
            } else {
                // Just update last login
                await authService.updateLastLogin(user.id);
            }
        } else {
            // Case 1: User does not exist
            // Split name into first and last name
            let first_name = '';
            let last_name = '';
            if (name) {
                const parts = name.trim().split(/\s+/);
                first_name = parts[0] || '';
                last_name = parts.slice(1).join(' ') || '';
            }

            user = await authService.createUser({
                email: email.trim().toLowerCase(),
                first_name,
                last_name,
                profile_image: picture,
                google_id,
                provider: 'google',
                password_hash: null,
                role: 'User'
            });
        }

        const appToken = generateToken(user.id);
        const options = {
            expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            httpOnly: true
        };

        if (process.env.NODE_ENV === 'production') {
            options.secure = true;
        }

        res.status(200).cookie('token', appToken, options).json({
            success: true,
            token: appToken,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                first_name: user.first_name,
                last_name: user.last_name,
                profile_image: user.profile_image
            }
        });
});
