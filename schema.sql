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
    role NVARCHAR(20) CHECK (role IN ('Buyer', 'Seller', 'Admin')) DEFAULT 'Buyer',
    reset_password_token NVARCHAR(MAX),
    reset_password_expire DATETIME,
    created_at DATETIME DEFAULT GETDATE()
);

-- 2. SellerProfiles Table
CREATE TABLE SellerProfiles (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    user_id UNIQUEIDENTIFIER NOT NULL,
    bio NVARCHAR(MAX),
    average_rating DECIMAL(3, 2) DEFAULT 0,
    total_reviews INT DEFAULT 0,
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
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
   

    contact_email NVARCHAR(255),
    contact_phone NVARCHAR(20),
    property_story NVARCHAR(MAX),
    property_age INT NULL,
    special_features NVARCHAR(MAX), -- Store as JSON string or text
    status NVARCHAR(20) CHECK (status IN ('Available', 'Sold', 'Pending')) DEFAULT 'Available',
    is_verified BIT DEFAULT 0,
    is_visible BIT DEFAULT 1,
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (seller_id) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (property_type_id)
REFERENCES PropertyTypes(id)
);

-- 4. PropertyMedia Table
CREATE TABLE PropertyMedia (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    property_id UNIQUEIDENTIFIER NOT NULL,
    media_url NVARCHAR(MAX) NOT NULL,
    media_type NVARCHAR(20) CHECK (media_type IN ('Image', 'Video')),
    is_thumbnail BIT DEFAULT 0,
    created_at DATETIME DEFAULT GETDATE(),
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

-- 6. Reviews Table
CREATE TABLE Reviews (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),

    property_id UNIQUEIDENTIFIER NOT NULL,
    seller_id UNIQUEIDENTIFIER NOT NULL,
    buyer_id UNIQUEIDENTIFIER NOT NULL,

    rating INT
    CHECK (rating BETWEEN 1 AND 5)
    NOT NULL,

    comment NVARCHAR(1000),

    is_verified_purchase BIT DEFAULT 0,

    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),

    FOREIGN KEY (property_id)
    REFERENCES Properties(id)
    ON DELETE CASCADE,

    FOREIGN KEY (seller_id)
    REFERENCES Users(id),

    FOREIGN KEY (buyer_id)
    REFERENCES Users(id),

    UNIQUE (property_id, buyer_id)
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

    created_at DATETIME2 DEFAULT SYSDATETIME(),

    updated_at DATETIME2 DEFAULT SYSDATETIME()
);

--12 PropertyTypes table

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

