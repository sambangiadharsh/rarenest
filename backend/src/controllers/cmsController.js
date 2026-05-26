const cmsService = require('../services/cmsService');
const { cmsSchema } = require('../models/cmsModel');

exports.getPublishedPage = async (req, res) => {
    try {
        const page = await cmsService.getPublishedPage(req.params.pageKey);
        res.status(200).json({ success: true, data: page });
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

exports.getAdminPage = async (req, res) => {
    try {
        const page = await cmsService.getAdminPage(req.params.pageKey);
        res.status(200).json({ success: true, data: page });
    } catch (err) {
        if (err.statusCode === 400) {
            return res.status(400).json({ success: false, message: err.message });
        }
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.upsertPage = async (req, res) => {
    try {
        const { error } = cmsSchema.upsert.validate(req.body);
        if (error) {
            return res.status(400).json({ success: false, message: error.details[0].message });
        }

        const page = await cmsService.upsertPage(req.params.pageKey, req.body, req.user.id);
        res.status(200).json({ success: true, data: page });
    } catch (err) {
        if (err.statusCode === 400) {
            return res.status(400).json({ success: false, message: err.message });
        }
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
