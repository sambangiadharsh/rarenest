const { poolPromise, sql } = require('../config/db');

const PROPERTY_SELECT = `
    SELECT p.*, pt.name AS property_type_name, pt.is_active AS property_type_is_active,
        u.first_name AS seller_first_name,
        u.last_name AS seller_last_name,
        u.email AS seller_email,
        u.phone AS seller_phone,
        u.role AS seller_role,
        bp.id AS builder_profile_id,
        bp.average_rating AS builder_average_rating,
        bp.total_reviews AS builder_total_reviews
    FROM Properties p
    LEFT JOIN PropertyTypes pt ON p.property_type_id = pt.id
    LEFT JOIN Users u ON p.seller_id = u.id
    LEFT JOIN BuilderProfiles bp ON u.id = bp.user_id
`;

const ACTIVE_PROPERTY_TYPE_FILTER = ' AND (p.property_type_id IS NULL OR pt.is_active = 1)';

class PropertyRepository {
    async findAll(filters = {}) {
        const { city, type, minPrice, maxPrice, minSize, maxSize, seller_id, is_verified, is_visible } = filters;
        const pool = await poolPromise;

        let query = `${PROPERTY_SELECT} WHERE 1=1`;
        const request = pool.request();

        if (seller_id) {
            request.input('seller_id', sql.UniqueIdentifier, seller_id);
            query += ' AND p.seller_id = @seller_id';
        }
        if (city) {
            request.input('city', sql.NVarChar, city);
            query += ' AND p.location_city = @city';
        }
        if (type) {
            request.input('type', sql.NVarChar, type);
            query += ' AND pt.name = @type';
        }
        if (minPrice) {
            request.input('minPrice', sql.Decimal, minPrice);
            query += ' AND p.asking_price >= @minPrice';
        }
        if (maxPrice) {
            request.input('maxPrice', sql.Decimal, maxPrice);
            query += ' AND p.asking_price <= @maxPrice';
        }
        if (minSize) {
            request.input('minSize', sql.Decimal, minSize);
            query += ' AND p.size_sqft >= @minSize';
        }
        if (maxSize) {
            request.input('maxSize', sql.Decimal, maxSize);
            query += ' AND p.size_sqft <= @maxSize';
        }

        const isPortfolioQuery = seller_id && is_verified === 'all';
        const isAdminPortfolio = is_visible === 'all';
        const requireActivePropertyType = !isPortfolioQuery && !isAdminPortfolio;

        if (is_verified === 'all') {
            // no is_verified filter (owner portfolio)
        } else if (is_verified !== undefined && is_verified !== null) {
            const isVerifiedVal = is_verified === 'true' || is_verified === true || is_verified === 1 || is_verified === '1';
            request.input('is_verified', sql.Bit, isVerifiedVal ? 1 : 0);
            query += ' AND p.is_verified = @is_verified';
        } else {
            request.input('is_verified', sql.Bit, 1);
            query += ' AND p.is_verified = @is_verified';
        }

        if (is_visible === 'all') {
            // no is_visible filter (admin portfolio)
        } else if (!isPortfolioQuery) {
            request.input('is_visible', sql.Bit, 1);
            query += ' AND p.is_visible = @is_visible';
        }

        if (requireActivePropertyType) {
            query += ACTIVE_PROPERTY_TYPE_FILTER;
        }

        query += ' ORDER BY p.created_at DESC';

        const result = await request.query(query);
        return result.recordset;
    }

