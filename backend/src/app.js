const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const app = express();

// Middlewares
app.use(express.json());
const allowedOrigins = [
    process.env.CLIENT_URL || 'http://localhost:5173',
    process.env.ADMIN_URL || 'http://localhost:5174',
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));
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
app.use('/api/wishlist', require('./routes/wishlistRoutes'));
app.use('/api/enquiries', require('./routes/enquiryRoutes'));
app.use('/api/sellers', require('./routes/sellerRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/property-types', require('./routes/propertyTypeRoutes'));
app.use('/api/cms', require('./routes/cmsRoutes'));
app.use('/api/faqs', require('./routes/faqRoutes'));
app.use('/api/contact-info', require('./routes/contactInfoRoutes'));
app.use('/api/careers', require('./routes/careerRoutes'));

// Health Check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'Rarenest API is running' });
});

// Basic Error Handler
app.use((err, req, res, next) => {
    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ success: false, message: 'File too large' });
    }
    if (err.code === 'LIMIT_FILE_COUNT' || err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({ success: false, message: err.message || 'Invalid upload' });
    }
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err.message : {}
    });
});

module.exports = app;
