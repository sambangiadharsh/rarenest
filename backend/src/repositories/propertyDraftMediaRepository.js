const { poolPromise, sql } = require('../config/db');

class PropertyDraftMediaRepository {
    async findByDraftId(draftId) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('draft_id', sql.UniqueIdentifier, draftId)
            .query('SELECT * FROM PropertyDraftMedia WHERE draft_id = @draft_id ORDER BY sort_order ASC, created_at ASC');
        return result.recordset;
    }

    async findById(mediaId) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.UniqueIdentifier, mediaId)
            .query('SELECT * FROM PropertyDraftMedia WHERE id = @id');
        return result.recordset[0] ?? null;
    }

    async insert({ draft_id, media_url, media_type, is_thumbnail = false, sort_order = 0 }) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('draft_id', sql.UniqueIdentifier, draft_id)
            .input('media_url', sql.NVarChar, media_url)
            .input('media_type', sql.NVarChar, media_type)
            .input('is_thumbnail', sql.Bit, is_thumbnail ? 1 : 0)
            .input('sort_order', sql.Int, sort_order)
            .query(`
                INSERT INTO PropertyDraftMedia (draft_id, media_url, media_type, is_thumbnail, sort_order)
                OUTPUT INSERTED.*
                VALUES (@draft_id, @media_url, @media_type, @is_thumbnail, @sort_order)
            `);
        return result.recordset[0];
    }

    async clearThumbnails(draftId) {
        const pool = await poolPromise;
        await pool.request()
            .input('draft_id', sql.UniqueIdentifier, draftId)
            .query('UPDATE PropertyDraftMedia SET is_thumbnail = 0 WHERE draft_id = @draft_id');
    }

    async setThumbnail(draftId, mediaId) {
        const pool = await poolPromise;
        await this.clearThumbnails(draftId);
        const result = await pool.request()
            .input('draft_id', sql.UniqueIdentifier, draftId)
            .input('id', sql.UniqueIdentifier, mediaId)
            .query(`
                UPDATE PropertyDraftMedia
                SET is_thumbnail = 1
                OUTPUT INSERTED.*
                WHERE id = @id AND draft_id = @draft_id AND media_type = 'Image'
            `);
        return result.recordset[0] ?? null;
    }

    async deleteById(mediaId) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.UniqueIdentifier, mediaId)
            .query('DELETE FROM PropertyDraftMedia OUTPUT DELETED.* WHERE id = @id');
        return result.recordset[0] ?? null;
    }

    async countByDraftAndType(draftId, mediaType) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('draft_id', sql.UniqueIdentifier, draftId)
            .input('media_type', sql.NVarChar, mediaType)
            .query('SELECT COUNT(*) AS cnt FROM PropertyDraftMedia WHERE draft_id = @draft_id AND media_type = @media_type');
        return result.recordset[0]?.cnt ?? 0;
    }
}

module.exports = new PropertyDraftMediaRepository();
