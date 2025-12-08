const express = require('express');
const router = express.Router();
const diemdanhController = require('../controllers/giaovien/diemdanhController');
const hanhkiem = require('../controllers/giaovien/hanhkiem');
const baitapController = require('../controllers/giaovien/baitapController');
const chamBaiController = require('../controllers/giaovien/chamBaiController');
const nhapDiemController = require('../controllers/giaovien/nhapDiemController');
const gradesController = require('../controllers/giaovien/gradesController');
const upload = require('../config/uploadConfig');
// Điểm Danh
// Hiển thị danh sách lớp giáo viên dạy
router.get('/diemdanh/:id/lop', diemdanhController.showClasses);

// Hiển thị danh sách học sinh trong lớp để điểm danh
router.get('/diemdanh/:id/lop/:lopId', diemdanhController.getHocSinhByLop);

// Gửi form điểm danh
router.post('/diemdanh/:id/lop/:lopId', diemdanhController.submitAttendance);
router.get('/diemdanh/:id/lop/:lopId/lich-su', diemdanhController.xemLichSuDiemDanh);
router.get('/diemdanh/:id/lop/:lopId/lich-su/:ngayHoc', diemdanhController.xemChiTietNgay);
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
router.get('/giao-bai-tap/xem/:idPhanCong', baitapController.xemDanhSachBaiDaGiao);
router.get('/giao-bai-tap/xem/:idPhanCong', baitapController.xemDanhSachBaiDaGiao);

// 1. Hiện form sửa
router.get('/giao-bai-tap/sua/:idBaiTap', baitapController.hienThiFormSua);

// 2. Lưu cập nhật (Có upload file)
router.post('/giao-bai-tap/sua/:idBaiTap', upload.single('fileBaiTap'), baitapController.capNhatBaiTap);

// --- CHẤM BÀI ---
router.get('/cham-bai', chamBaiController.dsBaiTapCanCham);
router.get('/cham-bai/:idBaiTap', chamBaiController.chiTietBaiCham);
router.post('/cham-bai/luu-tat-ca/:idBaiTap', chamBaiController.luuDiemBaiTap);

// --- NHẬP ĐIỂM ---
router.get('/nhap-diem', nhapDiemController.hienThiDanhSachLop);
router.get('/nhap-diem/:idPhanCong', nhapDiemController.hienThiBangDiem);
router.post('/nhap-diem/:idPhanCong', nhapDiemController.luuBangDiem);

// XEM ĐIỂM
// GV Bộ môn: Xem điểm lớp mình dạy (chỉ môn mình)
router.get('/xem-diem-bo-mon/:giaovienId', gradesController.xemDiemGVBoMon);

// GVCN: Xem điểm lớp mình (tất cả môn)
router.get('/xem-diem-chu-nhiem/:giaovienId', gradesController.xemDiemGVChuNhiem);

module.exports = router;