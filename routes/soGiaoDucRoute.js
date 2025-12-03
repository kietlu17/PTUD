const express = require('express');
const router = express.Router();
const Truong = require('../models/Truong');
const PhongThi = require('../models/PhongThi');
const ThiSinh = require('../models/ThiSinh');
const DiemThi = require('../models/DiemThi');

// middleware: kiểm tra đăng nhập
function requireLogin(req, res, next) {
  if (!req.session.user) return res.redirect('/login');
  next();
}

// Trang nhập điểm
router.get('/nhapdiem', requireLogin, async (req, res) => {
  try {
    const truongs = await Truong.findAll();
    res.render('./sogiaoduc/nhapdiemthi/nhapdiemthi', {
      truongs,
      nhanVien: req.session.user
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Lỗi tải danh sách trường.');
  }
});

// Lấy phòng thi theo trường
router.get('/diemthi/phongthi/:truongId', async (req, res) => {
  try {
    const phongthi = await PhongThi.findAll({ where: { truongid: req.params.truongId } });
    res.json(phongthi);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi lấy danh sách phòng thi.' });
  }
});

// Lấy danh sách thí sinh + điểm nếu có
router.get('/diemthi/thisinh/:phongId', async (req, res) => {
  try {
    const thisinh = await ThiSinh.findAll({
      where: { phongthiid: req.params.phongId },
      include: [
        {
          model: DiemThi, as: 'diem',
          attributes: ['toan', 'nguvan', 'tienganh', 'tong'],
        }
      ]
    });
    res.json(thisinh);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi lấy danh sách thí sinh.' });
  }
});

//  Lưu hoặc cập nhật điểm
router.post('/diemthi/luu', async (req, res) => {
  try {
    const { thisinhid, toan, nguvan, tienganh } = req.body;
    const tong = (+toan) + (+nguvan) + (+tienganh);

    const [diem, created] = await DiemThi.findOrCreate({
      where: { thisinhid },
      defaults: { toan, nguvan, tienganh, tong }
    });

    if (!created) {
      // nếu đã có → update
      await diem.update({ toan, nguvan, tienganh, tong });
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi lưu điểm thi.' });
  }
});

module.exports = router;