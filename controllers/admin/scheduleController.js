const { Lop, MonHoc, GiaoVien, BangPhanCongGiaoVien, ThoiKhoaBieu, sequelize } = require('../../models');
const { Op } = require('sequelize');

// --- CẤU HÌNH ---
const DEFAULT_YEAR = '2025-2026';
const DEFAULT_SEMESTER = '1';

// [HELPER] Lấy dữ liệu chung
async function getCommonDataForView(id_Lop, namHoc, hocKy) {
    const listPhanCong = await BangPhanCongGiaoVien.findAll({
        where: { id_Lop: id_Lop },
        include: [{ model: GiaoVien, as: 'giaoVien' }, { model: MonHoc, as: 'monHoc' }]
    });

    const currentSchedule = await ThoiKhoaBieu.findAll({
        where: { id_Lop: id_Lop, NamHoc: namHoc, HocKy: hocKy },
        include: [{ model: GiaoVien, as: 'giaoVien' }, { model: MonHoc, as: 'monHoc' }]
    });

    // Busy Map & Teacher Load
    const teacherIds = listPhanCong.map(pc => pc.id_GiaoVien);
    const allSchedules = await ThoiKhoaBieu.findAll({
        where: { id_GiaoVien: { [Op.in]: teacherIds }, NamHoc: namHoc, HocKy: hocKy },
        include: [{ model: Lop, as: 'lop' }]
    });

    const busyMap = {};     
    const teacherLoad = {}; 

    allSchedules.forEach(s => {
        if (s.id_Lop != id_Lop) busyMap[`${s.id_GiaoVien}-${s.Thu}-${s.Tiet}`] = s.lop.TenLop;
        
        if (!teacherLoad[s.id_GiaoVien]) teacherLoad[s.id_GiaoVien] = { total: 0, days: {} };
        teacherLoad[s.id_GiaoVien].total++;
        if (!teacherLoad[s.id_GiaoVien].days[s.Thu]) teacherLoad[s.id_GiaoVien].days[s.Thu] = 0;
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
        // Lấy tham số từ URL (hoặc dùng mặc định)
        const selectedNamHoc = req.query.namHoc || DEFAULT_YEAR;
        const selectedHocKy = req.query.hocKy || DEFAULT_SEMESTER;
        
        const listLop = await Lop.findAll({ order: [['TenLop', 'ASC']] });

        // Đếm số tiết đã xếp theo Năm/Kỳ được chọn
        const scheduleCounts = await ThoiKhoaBieu.findAll({
            attributes: ['id_Lop', [sequelize.fn('COUNT', sequelize.col('id')), 'total']],
            where: { NamHoc: selectedNamHoc, HocKy: selectedHocKy },
            group: ['id_Lop'], raw: true
        });

        const countMap = {};
        scheduleCounts.forEach(item => countMap[item.id_Lop] = parseInt(item.total));

        res.render('admin/thoikhoabieu/list', { 
            listLop, 
            countMap, 
            fullThreshold: 30, // Giả định 30 tiết/tuần là đầy đủ
            selectedNamHoc,    // Truyền lại để view hiển thị
            selectedHocKy
        });
    } catch (error) {
        console.error("Lỗi lấy danh sách lớp:",error);
        res.status(500).send("Lỗi Server");
    }
};

/**
 * [GET] /admin/thoikhoabieu/create?id_Lop=...
 * Hiển thị giao diện lưới để xếp TKB
 */
exports.getCreatePage = async (req, res) => {
    try {
        const { id_Lop, namHoc, hocKy } = req.query;
        
        // Nếu thiếu tham số, dùng mặc định
        const useNamHoc = namHoc || DEFAULT_YEAR;
        const useHocKy = hocKy || DEFAULT_SEMESTER;

        if (!id_Lop) return res.status(400).send("Vui lòng chọn lớp.");

        const lop = await Lop.findByPk(id_Lop);
        const data = await getCommonDataForView(id_Lop, useNamHoc, useHocKy);

        res.render('admin/thoikhoabieu/create', {
            lop,
            ...data,
            selectedNamHoc: useNamHoc,
            selectedHocKy: useHocKy
        });
    } catch (error) {
        console.error(error);
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