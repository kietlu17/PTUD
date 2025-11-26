const { MonHoc } = require('../../models');
const { Op } = require('sequelize');

// ✅ Hiển thị trang quản lý môn học
exports.showPage = async (req, res) => {
  try {
    // lấy danh sách môn học theo id cố định để thứ tự hiển thị ổn định
    const monhocs = await MonHoc.findAll({ order: [['id', 'ASC']] });

    res.render('sogiaoduc/quanlymonhoc/quanlymonhoc', {
      monhocs,
      profile: req.session.user.profile,
      currentUrl: '/monhoc'
    });
  } catch (err) {
    console.error('Lỗi load môn học:', err);
    res.status(500).send('Lỗi tải trang môn học');
  }
};

// ✅ Thêm môn học (chống trùng + validate)
exports.themMonHoc = async (req, res) => {
  try {
    let { TenMon, SoTiet } = req.body;
    TenMon = (TenMon || '').trim();

    // ✅ Chỉ cho nhập chữ (hỗ trợ tiếng Việt bằng phạm vi ký tự Latin có dấu)
    if (!/^[A-Za-zÀ-ỹ\s]+$/.test(TenMon)) {
      return res.json({ error: 'Tên môn học không hợp lệ' });
    }

    // ✅ Check trùng KHÔNG phân biệt hoa thường
    const trung = await MonHoc.findOne({
      where: {
        TenMon: {
          [Op.iLike]: TenMon
        }
      }
    });

    if (trung) {
      return res.json({ error: 'Tên môn học đã tồn tại' });
    }

    // SoTiet nên là số nguyên hợp lệ (nếu gửi)
    // xử lý SoTiet: nếu trường trống -> null; nếu có -> phải là số nguyên >= 0
    const rawSoTiet = String(SoTiet ?? '').trim();
    let soTietInt = null;
    if (rawSoTiet !== '') {
      const parsed = parseInt(rawSoTiet, 10);
      if (isNaN(parsed) || parsed < 0) {
        return res.json({ error: 'Số tiết không hợp lệ' });
      }
      soTietInt = parsed;
    }

    await MonHoc.create({ TenMon, SoTiet: soTietInt });

    res.json({ success: true });

  } catch (err) {
    console.error('Lỗi thêm môn học:', err);
    res.status(500).json({ error: 'Không thể lưu môn học' });
  }
};

// ✅ Sửa môn học
exports.suaMonHoc = async (req, res) => {
  try {
    let { TenMon, SoTiet } = req.body;
    TenMon = TenMon?.trim();

    if (!TenMon) return res.json({ error: 'Tên môn học không được để trống' });

    if (!/^[\p{L}\s]+$/u.test(TenMon)) {
      return res.json({ error: 'Tên môn học không hợp lệ' });
    }

    // xử lý SoTiet giống như khi tạo: rỗng -> null, có giá trị -> số nguyên >=0
    const rawSoTiet = String(SoTiet ?? '').trim();
    let soTietInt = null;
    if (rawSoTiet !== '') {
      const parsed = parseInt(rawSoTiet, 10);
      if (isNaN(parsed) || parsed < 0) return res.json({ error: 'Số tiết không hợp lệ' });
      soTietInt = parsed;
    }

    const monhoc = await MonHoc.findByPk(req.params.id);
    if (!monhoc) return res.json({ error: 'Không tìm thấy môn học' });

    // Kiểm tra trùng tên (không phân biệt hoa thường) 
    const duplicate = await MonHoc.findOne({
      where: {
        TenMon: { [Op.iLike]: TenMon },
        id: { [Op.ne]: monhoc.id }
      }
    });
    if (duplicate) return res.json({ error: 'Tên môn học đã tồn tại' });

    await monhoc.update({ TenMon, SoTiet: soTietInt });

    res.json({ success: true });

  } catch (err) {
    console.error('Lỗi sửa môn học:', err);
    res.status(500).json({ error: 'Không thể sửa môn học' });
  }
};

// ✅ Xóa môn học (bắt lỗi khóa ngoại)
exports.xoaMonHoc = async (req, res) => {
  try {
    const monhoc = await MonHoc.findByPk(req.params.id);
    if (!monhoc) return res.json({ error: 'Không tìm thấy môn học' });

    await monhoc.destroy();
    res.json({ success: true });

  } catch (err) {
    console.error('Lỗi xóa môn học:', err);

    if (err.name === 'SequelizeForeignKeyConstraintError') {
      return res.json({ 
        error: 'Không thể xóa môn học vì đang được sử dụng'
      });
    }

    res.status(500).json({ error: 'Không thể xóa môn học' });
  }
};
