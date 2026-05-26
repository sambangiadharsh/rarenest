const { poolPromise, sql } = require('../config/db');

class ContactInfoRepository {
    async findLatest() {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT TOP 1 id, support_email, support_phone, office_address,
                   facebook_url, instagram_url, linkedin_url, twitter_url,
                   updated_by, updated_at
            FROM ContactInfo
            ORDER BY updated_at DESC
        `);
        return result.recordset[0] || null;
    }

    async upsert(data, userId) {
        const pool = await poolPromise;
        const existing = await this.findLatest();

        if (existing) {
            const result = await pool.request()
                .input('id', sql.UniqueIdentifier, existing.id)
                .input('support_email', sql.NVarChar, data.support_email || null)
                .input('support_phone', sql.NVarChar, data.support_phone || null)
                .input('office_address', sql.NVarChar, data.office_address || null)
                .input('facebook_url', sql.NVarChar, data.facebook_url || null)
                .input('instagram_url', sql.NVarChar, data.instagram_url || null)
                .input('linkedin_url', sql.NVarChar, data.linkedin_url || null)
                .input('twitter_url', sql.NVarChar, data.twitter_url || null)
                .input('updated_by', sql.UniqueIdentifier, userId)
                .query(`
                    UPDATE ContactInfo
                    SET support_email = @support_email,
                        support_phone = @support_phone,
                        office_address = @office_address,
                        facebook_url = @facebook_url,
                        instagram_url = @instagram_url,
                        linkedin_url = @linkedin_url,
                        twitter_url = @twitter_url,
                        updated_by = @updated_by,
                        updated_at = SYSDATETIME()
                    OUTPUT INSERTED.id, INSERTED.support_email, INSERTED.support_phone,
                           INSERTED.office_address, INSERTED.facebook_url, INSERTED.instagram_url,
                           INSERTED.linkedin_url, INSERTED.twitter_url,
                           INSERTED.updated_by, INSERTED.updated_at
                    WHERE id = @id
                `);
            return result.recordset[0];
        }

        const result = await pool.request()
            .input('support_email', sql.NVarChar, data.support_email || null)
            .input('support_phone', sql.NVarChar, data.support_phone || null)
            .input('office_address', sql.NVarChar, data.office_address || null)
            .input('facebook_url', sql.NVarChar, data.facebook_url || null)
            .input('instagram_url', sql.NVarChar, data.instagram_url || null)
            .input('linkedin_url', sql.NVarChar, data.linkedin_url || null)
            .input('twitter_url', sql.NVarChar, data.twitter_url || null)
            .input('updated_by', sql.UniqueIdentifier, userId)
            .query(`
                INSERT INTO ContactInfo (support_email, support_phone, office_address,
                    facebook_url, instagram_url, linkedin_url, twitter_url, updated_by)
                OUTPUT INSERTED.id, INSERTED.support_email, INSERTED.support_phone,
                       INSERTED.office_address, INSERTED.facebook_url, INSERTED.instagram_url,
                       INSERTED.linkedin_url, INSERTED.twitter_url,
                       INSERTED.updated_by, INSERTED.updated_at
                VALUES (@support_email, @support_phone, @office_address,
                    @facebook_url, @instagram_url, @linkedin_url, @twitter_url, @updated_by)
            `);
        return result.recordset[0];
    }
}

module.exports = new ContactInfoRepository();
