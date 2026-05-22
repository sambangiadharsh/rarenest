const express = require('express');
const router = express.Router();
const { register, login, forgotPassword, resetPassword, logout } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.get('/logout', logout);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);

module.exports = router;
