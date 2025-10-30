const express = require('express');
const router = express.Router();
const diemdanhController = require('../controllers/diemdanhController');
const hanhkiem = require('../controllers/hanhkiem');

// Hiển thị danh sách lớp giáo viên dạy
router.get('/diemdanh/:id/lop', diemdanhController.showClasses);

// Hiển thị danh sách học sinh trong lớp để điểm danh
router.get('/diemdanh/:id/lop/:lopId', diemdanhController.getHocSinhByLop);

// Gửi form điểm danh
router.post('/diemdanh/:id/lop/:lopId', diemdanhController.submitAttendance);

// Hiển thị danh sách lớp giáo viên chủ nhiệm
router.get('/hanhkiem/:giaovienId/lop', hanhkiem.showClasses);

// Hiển thị danh sách học sinh trong lớp để nhập hạnh kiểm
router.get('/hanhkiem/:giaovienId/lop/:lopId', hanhkiem.getHocSinhByLop);

// Xử lý lưu hạnh kiểm
router.post('/hanhkiem/:giaovienId/lop/:lopId', hanhkiem.submitHanhKiem);

module.exports = router;
