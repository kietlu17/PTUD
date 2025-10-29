const express = require('express');
const router = express.Router();
const lopController = require('../controllers/lopController');


function requireLogin(req, res, next) {
  if (!req.session.user) return res.redirect('/login');
  next();
}
// Lấy danh sách lớp + giáo viên chủ nhiệm
router.get('/quanlylop', requireLogin, lopController.getAllLop);

// Lấy danh sách học sinh trong 1 lớp
router.get('/quanlylop/:id/hocsinh', lopController.getHocSinhByLop);

// Hiển thị form chuyển lớp cho 1 học sinh
router.get('/quanlylop/hocsinh/:id/chuyenlop', lopController.showChuyenLopForm);

// Xử lý chuyển lớp
router.post('/quanlylop/hocsinh/:id/chuyenlop', lopController.handleChuyenLop);

module.exports = router;