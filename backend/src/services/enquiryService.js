const crypto = require('crypto');
const enquiryRepository = require('../repositories/enquiryRepository');
const propertyRepository = require('../repositories/propertyRepository');
const authService = require('../services/authService');
const sendEmail = require('../utils/sendEmail');
const { hashPassword } = require('../utils/authUtils');

class EnquiryService {
    async createEnquiry(fromUserId, propertyId) {
        const sellerId = await propertyRepository.findSellerIdByPropertyId(propertyId);
        if (sellerId === null) {
            return { error: 'not_found' };
        }

        if (sellerId === fromUserId) {
            return { error: 'own_property' };
        }

        const alreadySent = await enquiryRepository.exists(fromUserId, propertyId);
        if (alreadySent) {
            return { error: 'duplicate' };
        }

        const enquiry = await enquiryRepository.create({
            from_user_id: fromUserId,
            to_user_id: sellerId,
            property_id: propertyId,
        });

        return { enquiry };
    }

    async createGuestEnquiry({ email, name, phone, property_id }) {
        const property = await propertyRepository.findById(property_id);
        if (!property) {
            return { error: 'not_found' };
        }

        const normalizedEmail = email.trim().toLowerCase();
        const existingUser = await authService.findUserByEmail(normalizedEmail);
        if (existingUser) {
            return { error: 'requires_login' };
        }

        const trimmedName = name.trim();
        const spaceIdx = trimmedName.indexOf(' ');
        const first_name =
            spaceIdx === -1 ? trimmedName : trimmedName.slice(0, spaceIdx);
        const last_name =
            spaceIdx === -1 ? '' : trimmedName.slice(spaceIdx + 1).trim();

        const plainPassword = crypto.randomBytes(9).toString('base64url');
        const password_hash = await hashPassword(plainPassword);

        const newUser = await authService.createUser({
            email: normalizedEmail,
            password_hash,
            first_name,
            last_name,
            phone: phone.trim(),
            role: 'Buyer',
        });

        const enquiryResult = await this.createEnquiry(newUser.id, property_id);
        if (enquiryResult.error) {
            return enquiryResult;
        }

        const loginUrl = process.env.CLIENT_URL || 'http://localhost:5173';
        let emailSent = false;
        try {
            await sendEmail({
                email: newUser.email,
                subject: 'Your RareNest enquiry & account details',
                message: [
                    `Thank you for your enquiry about "${property.title}".`,
                    '',
                    'We created a RareNest account for you:',
                    `Email: ${newUser.email}`,
                    `Temporary password: ${plainPassword}`,
                    '',
                    `You can log in anytime at: ${loginUrl}`,
                    '',
                    'Your enquiry has been sent to the property seller.',
                ].join('\n'),
            });
            emailSent = true;
        } catch (mailErr) {
            console.error('Guest enquiry welcome email failed:', mailErr);
        }

        return {
            enquiry: enquiryResult.enquiry,
            user: newUser,
            emailSent,
        };
    }
}

module.exports = new EnquiryService();
