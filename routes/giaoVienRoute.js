const express = require('express');
const router = express.Router();
const diemdanhController = require('../controllers/giaovien/diemdanhController');
const hanhkiem = require('../controllers/giaovien/hanhkiem');
const baitapController = require('../controllers/giaovien/baitapController');
const statisticsController = require('../controllers/statisticsController');

const upload = require('../config/uploadConfig');
// Điểm Danh
// Hiển thị danh sách lớp giáo viên dạy
router.get('/diemdanh/:id/lop', diemdanhController.showClasses);

// Hiển thị danh sách học sinh trong lớp để điểm danh
router.get('/diemdanh/:id/lop/:lopId', diemdanhController.getHocSinhByLop);

// Gửi form điểm danh
router.post('/diemdanh/:id/lop/:lopId', diemdanhController.submitAttendance);

// Hạnh Kiểm
// Hiển thị danh sách lớp giáo viên chủ nhiệm
router.get('/hanhkiem/:giaovienId/lop', hanhkiem.showClasses);

// Hiển thị danh sách học sinh trong lớp để nhập hạnh kiểm
// router.get('/hanhkiem/:giaovienId/lop/:lopId', hanhkiem.getHocSinhByLop);

// Xử lý lưu hạnh kiểm
router.post('/hanhkiem/:giaovienId/lop/:lopId', hanhkiem.submitHanhKiem);


// 3. GIAO BÀI TẬP (Chức năng mới)
// ==========================================

// Bước 1: Hiển thị danh sách các lớp phụ trách để chọn
router.get('/giao-bai-tap', baitapController.hienThiDanhSachLop);

// Bước 2: Hiển thị form nhập liệu cho 1 lớp cụ thể 
// (:idPhanCong là ID của bảng BangPhanCongGiaoVien)
router.get('/giao-bai-tap/:idPhanCong', baitapController.hienThiFormGiaoBai);

// Bước 3: Xử lý lưu bài tập vào CSDL (Có hỗ trợ upload file)
router.post('/giao-bai-tap/:idPhanCong', upload.single('fileBaiTap'), baitapController.luuBaiTap);

router.get('/thongke', statisticsController.getStatisticsPage);
router.post('/thongke/get-data', statisticsController.getStatisticsData);

module.exports = router;
