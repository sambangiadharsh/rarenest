const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const cmsService = require('../services/cmsService');
const { cmsSchema } = require('../models/cmsModel');

exports.getPublishedPage = asyncHandler(async (req, res) => {
        const page = await cmsService.getPublishedPage(req.params.pageKey);
        res.status(200).json({ success: true, data: page });
});

exports.getAdminPage = asyncHandler(async (req, res) => {
        const page = await cmsService.getAdminPage(req.params.pageKey);
        res.status(200).json({ success: true, data: page });
});



exports.upsertPage = asyncHandler(async (req, res) => {
        const { error } = cmsSchema.upsert.validate(req.body);
        if (error) {
            throw new AppError(error.details[0].message, 400);
        }

        const page = await cmsService.upsertPage(req.params.pageKey, req.body, req.user.id);
        res.status(200).json({ success: true, data: page });
});




