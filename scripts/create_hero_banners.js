require('dotenv').config({ path: require('path').join(__dirname, '../backend/.env') });
const sql = require('mssql');

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT) || 1433,
    options: { encrypt: true, trustServerCertificate: true },
};

const DDL = `
IF NOT EXISTS (
    SELECT 1 FROM sys.tables WHERE name = 'HeroBanners'
)
BEGIN
    CREATE TABLE HeroBanners (
        id            UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        title         NVARCHAR(255)  NOT NULL,
        subtitle      NVARCHAR(500)  NULL,
        image_url     NVARCHAR(1000) NOT NULL,
        display_order INT            NOT NULL DEFAULT 1,
        is_active     BIT            NOT NULL DEFAULT 1,
        created_at    DATETIME2      NOT NULL DEFAULT GETDATE(),
        updated_at    DATETIME2      NOT NULL DEFAULT GETDATE()
    );
    PRINT 'HeroBanners table created.';
END
ELSE
BEGIN
    PRINT 'HeroBanners table already exists — skipped.';
END
`;

(async () => {
    const pool = await sql.connect(config);
    const result = await pool.request().query(DDL);
    console.log(result.output ?? 'Done.');
    await pool.close();
})().catch(err => {
    console.error('Migration failed:', err.message);
    process.exit(1);
});

