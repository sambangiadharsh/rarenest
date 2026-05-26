const { poolPromise, sql } = require('../config/db');

class FaqRepository {
    async findAll({ activeOnly = false } = {}) {
        const pool = await poolPromise;
        let where = '';
        if (activeOnly) {
            where = 'WHERE is_active = 1';
        }
        const result = await pool.request().query(`
            SELECT id, question, answer, is_active, created_at, updated_at
            FROM FAQs
            ${where}
            ORDER BY created_at ASC
        `);
        return result.recordset;
    }

    async findById(id) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.UniqueIdentifier, id)
            .query(`
                SELECT id, question, answer, is_active, created_at, updated_at
                FROM FAQs WHERE id = @id
            `);
        return result.recordset[0] || null;
    }

    async create({ question, answer, is_active }) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('question', sql.NVarChar, question)
            .input('answer', sql.NVarChar, answer)
            .input('is_active', sql.Bit, is_active ? 1 : 0)
            .query(`
                INSERT INTO FAQs (question, answer, is_active)
                OUTPUT INSERTED.id, INSERTED.question, INSERTED.answer, INSERTED.is_active,
                       INSERTED.created_at, INSERTED.updated_at
                VALUES (@question, @answer, @is_active)
            `);
        return result.recordset[0];
    }

    async update(id, data) {
        const pool = await poolPromise;
        const fields = [];
        const request = pool.request().input('id', sql.UniqueIdentifier, id);

        if (data.question !== undefined) {
            fields.push('question = @question');
            request.input('question', sql.NVarChar, data.question);
        }
        if (data.answer !== undefined) {
            fields.push('answer = @answer');
            request.input('answer', sql.NVarChar, data.answer);
        }
        if (data.is_active !== undefined) {
            fields.push('is_active = @is_active');
            request.input('is_active', sql.Bit, data.is_active ? 1 : 0);
        }

        fields.push('updated_at = SYSDATETIME()');

        const result = await request.query(`
            UPDATE FAQs SET ${fields.join(', ')}
            OUTPUT INSERTED.id, INSERTED.question, INSERTED.answer, INSERTED.is_active,
                   INSERTED.created_at, INSERTED.updated_at
            WHERE id = @id
        `);
        return result.recordset[0] || null;
    }

    async delete(id) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.UniqueIdentifier, id)
            .query('DELETE FROM FAQs WHERE id = @id');
        return result.rowsAffected[0] > 0;
    }
}

module.exports = new FaqRepository();
