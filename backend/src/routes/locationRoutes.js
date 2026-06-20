const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');

router.get('/states', locationController.getStates);
router.get('/districts', locationController.getDistricts);
router.get('/cities', locationController.getCities);
router.get('/search', locationController.searchLocations);

module.exports = router;
