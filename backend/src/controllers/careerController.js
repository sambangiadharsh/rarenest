const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const careerService = require('../services/careerService');
const careerSchema = require('../models/careerModel');

exports.getOpenCareers = asyncHandler(async (req, res) => {
        const careers = await careerService.getOpenCareers();
        res.status(200).json({ success: true, count: careers.length, data: careers });
});

exports.getOpenCareerById = asyncHandler(async (req, res) => {
        const career = await careerService.getOpenCareerById(req.params.id);
        res.status(200).json({ success: true, data: career });
});

exports.getAllCareers = asyncHandler(async (req, res) => {
        const careers = await careerService.getAllCareers();
        res.status(200).json({ success: true, count: careers.length, data: careers });
});

exports.createCareer = asyncHandler(async (req, res) => {
        const { error } = careerSchema.create.validate(req.body);
        if (error) {
            throw new AppError(error.details[0].message, 400);
        }

        const career = await careerService.createCareer({ ...req.body, created_by: req.user.id });
        res.status(201).json({ success: true, data: career });
});

exports.updateCareer = asyncHandler(async (req, res) => {
        const { error } = careerSchema.update.validate(req.body);
        if (error) {
            throw new AppError(error.details[0].message, 400);
        }

        const career = await careerService.updateCareer(req.params.id, { ...req.body, updated_by: req.user.id });
        res.status(200).json({ success: true, data: career });
});

exports.deleteCareer = asyncHandler(async (req, res) => {
        await careerService.deleteCareer(req.params.id);
        res.status(200).json({ success: true, data: {} });
});
