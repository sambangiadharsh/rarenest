const express = require('express');
const router = express.Router();
const {
    getAllBuilders,
    getBuilderProfile,
    getBuilderByUser,
    submitReview,
    getBuilderReviews,
    toggleFeatured,
} = require('../controllers/builderController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.get('/', getAllBuilders);
router.get('/by-user/:userId', getBuilderByUser);
router.get('/:builderId', getBuilderProfile);
router.get('/:builderId/reviews', getBuilderReviews);
router.post('/:builderId/reviews', protect, submitReview);
router.patch('/:builderId/featured', protect, authorize('Admin'), toggleFeatured);

module.exports = router;
