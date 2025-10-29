const express = require('express');
const router = express.Router();

// Middleware kiểm tra đăng nhập (nếu có)
const requireLogin = (req, res, next) => {
  if (!req.session || !req.session.user) {
    return res.redirect('/login');
  }
  next();
};

// Route hiển thị trang Dashboard Nhân Viên Sở
router.get('/', requireLogin, (req, res) => {
  res.render('dashboard-sogiaoduc', {
    nhanVien: req.session.user
  });
});

module.exports = router;
