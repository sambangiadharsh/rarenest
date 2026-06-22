const { poolPromise, sql } = require('../config/db');

const CATEGORY_SELECT_FIELDS = `
    pfc.Id, pfc.Name, pfc.DisplayOrder, pfc.IsActive,
    pfc.CreatedBy, pfc.UpdatedBy, pfc.CreatedAt, pfc.UpdatedAt,
    LTRIM(RTRIM(CONCAT(creator.first_name, ' ', creator.last_name))) AS created_by_name,
    LTRIM(RTRIM(CONCAT(updater.first_name, ' ', updater.last_name))) AS updated_by_name
`;

const CATEGORY_FROM_JOIN = `
    FROM PropertyFeatureCategories pfc
    LEFT JOIN Users creator ON pfc.CreatedBy = creator.id
    LEFT JOIN Users updater ON pfc.UpdatedBy = updater.id
`;

const FEATURE_SELECT_FIELDS = `
    pf.Id, pf.CategoryId, pf.Name, pf.IsPopular, pf.DisplayOrder, pf.IsActive,
    pf.CreatedBy, pf.UpdatedBy, pf.CreatedAt, pf.UpdatedAt,
    pfc.Name AS category_name,
    LTRIM(RTRIM(CONCAT(creator.first_name, ' ', creator.last_name))) AS created_by_name,
    LTRIM(RTRIM(CONCAT(updater.first_name, ' ', updater.last_name))) AS updated_by_name
`;

const FEATURE_FROM_JOIN = `
    FROM PropertyFeatures pf
    LEFT JOIN PropertyFeatureCategories pfc ON pf.CategoryId = pfc.Id
    LEFT JOIN Users creator ON pf.CreatedBy = creator.id
    LEFT JOIN Users updater ON pf.UpdatedBy = updater.id
`;

class PropertyFeatureRepository {
    // ─── CATEGORIES ───

