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
            .query('SELECT id, email, role FROM Users WHERE id = @id');
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
            .query('SELECT id, email, first_name, last_name, phone, address, role, created_at FROM Users WHERE id = @id');
        return result.recordset[0];
    }

    async create(userData) {
        const { email, password_hash, first_name, last_name, phone, address, role } = userData;
        const pool = await poolPromise;
        const result = await pool.request()
            .input('email', sql.NVarChar, email)
            .input('password', sql.NVarChar, password_hash)
            .input('first_name', sql.NVarChar, first_name)
            .input('last_name', sql.NVarChar, last_name)
            .input('phone', sql.NVarChar, phone)
            .input('address', sql.NVarChar, address)
            .input('role', sql.NVarChar, role || 'Buyer')
            .query(`
                INSERT INTO Users (email, password_hash, first_name, last_name, phone, address, role)
                OUTPUT inserted.id, inserted.email, inserted.role, inserted.first_name, inserted.last_name
                VALUES (@email, @password, @first_name, @last_name, @phone, @address, @role)
            `);
        return result.recordset[0];
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
                    reset_password_expire = NULL 
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
                    address = COALESCE(@address, address)
                OUTPUT inserted.id, inserted.email, inserted.first_name, inserted.last_name, inserted.phone, inserted.address, inserted.role
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

    async countAll() {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT COUNT(*) AS total FROM Users');
        return result.recordset[0]?.total ?? 0;
    }
}

module.exports = new UserRepository();
