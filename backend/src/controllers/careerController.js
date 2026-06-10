const careerService = require('../services/careerService');
const careerSchema = require('../models/careerModel');

exports.getOpenCareers = async (req, res) => {
    try {
        const careers = await careerService.getOpenCareers();
        res.status(200).json({ success: true, count: careers.length, data: careers });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.getOpenCareerById = async (req, res) => {
    try {
        const career = await careerService.getOpenCareerById(req.params.id);
        res.status(200).json({ success: true, data: career });
    } catch (err) {
        if (err.statusCode === 404) {
            return res.status(404).json({ success: false, message: err.message });
        }
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.getAllCareers = async (req, res) => {
    try {
        const careers = await careerService.getAllCareers();
        res.status(200).json({ success: true, count: careers.length, data: careers });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.createCareer = async (req, res) => {
    try {
        const { error } = careerSchema.create.validate(req.body);
        if (error) {
            return res.status(400).json({ success: false, message: error.details[0].message });
        }

        const career = await careerService.createCareer({ ...req.body, created_by: req.user.id });
        res.status(201).json({ success: true, data: career });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.updateCareer = async (req, res) => {
    try {
        const { error } = careerSchema.update.validate(req.body);
        if (error) {
            return res.status(400).json({ success: false, message: error.details[0].message });
        }

        const career = await careerService.updateCareer(req.params.id, { ...req.body, updated_by: req.user.id });
        res.status(200).json({ success: true, data: career });
    } catch (err) {
        if (err.statusCode === 404) {
            return res.status(404).json({ success: false, message: err.message });
        }
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.deleteCareer = async (req, res) => {
    try {
        await careerService.deleteCareer(req.params.id);
        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        if (err.statusCode === 404) {
            return res.status(404).json({ success: false, message: err.message });
        }
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
