const express = require('express');
const router = express.Router();
const lopController = require('../controllers/admin/chuyenLopCTRL');
const userController = require('../controllers/admin/accountCTRL');

// Quản lý lớp
// Lấy danh sách lớp + giáo viên chủ nhiệm
router.get('/quanlylop', lopController.getAllLop);

// Lấy danh sách học sinh trong 1 lớp
router.get('/quanlylop/:id/hocsinh', lopController.getHocSinhByLop);

// Hiển thị form chuyển lớp cho 1 học sinh
router.get('/quanlylop/hocsinh/:id/chuyenlop', lopController.showChuyenLopForm);

// Xử lý chuyển lớp
router.post('/quanlylop/hocsinh/:id/chuyenlop', lopController.handleChuyenLop);

// Quản lý tài khoản
router.get('/users',userController.getListRole )

router.get('/users/:roleID',userController.getUsersByRole )
// router.post('/users/:id/password', userController.changePassword);
router.post('/users/reset-password/:id', userController.resetDefaultPassword);
module.exports = router;