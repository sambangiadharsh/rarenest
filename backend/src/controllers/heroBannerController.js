const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const heroBannerService = require('../services/heroBannerService');
const heroBannerSchema = require('../models/heroBannerModel');

exports.getActiveBanners = asyncHandler(async (req, res) => {
        const banners = await heroBannerService.getActiveBanners();
        res.status(200).json({ success: true, count: banners.length, data: banners });
});

exports.getAllBanners = asyncHandler(async (req, res) => {
        const banners = await heroBannerService.getAllBanners();
        res.status(200).json({ success: true, count: banners.length, data: banners });
});

exports.createBanner = asyncHandler(async (req, res) => {
        // Coerce multipart string fields
        const body = {
            title: req.body.title,
            subtitle: req.body.subtitle || undefined,
            image_url: req.body.image_url || undefined,
            display_order: req.body.display_order ? Number(req.body.display_order) : undefined,
            is_active: req.body.is_active !== undefined
                ? req.body.is_active === 'true' || req.body.is_active === true
                : true,
        };

        // image_url not required when a file is uploaded
        const schemaToUse = req.file
            ? heroBannerSchema.createWithFile
            : heroBannerSchema.create;

        const { error } = schemaToUse.validate(body);
        if (error) {
            throw new AppError(error.details[0].message, 400);
        }

        const banner = await heroBannerService.createBanner(body, req.file || null);
        res.status(201).json({ success: true, data: banner });
});

exports.updateBanner = asyncHandler(async (req, res) => {
        const body = {};
        if (req.body.title !== undefined) body.title = req.body.title;
        if (req.body.subtitle !== undefined) body.subtitle = req.body.subtitle;
        if (req.body.image_url !== undefined) body.image_url = req.body.image_url;
        if (req.body.display_order !== undefined) body.display_order = Number(req.body.display_order);
        if (req.body.is_active !== undefined) {
            body.is_active = req.body.is_active === 'true' || req.body.is_active === true;
        }

        const { error } = heroBannerSchema.update.validate(body);
        if (error && !req.file) {
            throw new AppError(error.details[0].message, 400);
        }

        const banner = await heroBannerService.updateBanner(req.params.id, body, req.file || null);
        res.status(200).json({ success: true, data: banner });
});

exports.deleteBanner = asyncHandler(async (req, res) => {
        await heroBannerService.deleteBanner(req.params.id);
        res.status(200).json({ success: true, data: {} });
});

exports.toggleActive = asyncHandler(async (req, res) => {
        const banner = await heroBannerService.toggleActive(req.params.id);
        res.status(200).json({ success: true, data: banner });
});

exports.reorderBanners = asyncHandler(async (req, res) => {
        const { error } = heroBannerSchema.reorder.validate(req.body);
        if (error) {
            throw new AppError(error.details[0].message, 400);
        }
        await heroBannerService.reorderBanners(req.body.items);
        res.status(200).json({ success: true, message: 'Order updated' });
});
