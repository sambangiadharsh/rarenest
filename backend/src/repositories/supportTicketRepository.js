const { poolPromise, sql } = require('../config/db');

class SupportTicketRepository {
    async create({
        conversation_id, user_id, category, subject, description, priority, status = 'Open',
    }) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('conversation_id', sql.UniqueIdentifier, conversation_id)
            .input('user_id', sql.UniqueIdentifier, user_id)
            .input('category', sql.NVarChar, category)
            .input('subject', sql.NVarChar, subject)
            .input('description', sql.NVarChar(sql.MAX), description)
            .input('priority', sql.NVarChar, priority)
            .input('status', sql.NVarChar, status)
            .query(`
                INSERT INTO SupportTickets (
                    conversation_id, user_id, category, subject, description, priority, status
                )
                OUTPUT inserted.*
                VALUES (
                    @conversation_id, @user_id, @category, @subject, @description, @priority, @status
                )
            `);
        return result.recordset[0];
    }

    async findById(id) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.UniqueIdentifier, id)
            .query(`
                SELECT st.*,
                    u.first_name AS user_first_name,
                    u.last_name AS user_last_name,
                    u.email AS user_email,
                    u.phone AS user_phone,
                    a.first_name AS admin_first_name,
                    a.last_name AS admin_last_name
                FROM SupportTickets st
                INNER JOIN Users u ON u.id = st.user_id
                LEFT JOIN Users a ON a.id = st.assigned_admin_id
                WHERE st.id = @id
            `);
        return result.recordset[0] || null;
    }

    async findByConversationId(conversation_id) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('conversation_id', sql.UniqueIdentifier, conversation_id)
            .query('SELECT * FROM SupportTickets WHERE conversation_id = @conversation_id');
        return result.recordset[0] || null;
    }

    async findByUserId(userId, { status, search, limit = 20, offset = 0 } = {}) {
        const pool = await poolPromise;
        const request = pool.request()
            .input('user_id', sql.UniqueIdentifier, userId)
            .input('limit', sql.Int, limit)
            .input('offset', sql.Int, offset);

        let filters = '';
        if (status) {
            request.input('status', sql.NVarChar, status);
            filters += ' AND st.status = @status';
        }
        if (search) {
            request.input('search', sql.NVarChar, `%${search}%`);
            filters += ' AND (st.subject LIKE @search OR st.description LIKE @search)';
        }

        const result = await request.query(`
            SELECT st.*, c.last_message_at
            FROM SupportTickets st
            INNER JOIN Conversations c ON c.id = st.conversation_id
            WHERE st.user_id = @user_id
              ${filters}
            ORDER BY st.created_at DESC
            OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
        `);
        return result.recordset;
    }

    async findAll({ category, priority, status, search, limit = 20, offset = 0 } = {}) {
        const pool = await poolPromise;
        const request = pool.request()
            .input('limit', sql.Int, limit)
            .input('offset', sql.Int, offset);

        let filters = '';
        if (category) {
            request.input('category', sql.NVarChar, category);
            filters += ' AND st.category = @category';
        }
        if (priority) {
            request.input('priority', sql.NVarChar, priority);
            filters += ' AND st.priority = @priority';
        }
        if (status) {
            request.input('status', sql.NVarChar, status);
            filters += ' AND st.status = @status';
        }
        if (search) {
            request.input('search', sql.NVarChar, `%${search}%`);
            filters += ` AND (
                st.subject LIKE @search OR st.description LIKE @search
                OR u.first_name LIKE @search OR u.last_name LIKE @search OR u.email LIKE @search
            )`;
        }

        const result = await request.query(`
            SELECT st.*,
                u.first_name AS user_first_name,
                u.last_name AS user_last_name,
                u.email AS user_email,
                a.first_name AS admin_first_name,
                a.last_name AS admin_last_name,
                c.last_message_at
            FROM SupportTickets st
            INNER JOIN Users u ON u.id = st.user_id
            INNER JOIN Conversations c ON c.id = st.conversation_id
            LEFT JOIN Users a ON a.id = st.assigned_admin_id
            WHERE 1=1
              ${filters}
            ORDER BY
                CASE st.priority WHEN 'High' THEN 1 WHEN 'Medium' THEN 2 ELSE 3 END,
                st.created_at DESC
            OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
        `);
        return result.recordset;
    }

    async countAll(filters = {}) {
        const pool = await poolPromise;
        const request = pool.request();
        let where = 'WHERE 1=1';

        if (filters.category) {
            request.input('category', sql.NVarChar, filters.category);
            where += ' AND st.category = @category';
        }
        if (filters.priority) {
            request.input('priority', sql.NVarChar, filters.priority);
            where += ' AND st.priority = @priority';
        }
        if (filters.status) {
            request.input('status', sql.NVarChar, filters.status);
            where += ' AND st.status = @status';
        }
        if (filters.search) {
            request.input('search', sql.NVarChar, `%${filters.search}%`);
            where += ` AND (
                st.subject LIKE @search OR st.description LIKE @search
                OR u.first_name LIKE @search OR u.last_name LIKE @search OR u.email LIKE @search
            )`;
        }

        const result = await request.query(`
            SELECT COUNT(*) AS total
            FROM SupportTickets st
            INNER JOIN Users u ON u.id = st.user_id
            ${where}
        `);
        return result.recordset[0]?.total ?? 0;
    }

    async updateStatus(id, status, closed_at = null) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.UniqueIdentifier, id)
            .input('status', sql.NVarChar, status)
            .input('closed_at', sql.DateTime, closed_at)
            .query(`
                UPDATE SupportTickets
                SET status = @status,
                    closed_at = @closed_at,
                    updated_at = GETDATE()
                OUTPUT inserted.*
                WHERE id = @id
            `);
        return result.recordset[0] || null;
    }

    async updatePriority(id, priority) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.UniqueIdentifier, id)
            .input('priority', sql.NVarChar, priority)
            .query(`
                UPDATE SupportTickets
                SET priority = @priority, updated_at = GETDATE()
                OUTPUT inserted.*
                WHERE id = @id
            `);
        return result.recordset[0] || null;
    }

    async assignAdmin(id, adminId) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.UniqueIdentifier, id)
            .input('admin_id', sql.UniqueIdentifier, adminId)
            .query(`
                UPDATE SupportTickets
                SET assigned_admin_id = @admin_id, updated_at = GETDATE()
                OUTPUT inserted.*
                WHERE id = @id
            `);
        return result.recordset[0] || null;
    }
}

module.exports = new SupportTicketRepository();
