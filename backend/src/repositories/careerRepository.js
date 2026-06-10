const { poolPromise, sql } = require('../config/db');

const SELECT_FIELDS = `
    c.id, c.title, c.department, c.location, c.employment_type, c.experience_level,
    c.description, c.requirements, c.salary_range, c.application_email, c.status,
    c.created_by, c.updated_by,
    c.created_at, c.updated_at,
    LTRIM(RTRIM(CONCAT(creator.first_name, ' ', creator.last_name))) AS created_by_name,
    LTRIM(RTRIM(CONCAT(updater.first_name, ' ', updater.last_name))) AS updated_by_name
`;

const FROM_JOIN = `
    FROM Careers c
    LEFT JOIN Users creator ON c.created_by = creator.id
    LEFT JOIN Users updater ON c.updated_by = updater.id
`;

class CareerRepository {
    async findAll({ openOnly = false } = {}) {
        const pool = await poolPromise;
        const where = openOnly ? "WHERE c.status = 'Open'" : '';
        const result = await pool.request().query(`
            SELECT ${SELECT_FIELDS}
            ${FROM_JOIN}
            ${where}
            ORDER BY c.created_at DESC
        `);
        return result.recordset;
    }

    async findById(id, { openOnly = false } = {}) {
        const pool = await poolPromise;
        const statusFilter = openOnly ? "AND c.status = 'Open'" : '';
        const result = await pool.request()
            .input('id', sql.UniqueIdentifier, id)
            .query(`
                SELECT ${SELECT_FIELDS}
                ${FROM_JOIN}
                WHERE c.id = @id ${statusFilter}
            `);
        return result.recordset[0] || null;
    }

    async create(data) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('title', sql.NVarChar, data.title)
            .input('department', sql.NVarChar, data.department || null)
            .input('location', sql.NVarChar, data.location || null)
            .input('employment_type', sql.NVarChar, data.employment_type || null)
            .input('experience_level', sql.NVarChar, data.experience_level || null)
            .input('description', sql.NVarChar, data.description || null)
            .input('requirements', sql.NVarChar, data.requirements || null)
            .input('salary_range', sql.NVarChar, data.salary_range || null)
            .input('application_email', sql.NVarChar, data.application_email || null)
            .input('status', sql.NVarChar, data.status || 'Open')
            .input('created_by', sql.UniqueIdentifier, data.created_by || null)
            .input('updated_by', sql.UniqueIdentifier, data.created_by || null)
            .query(`
                INSERT INTO Careers (
                    title, department, location, employment_type, experience_level,
                    description, requirements, salary_range, application_email, status,
                    created_by, updated_by
                )
                OUTPUT INSERTED.id
                VALUES (
                    @title, @department, @location, @employment_type, @experience_level,
                    @description, @requirements, @salary_range, @application_email, @status,
                    @created_by, @updated_by
                )
            `);
        return this.findById(result.recordset[0].id);
    }

    async update(id, data) {
        const pool = await poolPromise;
        const fields = [];
        const request = pool.request()
            .input('id', sql.UniqueIdentifier, id)
            .input('updated_by', sql.UniqueIdentifier, data.updated_by || null);

        fields.push('updated_by = @updated_by');

        const map = {
            title: sql.NVarChar,
            department: sql.NVarChar,
            location: sql.NVarChar,
            employment_type: sql.NVarChar,
            experience_level: sql.NVarChar,
            description: sql.NVarChar,
            requirements: sql.NVarChar,
            salary_range: sql.NVarChar,
            application_email: sql.NVarChar,
            status: sql.NVarChar,
        };

        for (const [key, type] of Object.entries(map)) {
            if (data[key] !== undefined) {
                fields.push(`${key} = @${key}`);
                request.input(key, type, data[key] || null);
            }
        }

        fields.push('updated_at = SYSDATETIME()');

        const result = await request.query(`
            UPDATE Careers SET ${fields.join(', ')}
            OUTPUT INSERTED.id
            WHERE id = @id
        `);

        if (!result.recordset[0]) return null;
        return this.findById(id);
    }

    async delete(id) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.UniqueIdentifier, id)
            .query('DELETE FROM Careers WHERE id = @id');
        return result.rowsAffected[0] > 0;
    }
}

module.exports = new CareerRepository();
