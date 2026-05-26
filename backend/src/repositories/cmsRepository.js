const { poolPromise, sql } = require('../config/db');

class CmsRepository {
    async findByPageKey(pageKey, { publishedOnly = false } = {}) {
        const pool = await poolPromise;
        const request = pool.request().input('page_key', sql.NVarChar, pageKey);

        let statusFilter = '';
        if (publishedOnly) {
            statusFilter = "AND status = 'Published'";
        }

        const result = await request.query(`
            SELECT id, page_key, title, content, meta_title, meta_description,
                   status, created_by, updated_by, created_at, updated_at
            FROM CMSPages
            WHERE page_key = @page_key ${statusFilter}
        `);
        return result.recordset[0] || null;
    }

    async upsert({ pageKey, title, content, meta_title, meta_description, status, userId }) {
        const pool = await poolPromise;
        const existing = await this.findByPageKey(pageKey);

        if (existing) {
            const result = await pool.request()
                .input('page_key', sql.NVarChar, pageKey)
                .input('title', sql.NVarChar, title)
                .input('content', sql.NVarChar, content)
                .input('meta_title', sql.NVarChar, meta_title || null)
                .input('meta_description', sql.NVarChar, meta_description || null)
                .input('status', sql.NVarChar, status)
                .input('updated_by', sql.UniqueIdentifier, userId)
                .query(`
                    UPDATE CMSPages
                    SET title = @title,
                        content = @content,
                        meta_title = @meta_title,
                        meta_description = @meta_description,
                        status = @status,
                        updated_by = @updated_by,
                        updated_at = SYSDATETIME()
                    OUTPUT INSERTED.id, INSERTED.page_key, INSERTED.title, INSERTED.content,
                           INSERTED.meta_title, INSERTED.meta_description, INSERTED.status,
                           INSERTED.created_by, INSERTED.updated_by, INSERTED.created_at, INSERTED.updated_at
                    WHERE page_key = @page_key
                `);
            return result.recordset[0];
        }

        const result = await pool.request()
            .input('page_key', sql.NVarChar, pageKey)
            .input('title', sql.NVarChar, title)
            .input('content', sql.NVarChar, content)
            .input('meta_title', sql.NVarChar, meta_title || null)
            .input('meta_description', sql.NVarChar, meta_description || null)
            .input('status', sql.NVarChar, status)
            .input('created_by', sql.UniqueIdentifier, userId)
            .input('updated_by', sql.UniqueIdentifier, userId)
            .query(`
                INSERT INTO CMSPages (page_key, title, content, meta_title, meta_description, status, created_by, updated_by)
                OUTPUT INSERTED.id, INSERTED.page_key, INSERTED.title, INSERTED.content,
                       INSERTED.meta_title, INSERTED.meta_description, INSERTED.status,
                       INSERTED.created_by, INSERTED.updated_by, INSERTED.created_at, INSERTED.updated_at
                VALUES (@page_key, @title, @content, @meta_title, @meta_description, @status, @created_by, @updated_by)
            `);
        return result.recordset[0];
    }
}

module.exports = new CmsRepository();
