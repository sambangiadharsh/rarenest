const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/authMiddleware');
const {
    getCategories,
    getGroupedFeatures,
    getPropertyFeatures,
    createCategory,
    updateCategory,
    createFeature,
    updateFeature,
    savePropertyFeatures,
    getFeatures,
} = require('../controllers/propertyFeatureController');

// Categories
router.get('/property-feature-categories', getCategories);
router.post('/property-feature-categories', protect, authorize('Admin'), createCategory);
router.put('/property-feature-categories/:id', protect, authorize('Admin'), updateCategory);

// Features
router.get('/property-features/grouped', getGroupedFeatures);
router.get('/property-features', getFeatures);
router.post('/property-features', protect, authorize('Admin'), createFeature);
router.put('/property-features/:id', protect, authorize('Admin'), updateFeature);

// Mappings
router.get('/properties/:propertyId/features', getPropertyFeatures);
router.post('/properties/:propertyId/features', protect, savePropertyFeatures);

module.exports = router;
