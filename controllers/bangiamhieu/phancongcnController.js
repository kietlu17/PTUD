const { sequelize, Lop, GiaoVien, BangPhanCongChuNhiem } = require('../../models');
const { Op } = require('sequelize');

// Controller hiển thị form phân công
exports.renderFormGVCN = async (req, res) => {
    try {
        // --- Lấy danh sách lớp ---
        const dsLop = await Lop.findAll({
            attributes: ['id', 'TenLop']
        });

        // --- Lấy danh sách giáo viên chưa làm GVCN ---
        const lopDaCoChuNhiem = await Lop.findAll({
            attributes: ['id_GiaoVienChuNhiem'],
            where: { id_GiaoVienChuNhiem: { [Op.ne]: null } }
        });
        const busyTeacherIds = lopDaCoChuNhiem.map(l => l.id_GiaoVienChuNhiem);

        const dsGiaoVienChuNhiemKhaDung = await GiaoVien.findAll({
            where: { id: { [Op.notIn]: busyTeacherIds } }
        });

        res.render('bangiamhieu/phancongGV/phancongcn', {
            dsLop,
            dsGiaoVienChuNhiemKhaDung,
            error: null,
            successData: null
        });
    } catch (error) {
        console.error("Lỗi render form:", error);
        res.render('bangiamhieu/phancongGV/phancongcn', {
            dsLop: [],
            dsGiaoVienChuNhiemKhaDung: [],
            error: "Lỗi khi load form phân công",
            successData: null
        });
    }
};

// Controller xử lý POST phân công
exports.saveGVCN = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { id_Lop, NamHoc, id_GVCN } = req.body;

        // --- 1. Lưu GVCN ---
        let tenGVCN = null;
        if (id_GVCN) {
            const gv = await GiaoVien.findByPk(id_GVCN);
            tenGVCN = gv ? gv.HoVaTen : null;

            await Lop.update({ id_GiaoVienChuNhiem: id_GVCN }, {
                where: { id: id_Lop },
                transaction
            });

            // Lưu vào bảng BangPhanCongGiaoVien
            await BangPhanCongChuNhiem.create({
                id_Lop,
                id_GiaoVien: id_GVCN,
                NamHoc,
                NgayPhanCong: new Date()
            }, { transaction });
        }

        await transaction.commit();

        // Lấy tên lớp
        const lop = await Lop.findByPk(id_Lop);

        // Render lại form với modal thành công
        const dsLop = await Lop.findAll({ attributes: ['id', 'TenLop'] });
        const lopDaCoChuNhiem = await Lop.findAll({
            attributes: ['id_GiaoVienChuNhiem'],
            where: { id_GiaoVienChuNhiem: { [Op.ne]: null } }
        });
        const busyTeacherIds = lopDaCoChuNhiem.map(l => l.id_GiaoVienChuNhiem);
        const dsGiaoVienChuNhiemKhaDung = await GiaoVien.findAll({
            where: { id: { [Op.notIn]: busyTeacherIds } }
        });

        res.render('bangiamhieu/phancongGV/phancongcn', {
            dsLop,
            dsGiaoVienChuNhiemKhaDung,
            error: null,
            successData: {
                TenLop: lop ? lop.TenLop : id_Lop,
                NamHoc,
                tenGVCN
            }
        });

    } catch (error) {
        if (!transaction.finished) await transaction.rollback();
        console.error("Lỗi khi lưu phân công:", error);

        const dsLop = await Lop.findAll({ attributes: ['id', 'TenLop'] });
        const lopDaCoChuNhiem = await Lop.findAll({
            attributes: ['id_GiaoVienChuNhiem'],
            where: { id_GiaoVienChuNhiem: { [Op.ne]: null } }
        });
        const busyTeacherIds = lopDaCoChuNhiem.map(l => l.id_GiaoVienChuNhiem);
        const dsGiaoVienChuNhiemKhaDung = await GiaoVien.findAll({
            where: { id: { [Op.notIn]: busyTeacherIds } }
        });

        res.render('bangiamhieu/phancongGV/phancongcn', {
            dsLop,
            dsGiaoVienChuNhiemKhaDung,
            error: "Lỗi khi lưu phân công: " + error.message,
            successData: null
        });
    }
};
