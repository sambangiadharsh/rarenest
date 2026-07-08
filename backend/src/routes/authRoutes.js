const express = require('express');
const router = express.Router();
const { register, login, logout, changePassword, forgotPassword, resetPassword, googleLogin } = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.get('/logout', logout);
router.put('/changepassword', protect, changePassword);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/google', googleLogin);

module.exports = router;
