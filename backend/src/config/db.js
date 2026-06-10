const sql = require('mssql');
require('dotenv').config();

const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT) || 1433,
    options: {
        encrypt: true, 
        trustServerCertificate: true 
    }
};

const pool = new sql.ConnectionPool(dbConfig);

pool.on('error', (err) => {
    console.error('SQL pool error:', err.message);
});

const poolPromise = pool
    .connect()
    .then(p => {
        console.log('Connected to MS SQL');
        return p;
    })
    .catch(err => {
        console.error('Database Connection Failed! Bad Config: ', err);
        process.exit(1);
    });

module.exports = {
    sql,
    poolPromise
};
