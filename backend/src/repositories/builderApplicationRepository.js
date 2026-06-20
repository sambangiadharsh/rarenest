const { poolPromise, sql } = require('../config/db');

class BuilderApplicationRepository {
    async create(applicationData) {
        const { user_id, company_name, company_description } = applicationData;
        const pool = await poolPromise;
        const result = await pool.request()
            .input('user_id', sql.UniqueIdentifier, user_id)
            .input('company_name', sql.NVarChar, company_name)
            .input('company_description', sql.NVarChar, company_description)
            .query(`
                INSERT INTO BuilderApplications (user_id, company_name, company_description)
                OUTPUT inserted.*
                VALUES (@user_id, @company_name, @company_description)
            `);
        return result.recordset[0];
    }

    async findByUserId(userId) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('user_id', sql.UniqueIdentifier, userId)
            .query(`
                SELECT TOP 1 * FROM BuilderApplications 
                WHERE user_id = @user_id 
                ORDER BY created_at DESC
            `);
        return result.recordset[0] ?? null;
    }

    async findById(id) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.UniqueIdentifier, id)
            .query('SELECT * FROM BuilderApplications WHERE id = @id');
        return result.recordset[0] ?? null;
    }

    async findAll() {
        const pool = await poolPromise;
        const result = await pool.request()
            .query(`
                SELECT ba.*, u.first_name, u.last_name, u.email, u.phone 
                FROM BuilderApplications ba
                JOIN Users u ON ba.user_id = u.id
                ORDER BY ba.created_at DESC
            `);
        return result.recordset;
    }

    async updateStatus(id, { status, adminId }) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.UniqueIdentifier, id)
            .input('status', sql.NVarChar, status)
            .input('admin_id', sql.UniqueIdentifier, adminId)
            .query(`
                UPDATE BuilderApplications
                SET status = @status, reviewed_by = @admin_id, reviewed_at = GETDATE()
                OUTPUT inserted.*
                WHERE id = @id
            `);
        return result.recordset[0] ?? null;
    }
}

module.exports = new BuilderApplicationRepository();
