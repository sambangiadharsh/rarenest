const asyncHandler = require('../utils/asyncHandler');
const { poolPromise, sql } = require('../config/db');

// @desc    Search cities by keyword
// @route   GET /api/cities/search?q=keyword
exports.searchCities = asyncHandler(async (req, res) => {
        const { q } = req.query;

        // Return empty array if search term is less than 3 characters or missing
        if (!q || q.trim().length < 3) {
            return res.status(200).json([]);
        }

        const pool = await poolPromise;
        const result = await pool.request()
            .input('keyword', sql.NVarChar, `${q.trim()}%`)
            .query(`
                SELECT DISTINCT TOP 20 CityName AS City, StateName AS State
                FROM Locations
                WHERE CityName LIKE @keyword
                ORDER BY CityName ASC
            `);

        // Format to lowercase properties as requested
        const formattedCities = result.recordset.map(row => ({
            city: row.City,
            state: row.State,
            district: ''
        }));

        return res.status(200).json(formattedCities);
});

