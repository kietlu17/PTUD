const express = require('express');
const router = express.Router();

// Import các Controller
const diemdanhController = require('../controllers/giaovien/diemdanhController');
const hanhkiem = require('../controllers/giaovien/hanhkiem');
const baitapController = require('../controllers/giaovien/baitapController');

// Import Middleware Upload
const upload = require('../config/uploadConfig');

// ==========================================
// 1. QUẢN LÝ ĐIỂM DANH
// ==========================================

// Hiển thị danh sách lớp giáo viên dạy để chọn điểm danh
router.get('/diemdanh/:id/lop', diemdanhController.showClasses);

// Hiển thị danh sách học sinh trong lớp để thực hiện điểm danh
router.get('/diemdanh/:id/lop/:lopId', diemdanhController.getHocSinhByLop);

// Xử lý lưu dữ liệu điểm danh
router.post('/diemdanh/:id/lop/:lopId', diemdanhController.submitAttendance);


// ==========================================
// 2. QUẢN LÝ HẠNH KIỂM
// ==========================================

// Hiển thị danh sách lớp giáo viên chủ nhiệm
router.get('/hanhkiem/:giaovienId/lop', hanhkiem.showClasses);


// Hiển thị danh sách học sinh để nhập hạnh kiểm
//router.get('/hanhkiem/:giaovienId/lop/:lopId', hanhkiem.getHocSinhByLop);

// Xử lý lưu hạnh kiểm
//router.post('/hanhkiem/:giaovienId/lop/:lopId', hanhkiem.submitHanhKiem);

// ==========================================
// 3. GIAO BÀI TẬP (Chức năng mới)
// ==========================================

// Bước 1: Hiển thị danh sách các lớp phụ trách để chọn
router.get('/giao-bai-tap', baitapController.hienThiDanhSachLop);

// Bước 2: Hiển thị form nhập liệu cho 1 lớp cụ thể 
// (:idPhanCong là ID của bảng BangPhanCongGiaoVien)
router.get('/giao-bai-tap/:idPhanCong', baitapController.hienThiFormGiaoBai);

// Bước 3: Xử lý lưu bài tập vào CSDL (Có hỗ trợ upload file)
router.post('/giao-bai-tap/:idPhanCong', upload.single('fileBaiTap'), baitapController.luuBaiTap);


// ==========================================
// 4. CÁC CHỨC NĂNG KHÁC (Placeholder)
// ==========================================
// Thêm các route này để tránh lỗi 404 khi bấm vào menu Dashboard

router.get('/profile', (req, res) => {
    // Render trang thông tin cá nhân (nếu bạn đã làm view này)
    res.render('giaovien/profile', { user: req.session.user });
});

router.get('/thongbao', (req, res) => {
    // Render trang thông báo
    res.render('giaovien/thongbao');
});

module.exports = router;