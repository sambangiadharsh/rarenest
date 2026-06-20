const { poolPromise } = require("../src/config/db");

async function run() {
    try {
        console.log("Connecting to database...");
        const pool = await poolPromise;

        console.log("Creating StateName index...");
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Locations_StateName' AND object_id = OBJECT_ID('Locations'))
            BEGIN
                CREATE INDEX IX_Locations_StateName ON Locations(StateName);
                PRINT 'Index IX_Locations_StateName created.';
            END
            ELSE
            BEGIN
                PRINT 'Index IX_Locations_StateName already exists.';
            END
        `);

        console.log("Creating DistrictName index...");
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Locations_DistrictName' AND object_id = OBJECT_ID('Locations'))
            BEGIN
                CREATE INDEX IX_Locations_DistrictName ON Locations(DistrictName);
                PRINT 'Index IX_Locations_DistrictName created.';
            END
            ELSE
            BEGIN
                PRINT 'Index IX_Locations_DistrictName already exists.';
            END
        `);

        console.log("Creating CityName index...");
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Locations_CityName' AND object_id = OBJECT_ID('Locations'))
            BEGIN
                CREATE INDEX IX_Locations_CityName ON Locations(CityName);
                PRINT 'Index IX_Locations_CityName created.';
            END
            ELSE
            BEGIN
                PRINT 'Index IX_Locations_CityName already exists.';
            END
        `);

        console.log("Database indexes verification/creation completed successfully.");
        process.exit(0);
    } catch (err) {
        console.error("Index creation failed:", err);
        process.exit(1);
    }
}

run();
