const heroBannerService = require('../services/heroBannerService');
const heroBannerSchema = require('../models/heroBannerModel');

exports.getActiveBanners = async (req, res) => {
    try {
        const banners = await heroBannerService.getActiveBanners();
        res.status(200).json({ success: true, count: banners.length, data: banners });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.getAllBanners = async (req, res) => {
    try {
        const banners = await heroBannerService.getAllBanners();
        res.status(200).json({ success: true, count: banners.length, data: banners });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.createBanner = async (req, res) => {
    try {
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
            return res.status(400).json({ success: false, message: error.details[0].message });
        }

        const banner = await heroBannerService.createBanner(body, req.file || null);
        res.status(201).json({ success: true, data: banner });
    } catch (err) {
        if (err.statusCode === 400) {
            return res.status(400).json({ success: false, message: err.message });
        }
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.updateBanner = async (req, res) => {
    try {
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
            return res.status(400).json({ success: false, message: error.details[0].message });
        }

        const banner = await heroBannerService.updateBanner(req.params.id, body, req.file || null);
        res.status(200).json({ success: true, data: banner });
    } catch (err) {
        if (err.statusCode === 404) {
            return res.status(404).json({ success: false, message: err.message });
        }
        if (err.statusCode === 400) {
            return res.status(400).json({ success: false, message: err.message });
        }
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.deleteBanner = async (req, res) => {
    try {
        await heroBannerService.deleteBanner(req.params.id);
        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        if (err.statusCode === 404) {
            return res.status(404).json({ success: false, message: err.message });
        }
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.toggleActive = async (req, res) => {
    try {
        const banner = await heroBannerService.toggleActive(req.params.id);
        res.status(200).json({ success: true, data: banner });
    } catch (err) {
        if (err.statusCode === 404) {
            return res.status(404).json({ success: false, message: err.message });
        }
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.reorderBanners = async (req, res) => {
    try {
        const { error } = heroBannerSchema.reorder.validate(req.body);
        if (error) {
            return res.status(400).json({ success: false, message: error.details[0].message });
        }
        await heroBannerService.reorderBanners(req.body.items);
        res.status(200).json({ success: true, message: 'Order updated' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
