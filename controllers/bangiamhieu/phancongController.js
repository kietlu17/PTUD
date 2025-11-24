const { Lop, GiaoVien, MonHoc, BangPhanCongGiaoVien, BangPhanCongChuNhiem, ChiTiet_ToHopMon,sequelize } = require('../../models');
const { Op } = require('sequelize'); 

/**
 * HÀM PHỤ TRỢ: Lấy dữ liệu chung để hiển thị ra View
 * (Dùng cho cả trang GET ban đầu, và render lại khi POST thành công/thất bại)
 */
async function getCommonDataForView(req, res) {
    // 1. Lấy danh sách lớp của trường chưa có GVCN
    const bgh = req.session.user.profile;
    const dsLop = await Lop.findAll({
        where: { 
            id_GiaoVienChuNhiem: { [Op.is]: null },
            id_truong: bgh.id_truong
        },
        order: [['TenLop', 'ASC']]
    });

    const dsGiaoVienBoMon = await GiaoVien.findAll({
        include: [{ model: MonHoc, as: 'chuyenMon' }], 
        where: { 
            id_truong: bgh.id_truong
        },
        order: [['HoVaTen', 'ASC']]
    });

    return { dsLop, dsGiaoVienBoMon};
}


/**
 * HÀM PHỤ TRỢ: Tạo Promise lưu bộ môn và lấy tên để hiển thị báo cáo
 */
async function createAssignmentPromise(idLop, idMon, idGV, nam, ky, trans, resultArr) {
    // Kiểm tra dữ liệu hợp lệ trước khi tạo
    if (!idMon || !idGV || isNaN(idMon) || isNaN(idGV)) return null;

    return BangPhanCongGiaoVien.create({
        id_Lop: idLop, 
        id_MonHoc: idMon, 
        id_GiaoVien: idGV,
        NamHoc: nam, 
        KyHoc: ky, 
        NgayPhanCong: new Date()
    }, { transaction: trans })
    .then(async () => {
        // Lấy tên Môn và GV để hiển thị ra Modal thông báo
        const tenMon = await MonHoc.findByPk(idMon).then(m => m ? m.TenMon : 'Môn ' + idMon);
        const tenGV = await GiaoVien.findByPk(idGV).then(g => g ? g.HoVaTen : 'GV ' + idGV);
        resultArr.push({ tenMon, tenGV });
    });
}

/**
 * [GET] /bangiamhieu/phancong
 * Hiển thị trang phân công giáo viên
 */
exports.getPhanCongPage = async (req, res) => {
    try {
        const data = await getCommonDataForView(req, res);
        res.render('bangiamhieu/phancongGV/phancong', {
            ...data,
            success: req.query.success || null,
            error: null
        });
    } catch (error) {
        console.error("Lỗi lấy dữ liệu trang phân công:", error);
        res.status(500).send("Lỗi Server: Không thể tải dữ liệu phân công.");
    }
};

/**
 * [POST] /bangiamhieu/phancong
 * Xử lý lưu dữ liệu phân công
 */
exports.savePhanCong = async (req, res) => {
const transaction = await sequelize.transaction();
let chiTietPhanCong = [];

try {
    const { id_Lop, NamHoc, KyHoc, assignments, id_GVCN } = req.body;

    // --- 1. Phân công giáo viên chủ nhiệm ---
    let tenGVCN = null;
    if (id_GVCN) {
        const gv = await GiaoVien.findByPk(id_GVCN);
        tenGVCN = gv ? gv.HoVaTen : null;

        await Lop.update({ id_GiaoVienChuNhiem: id_GVCN }, {
            where: { id: id_Lop },
            transaction
        });
    }

    // --- 2. Phân công giáo viên bộ môn ---
    chiTietPhanCong = [];
    if (assignments && Object.keys(assignments).length > 0) {
        const listPromises = Object.entries(assignments)
            .map(([idMon, idGV]) => createAssignmentPromise(
                id_Lop, parseInt(idMon), parseInt(idGV), NamHoc, KyHoc, transaction, chiTietPhanCong
            ));
        await Promise.all(listPromises);
    }

    // --- 3. Commit transaction ---
    await transaction.commit();

    // Lấy thông tin lớp
    const lop = await Lop.findByPk(id_Lop);

    // Lấy dữ liệu chung cho form
    const data = await getCommonDataForView(req, res);

    res.render('bangiamhieu/phancongGV/phancong', {
        ...data,
        success: true,
        error: null,
        successData: {
            TenLop: lop ? lop.TenLop : id_Lop,
            NamHoc,
            KyHoc,
            TenGVCN: tenGVCN,
            ChiTiet: chiTietPhanCong
        }
    });

} catch (error) {
    // --- 4. Rollback nếu transaction chưa commit ---
    if (!transaction.finished) {
        await transaction.rollback();
    }
    console.error("Lỗi khi lưu phân công:", error);

    const data = await getCommonDataForView(req, res);
    res.render('bangiamhieu/phancongGV/phancong', {
        ...data,
        success: null,
        error: "Lỗi: " + error.message
    });
}};


exports.getMonHocTheoLop = async (req, res) => {
    try {
        const idLop = req.params.idLop;

        // --- Lấy lớp ---
        const lop = await Lop.findByPk(idLop);

        if (!lop) {
            return res.json({ monBatBuoc: [], monTuChon: [] });
        }

        // --- 1. Môn bắt buộc (cố định) ---
        const monBatBuoc = await MonHoc.findAll({
            where: { id: [1, 2, 3, 12, 13, 7] }  // TOÁN, VĂN, ANH... tùy bảng của bạn
        });

        // --- 2. Lấy môn tự chọn theo tổ hợp ---
        const monTuChon = await MonHoc.findAll({
            include: [{
                model: ChiTiet_ToHopMon,
                where: { subject_group_id: lop.id_ToHopMon }
            }]
        });


        return res.json({
            monBatBuoc,
            monTuChon
        });

    } catch (err) {
        console.error(err);
        res.json({ monBatBuoc: [], monTuChon: [] });
    }
};