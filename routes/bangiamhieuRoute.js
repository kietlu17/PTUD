const express = require('express');
const router = express.Router();
const phancongController = require('../controllers/bangiamhieu/phancongController');
<<<<<<< HEAD

// Đường dẫn: /bangiamhieu/phan-cong
router.get('/phancong', phancongController.getPhanCongPage);
router.post('/phancong', phancongController.savePhanCong);

=======
const phancongcnController = require('../controllers/bangiamhieu/phancongcnController');
// Đường dẫn: /bangiamhieu/phan-cong
router.get('/phancong', phancongController.getPhanCongPage);
router.post('/phancong', phancongController.savePhanCong);
router.get('/getMonHoc/:idLop', phancongController.getMonHocTheoLop);

router.get('/phancongcn', phancongcnController.renderFormGVCN);

// Lưu phân công GVCN
router.post('/phancongcn', phancongcnController.saveGVCN);
>>>>>>> 1f26f04d5f47ef00b6d633733decf4e26684f9b6
module.exports = router;