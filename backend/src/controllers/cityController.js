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
            .input('keyword', sql.NVarChar, `%${q.trim()}%`)
            .query(`
                SELECT TOP 20 City, State, District
                FROM Cities
                WHERE City LIKE @keyword
                ORDER BY City ASC
            `);

        // Format to lowercase properties as requested
        const formattedCities = result.recordset.map(row => ({
            city: row.City,
            state: row.State,
            district: row.District || ''
        }));

        return res.status(200).json(formattedCities);
});

