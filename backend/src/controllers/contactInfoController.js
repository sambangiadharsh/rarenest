const contactInfoService = require('../services/contactInfoService');
const contactInfoSchema = require('../models/contactInfoModel');

exports.getContactInfo = async (req, res) => {
    try {
        const contact = await contactInfoService.getContactInfo();
        res.status(200).json({ success: true, data: contact });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.upsertContactInfo = async (req, res) => {
    try {
        const { error } = contactInfoSchema.upsert.validate(req.body);
        if (error) {
            return res.status(400).json({ success: false, message: error.details[0].message });
        }

        const contact = await contactInfoService.upsertContactInfo(req.body, req.user.id);
        res.status(200).json({ success: true, data: contact });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
