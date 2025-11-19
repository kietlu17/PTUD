const express = require('express');
const router = express.Router();
const auth = require('../controllers/authController');

// router.get('/register', auth.showRegister);
// router.post('/register', auth.register);
router.get('/login', auth.showLogin);
router.post('/login', auth.login);
router.post('/logout', auth.logout);
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

router.get('/dashboard-hocsinh', (req, res) => {
  if (!req.session.user || req.session.user.role !== 'học sinh') {
    return res.redirect('/login');
  }

  const hocSinh = req.session.user.profile;

  res.render('dashboard-hocsinh', {
                hocSinh: {
                  ...hocSinh,
                  Lop: hocSinh.lop?.TenLop || 'Chưa cập nhật',
                  Truong: hocSinh.truong?.name || 'Chưa cập nhật'
                }
  });
});

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
  console.log(admin)
  res.render('./admin/dashboard-admin', {
              admin: {
                      ...admin,
                  Truong: admin.truong?.name || 'Chưa cập nhật'
                }
  });
});

router.get('/dashboard-sogiaoduc', (req, res) => {
  if (!req.session.user || req.session.user.role !== 'sở giáo dục') {
    return res.redirect('/login');
  }

  const nhanVien = req.session.user.profile;
  console.log(nhanVien)
  res.render('./sogiaoduc/dashboard-sogiaoduc', {nhanVien});
});
module.exports = router;
