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
            IF EXISTS (SELECT * FROM sys.tables WHERE name = 'Reviews')
            BEGIN
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
                    updated_by UNIQUEIDENTIFIER,
                    created_at DATETIME2 DEFAULT SYSDATETIME(),
                    updated_at DATETIME2 DEFAULT SYSDATETIME(),
                    FOREIGN KEY (created_by) REFERENCES Users(id),
                    FOREIGN KEY (updated_by) REFERENCES Users(id)
                );
            END
        `);

        console.log("Adding 'updated_by' column to PropertyTypes if missing...");
        await pool.request().query(`
            IF NOT EXISTS (
                SELECT * FROM sys.columns
                WHERE object_id = OBJECT_ID('PropertyTypes') AND name = 'updated_by'
            )
            BEGIN
                ALTER TABLE PropertyTypes ADD updated_by UNIQUEIDENTIFIER NULL;
            END

            IF NOT EXISTS (
                SELECT * FROM sys.foreign_keys WHERE name = 'FK_PropertyTypes_updated_by'
            )
            BEGIN
                ALTER TABLE PropertyTypes
                    ADD CONSTRAINT FK_PropertyTypes_updated_by
                    FOREIGN KEY (updated_by) REFERENCES Users(id);
            END
        `);

        // ── New fields ────────────────────────────────────────────────────────

        console.log("Adding 'updated_at' to Users if missing...");
        await pool.request().query(`
            IF NOT EXISTS (
                SELECT * FROM sys.columns
                WHERE object_id = OBJECT_ID('Users') AND name = 'updated_at'
            )
            BEGIN
                ALTER TABLE Users ADD updated_at DATETIME NOT NULL DEFAULT GETDATE();
            END
        `);

        console.log("Adding 'updated_at' to Properties if missing...");
        await pool.request().query(`
            IF NOT EXISTS (
                SELECT * FROM sys.columns
                WHERE object_id = OBJECT_ID('Properties') AND name = 'updated_at'
            )
            BEGIN
                ALTER TABLE Properties ADD updated_at DATETIME NOT NULL DEFAULT GETDATE();
            END
        `);

        console.log("Adding 'updated_at' to PropertyMedia if missing...");
        await pool.request().query(`
            IF NOT EXISTS (
                SELECT * FROM sys.columns
                WHERE object_id = OBJECT_ID('PropertyMedia') AND name = 'updated_at'
            )
            BEGIN
                ALTER TABLE PropertyMedia ADD updated_at DATETIME NOT NULL DEFAULT GETDATE();
            END
        `);

        console.log("Adding 'created_by' and 'updated_by' to Careers if missing...");
        await pool.request().query(`
            IF NOT EXISTS (
                SELECT * FROM sys.columns
                WHERE object_id = OBJECT_ID('Careers') AND name = 'created_by'
            )
            BEGIN
                ALTER TABLE Careers ADD created_by UNIQUEIDENTIFIER NULL;
            END

            IF NOT EXISTS (
                SELECT * FROM sys.columns
                WHERE object_id = OBJECT_ID('Careers') AND name = 'updated_by'
            )
            BEGIN
                ALTER TABLE Careers ADD updated_by UNIQUEIDENTIFIER NULL;
            END

            IF NOT EXISTS (
                SELECT * FROM sys.foreign_keys WHERE name = 'FK_Careers_created_by'
            )
            BEGIN
                ALTER TABLE Careers
                    ADD CONSTRAINT FK_Careers_created_by
                    FOREIGN KEY (created_by) REFERENCES Users(id);
            END

            IF NOT EXISTS (
                SELECT * FROM sys.foreign_keys WHERE name = 'FK_Careers_updated_by'
            )
            BEGIN
                ALTER TABLE Careers
                    ADD CONSTRAINT FK_Careers_updated_by
                    FOREIGN KEY (updated_by) REFERENCES Users(id);
            END
        `);

        console.log('Simplifying user roles and updating tables...');
        await pool.request().query(`
            -- Drop old constraints dynamically first
            DECLARE @ConstraintName nvarchar(200)
            SELECT @ConstraintName = cc.Name 
            FROM sys.check_constraints cc
            INNER JOIN sys.columns col ON cc.parent_column_id = col.column_id AND cc.parent_object_id = col.object_id
            WHERE cc.parent_object_id = object_id('Users') AND col.name = 'role'

            IF @ConstraintName IS NOT NULL
                EXEC('ALTER TABLE Users DROP CONSTRAINT ' + @ConstraintName)

            DECLARE @DefaultConstraintName nvarchar(200)
            SELECT @DefaultConstraintName = d.name
            FROM sys.default_constraints d
            INNER JOIN sys.columns c ON d.parent_column_id = c.column_id AND d.parent_object_id = c.object_id
            WHERE d.parent_object_id = object_id('Users') AND c.name = 'role'

            IF @DefaultConstraintName IS NOT NULL
                EXEC('ALTER TABLE Users DROP CONSTRAINT ' + @DefaultConstraintName)

            -- Recreate new constraints
            IF EXISTS (SELECT * FROM sys.check_constraints WHERE name = 'CK_Users_role')
                ALTER TABLE Users DROP CONSTRAINT CK_Users_role;

            IF EXISTS (SELECT * FROM sys.default_constraints WHERE name = 'DF_Users_role')
                ALTER TABLE Users DROP CONSTRAINT DF_Users_role;

            -- 1. Update roles to simplify (now that constraints are dropped)
            UPDATE Users SET role = 'User' WHERE role <> 'Admin' OR role IS NULL;

            ALTER TABLE Users ADD CONSTRAINT DF_Users_role DEFAULT 'User' FOR role;
            ALTER TABLE Users ADD CONSTRAINT CK_Users_role CHECK (role IN ('User', 'Admin'));

            -- 2. Create BuilderApplications table
            IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'BuilderApplications')
            BEGIN
                CREATE TABLE BuilderApplications (
                    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
                    user_id UNIQUEIDENTIFIER NOT NULL,
                    company_name NVARCHAR(255) NOT NULL,
                    company_description NVARCHAR(MAX) NOT NULL,
                    company_registration_number NVARCHAR(100) NOT NULL,
                    company_logo_url NVARCHAR(500) NULL,
                    website NVARCHAR(255) NULL,
                    contact_person_name NVARCHAR(150) NOT NULL,
                    business_email NVARCHAR(255) NOT NULL,
                    business_phone NVARCHAR(30) NOT NULL,
                    office_address NVARCHAR(MAX) NOT NULL,
                    city NVARCHAR(100) NOT NULL,
                    state NVARCHAR(100) NOT NULL,
                    is_primary_contact BIT NOT NULL DEFAULT 0,
                    business_registration_certificate_url NVARCHAR(500) NOT NULL,
                    applicant_government_id_url NVARCHAR(500) NOT NULL,
                    gst_number NVARCHAR(50) NULL,
                    gst_certificate_url NVARCHAR(500) NULL,
                    rera_number NVARCHAR(50) NULL,
                    rera_certificate_url NVARCHAR(500) NULL,
                    declaration_accepted BIT NOT NULL DEFAULT 0,
                    status NVARCHAR(20) NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected')),
                    reviewed_by UNIQUEIDENTIFIER NULL,
                    reviewed_at DATETIME NULL,
                    created_at DATETIME DEFAULT GETDATE(),
                    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
                    FOREIGN KEY (reviewed_by) REFERENCES Users(id)
                );
            END

            IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('BuilderApplications') AND name = 'company_registration_number')
                ALTER TABLE BuilderApplications ADD company_registration_number NVARCHAR(100) NOT NULL DEFAULT '';
            IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('BuilderApplications') AND name = 'company_logo_url')
                ALTER TABLE BuilderApplications ADD company_logo_url NVARCHAR(500) NULL;
            IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('BuilderApplications') AND name = 'website')
                ALTER TABLE BuilderApplications ADD website NVARCHAR(255) NULL;
            IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('BuilderApplications') AND name = 'contact_person_name')
                ALTER TABLE BuilderApplications ADD contact_person_name NVARCHAR(150) NOT NULL DEFAULT '';
            IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('BuilderApplications') AND name = 'business_email')
                ALTER TABLE BuilderApplications ADD business_email NVARCHAR(255) NOT NULL DEFAULT '';
            IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('BuilderApplications') AND name = 'business_phone')
                ALTER TABLE BuilderApplications ADD business_phone NVARCHAR(30) NOT NULL DEFAULT '';
            IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('BuilderApplications') AND name = 'office_address')
                ALTER TABLE BuilderApplications ADD office_address NVARCHAR(MAX) NOT NULL DEFAULT '';
            IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('BuilderApplications') AND name = 'city')
                ALTER TABLE BuilderApplications ADD city NVARCHAR(100) NOT NULL DEFAULT '';
            IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('BuilderApplications') AND name = 'state')
                ALTER TABLE BuilderApplications ADD state NVARCHAR(100) NOT NULL DEFAULT '';
            IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('BuilderApplications') AND name = 'is_primary_contact')
                ALTER TABLE BuilderApplications ADD is_primary_contact BIT NOT NULL DEFAULT 0;
            IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('BuilderApplications') AND name = 'business_registration_certificate_url')
                ALTER TABLE BuilderApplications ADD business_registration_certificate_url NVARCHAR(500) NOT NULL DEFAULT '';
            IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('BuilderApplications') AND name = 'applicant_government_id_url')
                ALTER TABLE BuilderApplications ADD applicant_government_id_url NVARCHAR(500) NOT NULL DEFAULT '';
            IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('BuilderApplications') AND name = 'gst_number')
                ALTER TABLE BuilderApplications ADD gst_number NVARCHAR(50) NULL;
            IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('BuilderApplications') AND name = 'gst_certificate_url')
                ALTER TABLE BuilderApplications ADD gst_certificate_url NVARCHAR(500) NULL;
            IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('BuilderApplications') AND name = 'rera_number')
                ALTER TABLE BuilderApplications ADD rera_number NVARCHAR(50) NULL;
            IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('BuilderApplications') AND name = 'rera_certificate_url')
                ALTER TABLE BuilderApplications ADD rera_certificate_url NVARCHAR(500) NULL;
            IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('BuilderApplications') AND name = 'declaration_accepted')
                ALTER TABLE BuilderApplications ADD declaration_accepted BIT NOT NULL DEFAULT 0;
            IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('BuilderApplications') AND name = 'social_links')
                ALTER TABLE BuilderApplications ADD social_links NVARCHAR(MAX) NULL;

            -- 3. Update BuilderProfiles
            IF NOT EXISTS (
                SELECT * FROM sys.columns
                WHERE object_id = OBJECT_ID('BuilderProfiles') AND name = 'builder_status'
            )
            BEGIN
                ALTER TABLE BuilderProfiles ADD builder_status NVARCHAR(20) NOT NULL DEFAULT 'Approved' CHECK (builder_status IN ('Pending', 'Approved', 'Rejected'));
            END

            IF NOT EXISTS (
                SELECT * FROM sys.columns
                WHERE object_id = OBJECT_ID('BuilderProfiles') AND name = 'approved_by'
            )
            BEGIN
                ALTER TABLE BuilderProfiles ADD approved_by UNIQUEIDENTIFIER NULL;
            END

            IF NOT EXISTS (
                SELECT * FROM sys.columns
                WHERE object_id = OBJECT_ID('BuilderProfiles') AND name = 'approved_at'
            )
            BEGIN
                ALTER TABLE BuilderProfiles ADD approved_at DATETIME NULL;
            END

            IF NOT EXISTS (
                SELECT * FROM sys.columns
                WHERE object_id = OBJECT_ID('BuilderProfiles') AND name = 'is_featured'
            )
            BEGIN
                ALTER TABLE BuilderProfiles ADD is_featured BIT NOT NULL DEFAULT 0;
            END

            -- 4. Update Properties
            IF NOT EXISTS (
                SELECT * FROM sys.columns
                WHERE object_id = OBJECT_ID('Properties') AND name = 'listing_type'
            )
            BEGIN
                ALTER TABLE Properties ADD listing_type NVARCHAR(50) NOT NULL DEFAULT 'Individual' CHECK (listing_type IN ('Individual', 'BuilderProject'));
            END
        `);

        // Check/Add FK for BuilderProfiles.approved_by if not present
        await pool.request().query(`
            IF NOT EXISTS (
                SELECT * FROM sys.foreign_keys WHERE name = 'FK_BuilderProfiles_approved_by'
            )
            BEGIN
                ALTER TABLE BuilderProfiles
                    ADD CONSTRAINT FK_BuilderProfiles_approved_by
                    FOREIGN KEY (approved_by) REFERENCES Users(id);
            END
        `);

        console.log("Updating Users table for Google Authentication support...");
        // 1. Alter password_hash to be nullable
        await pool.request().query(`
            ALTER TABLE Users ALTER COLUMN password_hash NVARCHAR(MAX) NULL;
        `);

        // 2. Add google_id column if missing, and create filtered index
        await pool.request().query(`
            IF NOT EXISTS (
                SELECT * FROM sys.columns
                WHERE object_id = OBJECT_ID('Users') AND name = 'google_id'
            )
            BEGIN
                ALTER TABLE Users ADD google_id NVARCHAR(255) NULL;
            END
        `);
        await pool.request().query(`
            IF NOT EXISTS (
                SELECT * FROM sys.indexes
                WHERE object_id = OBJECT_ID('Users') AND name = 'UQ_Users_google_id'
            )
            BEGIN
                CREATE UNIQUE NONCLUSTERED INDEX UQ_Users_google_id
                ON Users(google_id)
                WHERE google_id IS NOT NULL;
            END
        `);

        // 3. Add provider column if missing
        await pool.request().query(`
            IF NOT EXISTS (
                SELECT * FROM sys.columns
                WHERE object_id = OBJECT_ID('Users') AND name = 'provider'
            )
            BEGIN
                ALTER TABLE Users ADD provider NVARCHAR(20) DEFAULT 'local';
            END
        `);

        // 4. Add CK constraint for provider if not present
        await pool.request().query(`
            IF NOT EXISTS (
                SELECT * FROM sys.check_constraints
                WHERE parent_object_id = OBJECT_ID('Users') AND name = 'CK_Users_provider'
            )
            BEGIN
                ALTER TABLE Users ADD CONSTRAINT CK_Users_provider CHECK (provider IN ('local', 'google'));
            END
        `);

        // 5. Add profile_image column if missing
        await pool.request().query(`
            IF NOT EXISTS (
                SELECT * FROM sys.columns
                WHERE object_id = OBJECT_ID('Users') AND name = 'profile_image'
            )
            BEGIN
                ALTER TABLE Users ADD profile_image NVARCHAR(MAX) NULL;
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
