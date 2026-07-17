const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const builderApplicationRepository = require('../repositories/builderApplicationRepository');
const builderRepository = require('../repositories/builderRepository');
const notificationService = require('../services/messaging/notificationService');
const storageService = require('../services/storageService');

const requiredFields = [
    'company_name',
    'company_description',
    'company_registration_number',
    'contact_person_name',
    'business_email',
    'business_phone',
    'office_address',
    'city',
    'state',
];

function normalize(value) {
    return typeof value === 'string' ? value.trim() : value;
}

function firstFile(files, fieldName) {
    return files?.[fieldName]?.[0] || null;
}

async function saveApplicationFile(userId, fieldName, file) {
    if (!file) return null;
    const key = storageService.generateBuilderApplicationKey(userId, fieldName, file.originalname);
    return storageService.saveBuffer(key, file.buffer);
}

exports.submitApplication = asyncHandler(async (req, res) => {
        const body = Object.fromEntries(
            Object.entries(req.body || {}).map(([key, value]) => [key, normalize(value)])
        );

        const missingField = requiredFields.find((field) => !body[field]);
        if (missingField) {
            throw new AppError('Please complete all required builder application fields.', 400);
        }

        if (body.declaration_accepted !== 'true' && body.declaration_accepted !== true) {
            throw new AppError('Please accept the declaration before submitting.', 400);
        }

        if (!firstFile(req.files, 'business_registration_certificate')) {
            throw new AppError('Business registration certificate is required.', 400);
        }

        if (!firstFile(req.files, 'applicant_government_id')) {
            throw new AppError('Government ID of applicant is required.', 400);
        }

        const existingApp = await builderApplicationRepository.findByUserId(req.user.id);
        if (existingApp) {
            if (existingApp.status === 'Pending') {
                throw new AppError('You already have a builder application pending approval.', 400);
            }
            if (existingApp.status === 'Approved') {
                throw new AppError('Your builder profile is already approved.', 400);
            }
        }

        const fileUrls = {
            company_logo_url: await saveApplicationFile(req.user.id, 'company_logo', firstFile(req.files, 'company_logo')),
            business_registration_certificate_url: await saveApplicationFile(req.user.id, 'business_registration_certificate', firstFile(req.files, 'business_registration_certificate')),
            applicant_government_id_url: await saveApplicationFile(req.user.id, 'applicant_government_id', firstFile(req.files, 'applicant_government_id')),
            gst_certificate_url: await saveApplicationFile(req.user.id, 'gst_certificate', firstFile(req.files, 'gst_certificate')),
            rera_certificate_url: await saveApplicationFile(req.user.id, 'rera_certificate', firstFile(req.files, 'rera_certificate')),
        };

        const newApp = await builderApplicationRepository.create({
            user_id: req.user.id,
            company_name: body.company_name,
            company_description: body.company_description,
            company_registration_number: body.company_registration_number,
           
            contact_person_name: body.contact_person_name,
            business_email: body.business_email,
            business_phone: body.business_phone,
            office_address: body.office_address,
            city: body.city,
            state: body.state,
            is_primary_contact: body.is_primary_contact === 'true' || body.is_primary_contact === true,
            gst_number: body.gst_number || null,
            rera_number: body.rera_number || null,
            social_links: body.social_links || null,
            declaration_accepted: true,
            ...fileUrls,
        });

        res.status(201).json({ success: true, data: newApp });
});

exports.getMyApplication = asyncHandler(async (req, res) => {
        const app = await builderApplicationRepository.findByUserId(req.user.id);
        res.status(200).json({ success: true, data: app });
});

exports.getAllApplications = asyncHandler(async (req, res) => {
        const apps = await builderApplicationRepository.findAll();
        res.status(200).json({ success: true, count: apps.length, data: apps });
});

exports.reviewApplication = asyncHandler(async (req, res) => {
        const { status } = req.body;
        const validStatuses = ['Approved', 'Rejected'];

        if (!status || !validStatuses.includes(status)) {
            throw new AppError('Please provide a valid status: Approved or Rejected.', 400);
        }

        const app = await builderApplicationRepository.findById(req.params.id);
        if (!app) {
            throw new AppError('Builder application not found.', 404);
        }

        const updatedApp = await builderApplicationRepository.updateStatus(req.params.id, {
            status,
            adminId: req.user.id
        });

        if (status === 'Approved') {
            // Create/Ensure BuilderProfile for the user
            await builderRepository.ensureProfile(app.user_id, 'Approved', app.company_description);
            await notificationService.createNotification({
                user_id: app.user_id,
                type: 'BUILDER_APPROVED',
                title: 'Builder application approved',
                body: 'Your builder application has been approved. You can now list builder projects.',
            });
        } else if (status === 'Rejected') {
            // Update builder profile status if it existed
            const profile = await builderRepository.findProfileByUserId(app.user_id);
            if (profile) {
                await builderRepository.updateBuilderStatus(profile.id, 'Rejected');
            }
            await notificationService.createNotification({
                user_id: app.user_id,
                type: 'BUILDER_REJECTED',
                title: 'Builder application rejected',
                body: 'Your builder application was not approved. Please contact support for details.',
            });
        }

        res.status(200).json({ success: true, data: updatedApp });
});
