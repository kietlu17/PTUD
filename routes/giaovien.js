const express = require('express');
const router = express.Router();
const diemdanhController = require('../controllers/diemdanhController');

// Hiển thị danh sách lớp giáo viên dạy
router.get('/diemdanh/:id/lop', diemdanhController.showClasses);

// Hiển thị danh sách học sinh trong lớp để điểm danh
router.get('/diemdanh/:id/lop/:lopId', diemdanhController.getHocSinhByLop);

// Gửi form điểm danh
router.post('/diemdanh/:id/lop/:lopId', diemdanhController.submitAttendance);

module.exports = router;
