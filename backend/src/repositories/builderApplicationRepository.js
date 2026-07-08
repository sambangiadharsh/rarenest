const { poolPromise, sql } = require('../config/db');

class BuilderApplicationRepository {
    async create(applicationData) {
        const {
            user_id,
            company_name,
            company_description,
            company_registration_number,
            company_logo_url,
            
            contact_person_name,
            business_email,
            business_phone,
            office_address,
            city,
            state,
            is_primary_contact,
            business_registration_certificate_url,
            applicant_government_id_url,
            gst_number,
            gst_certificate_url,
            rera_number,
            rera_certificate_url,
            declaration_accepted,
            social_links,
        } = applicationData;
        const pool = await poolPromise;
        const result = await pool.request()
            .input('user_id', sql.UniqueIdentifier, user_id)
            .input('company_name', sql.NVarChar, company_name)
            .input('company_description', sql.NVarChar, company_description)
            .input('company_registration_number', sql.NVarChar, company_registration_number)
            .input('company_logo_url', sql.NVarChar, company_logo_url || null)
            .input('contact_person_name', sql.NVarChar, contact_person_name)
            .input('business_email', sql.NVarChar, business_email)
            .input('business_phone', sql.NVarChar, business_phone)
            .input('office_address', sql.NVarChar, office_address)
            .input('city', sql.NVarChar, city)
            .input('state', sql.NVarChar, state)
            .input('is_primary_contact', sql.Bit, !!is_primary_contact)
            .input('business_registration_certificate_url', sql.NVarChar, business_registration_certificate_url)
            .input('applicant_government_id_url', sql.NVarChar, applicant_government_id_url)
            .input('gst_number', sql.NVarChar, gst_number || null)
            .input('gst_certificate_url', sql.NVarChar, gst_certificate_url || null)
            .input('rera_number', sql.NVarChar, rera_number || null)
            .input('rera_certificate_url', sql.NVarChar, rera_certificate_url || null)
            .input('declaration_accepted', sql.Bit, !!declaration_accepted)
            .input('social_links', sql.NVarChar, social_links || null)
            .query(`
                INSERT INTO BuilderApplications (
                    user_id,
                    company_name,
                    company_description,
                    company_registration_number,
                    company_logo_url,
                    contact_person_name,
                    business_email,
                    business_phone,
                    office_address,
                    city,
                    state,
                    is_primary_contact,
                    business_registration_certificate_url,
                    applicant_government_id_url,
                    gst_number,
                    gst_certificate_url,
                    rera_number,
                    rera_certificate_url,
                    declaration_accepted,
                    social_links
                )
                OUTPUT inserted.*
                VALUES (
                    @user_id,
                    @company_name,
                    @company_description,
                    @company_registration_number,
                    @company_logo_url,
                    @contact_person_name,
                    @business_email,
                    @business_phone,
                    @office_address,
                    @city,
                    @state,
                    @is_primary_contact,
                    @business_registration_certificate_url,
                    @applicant_government_id_url,
                    @gst_number,
                    @gst_certificate_url,
                    @rera_number,
                    @rera_certificate_url,
                    @declaration_accepted,
                    @social_links
                )
            `);
        return result.recordset[0];
    }

    async findByUserId(userId) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('user_id', sql.UniqueIdentifier, userId)
            .query(`
                SELECT TOP 1 * FROM BuilderApplications 
                WHERE user_id = @user_id 
                ORDER BY created_at DESC
            `);
        return result.recordset[0] ?? null;
    }

    async findById(id) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.UniqueIdentifier, id)
            .query('SELECT * FROM BuilderApplications WHERE id = @id');
        return result.recordset[0] ?? null;
    }

    async findAll() {
        const pool = await poolPromise;
        const result = await pool.request()
            .query(`
                SELECT ba.*, u.first_name, u.last_name, u.email, u.phone 
                FROM BuilderApplications ba
                JOIN Users u ON ba.user_id = u.id
                ORDER BY ba.created_at DESC
            `);
        return result.recordset;
    }

    async updateStatus(id, { status, adminId }) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.UniqueIdentifier, id)
            .input('status', sql.NVarChar, status)
            .input('admin_id', sql.UniqueIdentifier, adminId)
            .query(`
                UPDATE BuilderApplications
                SET status = @status, reviewed_by = @admin_id, reviewed_at = GETDATE()
                OUTPUT inserted.*
                WHERE id = @id
            `);
        return result.recordset[0] ?? null;
    }
}

module.exports = new BuilderApplicationRepository();
