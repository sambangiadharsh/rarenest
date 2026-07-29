const { poolPromise, sql } = require('../config/db');

class UserRepository {
    async findByEmail(email) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('email', sql.NVarChar, email)
            .query('SELECT * FROM Users WHERE email = @email');
        return result.recordset[0];
    }

    async findById(id) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.UniqueIdentifier, id)
            .query('SELECT * FROM Users WHERE id = @id');
        return result.recordset[0];
    }

    async findAuthFieldsById(id) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.UniqueIdentifier, id)
            .query('SELECT id, email, role, first_name, last_name FROM Users WHERE id = @id');
        return result.recordset[0];
    }

    async findRoleById(id) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.UniqueIdentifier, id)
            .query('SELECT role FROM Users WHERE id = @id');
        return result.recordset[0]?.role ?? null;
    }

    async findProfileById(id) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.UniqueIdentifier, id)
            .query('SELECT id, email, first_name, last_name, phone, address, role, created_at, updated_at FROM Users WHERE id = @id');
        return result.recordset[0];
    }

    async create(userData) {
        const { email, password_hash, first_name, last_name, phone, address, role, provider, google_id, profile_image } = userData;
        const pool = await poolPromise;
        const result = await pool.request()
            .input('email', sql.NVarChar, email)
            .input('password', sql.NVarChar, password_hash || null)
            .input('first_name', sql.NVarChar, first_name || null)
            .input('last_name', sql.NVarChar, last_name || null)
            .input('phone', sql.NVarChar, phone || null)
            .input('address', sql.NVarChar, address || null)
            .input('role', sql.NVarChar, role || 'User')
            .input('provider', sql.NVarChar, provider || 'local')
            .input('google_id', sql.NVarChar, google_id || null)
            .input('profile_image', sql.NVarChar, profile_image || null)
            .query(`
                INSERT INTO Users (email, password_hash, first_name, last_name, phone, address, role, provider, google_id, profile_image)
                OUTPUT inserted.id, inserted.email, inserted.role, inserted.first_name, inserted.last_name, inserted.provider, inserted.google_id, inserted.profile_image
                VALUES (@email, @password, @first_name, @last_name, @phone, @address, @role, @provider, @google_id, @profile_image)
            `);
        return result.recordset[0];
    }

    async linkGoogleAccount(userId, googleId, profileImage) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.UniqueIdentifier, userId)
            .input('google_id', sql.NVarChar, googleId)
            .input('profile_image', sql.NVarChar, profileImage || null)
            .query(`
                UPDATE Users
                SET google_id = @google_id,
                    provider = 'google',
                    profile_image = COALESCE(@profile_image, profile_image),
                    updated_at = GETDATE()
                OUTPUT inserted.id, inserted.email, inserted.role, inserted.first_name, inserted.last_name, inserted.provider, inserted.google_id, inserted.profile_image
                WHERE id = @id
            `);
        return result.recordset[0];
    }

    async updateLastLogin(userId) {
        const pool = await poolPromise;
        await pool.request()
            .input('id', sql.UniqueIdentifier, userId)
            .query(`
                UPDATE Users
                SET updated_at = GETDATE()
                WHERE id = @id
            `);
    }

    async updateResetToken(userId, hashedToken, expireDate) {
        const pool = await poolPromise;
        await pool.request()
            .input('id', sql.UniqueIdentifier, userId)
            .input('token', sql.NVarChar, hashedToken)
            .input('expire', sql.DateTime, expireDate)
            .query(`
                UPDATE Users 
                SET reset_password_token = @token, reset_password_expire = @expire 
                WHERE id = @id
            `);
    }

    async findByResetToken(hashedToken) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('token', sql.NVarChar, hashedToken)
            .input('now', sql.DateTime, new Date())
            .query(`
                SELECT * FROM Users 
                WHERE reset_password_token = @token AND reset_password_expire > @now
            `);
        return result.recordset[0];
    }

    async updatePassword(userId, hashedPassword) {
        const pool = await poolPromise;
        await pool.request()
            .input('id', sql.UniqueIdentifier, userId)
            .input('password', sql.NVarChar, hashedPassword)
            .query(`
                UPDATE Users
                SET password_hash = @password,
                    reset_password_token = NULL,
                    reset_password_expire = NULL,
                    updated_at = GETDATE()
                WHERE id = @id
            `);
    }

    async updateProfile(userId, profileData) {
        const { first_name, last_name, phone, address } = profileData;
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.UniqueIdentifier, userId)
            .input('first_name', sql.NVarChar, first_name)
            .input('last_name', sql.NVarChar, last_name)
            .input('phone', sql.NVarChar, phone)
            .input('address', sql.NVarChar, address)
            .query(`
                UPDATE Users
                SET first_name = COALESCE(@first_name, first_name),
                    last_name = COALESCE(@last_name, last_name),
                    phone = COALESCE(@phone, phone),
                    address = COALESCE(@address, address),
                    updated_at = GETDATE()
                OUTPUT inserted.id, inserted.email, inserted.first_name, inserted.last_name,
                       inserted.phone, inserted.address, inserted.role, inserted.updated_at
                WHERE id = @id
            `);
        return result.recordset[0];
    }

    async updateRole(userId, role) {
        const pool = await poolPromise;
        await pool.request()
            .input('id', sql.UniqueIdentifier, userId)
            .input('role', sql.NVarChar, role)
            .query('UPDATE Users SET role = @role WHERE id = @id');
    }

    async findAdmins() {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT id, email, first_name, last_name
            FROM Users
            WHERE role = 'Admin'
            ORDER BY first_name, last_name
        `);
        return result.recordset;
    }

    async countAll() {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT COUNT(*) AS total FROM Users');
        return result.recordset[0]?.total ?? 0;
    }
}

module.exports = new UserRepository();
