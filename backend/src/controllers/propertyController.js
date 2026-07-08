const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const propertyService = require('../services/propertyService');
const propertySchema = require('../models/propertyModel');
const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/userRepository');
const builderRepository = require('../repositories/builderRepository');
const { attachAuthCookie } = require('../utils/authUtils');

function mapIncomingLocationFields(body) {
    if (!body) return;
    if (body.city !== undefined) { body.location_city = body.city; delete body.city; }
    if (body.state !== undefined) { body.location_state = body.state; delete body.state; }
    if (body.district !== undefined) { body.location_district = body.district; delete body.district; }
    if (body.area !== undefined) { body.Area = body.area; delete body.area; }
    if (body.pincode !== undefined) { body.Pincode = body.pincode; delete body.pincode; }
}

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
exports.getProperties = asyncHandler(async (req, res) => {
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
});

// @desc    Get single property
// @route   GET /api/properties/:id
exports.getProperty = asyncHandler(async (req, res) => {
        const auth = await getOptionalAuth(req);
        const isAdmin = auth?.role === 'Admin';
        const property = await propertyService.getPropertyById(req.params.id, {
            includeEnquiries: isAdmin,
        });
        if (!property) {
            throw new AppError('Property not found', 404);
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
                throw new AppError('Property not found', 404);
            }
        }

        res.status(200).json({ success: true, data: property });
});

// @desc    Create new property
// @route   POST /api/properties
exports.createProperty = asyncHandler(async (req, res) => {
        mapIncomingLocationFields(req.body);
        const { error } = propertySchema.create.validate(req.body);
        if (error) {
            throw new AppError(error.details[0].message, 400);
        }

        const propertyData = { ...req.body, seller_id: req.user.id };

        if (propertyData.listing_type === 'BuilderProject') {
            const builder = await builderRepository.findProfileByUserId(propertyData.seller_id);
            if (!builder || builder.builder_status !== 'Approved') {
                throw new AppError('Builder approval required to create a Builder Project listing.', 403);
            }
        }

        const property = await propertyService.createProperty(propertyData);

        res.status(201).json({ success: true, data: property });
});

