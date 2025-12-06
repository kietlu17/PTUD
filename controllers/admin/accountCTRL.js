const { render } = require('ejs');
const { TaiKhoan } = require('../../models');
const bcrypt = require('bcrypt');

exports.getListRole = async (req, res)=> {
    res.render('./admin/quanlytaikhoan/quanlytaikhoan', {currentPage: '/quanlyacc'})
}

exports.getUsersByRole = async (req, res) => {
  try {
    const admin = req.session.user.profile;  // admin đang đăng nhập
    console.log(admin)
    const roleId = req.params.roleID;   // role được chọn
    if (!roleId) return res.json({ data: [] });

    const users = await TaiKhoan.findAll({
      where: {
        id_truong: admin.id_school,
        id_role: roleId
      },
        attributes: { exclude: ['password'] },
      order: [['username', 'ASC']],
    });

    res.json({ data: users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Hiển thị form đổi mật khẩu
exports.showChangePassword = async (req, res) => {
  const user = await User.findByPk(req.params.id, { include: ['role'] });

  if (!user) return res.status(404).send("User not found");

  res.render('admin/account/editPassword', { user, currentPage: '/quanlyacc' });
};


// Xử lý đổi mật khẩu
exports.changePassword = async (req, res) => {
    const newPassword = req.body.password;
    console.log(newPassword)
    await TaiKhoan.update(
        { password: bcrypt.hashSync(newPassword, 10) },
        { where: { id: req.params.id } }
    );

    res.status(200).json('thanh cong');
};


// Reset về mật khẩu mặc định
exports.resetDefaultPassword = async (req, res) => {
  await TaiKhoan.update(
    { password: bcrypt.hashSync("1111", 10) },
    { where: { id: req.params.id } }
  );

    res.status(200).json('thanh cong');
};
