// routes/phuHuynhRoute.js
const express = require('express');
const router = express.Router();
const phuHuynhCtrl = require('../controllers/phuhuynh/phuHuynhController');
const paymentController = require('../controllers/phuhuynh/paymentController');
const gradesCtrl = require('../controllers/phuhuynh/gradesController');

router.get('/xin-nghi-hoc', phuHuynhCtrl.hienThiXinNghi);
router.post('/xin-nghi-hoc', phuHuynhCtrl.xuLyXinNghi); //
// Các route khác giữ nguyên tiền tố tương ứng
router.get('/thanh-toan-hoc-phi', paymentController.showPaymentDashboard);
router.get('/diem/:hocSinhId', gradesCtrl.showGradesForStudent);

module.exports = router;