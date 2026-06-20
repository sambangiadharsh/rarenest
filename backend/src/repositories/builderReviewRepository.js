const { poolPromise, sql } = require('../config/db');

class BuilderReviewRepository {
    async findByBuilderAndReviewer(builderId, reviewerId) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('builder_id', sql.UniqueIdentifier, builderId)
            .input('reviewer_id', sql.UniqueIdentifier, reviewerId)
            .query(`
                SELECT id FROM BuilderReviews
                WHERE builder_id = @builder_id AND reviewer_id = @reviewer_id
            `);
        return result.recordset[0] ?? null;
    }

    async create(data) {
        const { builder_id, reviewer_id, rating, comment } = data;
        const pool = await poolPromise;
        await pool.request()
            .input('builder_id', sql.UniqueIdentifier, builder_id)
            .input('reviewer_id', sql.UniqueIdentifier, reviewer_id)
            .input('rating', sql.Int, rating)
            .input('comment', sql.NVarChar, comment || null)
            .query(`
                INSERT INTO BuilderReviews (builder_id, reviewer_id, rating, comment, status)
                VALUES (@builder_id, @reviewer_id, @rating, @comment, 'Approved')
            `);
    }

    async findApprovedByBuilderId(builderId) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('builder_id', sql.UniqueIdentifier, builderId)
            .query(`
                SELECT br.id, br.rating, br.comment, br.created_at,
                       u.first_name AS reviewer_first_name,
                       u.last_name  AS reviewer_last_name
                FROM BuilderReviews br
                JOIN Users u ON br.reviewer_id = u.id
                WHERE br.builder_id = @builder_id AND br.status = 'Approved'
                ORDER BY br.created_at DESC
            `);
        return result.recordset;
    }

    async findByStatus(status) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('status', sql.NVarChar, status)
            .query(`
                SELECT br.id, br.rating, br.comment, br.created_at, br.status, br.reviewed_at,
                       bp.id   AS builder_profile_id,
                       ub.first_name AS builder_first_name,
                       ub.last_name  AS builder_last_name,
                       ur.first_name AS reviewer_first_name,
                       ur.last_name  AS reviewer_last_name,
                       ua.first_name AS admin_first_name,
                       ua.last_name  AS admin_last_name
                FROM BuilderReviews br
                JOIN BuilderProfiles bp ON br.builder_id = bp.id
                JOIN Users ub ON bp.user_id = ub.id
                JOIN Users ur ON br.reviewer_id = ur.id
                LEFT JOIN Users ua ON br.reviewed_by = ua.id
                WHERE br.status = @status
                ORDER BY br.created_at DESC
            `);
        return result.recordset;
    }

    async findById(id) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.UniqueIdentifier, id)
            .query('SELECT * FROM BuilderReviews WHERE id = @id');
        return result.recordset[0] ?? null;
    }

    async updateStatus(id, { status, adminId }) {
        const pool = await poolPromise;
        await pool.request()
            .input('id', sql.UniqueIdentifier, id)
            .input('status', sql.NVarChar, status)
            .input('reviewed_by', sql.UniqueIdentifier, adminId)
            .query(`
                UPDATE BuilderReviews
                SET status = @status,
                    reviewed_by = @reviewed_by,
                    reviewed_at = GETDATE(),
                    updated_at  = GETDATE()
                WHERE id = @id
            `);
    }
}

module.exports = new BuilderReviewRepository();