// @desc    Guest seller account — create Seller account + auto-login cookie (no property yet)
// @route   POST /api/properties/guest-account
exports.createGuestSellerAccount = asyncHandler(async (req, res) => {
        const { name, email, phone } = req.body;
        if (!name || !email || !phone) {
            throw new AppError('Please provide name, email and phone', 400);
        }

        const result = await propertyService.createGuestSellerAccount({ name, email, phone });

        if (result.error === 'requires_login') {
            throw new AppError('An account with this email already exists. Please log in.', 409, { requiresLogin: true });
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
});

// @desc    Guest create listing — new Seller account + property + auto-login cookie
// @route   POST /api/properties/guest
exports.createGuestListing = asyncHandler(async (req, res) => {
        mapIncomingLocationFields(req.body);
        const { error } = propertySchema.guestCreate.validate(req.body);
        if (error) {
            throw new AppError(error.details[0].message, 400);
        }

        const result = await propertyService.createGuestListing(req.body);

        if (result.error === 'requires_login') {
            throw new AppError('An account with this email already exists. Please log in to create a listing.', 409, { requiresLogin: true });
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
});

// @desc    Update property
// @route   PUT /api/properties/:id
exports.updateProperty = asyncHandler(async (req, res) => {
        mapIncomingLocationFields(req.body);
        const { error } = propertySchema.update.validate(req.body);
        if (error) {
            throw new AppError(error.details[0].message, 400);
        }

        const isOwner = await propertyService.checkOwnership(req.params.id, req.user.id);
        
        if (isOwner === null) {
            throw new AppError('Property not found', 404);
        }

        if (!isOwner && req.user.role !== 'Admin') {
            throw new AppError('Not authorized to update this property', 403);
        }

        // Strip is_verified from body unless user is Admin
        if (req.user.role !== 'Admin') {
            delete req.body.is_verified;
        }

        const property = await propertyService.updateProperty(req.params.id, req.body);
        res.status(200).json({ success: true, data: property });
});

// @desc    Delete property
// @route   DELETE /api/properties/:id
exports.deleteProperty = asyncHandler(async (req, res) => {
        const isOwner = await propertyService.checkOwnership(req.params.id, req.user.id);

        if (isOwner === null) {
            throw new AppError('Property not found', 404);
        }

        if (!isOwner && req.user.role !== 'Admin') {
            throw new AppError('Not authorized to delete this property', 403);
        }

        await propertyService.deleteProperty(req.params.id);
        res.status(200).json({ success: true, message: 'Property deleted' });
});

// @desc    Get verification history for a property (owner or admin)
// @route   GET /api/properties/:id/verification-history
exports.getPropertyVerificationHistory = asyncHandler(async (req, res) => {
        const property = await propertyService.getPropertyById(req.params.id);
        if (!property) {
            throw new AppError('Property not found', 404);
        }

        const isOwner = String(req.user.id) === String(property.seller_id);
        if (!isOwner && req.user.role !== 'Admin') {
            throw new AppError('Not authorized', 403);
        }

        const history = await propertyService.getVerificationHistory(req.params.id);
        res.status(200).json({ success: true, data: history });
});

// @desc    Seller resubmits a rejected/change-requested property
// @route   POST /api/properties/:id/resubmit
exports.resubmitProperty = asyncHandler(async (req, res) => {
        const property = await propertyService.getPropertyById(req.params.id);
        if (!property) {
            throw new AppError('Property not found', 404);
        }

        const isOwner = String(req.user.id) === String(property.seller_id);
        if (!isOwner) {
            throw new AppError('Not authorized', 403);
        }

        const resubmittableStatuses = ['Rejected', 'RequestChanges'];
        if (!resubmittableStatuses.includes(property.verification_status)) {
            throw new AppError('Property cannot be resubmitted in its current state', 400);
        }

        const updated = await propertyService.resubmitProperty(req.params.id, req.user.id);
        res.status(200).json({ success: true, data: updated });
});

// @desc    Get enquiries for a property (owner or admin)
// @route   GET /api/properties/:id/enquiries
exports.getPropertyEnquiries = asyncHandler(async (req, res) => {
        const property = await propertyService.getPropertyById(req.params.id);
        if (!property) {
            throw new AppError('Property not found', 404);
        }

        const isOwner = String(req.user.id) === String(property.seller_id);
        if (!isOwner && req.user.role !== 'Admin') {
            throw new AppError('Not authorized', 403);
        }

        const enquiries = await propertyService.getPropertyEnquiries(req.params.id);
        res.status(200).json({ success: true, data: enquiries });
});

// @desc    Toggle is_featured for a property (admin only)
// @route   PATCH /api/properties/:id/featured
exports.toggleFeatured = asyncHandler(async (req, res) => {
        const property = await propertyService.getPropertyById(req.params.id);
        if (!property) {
            throw new AppError('Property not found', 404);
        }
        const newValue = !isBitTruthy(property.is_featured);
        const updated = await propertyService.updateProperty(req.params.id, { is_featured: newValue });
        res.status(200).json({ success: true, data: updated });
});

// @desc    Verify/Approve a property
// @route   PUT /api/properties/:id/verify
exports.verifyProperty = asyncHandler(async (req, res) => {
        const { status, reason } = req.body;
        const validStatuses = ['Approved', 'Rejected', 'RequestChanges'];

        if (!status || !validStatuses.includes(status)) {
            throw new AppError('Please provide a valid status: Approved, Rejected, or RequestChanges', 400);
        }

        const property = await propertyService.getPropertyById(req.params.id);
        if (!property) {
            throw new AppError('Property not found', 404);
        }

        const updatedProperty = await propertyService.verifyProperty(req.params.id, {
            status,
            reason: reason || null,
            adminId: req.user.id,
        });
        res.status(200).json({ success: true, data: updatedProperty });
});

