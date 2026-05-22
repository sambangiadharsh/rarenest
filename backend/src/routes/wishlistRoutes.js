const express = require('express');
const router = express.Router();
const {
    addToWishlist,
    getWishlist,
    removeFromWishlist
} = require('../controllers/wishlistController');

const { protect } = require('../middlewares/authMiddleware');

router.use(protect); // All wishlist routes are protected

router.get('/', getWishlist);
router.post('/:property_id', addToWishlist);
router.delete('/:property_id', removeFromWishlist);

module.exports = router;
