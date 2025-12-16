const express = require('express');
const router = express.Router();
const auth = require('../controllers/authController');
const checkDangKyToHop = require('../middlewares/checkDKTHM');
const tuyenSinhController = require('../controllers/phuhuynh/tuyenSinhController');
const tuyensinhctr = require('../controllers/tuyensinhCtrl')
const middlewares = require('../middlewares/checkTuyenSinhLogin')
const controller = require('../controllers/importdata')
const { render } = require('ejs');
// router.get('/register', auth.showRegister);
router.post('/account/re-password/:id', auth.changePassword);
router.get('/login', auth.showLogin);
router.post('/login', auth.login);
router.post('/logout', auth.logout);

router.get("/import-hoc-sinh", controller.importHocSinh);

// Trang login tuyển sinh
router.get('/tuyensinh/login', (req, res) => {
  res.render('./phuhuynh/dangky/login');
});

// Xử lý login
router.post('/tuyensinh/login', tuyensinhctr.loginTuyenSinh);

// Hiển thị form đăng ký tuyển sinh
router.get('/dangky', middlewares,tuyenSinhController.showFormDangKy);
// Xử lý submit form đăng ký
router.post('/dangky', tuyenSinhController.submitDangKy);


router.get('/doi-mat-khau-lan-dau', (req, res) => {
  if(!req.session.user){
    return res.redirect('/login');
  }
  res.render('repassword', {user : req.session.user})
})

router.get('/dashboard-giaovien', (req, res) => {
  if (!req.session.user || req.session.user.role !== 'giáo viên') {
    return res.redirect('/login');
  }
  const giaovien = req.session.user.profile;
  res.render('./giaovien/dashboard-giaovien', {
    giaovien: {
      ...giaovien,
      Truong: giaovien.truong?.name || 'Chưa cập nhật'
    }
  });
});

router.get('/dashboard-hocsinh',(req, res) => {
    if (!req.session.user || req.session.user.role !== 'học sinh') {
    return res.redirect('/login');
    }
  const hocSinh = req.session.user.profile;
  if (hocSinh.id_tohopmon === null) {
    // Chưa chọn tổ hợp → check thời hạn đăng ký
    return checkDangKyToHop(req, res, () => {
      // Nếu hết hạn, checkDangKyToHop sẽ render hethandk hoặc redirect
      // Nếu trong hạn, redirect sang form chọn tổ hợp
      return res.redirect('/nhaphoc/tohop');
    });
  }
      res.render('./hocsinh/dashboard-hocsinh', {
                    hocSinh: {
                      ...hocSinh,
                      Lop: hocSinh.lop?.TenLop || 'Chưa cập nhật',
                      Truong: hocSinh.truong?.name || 'Chưa cập nhật'
                    }
      });


}, );

router.get('/dashboard-phuhuynh', (req, res) => {
  if (!req.session.user || req.session.user.role !== 'phụ huynh') {
    return res.redirect('/login');
  }
  const phuHuynh = req.session.user.profile;
  res.render('./phuhuynh/dashboard-phuhuynh', {
              phuHuynh: {
                ...phuHuynh,
                hocSinhLienQuan: {
                  ...phuHuynh.hocsinh,
                  Lop: phuHuynh.hocsinh?.lop?.TenLop || 'Chưa cập nhật',
                  Truong: phuHuynh.hocsinh?.truong?.name || 'Chưa cập nhật',
                }
              }
  });
});

router.get('/dashboard-admin', (req, res) => {
  if (!req.session.user || req.session.user.role !== 'admin') {
    return res.redirect('/login');
  }
  const admin = req.session.user.profile;
  res.render('./admin/dashboard-admin', {
              admin: {
                      ...admin,
                  Truong: admin.truong?.name || 'Chưa cập nhật'
                },
  });
});

router.get('/dashboard-sogiaoduc', (req, res) => {
  if (!req.session.user || req.session.user.role !== 'sở giáo dục') {
    return res.redirect('/login');
  }
  // redirect to the mounted sogiaoduc router which provides `truongs` and
  // other data needed by the view
  res.redirect('/sogiaoduc/dashboard-sogiaoduc');
});
router.get('/dashboard-bangiamhieu', (req, res) => {
  if (!req.session.user || req.session.user.role !== 'ban giám hiệu') {
    return res.redirect('/login');
  }

  const bangiamhieu = req.session.user.profile;

  res.render('./bangiamhieu/dashboard-bangiamhieu', {
    bangiamhieu: {
      ...bangiamhieu,
      Truong: bangiamhieu.truong?.name || 'Chưa cập nhật'
    }
  });
});

module.exports = router;
