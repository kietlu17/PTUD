const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/phuhuynh/paymentController');

// Route hiển thị trang tổng quan công nợ/thanh toán
router.get('/thanh-toan-hoc-phi', paymentController.showPaymentDashboard);
router.post('/thanh-toan-hoc-phi/initiate', paymentController.initiatePayment);

module.exports = router;