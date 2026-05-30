const enquiryService = require('../services/enquiryService');
const propertyService = require('../services/propertyService');
const enquirySchema = require('../models/enquiryModel');
const { attachAuthCookie } = require('../utils/authUtils');

function mapEnquiryErrors(result, res) {
    if (result.error === 'not_found') {
        return res.status(404).json({ success: false, message: 'Property not found' });
    }
    if (result.error === 'requires_login') {
        return res.status(409).json({
            success: false,
            requiresLogin: true,
            message: 'An account with this email already exists. Please log in to send your enquiry.',
        });
    }
    if (result.error === 'own_property') {
        return res.status(400).json({
            success: false,
            message: 'You cannot send an enquiry for your own listing',
        });
    }
    if (result.error === 'duplicate') {
        return res.status(409).json({
            success: false,
            message: 'You have already sent an enquiry for this property',
        });
    }
    return null;
}

// @desc    List enquiries sent by the current user
// @route   GET /api/enquiries
exports.getMyEnquiries = async (req, res) => {
    try {
        const enquiries = await enquiryService.getEnquiriesForUser(req.user.id);
        res.status(200).json({ success: true, data: enquiries });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Send enquiry for a property (authenticated)
// @route   POST /api/enquiries
exports.createEnquiry = async (req, res) => {
    try {
        const { property_id } = req.body;
        if (!property_id) {
            return res.status(400).json({
                success: false,
                message: 'Please provide property_id',
            });
        }

        const property = await propertyService.getPropertyById(property_id);
        if (!property) {
            return res.status(404).json({ success: false, message: 'Property not found' });
        }

        const result = await enquiryService.createEnquiry(req.user.id, property_id);
        const errRes = mapEnquiryErrors(result, res);
        if (errRes) return errRes;

        res.status(201).json({
            success: true,
            message: 'Enquiry sent successfully',
            data: result.enquiry,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Guest enquiry — new account + enquiry + auto-login cookie
// @route   POST /api/enquiries/guest
exports.createGuestEnquiry = async (req, res) => {
    try {
        const { error } = enquirySchema.guestEnquiry.validate(req.body);
        if (error) {
            return res.status(400).json({ success: false, message: error.details[0].message });
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
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
