const express = require('express');
const router = express.Router();
const lopController = require('../controllers/admin/chuyenLopCTRL');
const userController = require('../controllers/admin/accountCTRL');
const classController = require('../controllers/admin/classController');
const scheduleController = require('../controllers/admin/scheduleController');

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

// Search endpoint must be placed before the param route to avoid being captured as roleID
router.get('/users/search', userController.searchUsers )
router.get('/users/:roleID',userController.getUsersByRole )
// router.post('/users/:id/password', userController.changePassword);
router.post('/users/reset-password/:id', userController.resetDefaultPassword);

//Tạo lớp
router.get('/classes/create', classController.showCreateForm);
router.post('/classes/preview', classController.preview);
router.post('/classes/confirm-create',  classController.createClasses);

//Tạo Thời khóa biểu 
router.get('/thoikhoabieu', scheduleController.getListClasses);
router.get('/thoikhoabieu/create', scheduleController.getCreatePage);
router.post('/thoikhoabieu/save', scheduleController.saveSchedule);

module.exports = router;