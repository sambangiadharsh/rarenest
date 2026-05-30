const express = require('express');
const router = express.Router();
const {
    getOpenCareers,
    getOpenCareerById,
    getAllCareers,
    createCareer,
    updateCareer,
    deleteCareer,
} = require('../controllers/careerController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.get('/admin', protect, authorize('Admin'), getAllCareers);
router.get('/:id', getOpenCareerById);
router.get('/', getOpenCareers);
router.post('/', protect, authorize('Admin'), createCareer);
router.put('/:id', protect, authorize('Admin'), updateCareer);
router.delete('/:id', protect, authorize('Admin'), deleteCareer); // No need to delete career

module.exports = router;
