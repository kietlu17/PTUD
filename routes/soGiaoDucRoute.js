const express = require('express');
const router = express.Router();

// ✅ IMPORT ĐÚNG CONTROLLER
const diemThiController = require('../controllers/sogiaoduc/nhapDiemThiController');
const monHocController = require('../controllers/sogiaoduc/quanLyMonHocController');
const xetTuyenController = require('../controllers/sogiaoduc/xetTuyenController'); 
const chiTieuController = require('../controllers/sogiaoduc/chiTieuTuyenSinhController');
const dongboCTRL = require('../controllers/sogiaoduc/dongbo')

const { Truong } = require('../models');

// ✅ Middleware login
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

// Phân thí sinh vào phòng thi (preview) và xác nhận
router.post('/diemthi/phanphong', requireLogin, diemThiController.phanThiSinhPreview);
router.post('/diemthi/phanphong/confirm', requireLogin, diemThiController.phanThiSinhConfirm);

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

/* =========================
   ✅ XÉT TUYỂN
========================= */

// Trang xét tuyển
router.get('/xettuyen', requireLogin, xetTuyenController.showPage);

// Accept hyphenated path as well (legacy/links) and treat as the same page
router.get('/xet-tuyen', requireLogin, xetTuyenController.showPage);

// Tiến hành xét tuyển
router.post('/xettuyen/tienhanh', requireLogin, xetTuyenController.tienHanhXetTuyen);
router.post('/xet-tuyen/tienhanh', requireLogin, xetTuyenController.tienHanhXetTuyen);

// Lưu kết quả trúng tuyển
router.post('/xettuyen/luu', requireLogin, xetTuyenController.luuKetQua);
router.post('/xet-tuyen/luu', requireLogin, xetTuyenController.luuKetQua);

/* =========================
  ✅ CHỈ TIÊU TUYỂN SINH
========================= */
// Trang chỉ tiêu (hiển thị list trường + chỉ tiêu, edit per-trường)
router.get('/chi-tieu', requireLogin, chiTieuController.showPage);
router.get('/chitieutuyensinh', requireLogin, chiTieuController.showPage);

// Lưu chỉ tiêu cho 1 trường
router.post('/chi-tieu/save', requireLogin, chiTieuController.saveChiTieu);
router.post('/chitieutuyensinh/save', requireLogin, chiTieuController.saveChiTieu);

router.post("/tuyensinh/dongbo", dongboCTRL.chayDongBo);
router.get('/dongbo/thisinh', dongboCTRL.viewDongBo);
// router.get('/dongbo/thisinh/lichsu', dongBoCtrl.viewLichSu);

module.exports = router;