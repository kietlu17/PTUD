const { Truong, ChiTieu } = require('../../models');

// Hiển thị trang chỉnh sửa chỉ tiêu tuyển sinh
exports.showPage = async (req, res) => {
  try {
    const truongs = await Truong.findAll({ order: [['id', 'ASC']] });

    // Lấy chỉ tiêu (nếu có) cho mỗi trường
    const list = [];
    for (const t of truongs) {
      const ct = await ChiTieu.findOne({ where: { truongid: t.id } });
      list.push({ id: t.id, name: t.name, soLuong: ct ? ct.soLuong : 0, diemChuan: ct ? ct.diemChuan ?? 0 : 0 });
    }

    res.render('sogiaoduc/chitieutuyensinh/chitieu', {
      profile: req.session.user.profile,
      currentUrl: '/chi-tieu',
      truongs: list
    });
  } catch (err) {
    console.error('Lỗi load strán chỉ tiêu tuyển sinh:', err);
    res.status(500).send('Lỗi tải trang chỉ tiêu');
  }
};

// Lưu chỉ tiêu cho một trường (tạo hoặc update)
exports.saveChiTieu = async (req, res) => {
  try {
    const { truongid, soLuong } = req.body;
    const id = parseInt(truongid, 10);
    const so = parseInt(soLuong, 10);

    const dc = parseFloat(soLuong === undefined ? req.body.diemChuan : req.body.diemChuan);
    if (isNaN(id) || isNaN(so) || so <= 0 || isNaN(dc) || dc < 0) {
      return res.status(400).json({ success: false, error: 'Dữ liệu không hợp lệ (soLuong phải > 0, diemChuan >= 0)' });
    }

    const existing = await ChiTieu.findOne({ where: { truongid: id } });
    if (existing) {
      await existing.update({ soLuong: so, diemChuan: dc });
    } else {
      await ChiTieu.create({ truongid: id, soLuong: so, diemChuan: dc });
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Lỗi lưu chỉ tiêu:', err);
    res.status(500).json({ success: false, error: 'Không thể lưu chỉ tiêu' });
  }
};