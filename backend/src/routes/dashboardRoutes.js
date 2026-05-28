const express = require('express');
const { getDashboardStats } = require('../controllers/dashboardController');
const { protect, authorize } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/stats', protect, authorize('Admin'), getDashboardStats);

module.exports = router;
