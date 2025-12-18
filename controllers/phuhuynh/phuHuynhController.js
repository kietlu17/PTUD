const { NghiHoc, HocSinh, PhuHuynh } = require('../../models');

// 1. Hiển thị trang xin nghỉ và lịch sử (GET)
exports.hienThiXinNghi = async(req, res) => {
    try {
        const user = req.session.user;
        const phuHuynh = await PhuHuynh.findOne({
            where: { MaPH: user.username },
            // ĐỔI TỪ hocSinhLienQuan THÀNH hocsinh
            include: [{ model: HocSinh, as: 'hocsinh' }]
        });

        // Kiểm tra an toàn
        if (!phuHuynh || !phuHuynh.hocsinh) {
            throw new Error("Không tìm thấy thông tin học sinh liên quan");
        }

        const con = phuHuynh.hocsinh; // Sử dụng biến này
        const lichSu = await NghiHoc.findAll({
            where: { student_id: con.id },
            order: [
                ['NgayNghi', 'DESC']
            ]
        });

        res.render('phuhuynh/xinnghihoc/xin_nghi_hoc', {
            con,
            lichSu,
            success: null,
            error: null,
            profile: phuHuynh,
            currentUser: user,
            currentUrl: '/phuhuynh/xin-nghi-hoc'
        });
    } catch (error) {
        console.error("Lỗi hiển thị xin nghỉ:", error);
        res.status(500).send("Lỗi hệ thống: " + error.message);
    }
};

// 2. Xử lý gửi đơn xin nghỉ (POST) - THIẾU HÀM NÀY SẼ GÂY LỖI SERVER
exports.xuLyXinNghi = async(req, res) => {
    try {
        const { student_id, ngay_nghi, ly_do } = req.body;

        // Lưu vào DB
        await NghiHoc.create({
            student_id: student_id,
            NgayNghi: ngay_nghi,
            LyDo: ly_do,
            TinhTrang: 'Đã duyệt'
        });

        // Lấy lại dữ liệu mới nhất để hiển thị bảng lịch sử
        const phuHuynh = await PhuHuynh.findOne({
            where: { MaPH: req.session.user.username },
            include: [{ model: HocSinh, as: 'hocsinh' }]
        });
        const lichSu = await NghiHoc.findAll({
            where: { student_id: student_id },
            order: [
                ['NgayNghi', 'DESC']
            ]
        });

        // QUAN TRỌNG: Render lại trang kèm thông báo thành công
        res.render('phuhuynh/xinnghihoc/xin_nghi_hoc', {
            con: phuHuynh.hocsinh,
            lichSu: lichSu,
            success: "Đã nộp đơn xin nghỉ học thành công!", // Chuỗi này sẽ kích hoạt SweetAlert
            error: null,
            profile: phuHuynh,
            currentUser: req.session.user,
            currentUrl: '/phuhuynh/xin-nghi-hoc'
        });
    } catch (error) {
        res.status(500).send("Lỗi: " + error.message);
    }
};