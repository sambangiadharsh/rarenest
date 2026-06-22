-- Rarenest Database Schema

-- 1. Users Table
CREATE TABLE Users (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    email NVARCHAR(255) UNIQUE NOT NULL,
    password_hash NVARCHAR(MAX) NOT NULL,
    first_name NVARCHAR(100),
    last_name NVARCHAR(100),
    phone NVARCHAR(20),
    address NVARCHAR(MAX),
     
    role NVARCHAR(20)
    CHECK (role IN ('User', 'Admin'))
    DEFAULT 'User', 
    reset_password_token NVARCHAR(MAX),
    reset_password_expire DATETIME,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE()
);

-- 2. BuilderProfiles Table


CREATE TABLE BuilderProfiles(
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    user_id UNIQUEIDENTIFIER NOT NULL,
    bio NVARCHAR(MAX),
    average_rating DECIMAL(3, 2) DEFAULT 0,
    total_reviews INT DEFAULT 0,
    builder_status NVARCHAR(20) NOT NULL DEFAULT 'Pending' CHECK (builder_status IN ('Pending', 'Approved', 'Rejected')),
    approved_by UNIQUEIDENTIFIER NULL,
    approved_at DATETIME NULL,
    is_featured BIT NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES Users(id)
);

-- 2.1 BuilderApplications Table
CREATE TABLE BuilderApplications (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    user_id UNIQUEIDENTIFIER NOT NULL,
    company_name NVARCHAR(255) NOT NULL,
    company_description NVARCHAR(MAX) NOT NULL,
    status NVARCHAR(20) NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected')),
    reviewed_by UNIQUEIDENTIFIER NULL,
    reviewed_at DATETIME NULL,
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by) REFERENCES Users(id)
);


-- 3. Properties Table
CREATE TABLE Properties (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    seller_id UNIQUEIDENTIFIER NOT NULL,
    title NVARCHAR(255) NOT NULL,
    property_type_id UNIQUEIDENTIFIER,
    asking_price DECIMAL(18, 2),
    size_sqft DECIMAL(10, 2),
    location_city NVARCHAR(100),
    
    location_state NVARCHAR(100),
    location_district NVARCHAR(100),
    Area NVARCHAR(100) NOT NULL DEFAULT '',
    Pincode NVARCHAR(10) NOT NULL DEFAULT ''

    contact_email NVARCHAR(255),
    contact_phone NVARCHAR(20),
    property_story NVARCHAR(MAX),
    property_age INT NULL,
    
    status NVARCHAR(20) CHECK (status IN ('Available', 'Sold', 'Pending')) DEFAULT 'Avail,able',
    is_featured BIT NOT NULL DEFAULT 0,
    verification_status NVARCHAR(30)
DEFAULT 'PendingReview',
    is_verified BIT DEFAULT 0,
    is_visible BIT DEFAULT 1,
    listing_type NVARCHAR(50) NOT NULL DEFAULT 'Individual' CHECK (listing_type IN ('Individual', 'BuilderProject')),
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (seller_id) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (property_type_id)
REFERENCES PropertyTypes(id)
);

--Locations table

CREATE TABLE Locations (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),

    StateName NVARCHAR(100) NOT NULL,
    DistrictName NVARCHAR(100) NULL,
    CityName NVARCHAR(100) NULL,

    CreatedAt DATETIME DEFAULT GETDATE(),

    CONSTRAINT UQ_Location
        UNIQUE(StateName, DistrictName, CityName)
);
 

--Property feature category table
 CREATE TABLE PropertyFeatureCategories (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),

    Name NVARCHAR(100) NOT NULL,
    DisplayOrder INT DEFAULT 0,
    IsActive BIT DEFAULT 1,

    CreatedBy UNIQUEIDENTIFIER NULL,
    UpdatedBy UNIQUEIDENTIFIER NULL,

    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME NULL,

    FOREIGN KEY (CreatedBy) REFERENCES Users(Id),
    FOREIGN KEY (UpdatedBy) REFERENCES Users(Id)
);


--Property features table
CREATE TABLE PropertyFeatures (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),

    CategoryId UNIQUEIDENTIFIER NOT NULL,
    Name NVARCHAR(150) NOT NULL,

    IsPopular BIT DEFAULT 0,
    DisplayOrder INT DEFAULT 0,
    IsActive BIT DEFAULT 1,

    CreatedBy UNIQUEIDENTIFIER NULL,
    UpdatedBy UNIQUEIDENTIFIER NULL,

    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME NULL,

    FOREIGN KEY (CategoryId) REFERENCES PropertyFeatureCategories(Id),
    FOREIGN KEY (CreatedBy) REFERENCES Users(Id),
    FOREIGN KEY (UpdatedBy) REFERENCES Users(Id)
);


--FeatureMapping table 

CREATE TABLE PropertyFeatureMappings (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    PropertyId UNIQUEIDENTIFIER NOT NULL,
    FeatureId UNIQUEIDENTIFIER NOT NULL,

    UNIQUE(PropertyId, FeatureId),

    FOREIGN KEY (PropertyId) REFERENCES Properties(Id),
    FOREIGN KEY (FeatureId) REFERENCES PropertyFeatures(Id)
);

