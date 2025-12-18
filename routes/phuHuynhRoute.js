const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/phuhuynh/paymentController');
const gradesCtrl = require('../controllers/phuhuynh/gradesController');
const tuyenSinhController = require('../controllers/phuhuynh/tuyenSinhController');
const phuHuynhCtrl = require('../controllers/phuhuynh/phuHuynhController');
// Route hiển thị trang tổng quan công nợ/thanh toán
router.get('/thanh-toan-hoc-phi', paymentController.showPaymentDashboard);
router.post('/thanh-toan-hoc-phi/initiate', paymentController.initiatePayment);


// // Xem điểm (phụ huynh) - phụ huynh có thể truyền ?hocSinhId=...
// router.get('/:hocSinhId/diem', gradesCtrl.showGradesForParent);

// Xem điểm chi tiết theo học sinh (có thể dùng cho học sinh riêng)
router.get('/diem/:hocSinhId', gradesCtrl.showGradesForStudent);

// Hiển thị form đăng ký tuyển sinh
router.get('/dangky', tuyenSinhController.showFormDangKy);

// Xử lý submit form đăng ký
router.post('/dangky', tuyenSinhController.submitDangKy);

router.get('/xin-nghi-hoc', phuHuynhCtrl.hienThiXinNghi);
router.post('/xin-nghi-hoc', phuHuynhCtrl.xuLyXinNghi); //
module.exports = router;