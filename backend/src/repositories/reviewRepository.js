const { poolPromise, sql } = require('../config/db');

class ReviewRepository {
    async findBySellerAndBuyer(sellerId, buyerId) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('seller_id', sql.UniqueIdentifier, sellerId)
            .input('buyer_id', sql.UniqueIdentifier, buyerId)
            .query(`
                SELECT id FROM Reviews 
                WHERE seller_id = @seller_id AND buyer_id = @buyer_id
            `);
        return result.recordset[0] ?? null;
    }

    async create(reviewData) {
        const { seller_id, buyer_id, rating, comment } = reviewData;
        const pool = await poolPromise;
        await pool.request()
            .input('seller_id', sql.UniqueIdentifier, seller_id)
            .input('buyer_id', sql.UniqueIdentifier, buyer_id)
            .input('rating', sql.Int, rating)
            .input('comment', sql.NVarChar, comment)
            .query(`
                INSERT INTO Reviews (seller_id, buyer_id, rating, comment)
                VALUES (@seller_id, @buyer_id, @rating, @comment)
            `);
    }

    async findBySellerId(sellerId, limit = null) {
        const pool = await poolPromise;
        const request = pool.request()
            .input('seller_id', sql.UniqueIdentifier, sellerId);

        let query = `
            SELECT r.*, u.first_name, u.last_name 
            FROM Reviews r
            JOIN Users u ON r.buyer_id = u.id
            WHERE r.seller_id = @seller_id
            ORDER BY r.created_at DESC
        `;

        if (limit != null && limit > 0) {
            request.input('limit', sql.Int, limit);
            query = `
                SELECT TOP (@limit) r.*, u.first_name, u.last_name 
                FROM Reviews r
                JOIN Users u ON r.buyer_id = u.id
                WHERE r.seller_id = @seller_id
                ORDER BY r.created_at DESC
            `;
        }

        const result = await request.query(query);
        return result.recordset;
    }
}

module.exports = new ReviewRepository();
