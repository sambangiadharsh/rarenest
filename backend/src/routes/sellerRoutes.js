const express = require('express');
const router = express.Router();
const {
    getSellerProfile,
    updateProfile
} = require('../controllers/sellerController');

const { protect, authorize } = require('../middlewares/authMiddleware');

router.get('/:id', getSellerProfile);
router.post('/profile', protect, authorize('Seller', 'Admin'), updateProfile);

module.exports = router;
