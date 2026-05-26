const express = require('express');
const router = express.Router();
const {
    getContactInfo,
    upsertContactInfo,
} = require('../controllers/contactInfoController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.get('/', getContactInfo);
router.put('/', protect, authorize('Admin'), upsertContactInfo);

module.exports = router;
