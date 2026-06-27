const { poolPromise, sql } = require('../config/db');

class PropertyDraftRepository {
    async upsert({ seller_id, property_id = null, draft_type, current_step = 1, draft_data }) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('seller_id', sql.UniqueIdentifier, seller_id)
            .input('property_id', sql.UniqueIdentifier, property_id)
            .input('draft_type', sql.NVarChar, draft_type)
            .input('current_step', sql.Int, current_step)
            .input('draft_data', sql.NVarChar(sql.MAX), JSON.stringify(draft_data || {}))
            .query(`
                DECLARE @existing_id UNIQUEIDENTIFIER;

                SELECT TOP 1 @existing_id = id
                FROM PropertyDrafts
                WHERE seller_id = @seller_id
                    AND draft_type = @draft_type
                    AND (
                        (@draft_type = 'Create' AND property_id IS NULL)
                        OR (@draft_type = 'Edit' AND property_id = @property_id)
                    );

                IF @existing_id IS NOT NULL
                BEGIN
                    UPDATE PropertyDrafts
                    SET current_step = @current_step,
                        draft_data = @draft_data,
                        updated_at = GETDATE()
                    WHERE id = @existing_id;
                END
                ELSE
                BEGIN
                    DECLARE @inserted TABLE (id UNIQUEIDENTIFIER);
                    INSERT INTO PropertyDrafts (seller_id, property_id, draft_type, current_step, draft_data)
                    OUTPUT INSERTED.id INTO @inserted
                    VALUES (@seller_id, @property_id, @draft_type, @current_step, @draft_data);
                    SELECT TOP 1 @existing_id = id FROM @inserted;
                END

                SELECT TOP 1 * FROM PropertyDrafts WHERE id = @existing_id;
            `);

        return this.normalize(result.recordset[0]);
    }

    async findForSeller({ seller_id, draft_type, property_id = null }) {
        const pool = await poolPromise;
        const request = pool.request()
            .input('seller_id', sql.UniqueIdentifier, seller_id)
            .input('draft_type', sql.NVarChar, draft_type);

        let propertyClause = 'AND property_id IS NULL';
        if (property_id) {
            request.input('property_id', sql.UniqueIdentifier, property_id);
            propertyClause = 'AND property_id = @property_id';
        }

        const result = await request.query(`
            SELECT TOP 1 *
            FROM PropertyDrafts
            WHERE seller_id = @seller_id
                AND draft_type = @draft_type
                ${propertyClause}
            ORDER BY updated_at DESC
        `);

        return this.normalize(result.recordset[0]);
    }

    async findById(id) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.UniqueIdentifier, id)
            .query('SELECT * FROM PropertyDrafts WHERE id = @id');
        return this.normalize(result.recordset[0]);
    }

    async deleteById(id) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.UniqueIdentifier, id)
            .query('DELETE FROM PropertyDrafts OUTPUT DELETED.* WHERE id = @id');
        return this.normalize(result.recordset[0]);
    }

    normalize(row) {
        if (!row) return null;
        try {
            row.draft_data = typeof row.draft_data === 'string'
                ? JSON.parse(row.draft_data || '{}')
                : row.draft_data || {};
        } catch {
            row.draft_data = {};
        }
        return row;
    }
}

module.exports = new PropertyDraftRepository();
