const express = require('express');
const router = express.Router();
const {
    getActiveFaqs,
    getAllFaqs,
    createFaq,
    updateFaq,
    deleteFaq,
} = require('../controllers/faqController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.get('/', getActiveFaqs);
router.get('/admin', protect, authorize('Admin'), getAllFaqs);
router.post('/', protect, authorize('Admin'), createFaq);
router.put('/:id', protect, authorize('Admin'), updateFaq);
router.delete('/:id', protect, authorize('Admin'), deleteFaq);

module.exports = router;
