const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/phuhuynh/paymentController');
const gradesCtrl = require('../controllers/phuhuynh/gradesController');
// Route hiển thị trang tổng quan công nợ/thanh toán
router.get('/thanh-toan-hoc-phi', paymentController.showPaymentDashboard);
router.post('/thanh-toan-hoc-phi/initiate', paymentController.initiatePayment);


// Xem điểm (phụ huynh) - phụ huynh có thể truyền ?hocSinhId=...
router.get('/:phuHuynhId/diem', gradesCtrl.showGradesForParent);

// Xem điểm chi tiết theo học sinh (có thể dùng cho học sinh riêng)
router.get('/:hocSinhId/diem', gradesCtrl.showGradesForStudent);
module.exports = router;