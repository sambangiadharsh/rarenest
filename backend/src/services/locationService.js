const { poolPromise, sql } = require('../config/db');

class LocationService {
    async getStates() {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT DISTINCT StateName AS value, StateName AS label
            FROM Locations
            WHERE StateName IS NOT NULL AND StateName <> ''
            ORDER BY StateName ASC
        `);
        return result.recordset;
    }

    async getDistricts(state) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('state', sql.NVarChar, state)
            .query(`
                SELECT DISTINCT DistrictName AS value, DistrictName AS label
                FROM Locations
                WHERE StateName = @state AND DistrictName IS NOT NULL AND DistrictName <> ''
                ORDER BY DistrictName ASC
            `);
        return result.recordset;
    }

    async getCities(state, district) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('state', sql.NVarChar, state)
            .input('district', sql.NVarChar, district)
            .query(`
                SELECT DISTINCT CityName AS value, CityName AS label
                FROM Locations
                WHERE StateName = @state 
                  AND DistrictName = @district 
                  AND CityName IS NOT NULL 
                  AND CityName <> ''
                ORDER BY CityName ASC
            `);
        return result.recordset;
    }

    async searchLocations(query) {
        if (!query || query.trim().length === 0) {
            return [];
        }
        const pool = await poolPromise;
        const searchPattern = `%${query.trim()}%`;
        const result = await pool.request()
            .input('query', sql.NVarChar, searchPattern)
            .query(`
                SELECT DISTINCT TOP 20 StateName AS state, DistrictName AS district, CityName AS city
                FROM Locations
                WHERE StateName LIKE @query 
                   OR DistrictName LIKE @query 
                   OR CityName LIKE @query
                ORDER BY StateName ASC, DistrictName ASC, CityName ASC
            `);
        return result.recordset;
    }
}

module.exports = new LocationService();
