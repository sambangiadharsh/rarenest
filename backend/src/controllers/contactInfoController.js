const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const contactInfoService = require('../services/contactInfoService');
const contactInfoSchema = require('../models/contactInfoModel');

exports.getContactInfo = asyncHandler(async (req, res) => {
        const contact = await contactInfoService.getContactInfo();
        res.status(200).json({ success: true, data: contact });
});

exports.upsertContactInfo = asyncHandler(async (req, res) => {
        const { error } = contactInfoSchema.upsert.validate(req.body);
        if (error) {
            throw new AppError(error.details[0].message, 400);
        }

        const contact = await contactInfoService.upsertContactInfo(req.body, req.user.id);
        res.status(200).json({ success: true, data: contact });
});