-- 4. PropertyMedia Table
CREATE TABLE PropertyMedia (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    property_id UNIQUEIDENTIFIER NOT NULL,
    media_url NVARCHAR(MAX) NOT NULL,
    media_type NVARCHAR(20) CHECK (media_type IN ('Image', 'Video')),
    is_thumbnail BIT DEFAULT 0,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (property_id) REFERENCES Properties(id) ON DELETE CASCADE
);

-- 5. Wishlist Table
CREATE TABLE Wishlist (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    user_id UNIQUEIDENTIFIER NOT NULL,
    property_id UNIQUEIDENTIFIER NOT NULL,
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES Users(id),
    FOREIGN KEY (property_id) REFERENCES Properties(id) ON DELETE CASCADE,
    UNIQUE (user_id, property_id)
);

-- 6. BuilderReviews Table
CREATE TABLE BuilderReviews (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),

    builder_id UNIQUEIDENTIFIER NOT NULL,
    reviewer_id UNIQUEIDENTIFIER NOT NULL,

    rating INT NOT NULL
        CHECK (rating BETWEEN 1 AND 5),

    comment NVARCHAR(1000),

    status NVARCHAR(20) NOT NULL DEFAULT 'Pending' ---currenlty default value to be approved later version we can make it as pending state
        CHECK (status IN ('Pending', 'Approved', 'Rejected')),

    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    reviewed_by UNIQUEIDENTIFIER NULL,
reviewed_at DATETIME NULL,

    FOREIGN KEY (builder_id)
        REFERENCES BuilderProfiles(id),

    FOREIGN KEY (reviewer_id)
        REFERENCES Users(id),
    FOREIGN KEY (reviewed_by)
        REFERENCES Users(id),

    UNIQUE (builder_id, reviewer_id)
);



-- 7. Enquiries Table
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

--8.CMS table
CREATE TABLE CMSPages (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),

    page_key NVARCHAR(100) UNIQUE NOT NULL,

    title NVARCHAR(255) NOT NULL,

    content NVARCHAR(MAX) NOT NULL,

    meta_title NVARCHAR(255),

    meta_description NVARCHAR(MAX),

    status NVARCHAR(20)
    CHECK (status IN ('Draft', 'Published'))
    DEFAULT 'Published',

    created_by UNIQUEIDENTIFIER,

    updated_by UNIQUEIDENTIFIER,

    created_at DATETIME2 DEFAULT SYSDATETIME(),

    updated_at DATETIME2 DEFAULT SYSDATETIME(),

    FOREIGN KEY (created_by) REFERENCES Users(id),

    FOREIGN KEY (updated_by) REFERENCES Users(id)
);

--9.Faqs table

CREATE TABLE FAQs (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),

    question NVARCHAR(MAX) NOT NULL,

    answer NVARCHAR(MAX) NOT NULL,

    

    is_active BIT DEFAULT 1,

    created_at DATETIME2 DEFAULT SYSDATETIME(),

    updated_at DATETIME2 DEFAULT SYSDATETIME()
);

--10.contact-info table

CREATE TABLE ContactInfo (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),

    support_email NVARCHAR(255),

    support_phone NVARCHAR(20),

    office_address NVARCHAR(MAX),

    facebook_url NVARCHAR(MAX),

    instagram_url NVARCHAR(MAX),

    linkedin_url NVARCHAR(MAX),

    twitter_url NVARCHAR(MAX),

    updated_by UNIQUEIDENTIFIER,

    updated_at DATETIME2 DEFAULT SYSDATETIME(),

    FOREIGN KEY (updated_by) REFERENCES Users(id)
);

-- 12. HeroBanners Table
CREATE TABLE HeroBanners (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),

    title NVARCHAR(255) NOT NULL,
    subtitle NVARCHAR(500),

    image_url NVARCHAR(1000) NOT NULL,

    display_order INT NOT NULL DEFAULT 1,
    is_active BIT NOT NULL DEFAULT 1,

    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETDATE()
);

--11 Careers table

CREATE TABLE Careers (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),

    title NVARCHAR(255) NOT NULL,

    department NVARCHAR(100),

    location NVARCHAR(100),

    employment_type NVARCHAR(50),

    experience_level NVARCHAR(100),

    description NVARCHAR(MAX),

    requirements NVARCHAR(MAX),

    salary_range NVARCHAR(100),

    application_email NVARCHAR(255),

    status NVARCHAR(20)
    CHECK (status IN ('Open', 'Closed'))
    DEFAULT 'Open',

    created_by UNIQUEIDENTIFIER,

    updated_by UNIQUEIDENTIFIER,

    created_at DATETIME2 DEFAULT SYSDATETIME(),

    updated_at DATETIME2 DEFAULT SYSDATETIME(),

    FOREIGN KEY (created_by) REFERENCES Users(id),

    FOREIGN KEY (updated_by) REFERENCES Users(id)
);

--12 PropertyTypes table

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


--13 .PropertyVerificationHistpry table

CREATE TABLE PropertyVerificationHistory (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),

    property_id UNIQUEIDENTIFIER NOT NULL,

    previous_status NVARCHAR(30),

    new_status NVARCHAR(30) NOT NULL,

    reason NVARCHAR(1000),

    action_by UNIQUEIDENTIFIER NOT NULL,

    created_at DATETIME DEFAULT GETDATE(),

    FOREIGN KEY(property_id)
        REFERENCES Properties(id),

    FOREIGN KEY(action_by)
        REFERENCES Users(id)
);
