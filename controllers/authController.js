console.log(">>> FILE AUTH CONTROLLER ĐÃ ĐƯỢC LOAD <<<");
const { TaiKhoan, VaiTro, HocSinh, Lop, Truong, NhanVienSo, QuanTriTruong, GiaoVien, PhuHuynh, BanGiamHieu } = require('../models');

function showLogin(req, res) {
    res.render('dangnhap', { error: null });
}

async function login(req, res) {
    const { username, password } = req.body;
    console.log("Login attempt:", { username, password });

    try {
        // 1. Tìm tài khoản
        const user = await TaiKhoan.findOne({
            where: { username },
            include: { model: VaiTro, as: 'role' }
        });

        if (!user) {
            return res.status(401).json({ error: 'Tên đăng nhập hoặc mật khẩu không đúng' });
        }


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
}

function logout(req, res) {
    req.session.destroy(() => res.redirect('/login'));
}

module.exports = { showLogin, login, logout };