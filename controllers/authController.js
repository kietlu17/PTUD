<<<<<<< HEAD
<<<<<<< HEAD
const { render } = require('ejs');
<<<<<<< HEAD
const { TaiKhoan, VaiTro, HocSinh, Lop, Truong , PhuHuynh } = require('../models');

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
=======
console.log(">>> FILE AUTH CONTROLLER ĐÃ ĐƯỢC LOAD <<<");
const { TaiKhoan, VaiTro, HocSinh, Lop, Truong, NhanVienSo, QuanTriTruong, GiaoVien, PhuHuynh, BanGiamHieu } = require('../models');
>>>>>>> b138cbc (Update chuc nang phân công GVBM và GVCN)
=======
console.log(">>> FILE AUTH CONTROLLER ĐÃ ĐƯỢC LOAD <<<");
const { TaiKhoan, VaiTro, HocSinh, Lop, Truong, NhanVienSo, QuanTriTruong, GiaoVien, PhuHuynh, BanGiamHieu } = require('../models');
>>>>>>> main
=======
const { TaiKhoan, VaiTro, HocSinh,Lop, Truong, NhanVienSo, QuanTriTruong, GiaoVien, PhuHuynh, BanGiamHieu } = require('../models');
const bcrypt = require('bcrypt');
const { json } = require('body-parser');
>>>>>>> 1f26f04d5f47ef00b6d633733decf4e26684f9b6

function showLogin(req, res) {
    res.render('dangnhap', { error: null });
}

async function login(req, res) {
<<<<<<< HEAD
<<<<<<< HEAD
  const { username, password } = req.body;
<<<<<<< HEAD
  console.log({ username, password })
  if (!username || !password) {
    return res.status(400).json({ error: 'Vui lòng nhập đầy đủ thông tin đăng nhập' });
  }
=======
    const { username, password } = req.body;
    console.log("Login attempt:", { username, password });
>>>>>>> main

    try {
        // 1. Tìm tài khoản
        const user = await TaiKhoan.findOne({
            where: { username },
            include: { model: VaiTro, as: 'role' }
        });

        if (!user) {
            return res.status(401).json({ error: 'Tên đăng nhập hoặc mật khẩu không đúng' });
        }

<<<<<<< HEAD
        // Truyền toàn bộ thông tin ra view
            res.status(200).render('dashboard-hocsinh', {
                hocSinh: {
                  ...hocSinh.toJSON(),
                  Lop: hocSinh.lop?.TenLop || 'Chưa cập nhật',
                  Truong: hocSinh.truong?.name || 'Chưa cập nhật'
                }
=======
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
>>>>>>> 1f26f04d5f47ef00b6d633733decf4e26684f9b6
            });
      }
<<<<<<< HEAD
=======

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

>>>>>>> 1f26f04d5f47ef00b6d633733decf4e26684f9b6
      
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
    
    // 2. Logic cho PHỤ HUYNH 👈 PHẦN BỔ SUNG
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
=======
    const { username, password } = req.body;
    console.log("Login attempt:", { username, password });

    try {
        // 1. Tìm tài khoản
        const user = await TaiKhoan.findOne({
            where: { username },
            include: { model: VaiTro, as: 'role' }
>>>>>>> b138cbc (Update chuc nang phân công GVBM và GVCN)
        });

        if (!user) {
            return res.status(401).json({ error: 'Tên đăng nhập hoặc mật khẩu không đúng' });
        }
<<<<<<< HEAD
<<<<<<< HEAD
          
          // Trả về dashboard phụ huynh với thông tin của họ và thông tin của con (hocsinh)
            res.status(200).render('dashboard-phuhuynh', {
              phuHuynh: {
                ...phuHuynh.toJSON(),
                hocSinhLienQuan: {
                  ...phuHuynh.hocsinh?.toJSON(),
                  Lop: phuHuynh.hocsinh?.lop?.TenLop || 'Chưa cập nhật',
                  Truong: phuHuynh.hocsinh?.truong?.name || 'Chưa cập nhật',
                }
              }
            });
          // THÊM: Lưu id_HocSinh vào session
        req.session.user.hocSinhId = phuHuynh.hocsinh.id; 

          // Trả về dashboard phụ huynh
          return res.status(200).render('dashboard-phuhuynh', {
              // ... (dữ liệu truyền đi không đổi)
          });
          }
          
=======
            req.session.user = {
              id: user.id,
              username: user.username,
              role: user.role.TenVaiTro,
              roleId: user.role.id,
              profile: phuHuynh.toJSON()
            };
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
            console.log(req.session.user)
            res.redirect('/dashboard-bangiamhieu');
      }
>>>>>>> 1f26f04d5f47ef00b6d633733decf4e26684f9b6
    });




  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Đã xảy ra lỗi, vui lòng thử lại' });
  }
