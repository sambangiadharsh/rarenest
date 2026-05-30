const { poolPromise } = require('../src/config/db');

async function run() {
    try {
        console.log('Connecting to database...');
        const pool = await poolPromise;

        console.log("Adding 'is_verified' column to Properties if missing...");
        await pool.request().query(`
            IF NOT EXISTS (
                SELECT * FROM sys.columns
                WHERE object_id = OBJECT_ID('Properties') AND name = 'is_verified'
            )
            BEGIN
                ALTER TABLE Properties ADD is_verified BIT NOT NULL DEFAULT 0;
            END
        `);

        console.log('Migrating Reviews table...');
        await pool.request().query(`
            IF NOT EXISTS (
                SELECT * FROM sys.columns
                WHERE object_id = OBJECT_ID('Reviews') AND name = 'property_id'
            )
            BEGIN
                ALTER TABLE Reviews ADD property_id UNIQUEIDENTIFIER NULL;
            END

            IF NOT EXISTS (
                SELECT * FROM sys.columns
                WHERE object_id = OBJECT_ID('Reviews') AND name = 'is_verified_purchase'
            )
            BEGIN
                ALTER TABLE Reviews ADD is_verified_purchase BIT NOT NULL DEFAULT 0;
            END

            IF NOT EXISTS (
                SELECT * FROM sys.columns
                WHERE object_id = OBJECT_ID('Reviews') AND name = 'updated_at'
            )
            BEGIN
                ALTER TABLE Reviews ADD updated_at DATETIME NOT NULL DEFAULT GETDATE();
            END

            IF EXISTS (
                SELECT * FROM sys.columns
                WHERE object_id = OBJECT_ID('Reviews')
                  AND name = 'comment'
                  AND max_length = -1
            )
            BEGIN
                ALTER TABLE Reviews ALTER COLUMN comment NVARCHAR(1000) NULL;
            END

            IF NOT EXISTS (
                SELECT * FROM sys.foreign_keys
                WHERE parent_object_id = OBJECT_ID('Reviews')
                  AND referenced_object_id = OBJECT_ID('Properties')
            )
            BEGIN
                ALTER TABLE Reviews
                ADD CONSTRAINT FK_Reviews_Properties
                FOREIGN KEY (property_id) REFERENCES Properties(id) ON DELETE CASCADE;
            END

            DECLARE @oldUq sysname;
            SELECT @oldUq = kc.name
            FROM sys.key_constraints kc
            INNER JOIN sys.index_columns ic
                ON kc.parent_object_id = ic.object_id AND kc.unique_index_id = ic.index_id
            INNER JOIN sys.columns c
                ON ic.object_id = c.object_id AND ic.column_id = c.column_id
            WHERE kc.parent_object_id = OBJECT_ID('Reviews')
              AND kc.type = 'UQ'
            GROUP BY kc.name
            HAVING SUM(CASE WHEN c.name = 'seller_id' THEN 1 ELSE 0 END) = 1
               AND SUM(CASE WHEN c.name = 'buyer_id' THEN 1 ELSE 0 END) = 1
               AND COUNT(*) = 2;

            IF @oldUq IS NOT NULL
                EXEC('ALTER TABLE Reviews DROP CONSTRAINT [' + @oldUq + ']');

            IF NOT EXISTS (
                SELECT * FROM sys.key_constraints
                WHERE parent_object_id = OBJECT_ID('Reviews')
                  AND name = 'UQ_Reviews_property_buyer'
            )
            BEGIN
                ALTER TABLE Reviews
                ADD CONSTRAINT UQ_Reviews_property_buyer UNIQUE (property_id, buyer_id);
            END
        `);

        console.log('Creating Enquiries table if missing...');
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Enquiries')
            BEGIN
                CREATE TABLE Enquiries (
                    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),

                    from_user_id UNIQUEIDENTIFIER NOT NULL,
                    to_user_id UNIQUEIDENTIFIER NOT NULL,

                    property_id UNIQUEIDENTIFIER NOT NULL,

                    created_at DATETIME DEFAULT GETDATE(),

                    FOREIGN KEY (from_user_id) REFERENCES Users(id),

                    FOREIGN KEY (to_user_id) REFERENCES Users(id),

                    FOREIGN KEY (property_id) REFERENCES Properties(id)
                    ON DELETE CASCADE
                );
            END
        `);

        console.log('Creating Wishlist table if missing...');
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Wishlist')
            BEGIN
                CREATE TABLE Wishlist (
                    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
                    user_id UNIQUEIDENTIFIER NOT NULL,
                    property_id UNIQUEIDENTIFIER NOT NULL,
                    created_at DATETIME DEFAULT GETDATE(),
                    FOREIGN KEY (user_id) REFERENCES Users(id),
                    FOREIGN KEY (property_id) REFERENCES Properties(id) ON DELETE CASCADE,
                    UNIQUE (user_id, property_id)
                );
            END
        `);

        console.log('Creating PropertyTypes table if missing...');
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'PropertyTypes')
            BEGIN
                CREATE TABLE PropertyTypes (
                    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
                    name NVARCHAR(100) UNIQUE NOT NULL,
                    is_active BIT DEFAULT 1,
                    display_order INT DEFAULT 0,
                    created_by UNIQUEIDENTIFIER,
                    created_at DATETIME2 DEFAULT SYSDATETIME(),
                    updated_at DATETIME2 DEFAULT SYSDATETIME(),
                    FOREIGN KEY (created_by) REFERENCES Users(id)
                );
            END
        `);

        console.log('Database schema updated successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Failed to update database schema:', err);
        process.exit(1);
    }
}

run();
