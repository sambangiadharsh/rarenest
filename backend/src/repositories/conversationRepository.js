const { poolPromise, sql } = require('../config/db');

class ConversationRepository {
    async create({ type, property_id, buyer_id, created_by }) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('type', sql.NVarChar, type)
            .input('property_id', sql.UniqueIdentifier, property_id || null)
            .input('buyer_id', sql.UniqueIdentifier, buyer_id || null)
            .input('created_by', sql.UniqueIdentifier, created_by)
            .query(`
                INSERT INTO Conversations (type, property_id, buyer_id, created_by)
                OUTPUT inserted.*
                VALUES (@type, @property_id, @buyer_id, @created_by)
            `);
        return result.recordset[0];
    }

    async findById(id) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.UniqueIdentifier, id)
            .query('SELECT * FROM Conversations WHERE id = @id');
        return result.recordset[0] || null;
    }

    async findPropertyConversation(property_id, buyer_id) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('property_id', sql.UniqueIdentifier, property_id)
            .input('buyer_id', sql.UniqueIdentifier, buyer_id)
            .query(`
                SELECT * FROM Conversations
                WHERE type = 'PROPERTY'
                  AND property_id = @property_id
                  AND buyer_id = @buyer_id
            `);
        return result.recordset[0] || null;
    }

    async updateLastMessageAt(conversationId, timestamp) {
        const pool = await poolPromise;
        await pool.request()
            .input('id', sql.UniqueIdentifier, conversationId)
            .input('last_message_at', sql.DateTime, timestamp || new Date())
            .query(`
                UPDATE Conversations
                SET last_message_at = @last_message_at, updated_at = GETDATE()
                WHERE id = @id
            `);
    }

    async addParticipant({ conversation_id, user_id }) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('conversation_id', sql.UniqueIdentifier, conversation_id)
            .input('user_id', sql.UniqueIdentifier, user_id)
            .query(`
                IF NOT EXISTS (
                    SELECT 1 FROM ConversationParticipants
                    WHERE conversation_id = @conversation_id AND user_id = @user_id
                )
                BEGIN
                    INSERT INTO ConversationParticipants (conversation_id, user_id)
                    OUTPUT inserted.*
                    VALUES (@conversation_id, @user_id)
                END
                ELSE
                BEGIN
                    SELECT * FROM ConversationParticipants
                    WHERE conversation_id = @conversation_id AND user_id = @user_id
                END
            `);
        return result.recordset[0];
    }

    async findParticipant(conversation_id, user_id) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('conversation_id', sql.UniqueIdentifier, conversation_id)
            .input('user_id', sql.UniqueIdentifier, user_id)
            .query(`
                SELECT * FROM ConversationParticipants
                WHERE conversation_id = @conversation_id AND user_id = @user_id
            `);
        return result.recordset[0] || null;
    }

    async getParticipants(conversation_id) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('conversation_id', sql.UniqueIdentifier, conversation_id)
            .query(`
                SELECT cp.*, u.first_name, u.last_name, u.email, u.profile_image, u.role
                FROM ConversationParticipants cp
                INNER JOIN Users u ON u.id = cp.user_id
                WHERE cp.conversation_id = @conversation_id
            `);
        return result.recordset;
    }

    async setArchived(conversation_id, user_id, is_archived) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('conversation_id', sql.UniqueIdentifier, conversation_id)
            .input('user_id', sql.UniqueIdentifier, user_id)
            .input('is_archived', sql.Bit, is_archived ? 1 : 0)
            .query(`
                UPDATE ConversationParticipants
                SET is_archived = @is_archived
                OUTPUT inserted.*
                WHERE conversation_id = @conversation_id AND user_id = @user_id
            `);
        return result.recordset[0] || null;
    }

    async updateLastRead(conversation_id, user_id, message_id) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('conversation_id', sql.UniqueIdentifier, conversation_id)
            .input('user_id', sql.UniqueIdentifier, user_id)
            .input('message_id', sql.UniqueIdentifier, message_id)
            .query(`
                UPDATE ConversationParticipants
                SET last_read_message_id = @message_id
                OUTPUT inserted.*
                WHERE conversation_id = @conversation_id AND user_id = @user_id
            `);
        return result.recordset[0] || null;
    }

    async findByUserId(userId, { type, archived, limit = 20, offset = 0 } = {}) {
        const pool = await poolPromise;
        const request = pool.request()
            .input('user_id', sql.UniqueIdentifier, userId)
            .input('limit', sql.Int, limit)
            .input('offset', sql.Int, offset);

        let typeFilter = '';
        if (type) {
            request.input('type', sql.NVarChar, type);
            typeFilter = 'AND c.type = @type';
        }

        let archivedFilter = 'AND cp.is_archived = 0';
        if (archived === true) {
            archivedFilter = 'AND cp.is_archived = 1';
        } else if (archived === 'all') {
            archivedFilter = '';
        }

        const result = await request.query(`
            SELECT
                c.*,
                cp.is_archived,
                cp.last_read_message_id,
                p.title AS property_title,
                p.seller_id AS property_seller_id,
                st.id AS ticket_id,
                st.subject AS ticket_subject,
                st.status AS ticket_status,
                st.priority AS ticket_priority,
                lm.id AS last_message_id,
                lm.message AS last_message_preview,
                lm.message_type AS last_message_type,
                lm.sender_id AS last_message_sender_id,
                lm.created_at AS last_message_created_at,
                (
                    SELECT COUNT(*)
                    FROM Messages m
                    WHERE m.conversation_id = c.id
                      AND m.is_deleted = 0
                      AND (m.is_internal = 0 OR EXISTS (
                          SELECT 1 FROM Users u WHERE u.id = @user_id AND u.role = 'Admin'
                      ))
                      AND (cp.last_read_message_id IS NULL OR m.created_at > (
                          SELECT created_at FROM Messages WHERE id = cp.last_read_message_id
                      ))
                      AND m.sender_id <> @user_id
                ) AS unread_count
            FROM Conversations c
            INNER JOIN ConversationParticipants cp ON cp.conversation_id = c.id AND cp.user_id = @user_id
            LEFT JOIN Properties p ON p.id = c.property_id
            LEFT JOIN SupportTickets st ON st.conversation_id = c.id
            OUTER APPLY (
                SELECT TOP 1 m.id, m.message, m.message_type, m.sender_id, m.created_at
                FROM Messages m
                WHERE m.conversation_id = c.id AND m.is_deleted = 0
                  AND (m.is_internal = 0 OR EXISTS (
                      SELECT 1 FROM Users u WHERE u.id = @user_id AND u.role = 'Admin'
                  ))
                ORDER BY m.created_at DESC
            ) lm
            WHERE c.is_active = 1
              ${typeFilter}
              ${archivedFilter}
            ORDER BY COALESCE(c.last_message_at, c.created_at) DESC
            OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
        `);
        return result.recordset;
    }
}

module.exports = new ConversationRepository();
