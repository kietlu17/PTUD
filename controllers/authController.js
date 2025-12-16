const { render } = require('ejs');
const { TaiKhoan, VaiTro, HocSinh,Lop, Truong, NhanVienSo, QuanTriTruong, GiaoVien, PhuHuynh, BanGiamHieu } = require('../models');
const bcrypt = require('bcrypt');
const { json } = require('body-parser');

function showLogin(req, res) {
  res.render('dangnhap', { error: null });
}

async function login(req, res) {
  const { username, password } = req.body;
  try {
    const user = await TaiKhoan.findOne({ where: { username }, include: { model: VaiTro, as: 'role' } });
    if (!user) {
        // Render lại trang 'login' và truyền biến 'errorMessage'
        return res.render('dangnhap', { errorMessage: 'Tên đăng nhập không đúng', oldUsername: username });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        // Render lại trang 'login' và truyền biến 'errorMessage'
        return res.render('dangnhap', { errorMessage: 'Mật khẩu không đúng', oldUsername: username });
    }


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
            if (user.isFirstLogin) {
              return res.redirect('/doi-mat-khau-lan-dau');
            }

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
          req.session.user = {
              id: user.id,
              username: user.username,
              role: user.role.TenVaiTro,
              roleId: user.role.id,
              profile: nhanVien.toJSON()
            };
          res.redirect('/dashboard-sogiaoduc');
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
            if (user.isFirstLogin) {
              return res.redirect('/doi-mat-khau-lan-dau');
            }

            res.redirect('/dashboard-phuhuynh');
          }

                // Nếu là ban giám hiệu
        if (user.role.TenVaiTro === 'ban giám hiệu') {
            const bgh = await BanGiamHieu.findOne({
              where: { MaBGH: username },
              include: [
                { model: Truong, as: 'truong' }
              ],
            });    
        if (!bgh) {
          return res.status(404).json({ error: 'Không tìm thấy thông tin ' });
        }
            req.session.user = {
              id: user.id,
              username: user.username,
              role: user.role.TenVaiTro,
              roleId: user.role.id,
              profile: bgh.toJSON()
            };

            res.redirect('/dashboard-bangiamhieu');
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

// Xử lý đổi mật khẩu
async function  changePassword  (req, res){
    const newPassword = req.body.password;
    await TaiKhoan.update(
        { password: bcrypt.hashSync(newPassword, 10),
          isFirstLogin: false
         },
        { where: { id: req.params.id } }
    );

    res.status(200).json('thanh cong');
};

module.exports = { showLogin, login, logout, changePassword };