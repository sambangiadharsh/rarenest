const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const enquiryService = require('../services/enquiryService');
const propertyService = require('../services/propertyService');
const enquirySchema = require('../models/enquiryModel');
const { attachAuthCookie } = require('../utils/authUtils');

function mapEnquiryErrors(result, res) {
    if (result.error === 'not_found') {
        throw new AppError('Property not found', 404);
    }
    if (result.error === 'requires_login') {
        throw new AppError('An account with this email already exists. Please log in to send your enquiry.', 409, { requiresLogin: true });
    }
    if (result.error === 'own_property') {
        throw new AppError('You cannot send an enquiry for your own listing', 400);
    }
    if (result.error === 'duplicate') {
        throw new AppError('You have already sent an enquiry for this property', 409);
    }
    return null;
}

// @desc    List enquiries sent by the current user
// @route   GET /api/enquiries
exports.getMyEnquiries = asyncHandler(async (req, res) => {
        const enquiries = await enquiryService.getEnquiriesForUser(req.user.id);
        res.status(200).json({ success: true, data: enquiries });
});

// @desc    Send enquiry for a property (authenticated)
// @route   POST /api/enquiries
exports.createEnquiry = asyncHandler(async (req, res) => {
        const { property_id } = req.body;
        if (!property_id) {
            throw new AppError('Please provide property_id', 400);
        }

        const property = await propertyService.getPropertyById(property_id);
        if (!property) {
            throw new AppError('Property not found', 404);
        }

        const result = await enquiryService.createEnquiry(req.user.id, property_id);
        const errRes = mapEnquiryErrors(result, res);
        if (errRes) return errRes;

        res.status(201).json({
            success: true,
            message: 'Enquiry sent successfully',
            data: result.enquiry,
        });
});

// @desc    Guest enquiry — new account + enquiry + auto-login cookie
// @route   POST /api/enquiries/guest
exports.createGuestEnquiry = asyncHandler(async (req, res) => {
        const { error } = enquirySchema.guestEnquiry.validate(req.body);
        if (error) {
            throw new AppError(error.details[0].message, 400);
        }

        const { property_id, email, name, phone } = req.body;
        const result = await enquiryService.createGuestEnquiry({
            property_id,
            email,
            name,
            phone,
        });

        const errRes = mapEnquiryErrors(result, res);
        if (errRes) return errRes;

        const token = attachAuthCookie(res, result.user.id);

        res.status(201).json({
            success: true,
            message: 'Enquiry sent successfully',
            emailSent: result.emailSent,
            data: result.enquiry,
            token,
            user: {
                id: result.user.id,
                email: result.user.email,
                role: result.user.role,
                first_name: result.user.first_name,
                last_name: result.user.last_name,
            },
        });
});
