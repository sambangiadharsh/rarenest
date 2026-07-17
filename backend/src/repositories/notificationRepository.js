const { poolPromise, sql } = require('../config/db');

class NotificationRepository {
    async create({ user_id, type, title, body }) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('user_id', sql.UniqueIdentifier, user_id)
            .input('type', sql.NVarChar, type)
            .input('title', sql.NVarChar, title)
            .input('body', sql.NVarChar(sql.MAX), body)
            .query(`
                INSERT INTO Notifications (user_id, type, title, body)
                OUTPUT inserted.*
                VALUES (@user_id, @type, @title, @body)
            `);
        return result.recordset[0];
    }

    async findByUserId(userId, { limit = 20, offset = 0 } = {}) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('user_id', sql.UniqueIdentifier, userId)
            .input('limit', sql.Int, limit)
            .input('offset', sql.Int, offset)
            .query(`
                SELECT *
                FROM Notifications
                WHERE user_id = @user_id
                ORDER BY created_at DESC
                OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
            `);
        return result.recordset;
    }

    async getUnreadCount(userId) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('user_id', sql.UniqueIdentifier, userId)
            .query(`
                SELECT COUNT(*) AS total
                FROM Notifications
                WHERE user_id = @user_id AND is_read = 0
            `);
        return result.recordset[0]?.total ?? 0;
    }

    async markRead(id, userId) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.UniqueIdentifier, id)
            .input('user_id', sql.UniqueIdentifier, userId)
            .query(`
                UPDATE Notifications
                SET is_read = 1
                OUTPUT inserted.*
                WHERE id = @id AND user_id = @user_id
            `);
        return result.recordset[0] || null;
    }

    async markAllRead(userId) {
        const pool = await poolPromise;
        await pool.request()
            .input('user_id', sql.UniqueIdentifier, userId)
            .query(`
                UPDATE Notifications SET is_read = 1
                WHERE user_id = @user_id AND is_read = 0
            `);
    }
}

module.exports = new NotificationRepository();
