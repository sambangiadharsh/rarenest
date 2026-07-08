const asyncHandler = require('../utils/asyncHandler');
const dashboardService = require('../services/dashboardService');

// @desc    Get admin dashboard stats
// @route   GET /api/dashboard/stats
exports.getDashboardStats = asyncHandler(async (req, res) => {
        const stats = await dashboardService.getStats();
        res.status(200).json({
            success: true,
            data: stats,
        });
});
