const { poolPromise, sql } = require('../config/db');

class BuilderRepository {
    async findAll(filters = {}) {
        const pool = await poolPromise;
        let query = `
            SELECT
                bp.id,
                bp.user_id,
                bp.bio,
                bp.average_rating,
                bp.total_reviews,
                bp.builder_status,
                bp.is_featured,
                bp.created_at,
                u.first_name,
                u.last_name,
                ba.company_name,
                (
                    SELECT COUNT(*)
                    FROM Properties
                    WHERE seller_id = bp.user_id AND is_verified = 1
                ) AS properties_count,
                (
                    SELECT TOP 1 location_city
                    FROM Properties
                    WHERE seller_id = bp.user_id AND location_city IS NOT NULL
                    ORDER BY created_at DESC
                ) AS city
            FROM BuilderProfiles bp
            JOIN Users u ON bp.user_id = u.id
            LEFT JOIN BuilderApplications ba ON bp.user_id = ba.user_id AND ba.status = 'Approved'
            WHERE bp.builder_status = 'Approved'
        `;
        if (filters.featured === 'true' || filters.featured === true) {
            query += ' AND bp.is_featured = 1';
        }
        query += ' ORDER BY bp.average_rating DESC, bp.total_reviews DESC';

        const result = await pool.request().query(query);
        return result.recordset;
    }

    async findProfileById(builderId) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.UniqueIdentifier, builderId)
            .query(`
                SELECT bp.id, bp.user_id, bp.bio, bp.average_rating, bp.total_reviews, bp.created_at, bp.builder_status, bp.is_featured,
                       u.first_name, u.last_name, u.email, u.phone, ba.company_name, ba.social_links
                FROM BuilderProfiles bp
                JOIN Users u ON bp.user_id = u.id
                LEFT JOIN BuilderApplications ba ON bp.user_id = ba.user_id AND ba.status = 'Approved'
                WHERE bp.id = @id
            `);
        return result.recordset[0] ?? null;
    }

    async findProfileByUserId(userId) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('user_id', sql.UniqueIdentifier, userId)
            .query(`
                SELECT bp.id, bp.user_id, bp.bio, bp.average_rating, bp.total_reviews, bp.created_at, bp.builder_status, bp.is_featured,
                       u.first_name, u.last_name, u.email, u.phone, ba.company_name, ba.social_links
                FROM BuilderProfiles bp
                JOIN Users u ON bp.user_id = u.id
                LEFT JOIN BuilderApplications ba ON bp.user_id = ba.user_id AND ba.status = 'Approved'
                WHERE bp.user_id = @user_id
            `);
        return result.recordset[0] ?? null;
    }

    async ensureProfile(userId, status = 'Approved', bio = '') {
        const pool = await poolPromise;
        await pool.request()
            .input('user_id', sql.UniqueIdentifier, userId)
            .input('builder_status', sql.NVarChar, status)
            .input('bio', sql.NVarChar, bio)
            .query(`
                IF NOT EXISTS (SELECT 1 FROM BuilderProfiles WHERE user_id = @user_id)
                    INSERT INTO BuilderProfiles (user_id, builder_status, bio) VALUES (@user_id, @builder_status, @bio)
                ELSE
                    UPDATE BuilderProfiles SET builder_status = @builder_status, bio = COALESCE(NULLIF(@bio, ''), bio) WHERE user_id = @user_id
            `);
    }

    async toggleFeatured(builderId) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.UniqueIdentifier, builderId)
            .query(`
                UPDATE BuilderProfiles
                SET is_featured = ~is_featured
                OUTPUT inserted.is_featured
                WHERE id = @id
            `);
        return result.recordset[0]?.is_featured === true || result.recordset[0]?.is_featured === 1;
    }

    async updateBuilderStatus(builderId, status) {
        const pool = await poolPromise;
        await pool.request()
            .input('id', sql.UniqueIdentifier, builderId)
            .input('status', sql.NVarChar, status)
            .query(`
                UPDATE BuilderProfiles
                SET builder_status = @status
                WHERE id = @id
            `);
    }

    async recalculateStats(builderId) {
        const pool = await poolPromise;
        await pool.request()
            .input('builder_id', sql.UniqueIdentifier, builderId)
            .query(`
                UPDATE BuilderProfiles
                SET
                    average_rating = ISNULL(
                        (SELECT AVG(CAST(rating AS DECIMAL(3,2)))
                         FROM BuilderReviews
                         WHERE builder_id = @builder_id AND status = 'Approved'),
                        0
                    ),
                    total_reviews = (
                        SELECT COUNT(*)
                        FROM BuilderReviews
                        WHERE builder_id = @builder_id AND status = 'Approved'
                    )
                WHERE id = @builder_id
            `);
    }
}

module.exports = new BuilderRepository();
