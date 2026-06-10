const express = require('express');
const router = express.Router();
const {
    getProperties,
    getProperty,
    createProperty,
    createGuestListing,
    createGuestSellerAccount,
    updateProperty,
    deleteProperty,
    verifyProperty,
    getPropertyVerificationHistory,
    resubmitProperty,
    getPropertyEnquiries,
} = require('../controllers/propertyController');

const { protect, authorize } = require('../middlewares/authMiddleware');

router.use('/:id/media', require('./propertyMediaRoutes'));

router.get('/', getProperties);
router.post('/guest-account', createGuestSellerAccount);
router.post('/guest', createGuestListing);
router.get('/:id', getProperty);

// Protected routes

router.post('/', protect, createProperty);
router.put('/:id', protect, updateProperty);
router.delete('/:id', protect, deleteProperty);
router.put('/:id/verify', protect, authorize('Admin'), verifyProperty);
router.get('/:id/verification-history', protect, getPropertyVerificationHistory);
router.post('/:id/resubmit', protect, resubmitProperty);
router.get('/:id/enquiries', protect, getPropertyEnquiries);

module.exports = router;
