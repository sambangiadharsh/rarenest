const crypto = require('crypto');
const propertyRepository = require('../repositories/propertyRepository');
const propertyMediaRepository = require('../repositories/propertyMediaRepository');
const propertyFeatureRepository = require('../repositories/propertyFeatureRepository');
const enquiryRepository = require('../repositories/enquiryRepository');
const mediaService = require('./mediaService');
const authService = require('./authService');
const sendEmail = require('../utils/sendEmail');
const { hashPassword } = require('../utils/authUtils');

class PropertyService {
    async getPropertyById(id, options = {}) {
        const property = await propertyRepository.findById(id);
        if (!property) return null;
         
        property.media = await propertyRepository.findMediaByPropertyId(id);

        // Fetch and map features
        property.features = await propertyFeatureRepository.findFeaturesByPropertyId(id);
        property.selectedFeatureIds = property.features.map(f => f.Id);
        
        // Group features for display
        const grouped = {};
        for (const f of property.features) {
            if (!grouped[f.CategoryName]) grouped[f.CategoryName] = [];
            grouped[f.CategoryName].push(f.Name);
        }
        property.groupedFeatures = grouped;

        const first = property.seller_first_name || '';
        const last = property.seller_last_name || '';
        property.seller_name = [first, last].filter(Boolean).join(' ') || null;

        property.enquiry_count = await enquiryRepository.countByPropertyId(id);
        if (options.includeEnquiries) {
            property.enquiries = await enquiryRepository.findByPropertyId(id);
        }

        return property;
    }
    
    async getAllProperties(filters = {}) {
        const properties = await propertyRepository.findAll(filters);
        if (properties.length === 0) return properties;

        const mediaByPropertyId = await propertyMediaRepository.findByPropertyIds(
            properties.map((p) => p.id),
        );
        const featuresByPropertyId = await propertyFeatureRepository.findFeaturesByPropertyIds(
            properties.map((p) => p.id),
        );

        for (const p of properties) {
            const key = String(p.id).toLowerCase();
            p.media = mediaByPropertyId[key] || [];

            p.features = featuresByPropertyId[key] || [];
            p.selectedFeatureIds = p.features.map(f => f.Id);
            const grouped = {};
            for (const f of p.features) {
                if (!grouped[f.CategoryName]) grouped[f.CategoryName] = [];
                grouped[f.CategoryName].push(f.Name);
            }
            p.groupedFeatures = grouped;
        }
        return properties;
    }

    async createProperty(propertyData) {
        const property = await propertyRepository.create(propertyData);
        if (propertyData.selectedFeatureIds && propertyData.selectedFeatureIds.length > 0) {
            await propertyFeatureRepository.savePropertyMappings(property.id, propertyData.selectedFeatureIds);
        }
        return this.getPropertyById(property.id);
    }

    async createGuestSellerAccount({ name, email, phone }) {
        const normalizedEmail = email.trim().toLowerCase();
        const existingUser = await authService.findUserByEmail(normalizedEmail);
        if (existingUser) {
            return { error: 'requires_login' };
        }

        const trimmedName = name.trim();
        const spaceIdx = trimmedName.indexOf(' ');
        const first_name = spaceIdx === -1 ? trimmedName : trimmedName.slice(0, spaceIdx);
        const last_name = spaceIdx === -1 ? '' : trimmedName.slice(spaceIdx + 1).trim();

        const plainPassword = crypto.randomBytes(9).toString('base64url');
        const password_hash = await hashPassword(plainPassword);

        const newUser = await authService.createUser({
            email: normalizedEmail,
            password_hash,
            first_name,
            last_name,
            phone: phone.trim(),
            
        });
        
        const loginUrl = process.env.CLIENT_URL || 'http://localhost:8001';
        let emailSent = false;
        try {
            await sendEmail({
                email: newUser.email,
                subject: 'Your RareNest seller account',
                text: `Welcome to RareNest!\n\nEmail: ${newUser.email}\nTemporary password: ${plainPassword}\n\nLog in at: ${loginUrl}`,
                html: sendEmail.guestSellerHtml({
                    email: newUser.email,
                    password: plainPassword,
                    loginUrl,
                }),
            });
            emailSent = true;
        } catch (mailErr) {
            console.error('Guest seller account welcome email failed:', mailErr);
        }

        return { user: newUser, emailSent };
    }
    
    async createGuestListing({ name, email, phone, ...propertyData }) {
        const normalizedEmail = email.trim().toLowerCase();
        const existingUser = await authService.findUserByEmail(normalizedEmail);
        if (existingUser) {
            return { error: 'requires_login' };
        }

        const trimmedName = name.trim();
        const spaceIdx = trimmedName.indexOf(' ');
        const first_name = spaceIdx === -1 ? trimmedName : trimmedName.slice(0, spaceIdx);
        const last_name = spaceIdx === -1 ? '' : trimmedName.slice(spaceIdx + 1).trim();

        const plainPassword = crypto.randomBytes(9).toString('base64url');
        const password_hash = await hashPassword(plainPassword);

        const newUser = await authService.createUser({
            email: normalizedEmail,
            password_hash,
            first_name,
            last_name,
            phone: phone.trim(),
            role: 'Seller',
        });

        const property = await propertyRepository.create({
            ...propertyData,
            seller_id: newUser.id,
        });
          
        if (propertyData.selectedFeatureIds && propertyData.selectedFeatureIds.length > 0) {
            await propertyFeatureRepository.savePropertyMappings(property.id, propertyData.selectedFeatureIds);
        }
         
        const loginUrl = process.env.CLIENT_URL || 'http://localhost:8001';
        let emailSent = false;
        try {
            await sendEmail({
                email: newUser.email,
                subject: 'Your RareNest listing & account details',
                text: `Thank you for listing "${property.title}" on RareNest.\n\nEmail: ${newUser.email}\nTemporary password: ${plainPassword}\n\nLog in at: ${loginUrl}\n\nYour listing is pending admin verification.`,
                html: sendEmail.guestListingHtml({
                    propertyTitle: property.title,
                    email: newUser.email,
                    password: plainPassword,
                    loginUrl,
                }),
            });
            emailSent = true;
        } catch (mailErr) {
            console.error('Guest listing welcome email failed:', mailErr);
        }

        return { property, user: newUser, emailSent };
    }

    async updateProperty(id, propertyData) {
        if (propertyData.selectedFeatureIds !== undefined) {
            await propertyFeatureRepository.savePropertyMappings(id, propertyData.selectedFeatureIds);
        }
        return propertyRepository.update(id, propertyData);
    }

    async deleteProperty(id) {
        mediaService.deletePropertyUploads(id);
        return propertyRepository.delete(id);
    }
   
    async checkOwnership(propertyId, userId) {
        const sellerId = await propertyRepository.findSellerIdByPropertyId(propertyId);
        if (sellerId === null) return null;
        return String(sellerId).toLowerCase() === String(userId).toLowerCase();
    }

    async verifyProperty(id, { status, reason, adminId }) {
        return propertyRepository.setVerified(id, { status, reason, adminId });
    }

    async getVerificationHistory(propertyId) {
        return propertyRepository.findVerificationHistory(propertyId);
    }

    async resubmitProperty(propertyId, sellerId) {
        return propertyRepository.resubmit(propertyId, sellerId);
    }

    async getPropertyEnquiries(propertyId) {
        return enquiryRepository.findByPropertyId(propertyId);
    }
}

module.exports = new PropertyService();
