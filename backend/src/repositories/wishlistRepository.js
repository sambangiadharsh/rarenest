const { poolPromise, sql } = require('../config/db');

class WishlistRepository {
    async addIfNotExists(userId, propertyId) {
        const pool = await poolPromise;
        await pool.request()
            .input('user_id', sql.UniqueIdentifier, userId)
            .input('property_id', sql.UniqueIdentifier, propertyId)
            .query(`
                IF NOT EXISTS (SELECT 1 FROM Wishlist WHERE user_id = @user_id AND property_id = @property_id)
                BEGIN
                    INSERT INTO Wishlist (user_id, property_id) VALUES (@user_id, @property_id)
                END
            `);
    }

    async findPropertiesByUserId(userId) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('user_id', sql.UniqueIdentifier, userId)
            .query(`
                SELECT p.* FROM Properties p
                JOIN Wishlist w ON p.id = w.property_id
                WHERE w.user_id = @user_id AND p.is_verified = 1 AND p.is_visible = 1
            `);
        return result.recordset;
    }

    async remove(userId, propertyId) {
        const pool = await poolPromise;
        await pool.request()
            .input('user_id', sql.UniqueIdentifier, userId)
            .input('property_id', sql.UniqueIdentifier, propertyId)
            .query('DELETE FROM Wishlist WHERE user_id = @user_id AND property_id = @property_id');
    }
}

module.exports = new WishlistRepository();
