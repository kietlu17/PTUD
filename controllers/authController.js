const { render } = require('ejs');
const { TaiKhoan, VaiTro, HocSinh, Lop, Truong } = require('../models');

function showRegister(req, res) {
  res.render('register', { error: null });
}

async function register(req, res) {
  const { name, email, password } = req.body;
  if (!email || !password) return res.render('register', { error: 'Email and password required' });
  try {
    const existing = await User.findOne({ where: { email } });
    if (existing) return res.render('register', { error: 'Email already used' });
    const user = await User.create({ name, email, password });
    req.session.user = { id: user.id, name: user.name, email: user.email };
    res.redirect('/posts');
  } catch (err) {
    console.error(err);
    res.render('register', { error: 'Registration failed' });
  }
}

function showLogin(req, res) {
  res.render('dangnhap', { error: null });
}

async function login(req, res) {
  const { username, password } = req.body;
  console.log({ username, password })
  if (!username || !password) {
    return res.status(400).json({ error: 'Vui lòng nhập đầy đủ thông tin đăng nhập' });
  }

  try {
    const user = await TaiKhoan.findOne({ where: { username }, include: { model: VaiTro, as: 'role' } });
    if (!user) {
      return res.status(401).json({ error: 'Tên đăng nhập hoặc mật khẩu không đúng' });
    }

    // Bỏ qua bcrypt và so sánh trực tiếp mật khẩu
    if (password !== user.password) {
      return res.status(401).json({ error: 'Tên đăng nhập hoặc mật khẩu không đúng' });
    }

    req.session.user = {
      id: user.id,
      username: user.username,
      role: user.role.TenVaiTro,
    };

    req.session.save(async (err) => {
      if (err) {
        console.error('Session save error:', err);
        return res.status(500).json({ error: 'Đã xảy ra lỗi, vui lòng thử lại' });
      }

      // Nếu là học sinh
        if (user.role.TenVaiTro === 'học sinh') {
            const hocSinh = await HocSinh.findOne({
              where: { MaHS: username },
              include: [
                { model: Lop, as: 'lop' },
                { model: Truong, as: 'truong' },
              ],
            });

        if (!hocSinh) {
          return res.status(404).json({ error: 'Không tìm thấy thông tin học sinh' });
        }

        // Truyền toàn bộ thông tin ra view
            res.status(200).render('dashboard-hocsinh', {
                hocSinh: {
                  ...hocSinh.toJSON(),
                  Lop: hocSinh.lop?.TenLop || 'Chưa cập nhật',
                  Truong: hocSinh.truong?.name || 'Chưa cập nhật'
                }
            });
      }

      // Redirect cho các vai trò khác
      // switch (user.role.TenVaiTro) {
      //   case 'phụ huynh':
      //     return res.status(200).render('dashboard-phuhuynh');
      //   case 'giáo viên':
      //     return res.status(200).render('dashboard-giaovien');
      //   case 'ban giám hiệu':
      //     return res.status(200).render('dashboard-bangiamhieu');
      //   case 'sở giáo dục':
      //     return res.status(200).render('dashboard-sogiaoduc');
      //   case 'admin':
      //     return res.status(200).render('dashboard-admin');
      //   default:
      //     return res.status(200).render('404');
      // }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Đã xảy ra lỗi, vui lòng thử lại' });
  }
}

function logout(req, res) {
  req.session.destroy(() => res.redirect('/login'));
}

module.exports = { showRegister, register, showLogin, login, logout };
