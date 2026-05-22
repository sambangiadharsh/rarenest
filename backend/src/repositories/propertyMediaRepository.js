const { poolPromise, sql } = require('../config/db');

class PropertyMediaRepository {
    async findByPropertyId(propertyId) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('property_id', sql.UniqueIdentifier, propertyId)
            .query('SELECT * FROM PropertyMedia WHERE property_id = @property_id ORDER BY created_at ASC');
        return result.recordset;
    }

    async findById(mediaId) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.UniqueIdentifier, mediaId)
            .query('SELECT * FROM PropertyMedia WHERE id = @id');
        return result.recordset[0] ?? null;
    }

    async insert({ property_id, media_url, media_type, is_thumbnail }) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('property_id', sql.UniqueIdentifier, property_id)
            .input('media_url', sql.NVarChar, media_url)
            .input('media_type', sql.NVarChar, media_type)
            .input('is_thumbnail', sql.Bit, is_thumbnail ? 1 : 0)
            .query(`
                INSERT INTO PropertyMedia (property_id, media_url, media_type, is_thumbnail)
                OUTPUT INSERTED.*
                VALUES (@property_id, @media_url, @media_type, @is_thumbnail)
            `);
        return result.recordset[0];
    }

    async clearThumbnails(propertyId) {
        const pool = await poolPromise;
        await pool.request()
            .input('property_id', sql.UniqueIdentifier, propertyId)
            .query('UPDATE PropertyMedia SET is_thumbnail = 0 WHERE property_id = @property_id');
    }

    async setThumbnail(propertyId, mediaId) {
        const pool = await poolPromise;
        await this.clearThumbnails(propertyId);
        const result = await pool.request()
            .input('property_id', sql.UniqueIdentifier, propertyId)
            .input('id', sql.UniqueIdentifier, mediaId)
            .query(`
                UPDATE PropertyMedia
                SET is_thumbnail = 1
                OUTPUT INSERTED.*
                WHERE id = @id AND property_id = @property_id AND media_type = 'Image'
            `);
        return result.recordset[0] ?? null;
    }

    async deleteById(mediaId) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.UniqueIdentifier, mediaId)
            .query('DELETE FROM PropertyMedia OUTPUT DELETED.* WHERE id = @id');
        return result.recordset[0] ?? null;
    }

    async countByPropertyAndType(propertyId, mediaType) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('property_id', sql.UniqueIdentifier, propertyId)
            .input('media_type', sql.NVarChar, mediaType)
            .query(`
                SELECT COUNT(*) AS cnt FROM PropertyMedia
                WHERE property_id = @property_id AND media_type = @media_type
            `);
        return result.recordset[0]?.cnt ?? 0;
    }
}

module.exports = new PropertyMediaRepository();
