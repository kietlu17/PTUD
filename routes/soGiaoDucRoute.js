const express = require('express');
const router = express.Router();
const controller = require('../controllers/sogiaoduc/nhapDiemThiController');
const { Truong } = require('../models');

function requireLogin(req, res, next) {
  if (!req.session.user) return res.redirect('/login');
  next();
}

// Dashboard sở — URL đúng: /dashboard-sogiaoduc
router.get("/dashboard-sogiaoduc", requireLogin, async (req, res) => {
    const truongs = await Truong.findAll();

    res.render("sogiaoduc/dashboard-sogiaoduc", {
        profile: req.session.user.profile,
        nhanVien: req.session.user.profile,
        truongs,
        currentUrl: "/dashboard-sogiaoduc"
    });
});

// Trang nhập điểm
router.get('/diemthi', requireLogin, controller.showNhapDiem);

// API lấy phòng
router.get('/diemthi/phongthi/:truongId', controller.getPhongThi);

// API lấy thí sinh
router.get('/diemthi/thisinh/:phongId', controller.getThiSinh);

// API lưu tất cả điểm
router.post('/diemthi/luu-tatca', controller.saveAllScores);

module.exports = router;
