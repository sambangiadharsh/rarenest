const locationService = require('../services/locationService');

exports.getStates = async (req, res) => {
    try {
        const states = await locationService.getStates();
        return res.status(200).json(states);
    } catch (err) {
        console.error('Error in getStates:', err);
        return res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.getDistricts = async (req, res) => {
    try {
        const { state } = req.query;
        if (!state) {
            return res.status(400).json({ success: false, message: 'State parameter is required' });
        }
        const districts = await locationService.getDistricts(state);
        return res.status(200).json(districts);
    } catch (err) {
        console.error('Error in getDistricts:', err);
        return res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.getCities = async (req, res) => {
    try {
        const { state, district } = req.query;
        if (!state || !district) {
            return res.status(400).json({ success: false, message: 'State and district parameters are required' });
        }
        const cities = await locationService.getCities(state, district);
        return res.status(200).json(cities);
    } catch (err) {
        console.error('Error in getCities:', err);
        return res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.searchLocations = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) {
            return res.status(200).json([]);
        }
        const locations = await locationService.searchLocations(q);
        return res.status(200).json(locations);
    } catch (err) {
        console.error('Error in searchLocations:', err);
        return res.status(500).json({ success: false, message: 'Server Error' });
    }
};
