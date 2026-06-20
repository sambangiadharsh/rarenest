const express = require('express');
const router = express.Router();
const { searchCities } = require('../controllers/cityController');

router.get('/search', searchCities);

module.exports = router;
