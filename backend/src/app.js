const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const errorMiddleware = require('./middlewares/errorMiddleware');
require('dotenv').config();

const app = express();

// Middlewares
app.use(express.json());
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:8001',
  process.env.MANAGE_URL,
  'http://localhost:8002',
].filter(Boolean);

const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};

// Handle preflight before any other middleware
app.options(/.*/, cors(corsOptions));
app.use(cors(corsOptions));

app.use(helmet({
    // Allow frontend apps on different origins to embed uploaded images/videos.
    crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use(morgan('dev'));
app.use(cookieParser());

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/properties', require('./routes/propertyRoutes'));
app.use('/api/cities', require('./routes/cityRoutes'));
app.use('/api/locations', require('./routes/locationRoutes'));
app.use('/api/wishlist', require('./routes/wishlistRoutes'));
app.use('/api/enquiries', require('./routes/enquiryRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/property-types', require('./routes/propertyTypeRoutes'));
app.use('/api/property-drafts', require('./routes/propertyDraftRoutes'));
app.use('/api/cms', require('./routes/cmsRoutes'));
app.use('/api/faqs', require('./routes/faqRoutes'));
app.use('/api/contact-info', require('./routes/contactInfoRoutes'));
app.use('/api/careers', require('./routes/careerRoutes'));
app.use('/api/hero-banners', require('./routes/heroBannerRoutes'));
app.use('/api/builders/applications', require('./routes/builderApplicationRoutes'));
app.use('/api/builders', require('./routes/builderRoutes'));
app.use('/api/admin/reviews', require('./routes/adminReviewRoutes'));
app.use('/api/admin/support', require('./routes/adminSupportRoutes'));
app.use('/api/conversations', require('./routes/conversationRoutes'));
app.use('/api/property-chat', require('./routes/propertyChatRoutes'));
app.use('/api/support', require('./routes/supportRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api', require('./routes/propertyFeatureRoutes'));
app.use('/api', require('./routes/chatWidgetRoutes'));

// Health Check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'Rarenest API is running' });
});

app.use(errorMiddleware);

module.exports = app;
