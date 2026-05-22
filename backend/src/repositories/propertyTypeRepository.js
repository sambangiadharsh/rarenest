const { poolPromise, sql } = require('../config/db');

class PropertyTypeRepository {
    async findAll() {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT id, name, is_active, display_order, created_at, updated_at
            FROM PropertyTypes
            ORDER BY display_order ASC, name ASC
        `);
        return result.recordset;
    }

    async findActive() {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT id, name, display_order
            FROM PropertyTypes
            WHERE is_active = 1
            ORDER BY display_order ASC, name ASC
        `);
        return result.recordset;
    }

    async create({ name, created_by }) {
        const pool = await poolPromise;
        try {
            const result = await pool.request()
                .input('name', sql.NVarChar, name)
                .input('created_by', sql.UniqueIdentifier, created_by)
                .query(`
                    INSERT INTO PropertyTypes (name, created_by)
                    OUTPUT INSERTED.id, INSERTED.name, INSERTED.is_active,
                           INSERTED.display_order, INSERTED.created_at, INSERTED.updated_at
                    VALUES (@name, @created_by)
                `);
            return result.recordset[0];
        } catch (err) {
            if (err.number === 2627 || err.number === 2601) {
                const duplicateError = new Error('Property type already exists');
                duplicateError.statusCode = 400;
                throw duplicateError;
            }
            throw err;
        }
    }
}

module.exports = new PropertyTypeRepository();
