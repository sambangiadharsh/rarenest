const { poolPromise, sql } = require('../config/db');

class EnquiryRepository {
    async create({ from_user_id, to_user_id, property_id }) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('from_user_id', sql.UniqueIdentifier, from_user_id)
            .input('to_user_id', sql.UniqueIdentifier, to_user_id)
            .input('property_id', sql.UniqueIdentifier, property_id)
            .query(`
                INSERT INTO Enquiries (from_user_id, to_user_id, property_id)
                OUTPUT inserted.*
                VALUES (@from_user_id, @to_user_id, @property_id)
            `);
        return result.recordset[0];
    }

    async exists(from_user_id, property_id) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('from_user_id', sql.UniqueIdentifier, from_user_id)
            .input('property_id', sql.UniqueIdentifier, property_id)
            .query(`
                SELECT 1 AS found
                FROM Enquiries
                WHERE from_user_id = @from_user_id AND property_id = @property_id
            `);
        return result.recordset.length > 0;
    }

    async countAll() {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT COUNT(*) AS total FROM Enquiries');
        return result.recordset[0]?.total ?? 0;
    }

    async findByFromUserId(from_user_id) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('from_user_id', sql.UniqueIdentifier, from_user_id)
            .query(`
                SELECT
                    e.id,
                    e.property_id,
                    e.created_at,
                    p.title AS property_title
                FROM Enquiries e
                INNER JOIN Properties p ON p.id = e.property_id
                WHERE e.from_user_id = @from_user_id
                ORDER BY e.created_at DESC
            `);
        return result.recordset;
    }
}

module.exports = new EnquiryRepository();
