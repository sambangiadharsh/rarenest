const express = require('express');
const router = express.Router();
const {
    getPublishedPage,
    getAdminPage,
    upsertPage,
} = require('../controllers/cmsController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.get('/pages/:pageKey', getPublishedPage);
router.get('/pages/:pageKey/admin', protect, authorize('Admin'), getAdminPage);
router.put('/pages/:pageKey', protect, authorize('Admin'), upsertPage);

module.exports = router;
