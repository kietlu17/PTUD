const { DiemDanh, GiaoVien, Lop, HocSinh } = require('../models');

/**
 * 🧭 Hiển thị dashboard điểm danh cho giáo viên
 * - Danh sách khối/lớp mà giáo viên phụ trách
 */
async function showDiemDanhDashboard(req, res) {
    const { user } = req.session;

    // 1️⃣ Kiểm tra quyền truy cập
    if (!user || user.role !== 'giáo viên') {
        return res.redirect('/login');
    }

    const username = user.username;

    try {
        // 2️⃣ Tìm giáo viên hiện tại dựa theo mã GV (username)
        const giaoVien = await GiaoVien.findOne({
            where: { MaGV: username },
            include: [{
                model: Lop,
                as: 'lopPhuTrach', // alias trong index.js
                attributes: ['id', 'TenLop', 'Khoi'],
            }, ],
        });

        if (!giaoVien) {
            return res.render('dashboard-diemdanh', {
                error: 'Không tìm thấy thông tin giáo viên hoặc lớp phụ trách.',
                giaoVien: null,
                khoiLop: [],
            });
        }

        // Gom nhóm lớp theo khối (để hiển thị accordion)
        const lopData = giaoVien.lopPhuTrach || [];
        const grouped = {};

        lopData.forEach((lop) => {
            const khoi = lop.Khoi || 'Khác';
            if (!grouped[khoi]) grouped[khoi] = [];
            grouped[khoi].push(lop);
        });

        const khoiLop = Object.keys(grouped).map((khoi) => ({
            tenKhoi: `Khối ${khoi}`,
            lopList: grouped[khoi],
        }));

        // 3️⃣ Render giao diện
        res.render('dashboard-diemdanh', {
            giaoVien: giaoVien.toJSON(),
            khoiLop,
            error: null,
        });
    } catch (err) {
        console.error('Lỗi khi tải dashboard điểm danh:', err);
        res.render('dashboard-diemdanh', {
            error: 'Lỗi hệ thống, vui lòng thử lại sau.',
            giaoVien: null,
            khoiLop: [],
        });
    }
}

/**
 * 📋 Lấy danh sách học sinh trong 1 lớp
 */
async function getHocSinhTheoLop(req, res) {
    const { idLop } = req.params;
    const { user } = req.session;

    if (!user || user.role !== 'giáo viên') {
        return res.status(403).json({ error: 'Không có quyền truy cập' });
    }

    try {
        const hocSinhList = await HocSinh.findAll({
            where: { id_Lop: idLop },
            attributes: ['id', 'HoVaTen'],
        });

        if (!hocSinhList || hocSinhList.length === 0) {
            return res.status(404).json({ error: 'Không tìm thấy học sinh trong lớp.' });
        }

        res.json({
            lopId: idLop,
            hocSinhList,
        });
    } catch (err) {
        console.error('Lỗi khi tải danh sách học sinh:', err);
        res.status(500).json({ error: 'Lỗi hệ thống.' });
    }
}

/**
 * 💾 Lưu kết quả điểm danh
 */
async function luuDiemDanh(req, res) {
    const { danhSach } = req.body; // danhSach: [{id_HocSinh, id_Lop, TrangThai, GhiChu}]
    const { user } = req.session;

    if (!user || user.role !== 'giáo viên') {
        return res.status(403).json({ error: 'Truy cập bị từ chối.' });
    }

    try {
        if (!Array.isArray(danhSach) || danhSach.length === 0) {
            return res.status(400).json({ error: 'Không có dữ liệu điểm danh.' });
        }

        // Kiểm tra dữ liệu hợp lệ
        const invalid = danhSach.find((d) => !d.TrangThai || !d.id_HocSinh);
        if (invalid) {
            return res.status(400).json({ error: 'Có học sinh chưa được điểm danh.' });
        }

        // 1️⃣ Lưu điểm danh từng học sinh
        for (const item of danhSach) {
            await DiemDanh.create({
                id_HocSinh: item.id_HocSinh,
                id_GiaoVien: user.id, // từ session
                id_Lop: item.id_Lop,
                NgayDiemDanh: new Date(),
                TrangThai: item.TrangThai,
                GhiChu: item.GhiChu || null,
            });
        }

        // 2️⃣ Phản hồi kết quả
        res.json({
            message: 'Điểm danh thành công!',
            status: 'SUCCESS',
        });
    } catch (err) {
        console.error('Lỗi khi lưu điểm danh:', err);
        res.status(500).json({ error: 'Lỗi khi lưu dữ liệu điểm danh.' });
    }
}

module.exports = {
    showDiemDanhDashboard,
    getHocSinhTheoLop,
    luuDiemDanh,
};