const express = require('express');
const router = express.Router();
const { getProfile, updateProfile } = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');

router.use(protect); // All user routes are protected

router.get('/profile', getProfile);
router.put('/profile', updateProfile);

module.exports = router;
