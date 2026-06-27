IF OBJECT_ID('PropertyDrafts', 'U') IS NULL
BEGIN
    CREATE TABLE PropertyDrafts (
        id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        seller_id UNIQUEIDENTIFIER NOT NULL,
        property_id UNIQUEIDENTIFIER NULL,
        draft_type NVARCHAR(10) NOT NULL
            CHECK (draft_type IN ('Create', 'Edit')),
        current_step INT NOT NULL DEFAULT 1,
        draft_data NVARCHAR(MAX) NOT NULL,
        created_at DATETIME NOT NULL DEFAULT GETDATE(),
        updated_at DATETIME NOT NULL DEFAULT GETDATE(),
        CONSTRAINT FK_PropertyDrafts_Users
            FOREIGN KEY (seller_id) REFERENCES Users(id) ON DELETE CASCADE,
        CONSTRAINT FK_PropertyDrafts_Properties
            FOREIGN KEY (property_id) REFERENCES Properties(id) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = 'UX_PropertyDrafts_Create'
        AND object_id = OBJECT_ID('PropertyDrafts')
)
BEGIN
    CREATE UNIQUE INDEX UX_PropertyDrafts_Create
    ON PropertyDrafts(seller_id, draft_type)
    WHERE draft_type = 'Create' AND property_id IS NULL;
END;

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = 'UX_PropertyDrafts_Edit'
        AND object_id = OBJECT_ID('PropertyDrafts')
)
BEGIN
    CREATE UNIQUE INDEX UX_PropertyDrafts_Edit
    ON PropertyDrafts(seller_id, property_id, draft_type)
    WHERE draft_type = 'Edit' AND property_id IS NOT NULL;
END;

IF OBJECT_ID('PropertyDraftMedia', 'U') IS NULL
BEGIN
    CREATE TABLE PropertyDraftMedia (
        id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        draft_id UNIQUEIDENTIFIER NOT NULL,
        media_url NVARCHAR(MAX) NOT NULL,
        media_type NVARCHAR(20) NOT NULL
            CHECK (media_type IN ('Image', 'Video')),
        is_thumbnail BIT NOT NULL DEFAULT 0,
        sort_order INT NOT NULL DEFAULT 0,
        created_at DATETIME NOT NULL DEFAULT GETDATE(),
        CONSTRAINT FK_PropertyDraftMedia_PropertyDrafts
            FOREIGN KEY (draft_id) REFERENCES PropertyDrafts(id) ON DELETE CASCADE
    );
END;
