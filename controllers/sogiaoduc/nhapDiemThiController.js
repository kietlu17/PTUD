const { Truong, PhongThi, ThiSinh, DiemThi } = require('../../models');

// Hiển thị trang nhập điểm
exports.showNhapDiem = async (req, res) => {
  try {
    const truongs = await Truong.findAll();

    return res.render('./sogiaoduc/nhapdiemthi/nhapdiemthi', {
      truongs,
      profile: req.session.user.profile,
      currentUrl: '/diemthi'
    });
  } catch (err) {
    console.error("Lỗi load trang nhập điểm:", err);
    return res.status(500).send("Lỗi load trang nhập điểm.");
  }
};

// Lấy danh sách phòng thi theo trường
exports.getPhongThi = async (req, res) => {
  try {
    const phongthi = await PhongThi.findAll({
      where: { truongid: req.params.truongId }
    });
    return res.json(phongthi);
  } catch (err) {
    console.error("Lỗi lấy phòng thi:", err);
    return res.status(500).json({ error: 'Lỗi lấy phòng thi.' });
  }
};

// Lấy danh sách thí sinh theo phòng + điểm
exports.getThiSinh = async (req, res) => {
  try {
    const thisinh = await ThiSinh.findAll({
      where: { phongthiid: req.params.phongId },
      include: [{
        model: DiemThi,
        as: 'diem',
        attributes: ['toan', 'nguvan', 'tienganh', 'tong']
      }]
    });
    return res.json(thisinh);
  } catch (err) {
    console.error("Lỗi lấy thí sinh:", err);
    return res.status(500).json({ error: "Lỗi lấy thí sinh." });
  }
};

// Lưu tất cả điểm 1 lần
exports.saveAllScores = async (req, res) => {
  try {
    const dsDiem = req.body.dsDiem;

    for (const d of dsDiem) {
      const tong = (+d.toan) + (+d.nguvan) + (+d.tienganh);

      const [diem, created] = await DiemThi.findOrCreate({
        where: { thisinhid: d.thisinhid },
        defaults: {
          toan: d.toan,
          nguvan: d.nguvan,
          tienganh: d.tienganh,
          tong
        }
      });

      if (!created) {
        await diem.update({
          toan: d.toan,
          nguvan: d.nguvan,
          tienganh: d.tienganh,
          tong
        });
      }
    }

    return res.json({ success: true });

  } catch (err) {
    console.error("Lỗi lưu tất cả điểm:", err);
    return res.status(500).json({ success: false });
  }
};

exports.showDashboard = async (req, res) => {
  try {
    // profile lấy từ session (chắc bạn đang set req.session.user.profile khi login)
    const profile = req.session.user?.profile || null;

    // Lấy danh sách trường
    const truongs = await Truong.findAll();

    res.render('dashboard-sogiaoduc', {
      profile,
      truongs,
      currentUrl: '/dashboard-sogiaoduc'
    });
  } catch (err) {
    console.error('Lỗi load dashboard sở:', err);
    res.status(500).send('Lỗi tải dashboard.');
  }
};