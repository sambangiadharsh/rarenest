const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, updateRole } = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');

router.use(protect); // All user routes are protected

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.patch('/role', updateRole);

module.exports = router;
