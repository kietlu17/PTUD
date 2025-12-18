const express = require('express');
const router = express.Router();
const dangkynhaphocCTRL = require('../controllers/hocsinh/dangkynhaphocCTRL')
const nopBaiController = require('../controllers/hocsinh/nopBaiController')
const tkbController = require('../controllers/hocsinh/tkb')
const diem = require('../controllers/hocsinh/gradesController')
router.get('/nhaphoc/tohop', dangkynhaphocCTRL.viewForm);
router.post('/nhaphoc/tohop', dangkynhaphocCTRL.submit);



// Import cấu hình upload file (File bạn đã tạo trong thư mục config)
const upload = require('../config/uploadBaiNopConfig'); 

// 1. Xem danh sách bài tập
router.get('/bai-tap', nopBaiController.hienThiDanhSachBaiTap);

// 2. Xem chi tiết & Form nộp bài
router.get('/nop-bai/:idBaiTap', nopBaiController.hienThiFormNopBai);

// 3. Xử lý nộp bài (POST) - Có middleware upload.single('fileBaiLam')
router.post('/nop-bai/:idBaiTap', upload.single('fileBaiLam'), nopBaiController.xuLyNopBai);

router.get('/thoikhoabieu', tkbController.viewTKBHocSinh);

router.get('/diem/:hocSinhId', diem.showGradesForStudent);
module.exports = router;