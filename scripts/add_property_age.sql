-- Run once on existing databases to add property_age
IF NOT EXISTS (
    SELECT 1
    FROM sys.columns
    WHERE object_id = OBJECT_ID(N'Properties')
      AND name = 'property_age'
)
BEGIN
    ALTER TABLE Properties ADD property_age INT NULL;
END
