const crypto = require('crypto');
const authService = require('../services/authService');
const userSchema = require('../models/userModel');
const { hashPassword, comparePassword, generateToken } = require('../utils/authUtils');
const sendEmail = require('../utils/sendEmail');

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
            role
        });

        const token = generateToken(newUser.id);

        const options = {
            expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
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

// @desc    Forgot password
// @route   POST /api/auth/forgotpassword
exports.forgotPassword = async (req, res) => {
    try {
        // 1. Validate Input
        const { error } = userSchema.forgotPassword.validate(req.body);
        if (error) {
            return res.status(400).json({ success: false, message: error.details[0].message });
        }

        // 2. Find User
        const user = await authService.findUserByEmail(req.body.email);

        if (!user) {
            return res.status(404).json({ success: false, message: 'There is no user with that email' });
        }

        // 3. Generate Token
        const resetToken = crypto.randomBytes(20).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        const expireDate = new Date(Date.now() + 10 * 60 * 1000);

        // 4. Update User via Service
        await authService.updateResetToken(user.id, hashedToken, expireDate);

        // 5. Send Email
        const resetUrl = `${req.protocol}://${req.get('host')}/api/auth/resetpassword/${resetToken}`;
        const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

        try {
            await sendEmail({
                email: user.email,
                subject: 'Password reset token',
                message
            });

            res.status(200).json({ success: true, data: 'Email sent' });
        } catch (err) {
            console.error(err);
            await authService.updateResetToken(user.id, null, null);
            return res.status(500).json({ success: false, message: 'Email could not be sent' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Reset password
// @route   PUT /api/auth/resetpassword/:resettoken
exports.resetPassword = async (req, res) => {
    try {
        // 1. Validate Input
        const { error } = userSchema.resetPassword.validate(req.body);
        if (error) {
            return res.status(400).json({ success: false, message: error.details[0].message });
        }

        // 2. Hash token from params
        const hashedToken = crypto.createHash('sha256').update(req.params.resettoken).digest('hex');

        // 3. Find User via Service
        const user = await authService.findUserByResetToken(hashedToken);

        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid token or token expired' });
        }

        // 4. Update Password via Service
        const hashedPassword = await hashPassword(req.body.password);
        await authService.updatePassword(user.id, hashedPassword);

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
            token
        });
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
