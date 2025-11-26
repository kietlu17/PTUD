const express = require('express');
const router = express.Router();
const phancongController = require('../controllers/bangiamhieu/phancongController');
const phancongcnController = require('../controllers/bangiamhieu/phancongcnController');
// Đường dẫn: /bangiamhieu/phan-cong
router.get('/phancong', phancongController.getPhanCongPage);
router.post('/phancong', phancongController.savePhanCong);
router.get('/getMonHoc/:idLop', phancongController.getMonHocTheoLop);

router.get('/phancongcn', phancongcnController.renderFormGVCN);

// Lưu phân công GVCN
router.post('/phancongcn', phancongcnController.saveGVCN);
module.exports = router;