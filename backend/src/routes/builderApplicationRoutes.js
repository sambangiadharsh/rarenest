const express = require('express');
const router = express.Router();
const {
    submitApplication,
    getMyApplication,
    getAllApplications,
    reviewApplication
} = require('../controllers/builderApplicationController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.post('/', protect, submitApplication);
router.get('/my', protect, getMyApplication);
router.get('/', protect, authorize('Admin'), getAllApplications);
router.put('/:id', protect, authorize('Admin'), reviewApplication);

module.exports = router;
