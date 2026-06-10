const { poolPromise, sql } = require('../config/db');

const SELECT_FIELDS = `
    pt.id, pt.name, pt.is_active, pt.display_order,
    pt.created_by, pt.updated_by, pt.created_at, pt.updated_at,
    LTRIM(RTRIM(CONCAT(creator.first_name, ' ', creator.last_name))) AS created_by_name,
    LTRIM(RTRIM(CONCAT(updater.first_name, ' ', updater.last_name))) AS updated_by_name
`;

const FROM_JOIN = `
    FROM PropertyTypes pt
    LEFT JOIN Users creator ON pt.created_by = creator.id
    LEFT JOIN Users updater ON pt.updated_by = updater.id
`;

class PropertyTypeRepository {
    async findAll() {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT ${SELECT_FIELDS}
            ${FROM_JOIN}
            ORDER BY pt.display_order ASC, pt.name ASC
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

    async findById(id) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.UniqueIdentifier, id)
            .query(`
                SELECT ${SELECT_FIELDS}
                ${FROM_JOIN}
                WHERE pt.id = @id
            `);
        return result.recordset[0] || null;
    }

    async create({ name, created_by }) {
        const pool = await poolPromise;
        try {
            const result = await pool.request()
                .input('name', sql.NVarChar, name)
                .input('created_by', sql.UniqueIdentifier, created_by)
                .input('updated_by', sql.UniqueIdentifier, created_by)
                .query(`
                    INSERT INTO PropertyTypes (name, created_by, updated_by)
                    OUTPUT INSERTED.id
                    VALUES (@name, @created_by, @updated_by)
                `);
            return this.findById(result.recordset[0].id);
        } catch (err) {
            if (err.number === 2627 || err.number === 2601) {
                const duplicateError = new Error('Property type already exists');
                duplicateError.statusCode = 400;
                throw duplicateError;
            }
            throw err;
        }
    }

    async update(id, data) {
        const pool = await poolPromise;
        const fields = [];
        const request = pool.request()
            .input('id', sql.UniqueIdentifier, id)
            .input('updated_by', sql.UniqueIdentifier, data.updated_by);

        fields.push('updated_by = @updated_by');

        if (data.name !== undefined) {
            fields.push('name = @name');
            request.input('name', sql.NVarChar, data.name);
        }
        if (data.is_active !== undefined) {
            fields.push('is_active = @is_active');
            request.input('is_active', sql.Bit, data.is_active ? 1 : 0);
        }
        if (data.display_order !== undefined) {
            fields.push('display_order = @display_order');
            request.input('display_order', sql.Int, data.display_order);
        }

        fields.push('updated_at = SYSDATETIME()');

        try {
            const result = await request.query(`
                UPDATE PropertyTypes SET ${fields.join(', ')}
                OUTPUT INSERTED.id
                WHERE id = @id
            `);
            if (!result.recordset[0]) {
                return null;
            }
            return this.findById(id);
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
