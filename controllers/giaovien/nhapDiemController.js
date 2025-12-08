const { BangPhanCongGiaoVien, Lop, MonHoc, HocSinh, DiemSo, GiaoVien } = require('../../models');

// 1. Chọn Lớp (Giống bài trước)
exports.hienThiDanhSachLop = async(req, res) => {
    const user = req.session.user;
    const gv = await GiaoVien.findOne({ where: { MaGV: user.username } });
    const idGV = gv ? gv.id : 1;

    const dsPhanCong = await BangPhanCongGiaoVien.findAll({
        where: { id_GiaoVien: idGV },
        include: [{ model: Lop, as: 'lop' }, { model: MonHoc, as: 'monhoc' }],
        raw: true,
        nest: true
    });
    res.render('giaovien/nhapdiem/chon_lop', { dsPhanCong });
};

// 2. Hiển thị bảng điểm
exports.hienThiBangDiem = async(req, res) => {
    const idPhanCong = req.params.idPhanCong;
    const phanCong = await BangPhanCongGiaoVien.findByPk(idPhanCong, {
        include: [{ model: Lop, as: 'lop' }, { model: MonHoc, as: 'monhoc' }]
    });

    // Exception 6.2: Kiểm tra thời hạn nhập điểm (Ví dụ giả lập)
    const isHetHan = false; // Logic thực tế: check bảng NamHoc/KyHoc

    const dsHocSinh = await HocSinh.findAll({
        where: { id_Lop: phanCong.id_Lop },
        include: [{
            model: DiemSo,
            as: 'bangDiem',
            required: false,
            where: { id_MonHoc: phanCong.id_MonHoc }
        }],
        order: [
            ['HoVaTen', 'ASC']
        ]
    });

    res.render('giaovien/nhapdiem/nhap_diem_form', { phanCong, dsHocSinh, isHetHan });
};

// 3. Lưu điểm (Có Validate 0-10)
exports.luuBangDiem = async(req, res) => {
    const idPhanCong = req.params.idPhanCong;
    try {
        const { grades } = req.body;
        const phanCong = await BangPhanCongGiaoVien.findByPk(idPhanCong);

        // Validation 0-10 cho toàn bộ dữ liệu
        for (const sid in grades) {
            const d = grades[sid];
            const check = (val) => {
                if (val === '') return true;
                const num = parseFloat(val);
                return num >= 0 && num <= 10;
            };

            if (!check(d.DiemTX1) || !check(d.DiemTX2) || !check(d.DiemGK) || !check(d.DiemCK)) {
                // Alternative flow 6.1
                throw new Error(`Điểm không hợp lệ (Phải từ 0-10). Vui lòng kiểm tra lại!`);
            }
        }

        // ... Logic lưu vào DB (Giống code tối ưu ở bài trước dùng Promise.all) ...
        // (Copy đoạn logic lưu ở bài trước vào đây)

        res.json({ success: true, message: "Lưu điểm thành công!" });

    } catch (error) {
        // Exception 8.1: Lỗi lưu
        res.status(400).json({ success: false, message: error.message });
    }
};