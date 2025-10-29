const express = require('express');
const router = express.Router();
const auth = require('../controllers/authController');

// router.get('/register', auth.showRegister);
// router.post('/register', auth.register);
router.get('/login', auth.showLogin);
router.post('/login', auth.login);
router.post('/logout', auth.logout);

module.exports = router;
