const { poolPromise, sql } = require('../config/db');

class SellerProfileRepository {
    async findSellerWithProfile(sellerId) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.UniqueIdentifier, sellerId)
            .query(`
                SELECT u.id, u.email, u.first_name, u.last_name, u.phone, 
                       sp.bio, sp.average_rating, sp.total_reviews
                FROM Users u
                LEFT JOIN SellerProfiles sp ON u.id = sp.user_id
                WHERE u.id = @id AND u.role = 'Seller'
            `);
        return result.recordset[0];
    }

    async upsertBio(userId, bio) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('user_id', sql.UniqueIdentifier, userId)
            .input('bio', sql.NVarChar, bio)
            .query(`
                IF EXISTS (SELECT 1 FROM SellerProfiles WHERE user_id = @user_id)
                BEGIN
                    UPDATE SellerProfiles SET bio = @bio OUTPUT inserted.* WHERE user_id = @user_id
                END
                ELSE
                BEGIN
                    INSERT INTO SellerProfiles (user_id, bio) OUTPUT inserted.* VALUES (@user_id, @bio)
                END
            `);
        return result.recordset[0];
    }

    async recalculateStats(sellerId) {
        const pool = await poolPromise;
        await pool.request()
            .input('seller_id', sql.UniqueIdentifier, sellerId)
            .query(`
                UPDATE SellerProfiles
                SET 
                    average_rating = (SELECT AVG(CAST(rating AS DECIMAL(3,2))) FROM Reviews WHERE seller_id = @seller_id),
                    total_reviews = (SELECT COUNT(*) FROM Reviews WHERE seller_id = @seller_id)
                WHERE user_id = @seller_id
            `);
    }
}

module.exports = new SellerProfileRepository();
