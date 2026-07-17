const { poolPromise, sql } = require('../config/db');

class MessageRepository {
    async create({ conversation_id, sender_id, message, message_type = 'TEXT', is_internal = false }) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('conversation_id', sql.UniqueIdentifier, conversation_id)
            .input('sender_id', sql.UniqueIdentifier, sender_id)
            .input('message', sql.NVarChar(sql.MAX), message || null)
            .input('message_type', sql.NVarChar, message_type)
            .input('is_internal', sql.Bit, is_internal ? 1 : 0)
            .query(`
                INSERT INTO Messages (conversation_id, sender_id, message, message_type, is_internal)
                OUTPUT inserted.*
                VALUES (@conversation_id, @sender_id, @message, @message_type, @is_internal)
            `);
        return result.recordset[0];
    }

    async findById(id) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.UniqueIdentifier, id)
            .query('SELECT * FROM Messages WHERE id = @id');
        return result.recordset[0] || null;
    }

    async findByConversation(conversation_id, { cursor, limit = 30, includeInternal = false, userId } = {}) {
        const pool = await poolPromise;
        const request = pool.request()
            .input('conversation_id', sql.UniqueIdentifier, conversation_id)
            .input('limit', sql.Int, limit);

        let cursorFilter = '';
        if (cursor) {
            request.input('cursor', sql.DateTime, new Date(cursor));
            cursorFilter = 'AND m.created_at < @cursor';
        }

        const internalFilter = includeInternal
            ? ''
            : 'AND m.is_internal = 0';

        const result = await request.query(`
            SELECT
                m.*,
                u.first_name AS sender_first_name,
                u.last_name AS sender_last_name,
                u.profile_image AS sender_profile_image,
                u.role AS sender_role,
                (
                    SELECT a.id, a.file_url, a.file_name, a.mime_type, a.file_size
                    FROM MessageAttachments a
                    WHERE a.message_id = m.id
                    FOR JSON PATH
                ) AS attachments_json
            FROM Messages m
            INNER JOIN Users u ON u.id = m.sender_id
            WHERE m.conversation_id = @conversation_id
              AND m.is_deleted = 0
              ${internalFilter}
              ${cursorFilter}
            ORDER BY m.created_at DESC
            OFFSET 0 ROWS FETCH NEXT @limit ROWS ONLY
        `);

        return result.recordset.map((row) => ({
            ...row,
            attachments: row.attachments_json ? JSON.parse(row.attachments_json) : [],
            attachments_json: undefined,
        }));
    }

    async createAttachment({ message_id, file_url, file_name, mime_type, file_size }) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('message_id', sql.UniqueIdentifier, message_id)
            .input('file_url', sql.NVarChar, file_url)
            .input('file_name', sql.NVarChar, file_name)
            .input('mime_type', sql.NVarChar, mime_type)
            .input('file_size', sql.BigInt, file_size)
            .query(`
                INSERT INTO MessageAttachments (message_id, file_url, file_name, mime_type, file_size)
                OUTPUT inserted.*
                VALUES (@message_id, @file_url, @file_name, @mime_type, @file_size)
            `);
        return result.recordset[0];
    }

    async getMessageWithSender(id) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.UniqueIdentifier, id)
            .query(`
                SELECT
                    m.*,
                    u.first_name AS sender_first_name,
                    u.last_name AS sender_last_name,
                    u.profile_image AS sender_profile_image,
                    u.role AS sender_role,
                    (
                        SELECT a.id, a.file_url, a.file_name, a.mime_type, a.file_size
                        FROM MessageAttachments a
                        WHERE a.message_id = m.id
                        FOR JSON PATH
                    ) AS attachments_json
                FROM Messages m
                INNER JOIN Users u ON u.id = m.sender_id
                WHERE m.id = @id
            `);
        const row = result.recordset[0];
        if (!row) return null;
        return {
            ...row,
            attachments: row.attachments_json ? JSON.parse(row.attachments_json) : [],
            attachments_json: undefined,
        };
    }

    async softDelete(id) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.UniqueIdentifier, id)
            .query(`
                UPDATE Messages
                SET is_deleted = 1, message = NULL, updated_at = GETDATE()
                OUTPUT inserted.*
                WHERE id = @id
            `);
        return result.recordset[0] || null;
    }
}

module.exports = new MessageRepository();
