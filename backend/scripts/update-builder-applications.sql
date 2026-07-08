-- SQL Script to update the BuilderApplications table with new fields for the wizard.
-- This script safely checks if a column exists before adding it.

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

PRINT 'BuilderApplications table successfully updated with new fields.';
