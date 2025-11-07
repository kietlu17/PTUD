const { render } = require('ejs');
const { TaiKhoan, VaiTro, HocSinh,Lop, Truong, NhanVienSo, QuanTriTruong, GiaoVien, PhuHuynh } = require('../models');
const bcrypt = require('bcrypt');
const { json } = require('body-parser');
// function showRegister(req, res) {
//   res.render('register', { error: null });
// }

// async function register(req, res) {
//   const { name, email, password } = req.body;
//   if (!email || !password) return res.render('register', { error: 'Email and password required' });
//   try {
//     const existing = await User.findOne({ where: { email } });
//     if (existing) return res.render('register', { error: 'Email already used' });
//     const user = await User.create({ name, email, password });
//     req.session.user = { id: user.id, name: user.name, email: user.email };
//     res.redirect('/posts');
//   } catch (err) {
//     console.error(err);
//     res.render('register', { error: 'Registration failed' });
//   }
// }

function showLogin(req, res) {
  res.render('dangnhap', { error: null });
}

async function login(req, res) {
  const { username, password } = req.body;
  console.log({ username, password })


  try {
    const user = await TaiKhoan.findOne({ where: { username }, include: { model: VaiTro, as: 'role' } });
    if (!user) {
      return res.status(401).json({ error: 'Tên đăng nhập hoặc mật khẩu không đúng' });
    }

    // Bỏ qua bcrypt và so sánh trực tiếp mật khẩu
  // const isMatch = await bcrypt.compare(password, user.password);
  // if (!isMatch) {
  //   return res.status(401).json({ error: 'Tên đăng nhập hoặc mật khẩu không đúng' });

  // }

    // req.session.user = {
    //   id: user.id,
    //   username: user.username,
    //   role: user.role.TenVaiTro,
    // };


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
            req.session.user = {
              id: user.id,
              username: user.username,
              role: user.role.TenVaiTro,
              roleId: user.role.id,
              profile: hocSinh.toJSON()
            };

            res.redirect('/dashboard-hocsinh');
            
      }

       // Nếu là Nhân viên sở giáo dục
        if (user.role.TenVaiTro === 'sở giáo dục') {
            const nhanVien = await NhanVienSo.findOne({
              where: { MaSGD: username }
            });

        if (!nhanVien) {
          return res.status(404).json({ error: 'Không tìm thấy thông tin Nhân viên' });
        }

        // Truyền toàn bộ thông tin ra view
            res.status(200).render('dashboard-sogiaoduc', {
              nhanVien
            });
      }

             // Nếu là quản trị trường
        if (user.role.TenVaiTro === 'admin') {
            const admin = await QuanTriTruong.findOne({
              where: { MaQTV: username },
              include: [
                { model: Truong, as: 'truong' },
              ],
            });

        if (!admin) {
          return res.status(404).json({ error: 'Không tìm thấy thông tin Nhân viên' });
        }
            req.session.user = {
              id: user.id,
              username: user.username,
              role: user.role.TenVaiTro,
              roleId: user.role.id,
              profile: admin.toJSON()
            };

            res.redirect('/dashboard-admin');

      }

      // Nếu là giáo viên
        if (user.role.TenVaiTro === 'giáo viên') {
            const giaovien = await GiaoVien.findOne({
              where: { MaGV: username },
              include: [
                { model: Truong, as: 'truong' }
              ],
            });
            console.log(giaovien.toJSON());
            
        if (!giaovien) {
          return res.status(404).json({ error: 'Không tìm thấy thông tin ' });
        }

            req.session.user = {
              id: user.id,
              username: user.username,
              role: user.role.TenVaiTro,
              roleId: user.role.id,
              profile: giaovien.toJSON()
            };

            res.redirect('/dashboard-giaovien');

      }

      
      if (user.role.TenVaiTro === 'phụ huynh') {
        // Tìm thông tin Phụ Huynh dựa trên username (giả định username là MaPH)
        const phuHuynh = await PhuHuynh.findOne({
          where: { MaPH: username },
          include: [
            { 
              model: HocSinh, 
              as: 'hocsinh', // Dùng tên alias 'hocsinh' đã định nghĩa trong index.js
              include: [
                { model: Lop, as: 'lop' },
                { model: Truong, as: 'truong' },
              ]
            },
          ],
        });

        if (!phuHuynh) {
          return res.status(404).json({ error: 'Không tìm thấy thông tin phụ huynh hoặc học sinh liên quan' });
        }
          
            req.session.user = {
              id: user.id,
              username: user.username,
              role: user.role.TenVaiTro,
              roleId: user.role.id,
              profile: phuHuynh.toJSON()
            };

            res.redirect('/dashboard-phuhuynh');


          }


    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Đã xảy ra lỗi, vui lòng thử lại' });
  }
}

function logout(req, res) {
  req.session.destroy(() => res.redirect('/login'));
}

module.exports = { showLogin, login, logout };
