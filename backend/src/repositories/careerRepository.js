const { poolPromise, sql } = require('../config/db');

class CareerRepository {
    async findAll({ openOnly = false } = {}) {
        const pool = await poolPromise;
        let where = '';
        if (openOnly) {
            where = "WHERE status = 'Open'";
        }
        const result = await pool.request().query(`
            SELECT id, title, department, location, employment_type, experience_level,
                   description, requirements, salary_range, application_email, status,
                   created_at, updated_at
            FROM Careers
            ${where}
            ORDER BY created_at DESC
        `);
        return result.recordset;
    }

    async findById(id, { openOnly = false } = {}) {
        const pool = await poolPromise;
        let statusFilter = '';
        if (openOnly) {
            statusFilter = "AND status = 'Open'";
        }
        const result = await pool.request()
            .input('id', sql.UniqueIdentifier, id)
            .query(`
                SELECT id, title, department, location, employment_type, experience_level,
                       description, requirements, salary_range, application_email, status,
                       created_at, updated_at
                FROM Careers
                WHERE id = @id ${statusFilter}
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
            .query(`
                INSERT INTO Careers (title, department, location, employment_type, experience_level,
                    description, requirements, salary_range, application_email, status)
                OUTPUT INSERTED.id, INSERTED.title, INSERTED.department, INSERTED.location,
                       INSERTED.employment_type, INSERTED.experience_level, INSERTED.description,
                       INSERTED.requirements, INSERTED.salary_range, INSERTED.application_email,
                       INSERTED.status, INSERTED.created_at, INSERTED.updated_at
                VALUES (@title, @department, @location, @employment_type, @experience_level,
                    @description, @requirements, @salary_range, @application_email, @status)
            `);
        return result.recordset[0];
    }

    async update(id, data) {
        const pool = await poolPromise;
        const fields = [];
        const request = pool.request().input('id', sql.UniqueIdentifier, id);

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
            OUTPUT INSERTED.id, INSERTED.title, INSERTED.department, INSERTED.location,
                   INSERTED.employment_type, INSERTED.experience_level, INSERTED.description,
                   INSERTED.requirements, INSERTED.salary_range, INSERTED.application_email,
                   INSERTED.status, INSERTED.created_at, INSERTED.updated_at
            WHERE id = @id
        `);
        return result.recordset[0] || null;
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
