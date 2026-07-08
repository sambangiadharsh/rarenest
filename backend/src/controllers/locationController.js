const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const locationService = require('../services/locationService');

exports.getStates = asyncHandler(async (req, res) => {
        const states = await locationService.getStates();
        return res.status(200).json(states);
});

exports.getDistricts = asyncHandler(async (req, res) => {
        const { state } = req.query;
        if (!state) {
            throw new AppError('State parameter is required', 400);
        }
        const districts = await locationService.getDistricts(state);
        return res.status(200).json(districts);
});

exports.getCities = asyncHandler(async (req, res) => {
        const { state, district } = req.query;
        if (!state || !district) {
            throw new AppError('State and district parameters are required', 400);
        }
        const cities = await locationService.getCities(state, district);
        return res.status(200).json(cities);
});

exports.searchLocations = asyncHandler(async (req, res) => {
        const { q } = req.query;
        if (!q) {
            return res.status(200).json([]);
        }
        const locations = await locationService.searchLocations(q);
        return res.status(200).json(locations);
});