=======

=======
>>>>>>> main

        // Chuẩn hóa tên vai trò: chuyển thành chữ thường và bỏ khoảng trắng 2 đầu
        const tenVaiTro = user.role.TenVaiTro.toLowerCase().trim();
        console.log("Vai trò đã chuẩn hóa:", tenVaiTro); // Log để kiểm tra

        // (Bỏ qua check pass theo yêu cầu của bạn)

        let userProfile = null;
        const roleName = user.role.TenVaiTro.toLowerCase().trim(); // Chuẩn hóa chuỗi để so sánh

        // 2. Lấy Profile dựa trên vai trò (Logic tuần tự - Async/Await chuẩn)
        if (roleName === 'học sinh') {
            userProfile = await HocSinh.findOne({
                where: { MaHS: username },
                include: [{ model: Lop, as: 'lop' }, { model: Truong, as: 'truong' }],
            });
            if (userProfile) {
                res.redirectUrl = '/dashboard-hocsinh'; // Lưu URL đích tạm thời
            }
        } 
        else if (roleName === 'sở giáo dục') {
            userProfile = await NhanVienSo.findOne({ where: { MaSGD: username } });
            if (userProfile) res.redirectUrl = '/dashboard-sogiaoduc';
        } 
        else if (roleName === 'admin') {
            userProfile = await QuanTriTruong.findOne({
                where: { MaQTV: username },
                include: [{ model: Truong, as: 'truong' }],
            });
            if (userProfile) res.redirectUrl = '/dashboard-admin';
        } 
        else if (roleName === 'giáo viên') {
            userProfile = await GiaoVien.findOne({
                where: { MaGV: username },
                include: [{ model: Truong, as: 'truong' }]
            });
            if (userProfile) res.redirectUrl = '/dashboard-giaovien';
        } 
        else if (roleName === 'ban giám hiệu' || roleName === 'bgh') { // Thêm 'bgh' đề phòng
            console.log("--- Đang xử lý Ban Giám Hiệu ---");
            userProfile = await BanGiamHieu.findOne({
                where: { MaBGV: username }, // Đảm bảo cột MaBGV đúng trong DB
                include: [{ model: Truong, as: 'truong' }],
            });
            if (userProfile) res.redirectUrl = '/dashboard-bangiamhieu';
        } 
        else if (roleName === 'phụ huynh') {
            userProfile = await PhuHuynh.findOne({
                where: { MaPH: username },
                include: [{
                    model: HocSinh, as: 'hocsinh',
                    include: [{ model: Lop, as: 'lop' }, { model: Truong, as: 'truong' }]
                }],
            });
            if (userProfile) res.redirectUrl = '/dashboard-phuhuynh';
        }

        // 3. Kiểm tra nếu không tìm thấy Profile
        if (!userProfile) {
            console.log(`Không tìm thấy profile cho vai trò: ${roleName}`);
            return res.status(404).json({ error: `Không tìm thấy thông tin người dùng cho vai trò ${roleName}` });
        }

        // 4. Gán Session (Quan trọng: Làm trước khi save)
        req.session.user = {
            id: user.id,
            username: user.username,
            role: user.role.TenVaiTro,
            roleId: user.role.id,
            profile: userProfile.toJSON()
        };

        // 5. Lưu session và chuyển hướng (Đây là cách dùng đúng)
        req.session.save((err) => {
            if (err) {
                console.error('Session save error:', err);
                return res.status(500).json({ error: 'Lỗi lưu phiên làm việc' });
            }
            console.log("Session saved. Redirecting to:", res.redirectUrl);
            return res.redirect(res.redirectUrl);
        });

    } catch (err) {
        console.error("Login Error:", err);
        return res.status(500).json({ error: 'Đã xảy ra lỗi hệ thống, vui lòng thử lại' });
    }
<<<<<<< HEAD
>>>>>>> b138cbc (Update chuc nang phân công GVBM và GVCN)
=======
>>>>>>> main
}


function logout(req, res) {
    req.session.destroy(() => res.redirect('/login'));
}

<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
module.exports = { showRegister, register, showLogin, login, logout };
=======
module.exports = { showLogin, login, logout };
>>>>>>> b138cbc (Update chuc nang phân công GVBM và GVCN)
=======
module.exports = { showLogin, login, logout };
>>>>>>> main
=======
// Xử lý đổi mật khẩu
async function  changePassword  (req, res){
    const newPassword = req.body.password;
    console.log(newPassword)
    await TaiKhoan.update(
        { password: bcrypt.hashSync(newPassword, 10) },
        { where: { id: req.params.id } }
    );

    res.status(200).json('thanh cong');
};

module.exports = { showLogin, login, logout, changePassword };
>>>>>>> 1f26f04d5f47ef00b6d633733decf4e26684f9b6
