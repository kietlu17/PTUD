<<<<<<< HEAD
const { Lop, GiaoVien, MonHoc, BangPhanCongGiaoVien, BangPhanCongChuNhiem, sequelize } = require('../../models');
=======
const { Lop, GiaoVien, MonHoc, BangPhanCongGiaoVien, BangPhanCongChuNhiem, ChiTiet_ToHopMon,sequelize } = require('../../models');
>>>>>>> 1f26f04d5f47ef00b6d633733decf4e26684f9b6
const { Op } = require('sequelize'); 

/**
 * HÀM PHỤ TRỢ: Lấy dữ liệu chung để hiển thị ra View
 * (Dùng cho cả trang GET ban đầu, và render lại khi POST thành công/thất bại)
 */
<<<<<<< HEAD
async function getCommonDataForView() {
    // 1. Lấy danh sách lớp chưa có GVCN
    const dsLop = await Lop.findAll({
        where: { id_GiaoVienChuNhiem: { [Op.is]: null } },
        order: [['TenLop', 'ASC']]
    });

    // 2. Lấy tất cả môn học
    const dsMonHoc = await MonHoc.findAll();

    // 3. Lấy danh sách ID giáo viên ĐANG làm chủ nhiệm (để loại trừ)
    const lopDaCoChuNhiem = await Lop.findAll({
        attributes: ['id_GiaoVienChuNhiem'],
        where: { id_GiaoVienChuNhiem: { [Op.ne]: null } }
    });
    const busyTeacherIds = lopDaCoChuNhiem.map(l => l.id_GiaoVienChuNhiem);

    // 4. Lấy danh sách GVCN Khả dụng (Trừ những người đang bận)
    const dsGiaoVienChuNhiemKhaDung = await GiaoVien.findAll({
        where: { id: { [Op.notIn]: busyTeacherIds } },
        order: [['HoVaTen', 'ASC']]
    });

    // 5. Lấy danh sách GV Bộ môn (Kèm thông tin chuyên môn)
    const dsGiaoVienBoMon = await GiaoVien.findAll({
        include: [{ model: MonHoc, as: 'chuyenMon' }], 
        order: [['HoVaTen', 'ASC']]
    });

    return { dsLop, dsMonHoc, dsGiaoVienChuNhiemKhaDung, dsGiaoVienBoMon };
}

=======
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


>>>>>>> 1f26f04d5f47ef00b6d633733decf4e26684f9b6
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
<<<<<<< HEAD
        const data = await getCommonDataForView();
        res.render('bangiamhieu/phancongGV/phancong', {
            ...data,
            success: req.query.success || null,
            error: null
=======
        const data = await getCommonDataForView(req, res);
        res.render('bangiamhieu/phancongGV/phancong', {
            ...data,
            success: req.query.success || null,
            error: null,
            currentUrl: '/phancong',
>>>>>>> 1f26f04d5f47ef00b6d633733decf4e26684f9b6
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
<<<<<<< HEAD
    const transaction = await sequelize.transaction();

    try {
        const { id_Lop, NamHoc, KyHoc, id_GVCN, assignments } = req.body;

        console.log("--- Bắt đầu xử lý phân công ---");
        console.log("Assignments received:", assignments);

        // --- BƯỚC 1: XỬ LÝ PHÂN CÔNG CHỦ NHIỆM ---
        let tenGVCN = "Chưa phân công";
        if (id_GVCN && id_GVCN.trim() !== "") {
            // Cập nhật bảng Lớp
            await Lop.update({ id_GiaoVienChuNhiem: id_GVCN }, { where: { id: id_Lop }, transaction });
            
            // Lưu lịch sử phân công
            await BangPhanCongChuNhiem.create({
                id_Lop, id_GiaoVien: id_GVCN, NamHoc, NgayPhanCong: new Date()
            }, { transaction });

            // Lấy tên GVCN để hiển thị
            const gv = await GiaoVien.findByPk(id_GVCN);
            if (gv) tenGVCN = gv.HoVaTen;
        }

        // --- BƯỚC 2: XỬ LÝ PHÂN CÔNG BỘ MÔN (Hỗ trợ cả Mảng và Object) ---
        const chiTietPhanCong = []; 
        
        if (assignments) {
            const listAssignments = [];
            
            if (Array.isArray(assignments)) {
                // TRƯỜNG HỢP 1: assignments là Mảng ['idGV1', 'idGV2'...]
                // (Xảy ra nếu view EJS đặt name="assignments")
                for (let i = 0; i < assignments.length; i++) {
                    const monHocId = i + 1; // Giả định index+1 là ID Môn (Cần chú ý nếu ID môn không liên tục)
                    const giaoVienId = parseInt(assignments[i]);

                    if (giaoVienId) {
                        listAssignments.push(createAssignmentPromise(id_Lop, monHocId, giaoVienId, NamHoc, KyHoc, transaction, chiTietPhanCong));
                    }
                }
            } else {
                // TRƯỜNG HỢP 2: assignments là Object { '1': 'idGV', '2': 'idGV' }
                // (Xảy ra nếu view EJS đặt name="assignments[idMon]") -> KHUYÊN DÙNG
                for (const [key, value] of Object.entries(assignments)) {
                    const monHocId = parseInt(key);
                    const giaoVienId = parseInt(value);

                    if (giaoVienId) {
                        listAssignments.push(createAssignmentPromise(id_Lop, monHocId, giaoVienId, NamHoc, KyHoc, transaction, chiTietPhanCong));
                    }
                }
            }
            
            await Promise.all(listAssignments);
        }

        // --- BƯỚC 3: COMMIT & RENDER THÀNH CÔNG ---
        await transaction.commit();
        
        // Lấy lại thông tin lớp vừa lưu
        const lop = await Lop.findByPk(id_Lop);
        
        // Lấy dữ liệu mới nhất để render lại form (tránh lỗi form trống)
        const data = await getCommonDataForView();

        res.render('bangiamhieu/phancongGV/phancong', {
            ...data,
            success: true,
            error: null,
            // Gửi cục dữ liệu này xuống để Modal hiển thị
            successData: {
                TenLop: lop ? lop.TenLop : id_Lop,
                NamHoc,
                KyHoc,
                TenGVCN: tenGVCN,
                ChiTiet: chiTietPhanCong
            }
        });

    } catch (error) {
        // --- BƯỚC 4: ROLLBACK & RENDER LỖI ---
        await transaction.rollback();
        console.error("Lỗi khi lưu phân công:", error);
        
        // Vẫn phải lấy dữ liệu để hiện lại form cho người dùng nhập lại
        const data = await getCommonDataForView();
        
        res.render('bangiamhieu/phancongGV/phancong', {
            ...data,
            success: null,
            error: "Lỗi: " + error.message
        });
    }
=======
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
        },
        currentUrl: '/phancong',
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
        error: "Lỗi: " + error.message,
        currentUrl: '/phancong',
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
>>>>>>> 1f26f04d5f47ef00b6d633733decf4e26684f9b6
};