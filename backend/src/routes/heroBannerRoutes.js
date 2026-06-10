const express = require('express');
const router = express.Router();
const {
    getActiveBanners,
    getAllBanners,
    createBanner,
    updateBanner,
    deleteBanner,
    toggleActive,
    reorderBanners,
} = require('../controllers/heroBannerController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const { uploadBannerImage } = require('../middlewares/uploadMiddleware');

router.get('/', getActiveBanners);
router.get('/admin', protect, authorize('Admin'), getAllBanners);
router.post('/', protect, authorize('Admin'), uploadBannerImage, createBanner);
router.put('/reorder', protect, authorize('Admin'), reorderBanners);
router.put('/:id', protect, authorize('Admin'), uploadBannerImage, updateBanner);
router.patch('/:id/toggle', protect, authorize('Admin'), toggleActive);
router.delete('/:id', protect, authorize('Admin'), deleteBanner);

module.exports = router;