    async findAllCategories() {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT ${CATEGORY_SELECT_FIELDS}
            ${CATEGORY_FROM_JOIN}
            ORDER BY pfc.DisplayOrder ASC, pfc.Name ASC
        `);
        return result.recordset;
    }

    async findActiveCategories() {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT Id, Name, DisplayOrder
            FROM PropertyFeatureCategories
            WHERE IsActive = 1
            ORDER BY DisplayOrder ASC, Name ASC
        `);
        return result.recordset;
    }

    async findCategoryById(id) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.UniqueIdentifier, id)
            .query(`
                SELECT ${CATEGORY_SELECT_FIELDS}
                ${CATEGORY_FROM_JOIN}
                WHERE pfc.Id = @id
            `);
        return result.recordset[0] || null;
    }

    async createCategory({ name, display_order, created_by }) {
        const pool = await poolPromise;
        try {
            const result = await pool.request()
                .input('name', sql.NVarChar, name)
                .input('display_order', sql.Int, display_order || 0)
                .input('created_by', sql.UniqueIdentifier, created_by)
                .query(`
                    INSERT INTO PropertyFeatureCategories (Name, DisplayOrder, CreatedBy, UpdatedBy)
                    OUTPUT INSERTED.Id
                    VALUES (@name, @display_order, @created_by, @created_by)
                `);
            return this.findCategoryById(result.recordset[0].Id);
        } catch (err) {
            if (err.number === 2627 || err.number === 2601) {
                const duplicateError = new Error('Category already exists');
                duplicateError.statusCode = 400;
                throw duplicateError;
            }
            throw err;
        }
    }

    async updateCategory(id, data) {
        const pool = await poolPromise;
        const fields = [];
        const request = pool.request()
            .input('id', sql.UniqueIdentifier, id)
            .input('updated_by', sql.UniqueIdentifier, data.updated_by);

        fields.push('UpdatedBy = @updated_by');

        if (data.name !== undefined) {
            fields.push('Name = @name');
            request.input('name', sql.NVarChar, data.name);
        }
        if (data.is_active !== undefined) {
            fields.push('IsActive = @is_active');
            request.input('is_active', sql.Bit, data.is_active ? 1 : 0);
        }
        if (data.display_order !== undefined) {
            fields.push('DisplayOrder = @display_order');
            request.input('display_order', sql.Int, data.display_order);
        }

        fields.push('UpdatedAt = SYSDATETIME()');

        try {
            const result = await request.query(`
                UPDATE PropertyFeatureCategories SET ${fields.join(', ')}
                OUTPUT INSERTED.Id
                WHERE Id = @id
            `);
            if (!result.recordset[0]) {
                return null;
            }
            return this.findCategoryById(id);
        } catch (err) {
            if (err.number === 2627 || err.number === 2601) {
                const duplicateError = new Error('Category already exists');
                duplicateError.statusCode = 400;
                throw duplicateError;
            }
            throw err;
        }
    }

    // ─── FEATURES ───

    async findAllFeatures() {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT ${FEATURE_SELECT_FIELDS}
            ${FEATURE_FROM_JOIN}
            ORDER BY pfc.DisplayOrder ASC, pfc.Name ASC, pf.DisplayOrder ASC, pf.Name ASC
        `);
        return result.recordset;
    }

    async findActiveGrouped() {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT pf.Id, pf.CategoryId, pf.Name, pf.IsPopular, pf.DisplayOrder,
                   pfc.Name AS CategoryName, pfc.DisplayOrder AS CategoryDisplayOrder
            FROM PropertyFeatures pf
            INNER JOIN PropertyFeatureCategories pfc ON pf.CategoryId = pfc.Id
            WHERE pf.IsActive = 1 AND pfc.IsActive = 1
            ORDER BY pfc.DisplayOrder ASC, pfc.Name ASC, pf.IsPopular DESC, pf.DisplayOrder ASC, pf.Name ASC
        `);
        return result.recordset;
    }

    async findFeatureById(id) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.UniqueIdentifier, id)
            .query(`
                SELECT ${FEATURE_SELECT_FIELDS}
                ${FEATURE_FROM_JOIN}
                WHERE pf.Id = @id
            `);
        return result.recordset[0] || null;
    }

    async createFeature({ category_id, name, is_popular, display_order, is_active, created_by }) {
        const pool = await poolPromise;
        try {
            const result = await pool.request()
                .input('category_id', sql.UniqueIdentifier, category_id)
                .input('name', sql.NVarChar, name)
                .input('is_popular', sql.Bit, is_popular ? 1 : 0)
                .input('display_order', sql.Int, display_order || 0)
                .input('is_active', sql.Bit, is_active !== false ? 1 : 0)
                .input('created_by', sql.UniqueIdentifier, created_by)
                .query(`
                    INSERT INTO PropertyFeatures (CategoryId, Name, IsPopular, DisplayOrder, IsActive, CreatedBy, UpdatedBy)
                    OUTPUT INSERTED.Id
                    VALUES (@category_id, @name, @is_popular, @display_order, @is_active, @created_by, @created_by)
                `);
            return this.findFeatureById(result.recordset[0].Id);
        } catch (err) {
            if (err.number === 2627 || err.number === 2601) {
                const duplicateError = new Error('Feature already exists');
                duplicateError.statusCode = 400;
                throw duplicateError;
            }
            throw err;
        }
    }

    async updateFeature(id, data) {
        const pool = await poolPromise;
        const fields = [];
        const request = pool.request()
            .input('id', sql.UniqueIdentifier, id)
            .input('updated_by', sql.UniqueIdentifier, data.updated_by);

        fields.push('UpdatedBy = @updated_by');

        if (data.category_id !== undefined) {
            fields.push('CategoryId = @category_id');
            request.input('category_id', sql.UniqueIdentifier, data.category_id);
        }
        if (data.name !== undefined) {
            fields.push('Name = @name');
            request.input('name', sql.NVarChar, data.name);
        }
        if (data.is_popular !== undefined) {
            fields.push('IsPopular = @is_popular');
            request.input('is_popular', sql.Bit, data.is_popular ? 1 : 0);
        }
        if (data.is_active !== undefined) {
            fields.push('IsActive = @is_active');
            request.input('is_active', sql.Bit, data.is_active ? 1 : 0);
        }
        if (data.display_order !== undefined) {
            fields.push('DisplayOrder = @display_order');
            request.input('display_order', sql.Int, data.display_order);
        }

        fields.push('UpdatedAt = SYSDATETIME()');

        try {
            const result = await request.query(`
                UPDATE PropertyFeatures SET ${fields.join(', ')}
                OUTPUT INSERTED.Id
                WHERE Id = @id
            `);
            if (!result.recordset[0]) {
                return null;
            }
            return this.findFeatureById(id);
        } catch (err) {
            if (err.number === 2627 || err.number === 2601) {
                const duplicateError = new Error('Feature already exists');
                duplicateError.statusCode = 400;
                throw duplicateError;
            }
            throw err;
        }
    }

    // ─── MAPPINGS ───

    async findFeaturesByPropertyId(propertyId) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('property_id', sql.UniqueIdentifier, propertyId)
            .query(`
                SELECT pf.Id, pf.Name, pf.CategoryId, pfc.Name AS CategoryName
                FROM PropertyFeatureMappings pfm
                INNER JOIN PropertyFeatures pf ON pfm.FeatureId = pf.Id
                INNER JOIN PropertyFeatureCategories pfc ON pf.CategoryId = pfc.Id
                WHERE pfm.PropertyId = @property_id
            `);
        return result.recordset;
    }

    async findFeaturesByPropertyIds(propertyIds) {
        if (!propertyIds || propertyIds.length === 0) return {};
        const pool = await poolPromise;
        
        const request = pool.request();
        const parameterNames = [];
        propertyIds.forEach((id, idx) => {
            const paramName = `id_${idx}`;
            request.input(paramName, sql.UniqueIdentifier, id);
            parameterNames.push(`@${paramName}`);
        });

        const query = `
            SELECT pfm.PropertyId, pf.Id, pf.Name, pf.CategoryId, pfc.Name AS CategoryName
            FROM PropertyFeatureMappings pfm
            INNER JOIN PropertyFeatures pf ON pfm.FeatureId = pf.Id
            INNER JOIN PropertyFeatureCategories pfc ON pf.CategoryId = pfc.Id
            WHERE pfm.PropertyId IN (${parameterNames.join(', ')})
        `;
        
        const result = await request.query(query);
        const map = {};
        for (const row of result.recordset) {
            const propId = String(row.PropertyId).toLowerCase();
            if (!map[propId]) map[propId] = [];
            map[propId].push({
                Id: row.Id,
                Name: row.Name,
                CategoryId: row.CategoryId,
                CategoryName: row.CategoryName
            });
        }
        return map;
    }

    async savePropertyMappings(propertyId, featureIds) {
        const pool = await poolPromise;
        const transaction = new sql.Transaction(pool);
        await transaction.begin();
        try {
            // Delete old mappings
            await transaction.request()
                .input('property_id', sql.UniqueIdentifier, propertyId)
                .query('DELETE FROM PropertyFeatureMappings WHERE PropertyId = @property_id');

            // Insert new mappings
            if (featureIds && featureIds.length > 0) {
                for (const featureId of featureIds) {
                    await transaction.request()
                        .input('property_id', sql.UniqueIdentifier, propertyId)
                        .input('feature_id', sql.UniqueIdentifier, featureId)
                        .query(`
                            INSERT INTO PropertyFeatureMappings (PropertyId, FeatureId)
                            VALUES (@property_id, @feature_id)
                        `);
                }
            }
            await transaction.commit();
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    }
}

module.exports = new PropertyFeatureRepository();
