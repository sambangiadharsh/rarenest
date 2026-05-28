const dashboardService = require('../services/dashboardService');

// @desc    Get admin dashboard stats
// @route   GET /api/dashboard/stats
exports.getDashboardStats = async (req, res) => {
    try {
        const stats = await dashboardService.getStats();
        res.status(200).json({
            success: true,
            data: stats,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
