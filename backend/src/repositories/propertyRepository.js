const { poolPromise, sql } = require('../config/db');

const PROPERTY_SELECT = `
    SELECT p.*, pt.name AS property_type_name
    FROM Properties p
    LEFT JOIN PropertyTypes pt ON p.property_type_id = pt.id
`;

class PropertyRepository {
    async findAll(filters = {}) {
        const { city, type, minPrice, maxPrice, minSize, maxSize, seller_id, is_verified } = filters;
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

        if (!isPortfolioQuery) {
            request.input('is_visible', sql.Bit, 1);
            query += ' AND p.is_visible = @is_visible';
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

        const specialFeatures = propertyData.special_features != null
            ? (Array.isArray(propertyData.special_features)
                ? JSON.stringify(propertyData.special_features)
                : propertyData.special_features)
            : null;

        request.input('seller_id', sql.UniqueIdentifier, propertyData.seller_id);
        request.input('title', sql.NVarChar, propertyData.title);
        request.input('property_type_id', sql.UniqueIdentifier, propertyData.property_type_id);
        request.input('asking_price', sql.Decimal(18, 2), propertyData.asking_price);
        request.input('size_sqft', sql.Decimal(18, 2), propertyData.size_sqft);
        request.input('location_city', sql.NVarChar, propertyData.location_city);
        request.input('location_state', sql.NVarChar, propertyData.location_state);
        request.input('location_district', sql.NVarChar, propertyData.location_district);
        request.input('contact_email', sql.NVarChar, propertyData.contact_email || null);
        request.input('contact_phone', sql.NVarChar, propertyData.contact_phone || null);
        request.input('property_story', sql.NVarChar, propertyData.property_story || null);
        request.input('special_features', sql.NVarChar, specialFeatures);

        const result = await request.query(`
            INSERT INTO Properties (
                seller_id, title, property_type_id, asking_price, size_sqft,
                location_city, location_state, location_district, contact_email,
                contact_phone, property_story, special_features
            )
            OUTPUT inserted.*
            VALUES (
                @seller_id, @title, @property_type_id, @asking_price, @size_sqft,
                @location_city, @location_state, @location_district, @contact_email,
                @contact_phone, @property_story, @special_features
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
            'location_city', 'location_state', 'location_district',
            'contact_email', 'contact_phone', 'property_story', 'special_features', 'status',
            'is_visible',
        ];

        const updateClauses = [];
        for (const key of allowedKeys) {
            if (propertyData[key] === undefined) continue;

            let value = propertyData[key];
            if (key === 'special_features' && value != null) {
                value = Array.isArray(value) ? JSON.stringify(value) : value;
            }

            if (key === 'asking_price' || key === 'size_sqft') {
                request.input(key, sql.Decimal(18, 2), value);
            } else if (key === 'property_type_id') {
                request.input(key, sql.UniqueIdentifier, value);
            } else if (key === 'is_visible') {
                const visible = value === true || value === 1 || value === '1' || value === 'true';
                request.input(key, sql.Bit, visible ? 1 : 0);
            } else {
                request.input(key, sql.NVarChar, value);
            }
            updateClauses.push(`${key} = @${key}`);
        }

        if (updateClauses.length === 0) {
            return this.findById(id);
        }

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

    async setVerified(id, isVerified) {
        const verified =
            isVerified === true || isVerified === 1 || isVerified === '1' || isVerified === 'true';
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.UniqueIdentifier, id)
            .input('is_verified', sql.Bit, verified ? 1 : 0)
            .query(`
                UPDATE Properties
                SET is_verified = @is_verified
                OUTPUT inserted.*
                WHERE id = @id
            `);
        return this.findById(result.recordset[0].id);
    }

    async countAll() {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT COUNT(*) AS total FROM Properties');
        return result.recordset[0]?.total ?? 0;
    }
}

module.exports = new PropertyRepository();
