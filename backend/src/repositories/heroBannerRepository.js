const { poolPromise, sql } = require('../config/db');

class HeroBannerRepository {
    async findAll({ activeOnly = false } = {}) {
        const pool = await poolPromise;
        const where = activeOnly ? 'WHERE is_active = 1' : '';
        const result = await pool.request().query(`
            SELECT id, title, subtitle, image_url, display_order, is_active, created_at, updated_at
            FROM HeroBanners
            ${where}
            ORDER BY display_order ASC
        `);
        return result.recordset;
    }

    async findById(id) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.UniqueIdentifier, id)
            .query(`
                SELECT id, title, subtitle, image_url, display_order, is_active, created_at, updated_at
                FROM HeroBanners WHERE id = @id
            `);
        return result.recordset[0] || null;
    }

    async create({ title, subtitle, image_url, display_order, is_active }) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('title', sql.NVarChar(255), title)
            .input('subtitle', sql.NVarChar(500), subtitle || null)
            .input('image_url', sql.NVarChar(1000), image_url)
            .input('display_order', sql.Int, display_order ?? 1)
            .input('is_active', sql.Bit, is_active !== false ? 1 : 0)
            .query(`
                INSERT INTO HeroBanners (title, subtitle, image_url, display_order, is_active)
                OUTPUT INSERTED.id, INSERTED.title, INSERTED.subtitle, INSERTED.image_url,
                       INSERTED.display_order, INSERTED.is_active, INSERTED.created_at, INSERTED.updated_at
                VALUES (@title, @subtitle, @image_url, @display_order, @is_active)
            `);
        return result.recordset[0];
    }

    async update(id, data) {
        const pool = await poolPromise;
        const fields = [];
        const request = pool.request().input('id', sql.UniqueIdentifier, id);

        if (data.title !== undefined) {
            fields.push('title = @title');
            request.input('title', sql.NVarChar(255), data.title);
        }
        if (data.subtitle !== undefined) {
            fields.push('subtitle = @subtitle');
            request.input('subtitle', sql.NVarChar(500), data.subtitle);
        }
        if (data.image_url !== undefined) {
            fields.push('image_url = @image_url');
            request.input('image_url', sql.NVarChar(1000), data.image_url);
        }
        if (data.display_order !== undefined) {
            fields.push('display_order = @display_order');
            request.input('display_order', sql.Int, data.display_order);
        }
        if (data.is_active !== undefined) {
            fields.push('is_active = @is_active');
            request.input('is_active', sql.Bit, data.is_active ? 1 : 0);
        }

        fields.push('updated_at = SYSDATETIME()');

        const result = await request.query(`
            UPDATE HeroBanners SET ${fields.join(', ')}
            OUTPUT INSERTED.id, INSERTED.title, INSERTED.subtitle, INSERTED.image_url,
                   INSERTED.display_order, INSERTED.is_active, INSERTED.created_at, INSERTED.updated_at
            WHERE id = @id
        `);
        return result.recordset[0] || null;
    }

    async delete(id) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.UniqueIdentifier, id)
            .query('DELETE FROM HeroBanners WHERE id = @id');
        return result.rowsAffected[0] > 0;
    }

    // Accepts an array of { id, display_order } and bulk-updates all in one transaction
    async reorder(items) {
        const pool = await poolPromise;
        const transaction = pool.transaction();
        await transaction.begin();
        try {
            for (let i = 0; i < items.length; i++) {
                await transaction.request()
                    .input(`id${i}`, sql.UniqueIdentifier, items[i].id)
                    .input(`order${i}`, sql.Int, items[i].display_order)
                    .query(`UPDATE HeroBanners SET display_order = @order${i}, updated_at = SYSDATETIME() WHERE id = @id${i}`);
            }
            await transaction.commit();
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    }
}

module.exports = new HeroBannerRepository();