    async findById(id) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.UniqueIdentifier, id)
            .query(`${PROPERTY_SELECT} WHERE p.id = @id`);
        return result.recordset[0] ?? null;
    }

    async findMediaByPropertyId(propertyId) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('property_id', sql.UniqueIdentifier, propertyId)
            .query('SELECT * FROM PropertyMedia WHERE property_id = @property_id ORDER BY created_at ASC');
        return result.recordset;
    }

    async create(propertyData) {
        const pool = await poolPromise;
        const request = pool.request();

        request.input('seller_id', sql.UniqueIdentifier, propertyData.seller_id);
        request.input('title', sql.NVarChar, propertyData.title);
        request.input('property_type_id', sql.UniqueIdentifier, propertyData.property_type_id);
        request.input('asking_price', sql.Decimal(18, 2), propertyData.asking_price);
        request.input('size_sqft', sql.Decimal(18, 2), propertyData.size_sqft);
        request.input('location_city', sql.NVarChar, propertyData.location_city);
        request.input('location_state', sql.NVarChar, propertyData.location_state);
        request.input('location_district', sql.NVarChar, propertyData.location_district);
        request.input('Area', sql.NVarChar, propertyData.Area || '');
        request.input('Pincode', sql.NVarChar, propertyData.Pincode || '');
        request.input('contact_email', sql.NVarChar, propertyData.contact_email || null);
        request.input('contact_phone', sql.NVarChar, propertyData.contact_phone || null);
        request.input('property_story', sql.NVarChar, propertyData.property_story || null);
        request.input('property_age', sql.Int, propertyData.property_age ?? null);
        request.input('listing_type', sql.NVarChar, propertyData.listing_type || 'Individual');
 
        const result = await request.query(`
            INSERT INTO Properties (
                seller_id, title, property_type_id, asking_price, size_sqft,
                location_city, location_state, location_district, Area, Pincode, contact_email,
                contact_phone, property_story, property_age, listing_type
            )
            OUTPUT inserted.*
            VALUES (
                @seller_id, @title, @property_type_id, @asking_price, @size_sqft,
                @location_city, @location_state, @location_district, @Area, @Pincode, @contact_email,
                @contact_phone, @property_story, @property_age, @listing_type
            )
        `);
        return this.findById(result.recordset[0].id);
    }

    async update(id, propertyData) {
        const pool = await poolPromise;
        const request = pool.request();
        request.input('id', sql.UniqueIdentifier, id);

        const allowedKeys = [
            'title', 'property_type_id', 'asking_price', 'size_sqft',
            'location_city', 'location_state', 'location_district', 'Area', 'Pincode',
            'contact_email', 'contact_phone', 'property_story', 'property_age', 'status',
            'is_visible', 'is_featured', 'listing_type',
        ];

        const updateClauses = [];
        for (const key of allowedKeys) {
            if (propertyData[key] === undefined) continue;

            let value = propertyData[key];

            if (key === 'asking_price' || key === 'size_sqft') {
                request.input(key, sql.Decimal(18, 2), value);
            } else if (key === 'property_age') {
                request.input(key, sql.Int, value);
            } else if (key === 'property_type_id') {
                request.input(key, sql.UniqueIdentifier, value);
            } else if (key === 'is_visible' || key === 'is_featured') {
                const boolVal = value === true || value === 1 || value === '1' || value === 'true';
                request.input(key, sql.Bit, boolVal ? 1 : 0);
            } else {
                request.input(key, sql.NVarChar, value);
            }
            updateClauses.push(`${key} = @${key}`);
        }

        if (updateClauses.length === 0) {
            return this.findById(id);
        }

        updateClauses.push('updated_at = GETDATE()');

        await request.query(`
            UPDATE Properties
            SET ${updateClauses.join(', ')}
            WHERE id = @id
        `);
        return this.findById(id);
    }

    async delete(id) {
        const pool = await poolPromise;
        await pool.request()
            .input('id', sql.UniqueIdentifier, id)
            .query('DELETE FROM Properties WHERE id = @id');
    }

    async findSellerIdByPropertyId(id) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.UniqueIdentifier, id)
            .query('SELECT seller_id FROM Properties WHERE id = @id');
        return result.recordset[0]?.seller_id ?? null;
    }

    async setVerified(id, { status, reason, adminId }) {
        const pool = await poolPromise;

        // Fetch current verification_status for history
        const current = await pool.request()
            .input('id_cur', sql.UniqueIdentifier, id)
            .query('SELECT verification_status FROM Properties WHERE id = @id_cur');
        const previousStatus = current.recordset[0]?.verification_status ?? null;

        const isVerified = status === 'Approved' ? 1 : 0;
        const isVisible = status === 'Approved' ? 1 : 0;

        await pool.request()
            .input('id', sql.UniqueIdentifier, id)
            .input('is_verified', sql.Bit, isVerified)
            .input('is_visible', sql.Bit, isVisible)
            .input('verification_status', sql.NVarChar, status)
            .query(`
                UPDATE Properties
                SET is_verified = @is_verified, is_visible = @is_visible,
                    verification_status = @verification_status, updated_at = GETDATE()
                WHERE id = @id
            `);

        await pool.request()
            .input('property_id', sql.UniqueIdentifier, id)
            .input('previous_status', sql.NVarChar, previousStatus)
            .input('new_status', sql.NVarChar, status)
            .input('reason', sql.NVarChar, reason || null)
            .input('action_by', sql.UniqueIdentifier, adminId)
            .query(`
                INSERT INTO PropertyVerificationHistory (property_id, previous_status, new_status, reason, action_by)
                VALUES (@property_id, @previous_status, @new_status, @reason, @action_by)
            `);

        return this.findById(id);
    }

    async findVerificationHistory(propertyId) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('property_id', sql.UniqueIdentifier, propertyId)
            .query(`
                SELECT pvh.id, pvh.property_id, pvh.previous_status, pvh.new_status,
                       pvh.reason, pvh.created_at,
                       u.first_name AS admin_first_name, u.last_name AS admin_last_name
                FROM PropertyVerificationHistory pvh
                LEFT JOIN Users u ON pvh.action_by = u.id
                WHERE pvh.property_id = @property_id
                ORDER BY pvh.created_at DESC
            `);
        return result.recordset;
    }

    async resubmit(id, sellerId) {
        const pool = await poolPromise;

        const current = await pool.request()
            .input('id_cur', sql.UniqueIdentifier, id)
            .query('SELECT verification_status FROM Properties WHERE id = @id_cur');
        const previousStatus = current.recordset[0]?.verification_status ?? null;

        await pool.request()
            .input('id', sql.UniqueIdentifier, id)
            .input('verification_status', sql.NVarChar, 'Resubmitted')
            .query(`
                UPDATE Properties
                SET verification_status = @verification_status, updated_at = GETDATE()
                WHERE id = @id
            `);

        await pool.request()
            .input('property_id', sql.UniqueIdentifier, id)
            .input('previous_status', sql.NVarChar, previousStatus)
            .input('new_status', sql.NVarChar, 'Resubmitted')
            .input('reason', sql.NVarChar, null)
            .input('action_by', sql.UniqueIdentifier, sellerId)
            .query(`
                INSERT INTO PropertyVerificationHistory (property_id, previous_status, new_status, reason, action_by)
                VALUES (@property_id, @previous_status, @new_status, @reason, @action_by)
            `);

        return this.findById(id);
    }

    async countAll() {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT COUNT(*) AS total FROM Properties');
        return result.recordset[0]?.total ?? 0;
    }
}

module.exports = new PropertyRepository();
