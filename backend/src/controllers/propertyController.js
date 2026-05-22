const propertyService = require('../services/propertyService');
const propertySchema = require('../models/propertyModel');
const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/userRepository');

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
        const property = await propertyService.getPropertyById(req.params.id);
        if (!property) {
            return res.status(404).json({ success: false, message: 'Property not found' });
        }

        // If the property is not verified, check if the current user is authorized (owner or Admin)
        if (!property.is_verified) {
            let isAuthorized = false;
            let token;

            if (req.cookies && req.cookies.token) {
                token = req.cookies.token;
            } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
                token = req.headers.authorization.split(' ')[1];
            }

            if (token) {
                try {
                    const decoded = jwt.verify(token, process.env.JWT_SECRET);
                    if (decoded.id === property.seller_id) {
                        isAuthorized = true;
                    } else {
                        const role = await userRepository.findRoleById(decoded.id);
                        if (role === 'Admin') {
                            isAuthorized = true;
                        }
                    }
                } catch (jwtErr) {
                    // Ignore token errors and treat as unauthorized
                }
            }

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

// @desc    Verify/Approve a property
// @route   PUT /api/properties/:id/verify
exports.verifyProperty = async (req, res) => {
    try {
        const parsed = parseVerifiedBody(req.body.is_verified);
        if (parsed === null) {
            return res.status(400).json({
                success: false,
                message: 'Please provide is_verified as true or false',
            });
        }

        const property = await propertyService.getPropertyById(req.params.id);
        if (!property) {
            return res.status(404).json({ success: false, message: 'Property not found' });
        }

        const updatedProperty = await propertyService.verifyProperty(req.params.id, parsed);
        res.status(200).json({ success: true, data: updatedProperty });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

