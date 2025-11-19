const express = require('express');
const router = express.Router();
const lopController = require('../controllers/admin/chuyenLopCTRL');



// Lấy danh sách lớp + giáo viên chủ nhiệm
router.get('/quanlylop', lopController.getAllLop);

// Lấy danh sách học sinh trong 1 lớp
router.get('/quanlylop/:id/hocsinh', lopController.getHocSinhByLop);

// Hiển thị form chuyển lớp cho 1 học sinh
router.get('/quanlylop/hocsinh/:id/chuyenlop', lopController.showChuyenLopForm);

// Xử lý chuyển lớp
router.post('/quanlylop/hocsinh/:id/chuyenlop', lopController.handleChuyenLop);

module.exports = router;