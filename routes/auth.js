const express = require('express');
const router = express.Router();
const auth = require('../controllers/authController');

// router.get('/register', auth.showRegister);
router.post('/account/re-password/:id', auth.changePassword);
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
            Truong: giaovien.truong ?.name || 'Chưa cập nhật'
        }
    });
});

router.get('/dashboard-hocsinh', (req, res) => {
  if (!req.session.user || req.session.user.role !== 'học sinh') {
    return res.redirect('/login');
  }
  const dataHocSinh = req.session.user.profile; // Đặt tên khác đi 1 chút cho đỡ nhầm

  res.render('hocsinh/dashboard-hocsinh', {
      // SỬA TÊN BIẾN NÀY THÀNH CHỮ THƯỜNG
      hocsinh: { 
        ...dataHocSinh,
        lop: dataHocSinh.lop || { TenLop: 'Chưa cập nhật' }, // Xử lý nếu null
        truong: dataHocSinh.truong || { TenTruong: 'Chưa cập nhật' }
      },
      currentPage: '/dashboard-hocsinh'
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
                Lop: phuHuynh.hocsinh ?.lop ?.TenLop || 'Chưa cập nhật',
                Truong: phuHuynh.hocsinh ?.truong ?.name || 'Chưa cập nhật',
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
            Truong: admin.truong ?.name || 'Chưa cập nhật'
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
            Truong: bangiamhieu.truong ?.name || 'Chưa cập nhật'
        }
    });
});

module.exports = router;