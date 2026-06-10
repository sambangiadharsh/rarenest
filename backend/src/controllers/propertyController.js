const propertyService = require('../services/propertyService');
const propertySchema = require('../models/propertyModel');
const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/userRepository');
const { attachAuthCookie } = require('../utils/authUtils');

async function getOptionalAuth(req) {
    let token;
    if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    if (!token) return null;
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const role = await userRepository.findRoleById(decoded.id);
        return { id: decoded.id, role };
    } catch {
        return null;
    }
}

function parseVerifiedBody(value) {
    if (value === true || value === 1 || value === '1' || value === 'true') return true;
    if (value === false || value === 0 || value === '0' || value === 'false') return false;
    return null;
}

function isBitTruthy(value) {
    return value === true || value === 1 || value === '1';
}

async function canViewRestrictedProperty(req, property) {
    let token;
    if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) return false;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.id === property.seller_id) return true;
        const role = await userRepository.findRoleById(decoded.id);
        return role === 'Admin';
    } catch {
        return false;
    }
}

// @desc    Get all properties
// @route   GET /api/properties
exports.getProperties = async (req, res) => {
    try {
        const filters = { ...req.query };
        const { is_verified, seller_id } = filters;
        const wantsUnverifiedList =
            is_verified === 'all' ||
            is_verified === 'false' ||
            is_verified === false ||
            is_verified === 0 ||
            is_verified === '0';

        if (wantsUnverifiedList) {
            const auth = await getOptionalAuth(req);
            const isAdmin = auth?.role === 'Admin';
            const isOwnSeller =
                auth && seller_id && String(auth.id) === String(seller_id);

            if (!isAdmin && !isOwnSeller) {
                delete filters.is_verified;
            }
        }

        if (filters.is_visible === 'all') {
            const auth = await getOptionalAuth(req);
            if (auth?.role !== 'Admin') {
                delete filters.is_visible;
            }
        }

        const properties = await propertyService.getAllProperties(filters);
        res.status(200).json({
            success: true,
            count: properties.length,
            data: properties
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get single property
// @route   GET /api/properties/:id
exports.getProperty = async (req, res) => {
    try {
        const auth = await getOptionalAuth(req);
        const isAdmin = auth?.role === 'Admin';
        const property = await propertyService.getPropertyById(req.params.id, {
            includeEnquiries: isAdmin,
        });
        if (!property) {
            return res.status(404).json({ success: false, message: 'Property not found' });
        }

        const hasActivePropertyType =
            !property.property_type_id || isBitTruthy(property.property_type_is_active);
        const isPubliclyVisible =
            isBitTruthy(property.is_verified) &&
            isBitTruthy(property.is_visible) &&
            hasActivePropertyType;
        if (!isPubliclyVisible) {
            const isAuthorized = await canViewRestrictedProperty(req, property);
            if (!isAuthorized) {
                return res.status(404).json({ success: false, message: 'Property not found' });
            }
        }

        res.status(200).json({ success: true, data: property });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Create new property
// @route   POST /api/properties
exports.createProperty = async (req, res) => {
    try {
        const { error } = propertySchema.create.validate(req.body);
        if (error) {
            return res.status(400).json({ success: false, message: error.details[0].message });
        }

        const propertyData = { ...req.body, seller_id: req.user.id };
        const property = await propertyService.createProperty(propertyData);
        if (property?.special_features && typeof property.special_features === 'string') {
            try {
                property.special_features = JSON.parse(property.special_features);
            } catch {
                // keep as string
            }
        }

        res.status(201).json({ success: true, data: property });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Guest seller account — create Seller account + auto-login cookie (no property yet)
// @route   POST /api/properties/guest-account
exports.createGuestSellerAccount = async (req, res) => {
    try {
        const { name, email, phone } = req.body;
        if (!name || !email || !phone) {
            return res.status(400).json({ success: false, message: 'Please provide name, email and phone' });
        }

        const result = await propertyService.createGuestSellerAccount({ name, email, phone });

        if (result.error === 'requires_login') {
            return res.status(409).json({
                success: false,
                requiresLogin: true,
                message: 'An account with this email already exists. Please log in.',
            });
        }

        const token = attachAuthCookie(res, result.user.id);

        res.status(201).json({
            success: true,
            emailSent: result.emailSent,
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

// @desc    Guest create listing — new Seller account + property + auto-login cookie
// @route   POST /api/properties/guest
exports.createGuestListing = async (req, res) => {
    try {
        const { error } = propertySchema.guestCreate.validate(req.body);
        if (error) {
            return res.status(400).json({ success: false, message: error.details[0].message });
        }

        const result = await propertyService.createGuestListing(req.body);

        if (result.error === 'requires_login') {
            return res.status(409).json({
                success: false,
                requiresLogin: true,
                message: 'An account with this email already exists. Please log in to create a listing.',
            });
        }

        if (result.property?.special_features && typeof result.property.special_features === 'string') {
            try {
                result.property.special_features = JSON.parse(result.property.special_features);
            } catch {
                // keep as string
            }
        }

        const token = attachAuthCookie(res, result.user.id);

        res.status(201).json({
            success: true,
            message: 'Listing created successfully',
            emailSent: result.emailSent,
            data: result.property,
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

// @desc    Update property
// @route   PUT /api/properties/:id
exports.updateProperty = async (req, res) => {
    try {
        const { error } = propertySchema.update.validate(req.body);
        if (error) {
            return res.status(400).json({ success: false, message: error.details[0].message });
        }

        const isOwner = await propertyService.checkOwnership(req.params.id, req.user.id);
        
        if (isOwner === null) {
            return res.status(404).json({ success: false, message: 'Property not found' });
        }

        if (!isOwner && req.user.role !== 'Admin') {
            return res.status(403).json({ success: false, message: 'Not authorized to update this property' });
        }

        // Strip is_verified from body unless user is Admin
        if (req.user.role !== 'Admin') {
            delete req.body.is_verified;
        }

        const property = await propertyService.updateProperty(req.params.id, req.body);
        res.status(200).json({ success: true, data: property });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Delete property
// @route   DELETE /api/properties/:id
exports.deleteProperty = async (req, res) => {
    try {
        const isOwner = await propertyService.checkOwnership(req.params.id, req.user.id);

        if (isOwner === null) {
            return res.status(404).json({ success: false, message: 'Property not found' });
        }

        if (!isOwner && req.user.role !== 'Admin') {
            return res.status(403).json({ success: false, message: 'Not authorized to delete this property' });
        }

        await propertyService.deleteProperty(req.params.id);
        res.status(200).json({ success: true, message: 'Property deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get verification history for a property (owner or admin)
// @route   GET /api/properties/:id/verification-history
exports.getPropertyVerificationHistory = async (req, res) => {
    try {
        const property = await propertyService.getPropertyById(req.params.id);
        if (!property) {
            return res.status(404).json({ success: false, message: 'Property not found' });
        }

        const isOwner = String(req.user.id) === String(property.seller_id);
        if (!isOwner && req.user.role !== 'Admin') {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        const history = await propertyService.getVerificationHistory(req.params.id);
        res.status(200).json({ success: true, data: history });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Seller resubmits a rejected/change-requested property
// @route   POST /api/properties/:id/resubmit
exports.resubmitProperty = async (req, res) => {
    try {
        const property = await propertyService.getPropertyById(req.params.id);
        if (!property) {
            return res.status(404).json({ success: false, message: 'Property not found' });
        }

        const isOwner = String(req.user.id) === String(property.seller_id);
        if (!isOwner) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        const resubmittableStatuses = ['Rejected', 'RequestChanges'];
        if (!resubmittableStatuses.includes(property.verification_status)) {
            return res.status(400).json({
                success: false,
                message: 'Property cannot be resubmitted in its current state',
            });
        }

        const updated = await propertyService.resubmitProperty(req.params.id, req.user.id);
        res.status(200).json({ success: true, data: updated });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get enquiries for a property (owner or admin)
// @route   GET /api/properties/:id/enquiries
exports.getPropertyEnquiries = async (req, res) => {
    try {
        const property = await propertyService.getPropertyById(req.params.id);
        if (!property) {
            return res.status(404).json({ success: false, message: 'Property not found' });
        }

        const isOwner = String(req.user.id) === String(property.seller_id);
        if (!isOwner && req.user.role !== 'Admin') {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        const enquiries = await propertyService.getPropertyEnquiries(req.params.id);
        res.status(200).json({ success: true, data: enquiries });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Verify/Approve a property
// @route   PUT /api/properties/:id/verify
exports.verifyProperty = async (req, res) => {
    try {
        const { status, reason } = req.body;
        const validStatuses = ['Approved', 'Rejected', 'RequestChanges'];

        if (!status || !validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid status: Approved, Rejected, or RequestChanges',
            });
        }

        const property = await propertyService.getPropertyById(req.params.id);
        if (!property) {
            return res.status(404).json({ success: false, message: 'Property not found' });
        }

        const updatedProperty = await propertyService.verifyProperty(req.params.id, {
            status,
            reason: reason || null,
            adminId: req.user.id,
        });
        res.status(200).json({ success: true, data: updatedProperty });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

