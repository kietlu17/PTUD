const express = require('express');
const router = express.Router();

const diemThiController = require('../controllers/sogiaoduc/nhapDiemThiController');
const monHocController = require('../controllers/sogiaoduc/quanLyMonHocController');

const { Truong } = require('../models');

// Middleware login
function requireLogin(req, res, next) {
  if (!req.session.user) return res.redirect('/login');
  next();
}

/* =========================
   ✅ DASHBOARD SỞ GIÁO DỤC
========================= */
router.get("/dashboard-sogiaoduc", requireLogin, async (req, res) => {
  try {
    const truongs = await Truong.findAll();

    res.render("sogiaoduc/dashboard-sogiaoduc", {
      profile: req.session.user.profile,
      nhanVien: req.session.user.profile,
      truongs,
      currentUrl: "/dashboard-sogiaoduc"
    });
  } catch (err) {
    console.error("Lỗi dashboard sở:", err);
    res.status(500).send("Lỗi dashboard");
  }
});

/* =========================
   ✅ NHẬP ĐIỂM THI
========================= */

// Trang nhập điểm
router.get('/diemthi', requireLogin, diemThiController.showNhapDiem);

// API lấy phòng
router.get('/diemthi/phongthi/:truongId', requireLogin, diemThiController.getPhongThi);

// API lấy thí sinh
router.get('/diemthi/thisinh/:phongId', requireLogin, diemThiController.getThiSinh);

// API lưu tất cả điểm
router.post('/diemthi/luu-tatca', requireLogin, diemThiController.saveAllScores);

/* =========================
   ✅ QUẢN LÝ MÔN HỌC (SỞ)
========================= */

// Trang quản lý môn học
router.get('/monhoc', requireLogin, monHocController.showPage);

// Thêm môn học
router.post('/monhoc/them', requireLogin, monHocController.themMonHoc);

// Sửa môn học
router.post('/monhoc/sua/:id', requireLogin, monHocController.suaMonHoc);

// Xóa môn học
router.post('/monhoc/xoa/:id', requireLogin, monHocController.xoaMonHoc);

module.exports = router;