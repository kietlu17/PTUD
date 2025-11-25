const { BaiTap, BangPhanCongGiaoVien, Lop, MonHoc, GiaoVien } = require('../../models');

// --- FLOW 1: HIỂN THỊ DANH SÁCH LỚP (CƠ CHẾ TỰ SỬA LỖI) ---
exports.hienThiDanhSachLop = async(req, res) => {
    try {
        const user = req.session.user;
        let idGiaoVienThat = null;

        console.log("------------------------------------------------");
        console.log(">>> Kiểm tra tài khoản:", user ? user.username : "Chưa đăng nhập");

        if (user) {
            // 1. Tìm Giáo viên có MaGV trùng với Username đăng nhập
            const gvInfo = await GiaoVien.findOne({ where: { MaGV: user.username } });

            if (gvInfo) {
                idGiaoVienThat = gvInfo.id;
                console.log(` Đã tìm thấy Giáo viên: ${gvInfo.HoVaTen} (ID: ${idGiaoVienThat})`);
            } else {
                console.log(" Không tìm thấy GV theo MaGV. Đang thử tìm theo Email...");
                // 2. Nếu không thấy, thử tìm theo Email (phòng hờ)
                if (user.email) {
                    const gvEmail = await GiaoVien.findOne({ where: { email: user.email } });
                    if (gvEmail) idGiaoVienThat = gvEmail.id;
                }
            }
        }

        // 3. CHẾ ĐỘ AN TOÀN: Nếu vẫn không tìm ra ai, lấy ID = 1 để không bị trang trắng
        if (!idGiaoVienThat) {
            console.warn(" KHÔNG TÌM THẤY LIÊN KẾT TÀI KHOẢN -> GIÁO VIÊN.");
            console.warn(" KÍCH HOẠT CHẾ ĐỘ TEST: SỬ DỤNG ID = 1 (Nguyễn Văn C)");
            idGiaoVienThat = 1;
        }

        // 4. Lấy danh sách phân công
        const dsPhanCong = await BangPhanCongGiaoVien.findAll({
            where: { id_GiaoVien: idGiaoVienThat },
            include: [
                { model: Lop, as: 'lop', attributes: ['id', 'TenLop'] },
                // QUAN TRỌNG: Đã sửa thành TenMon để khớp Database
                { model: MonHoc, as: 'monhoc', attributes: ['id', 'TenMon'] }
            ],
            raw: true,
            nest: true
        });

        console.log(`>>> Kết quả: Tìm thấy ${dsPhanCong.length} lớp.`);
        res.render('giaovien/taobaitap/chon_lop', { dsPhanCong });

    } catch (error) {
        console.error("Lỗi hệ thống:", error);
        res.status(500).send("Lỗi server: " + error.message);
    }
};

// --- FLOW 2: HIỂN THỊ FORM GIAO BÀI ---
exports.hienThiFormGiaoBai = async(req, res) => {
    try {
        const idPhanCong = req.params.idPhanCong;

        const phanCong = await BangPhanCongGiaoVien.findByPk(idPhanCong, {
            include: [
                { model: Lop, as: 'lop' },
                { model: MonHoc, as: 'monhoc' }
            ]
        });

        if (!phanCong) {
            return res.status(404).send("Không tìm thấy thông tin phân công này.");
        }

        res.render('giaovien/taobaitap/tao_baitap', {
            phanCong,
            error: null,
            success: null
        });

    } catch (error) {
        console.error(error);
        res.status(500).send("Lỗi server: " + error.message);
    }
};

// --- FLOW 3: LƯU BÀI TẬP ---
exports.luuBaiTap = async(req, res) => {
    const idPhanCong = req.params.idPhanCong;

    const getPhanCong = async() => {
        return await BangPhanCongGiaoVien.findByPk(idPhanCong, {
            include: [{ model: Lop, as: 'lop' }, { model: MonHoc, as: 'monhoc' }]
        });
    };

    try {
        // Tìm lại ID Giáo viên để lưu (Logic giống hàm trên)
        const user = req.session.user;
        const gvInfo = await GiaoVien.findOne({ where: { MaGV: user.username } });
        const idGiaoVien = gvInfo ? gvInfo.id : 1; // Fallback ID 1 nếu lỗi

        const { tieuDe, noiDung, hanNop } = req.body;
        const file = req.file;
        const phanCong = await getPhanCong();

        // Validate
        if (!tieuDe || tieuDe.trim() === "") {
            return res.render('giaovien/taobaitap/tao_baitap', {
                phanCong,
                error: "Vui lòng nhập tiêu đề!",
                success: null
            });
        }

        // Lưu vào DB
        const filePath = file ? `/uploads/baitap/${file.filename}` : null;

        await BaiTap.create({
            TieuDe: tieuDe,
            NoiDung: noiDung,
            File: filePath,
            HanNop: hanNop,
            id_Lop: phanCong.id_Lop,
            id_MonHoc: phanCong.id_MonHoc,
            id_GiaoVien: idGiaoVien
        });

        res.render('giaovien/taobaitap/tao_baitap', {
            phanCong,
            error: null,
            success: "Giao bài tập thành công!"
        });

    } catch (error) {
        console.error("Lỗi lưu:", error);
        const phanCong = await getPhanCong();
        res.render('giaovien/taobaitap/tao_baitap', {
            phanCong,
            error: "Lưu thất bại: " + error.message,
            success: null
        });
    }
};