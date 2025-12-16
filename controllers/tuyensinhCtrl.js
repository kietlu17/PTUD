const bcrypt = require('bcrypt');
const TaiKhoanTuyenSinh = require('../models/TaiKhoanTuyenSinh');

exports.loginTuyenSinh = async (req, res) => {
  try {
    const { soDinhDanh, matKhau } = req.body;

    if (!soDinhDanh || !matKhau) {
      return res.status(400).json({ message: 'Thiếu thông tin đăng nhập' });
    }

    const acc = await TaiKhoanTuyenSinh.findOne({
      where: { soDinhDanh }
    });

    if (!acc) {
      return res.status(401).json({ message: 'Sai số định danh' });
    }

    const isMatch = bcrypt.compareSync(matKhau, acc.matKhau);
    if (!isMatch) {
      return res.status(401).json({ message: 'Sai mật khẩu' });
    }

    // Lưu session riêng cho tuyển sinh
    req.session.tuyenSinh = {
      id: acc.id,
      soDinhDanh: acc.soDinhDanh
    };

    res.json({ success: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

