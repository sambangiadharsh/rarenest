const express = require('express');
const router = express.Router();
const {
    getPropertyTypes,
    getActivePropertyTypes,
    createPropertyType,
} = require('../controllers/propertyTypeController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.get('/active', getActivePropertyTypes);
router.get('/', protect, authorize('Admin'), getPropertyTypes);
router.post('/', protect, authorize('Admin'), createPropertyType);

module.exports = router;
