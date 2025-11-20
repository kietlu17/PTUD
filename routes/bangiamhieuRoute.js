const express = require('express');
const router = express.Router();
const phancongController = require('../controllers/bangiamhieu/phancongController');

// Đường dẫn: /bangiamhieu/phan-cong
router.get('/phancong', phancongController.getPhanCongPage);
router.post('/phancong', phancongController.savePhanCong);

module.exports = router;