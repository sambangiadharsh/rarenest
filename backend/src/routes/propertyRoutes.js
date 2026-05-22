const express = require('express');
const router = express.Router();
const {
    getProperties,
    getProperty,
    createProperty,
    updateProperty,
    deleteProperty,
    verifyProperty
} = require('../controllers/propertyController');

const { protect, authorize } = require('../middlewares/authMiddleware');

router.use('/:id/media', require('./propertyMediaRoutes'));

router.get('/', getProperties);
router.get('/:id', getProperty);

// Protected routes

router.post('/', protect, createProperty);
router.put('/:id', protect, updateProperty);
router.delete('/:id', protect, deleteProperty);
router.put('/:id/verify', protect, authorize('Admin'), verifyProperty);

module.exports = router;
