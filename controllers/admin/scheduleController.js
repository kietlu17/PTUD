const { Lop, MonHoc, GiaoVien, BangPhanCongGiaoVien, ThoiKhoaBieu, sequelize } = require('../../models');
const { Op } = require('sequelize');

// --- CẤU HÌNH ---
const CURRENT_YEAR = '2025-2026';
const CURRENT_SEMESTER = '1';

// [HELPER] Lấy dữ liệu chung
async function getCommonDataForView(id_Lop) {
    // 1. Lấy danh sách phân công
    const listPhanCong = await BangPhanCongGiaoVien.findAll({
        where: { id_Lop: id_Lop },
        include: [
            { model: GiaoVien, as: 'giaoVien' },
            { model: MonHoc, as: 'monHoc' }
        ]
    });

    // 2. Lấy TKB hiện tại của lớp
    const currentSchedule = await ThoiKhoaBieu.findAll({
        where: { id_Lop: id_Lop, NamHoc: CURRENT_YEAR, HocKy: CURRENT_SEMESTER },
        include: [{ model: GiaoVien, as: 'giaoVien' }, { model: MonHoc, as: 'monHoc' }]
    });

    // 3. TẠO MA TRẬN BẬN & TÍNH SỐ TIẾT (LOAD)
    const teacherIds = listPhanCong.map(pc => pc.id_GiaoVien);
    
    // Lấy TOÀN BỘ lịch dạy của các giáo viên này trong học kỳ (ở tất cả các lớp)
    const allSchedules = await ThoiKhoaBieu.findAll({
        where: {
            id_GiaoVien: { [Op.in]: teacherIds },
            NamHoc: CURRENT_YEAR,
            HocKy: CURRENT_SEMESTER
        },
        include: [{ model: Lop, as: 'lop' }]
    });

    const busyMap = {};     // Check trùng lịch: "IDGV-Thu-Tiet" -> "TênLop"
    const teacherLoad = {}; // Check số tiết: "IDGV" -> { total: 15, days: {'2': 3, ...} }

    allSchedules.forEach(s => {
        // a. Xử lý BusyMap (Chỉ tính lớp khác)
        if (s.id_Lop != id_Lop) {
            const key = `${s.id_GiaoVien}-${s.Thu}-${s.Tiet}`;
            busyMap[key] = s.lop.TenLop;
        }

        // b. Xử lý TeacherLoad (Tính cả lớp hiện tại và lớp khác)
        if (!teacherLoad[s.id_GiaoVien]) {
            teacherLoad[s.id_GiaoVien] = { total: 0, days: {} };
        }
        
        // Tăng tổng số tiết tuần
        teacherLoad[s.id_GiaoVien].total++;

        // Tăng số tiết ngày
        if (!teacherLoad[s.id_GiaoVien].days[s.Thu]) {
            teacherLoad[s.id_GiaoVien].days[s.Thu] = 0;
        }
        teacherLoad[s.id_GiaoVien].days[s.Thu]++;
    });

    return { listPhanCong, currentSchedule, busyMap, teacherLoad };
}


// ============================================================
// 2. CÁC HÀM EXPORT (CONTROLLER)
// ============================================================

/**
 * [GET] /admin/thoikhoabieu
 * Hiển thị danh sách các lớp để chọn xếp TKB
 */
exports.getListClasses = async (req, res) => {
    try {
        // 1. Lấy danh sách tất cả các lớp
        const listLop = await Lop.findAll({
            order: [['TenLop', 'ASC']]
        });

        // 2. Đếm số lượng tiết học đã xếp cho từng lớp
        // Kết quả trả về dạng: [{ id_Lop: 1, total: 5 }, { id_Lop: 2, total: 30 }]
        const scheduleCounts = await ThoiKhoaBieu.findAll({
            attributes: [
                'id_Lop',
                [sequelize.fn('COUNT', sequelize.col('id')), 'total']
            ],
            where: {
                NamHoc: CURRENT_YEAR,
                HocKy: CURRENT_SEMESTER
            },
            group: ['id_Lop'],
            raw: true // Trả về object thuần để dễ xử lý
        });

        // 3. Chuyển đổi sang dạng Map để tra cứu nhanh ở View
        // Format: { 'ID_LOP': SO_TIET } -> Ví dụ: { '1': 30, '2': 5 }
        const countMap = {};
        scheduleCounts.forEach(item => {
            countMap[item.id_Lop] = parseInt(item.total);
        });

        res.render('admin/thoikhoabieu/list', {
            listLop,
            countMap, // Gửi map số lượng xuống view
            fullThreshold: 30 // Định nghĩa số tiết coi là "Full" (ví dụ 30 tiết/tuần)
        });

    } catch (error) {
        console.error("Lỗi lấy danh sách lớp:", error);
        res.status(500).send("Lỗi Server");
    }
};

/**
 * [GET] /admin/thoikhoabieu/create?id_Lop=...
 * Hiển thị giao diện lưới để xếp TKB
 */
exports.getCreatePage = async (req, res) => {
    try {
        const { id_Lop } = req.query;

        if (!id_Lop) return res.status(400).send("Vui lòng chọn lớp trước.");

        const lop = await Lop.findByPk(id_Lop);
        if (!lop) return res.status(404).send("Lớp không tồn tại");

        // Gọi hàm phụ trợ lấy dữ liệu
        const data = await getCommonDataForView(id_Lop);

        res.render('admin/thoikhoabieu/create', {
            lop,
            ...data // Bung dữ liệu (listPhanCong, currentSchedule, busyMap) ra
        });

    } catch (error) {
        console.error("Lỗi lấy trang TKB:", error);
        res.status(500).send("Lỗi Server");
    }
};

/**
 * [POST] /admin/tkb/save
 * Lưu Thời Khóa Biểu vào CSDL
 */
exports.saveSchedule = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { id_Lop, scheduleData, NamHoc, HocKy } = req.body;

        console.log(`Saving schedule for Class ${id_Lop}... Items: ${scheduleData.length}`);

        // 1. Xóa TKB cũ của lớp này
        await ThoiKhoaBieu.destroy({
            where: { id_Lop, NamHoc, HocKy },
            transaction
        });

        // 2. Tạo TKB mới
        if (scheduleData && scheduleData.length > 0) {
            const dataToInsert = scheduleData.map(item => ({
                id_Lop: id_Lop,
                id_MonHoc: item.id_Mon,
                id_GiaoVien: item.id_GV,
                Thu: item.thu, 
                Tiet: item.tiet,
                NamHoc: NamHoc,
                HocKy: HocKy
            }));

            await ThoiKhoaBieu.bulkCreate(dataToInsert, { transaction });
        }

        await transaction.commit();
        res.json({ success: true, message: "Lưu thời khóa biểu thành công!" });

    } catch (error) {
        await transaction.rollback();
        console.error("Lỗi lưu TKB:", error);
        res.status(500).json({ success: false, message: "Lỗi hệ thống: " + error.message });
    }
};