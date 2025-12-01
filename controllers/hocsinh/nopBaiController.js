const { BaiTap, BaiNop, Lop, MonHoc, HocSinh } = require('../../models');
const { Op } = require('sequelize');

// 1. Hiển thị danh sách bài tập
exports.hienThiDanhSachBaiTap = async (req, res) => {
    try {
        const user = req.session.user;
        const hocSinh = await HocSinh.findOne({ where: { MaHS: user.username } });
        if (!hocSinh) return res.status(404).send("Không tìm thấy thông tin học sinh.");

        const dsBaiTap = await BaiTap.findAll({
            where: { id_Lop: hocSinh.id_Lop },
            include: [
                { model: MonHoc, as: 'monhoc', attributes: ['TenMon'] },
                { model: BaiNop, as: 'dsBaiNop', required: false, where: { id_HocSinh: hocSinh.id } }
            ],
            order: [['NgayGiao', 'DESC']]
        });

        res.render('hocsinh/nopbai/ds_baitap', { dsBaiTap, hocSinh });
    } catch (error) {
        console.error(error);
        res.status(500).send("Lỗi server: " + error.message);
    }
};

// 2. Hiển thị form nộp bài chi tiết
exports.hienThiFormNopBai = async (req, res) => {
    try {
        const idBaiTap = req.params.idBaiTap;
        const user = req.session.user;

        // 1. Lấy thông tin bài tập
        const baiTap = await BaiTap.findByPk(idBaiTap, {
            include: [{ model: MonHoc, as: 'monhoc' }]
        });
        if (!baiTap) return res.status(404).send("Bài tập không tồn tại.");

        // 2. Lấy thông tin học sinh
        const hocSinh = await HocSinh.findOne({ where: { MaHS: user.username } });

        // 3. Tìm xem học sinh này ĐÃ NỘP BÀI CHƯA? (Thêm đoạn này)
        const baiNop = await BaiNop.findOne({
            where: { 
                id_BaiTap: idBaiTap, 
                id_HocSinh: hocSinh.id 
            }
        });

        // 4. Tính toán quá hạn
        const now = new Date();
        const hanNop = new Date(baiTap.HanNop);
        const quaHan = now > hanNop;

        // 5. Render và truyền biến 'baiNop' sang View
        res.render('hocsinh/nopbai/form_nop_bai', { 
            baiTap, 
            quaHan, 
            baiNop, // <--- QUAN TRỌNG: Truyền biến này để view hiển thị điểm/file cũ
            error: null, 
            success: null 
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Lỗi server");
    }
};

// 3. Xử lý nộp bài
exports.xuLyNopBai = async (req, res) => {
    const idBaiTap = req.params.idBaiTap;
    
    const getBaiTap = async () => await BaiTap.findByPk(idBaiTap, { include: [{ model: MonHoc, as: 'monhoc' }] });

    try {
        const baiTap = await getBaiTap();
        
        // Kiểm tra hạn nộp lần nữa
        const now = new Date();
        const hanNop = new Date(baiTap.HanNop);
        const isQuaHan = now > hanNop;
        
        if (isQuaHan) {
            return res.render('hocsinh/nopbai/form_nop_bai', { 
                baiTap, 
                quaHan: true,
                error: "Đã hết hạn nộp bài! Hệ thống không nhận bài nữa.", 
                success: null 
            });
        }

        const user = req.session.user;
        const hocSinh = await HocSinh.findOne({ where: { MaHS: user.username } });
        const file = req.file;

        if (!file) {
            return res.render('hocsinh/nopbai/form_nop_bai', { 
                baiTap, quaHan: false, error: "Vui lòng chọn file!", success: null 
            });
        }

        // Lưu vào CSDL
        let baiNop = await BaiNop.findOne({
            where: { id_BaiTap: idBaiTap, id_HocSinh: hocSinh.id }
        });

        const filePath = `/uploads/bainop/${file.filename}`;

        if (baiNop) {
            await baiNop.update({ FileNop: filePath, NgayNop: now });
        } else {
            await BaiNop.create({
                FileNop: filePath,
                NgayNop: now,
                id_BaiTap: idBaiTap,
                id_HocSinh: hocSinh.id
            });
        }
        
        res.render('hocsinh/nopbai/form_nop_bai', { 
            baiTap, 
            quaHan: false,
            error: null, 
            success: "Nộp bài thành công!" 
        });

    } catch (error) {
        console.error(error);
        const baiTap = await getBaiTap();
        res.render('hocsinh/nopbai/form_nop_bai', { 
            baiTap, quaHan: false, error: "Lỗi nộp bài: " + error.message, success: null 
        });
    }
};