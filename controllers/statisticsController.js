const { DiemSo, HocSinh, Lop, MonHoc, GiaoVien, BangPhanCongGiaoVien, HanhKiem, sequelize } = require('../models');
const { Op } = require('sequelize');

// --- 1. HÀM ĐIỀU PHỐI (DISPATCHER) ---
exports.getStatisticsPage = async (req, res) => {
    try {
        const user = req.session.user;
        if (!user) return res.redirect('/login');

        const role = user.role.toLowerCase();
        const profileId = user.profile.id;

        // 1. NẾU LÀ BGH / ADMIN
        if (['ban giám hiệu', 'bgh'].includes(role)) {
            return await renderBGH(req, res);
        } 
        
        // 2. NẾU LÀ GIÁO VIÊN
        else if (role === 'giáo viên') {
            // A. Kiểm tra vai trò Chủ nhiệm
            const lopChuNhiem = await Lop.findOne({ where: { id_GiaoVienChuNhiem: profileId } });
            const isGVCN = !!lopChuNhiem;

            // B. Kiểm tra vai trò Bộ môn (Có được phân công dạy lớp nào không)
            const countPhanCong = await BangPhanCongGiaoVien.count({ where: { id_GiaoVien: profileId } });
            const isGVBM = countPhanCong > 0;

            // C. Lấy chế độ xem từ URL (ví dụ: /giaovien/thongke?view=gvbm)
            const viewMode = req.query.view;

            // --- LOGIC ĐIỀU HƯỚNG ---
            
            // Trường hợp 1: Muốn xem GVBM (và thực sự có quyền GVBM)
            if (viewMode === 'gvbm' && isGVBM) {
                return await renderGVBM(req, res, profileId, isGVCN); // Truyền thêm cờ isGVCN để hiện nút quay lại
            }

            // Trường hợp 2: Là GVCN (mặc định ưu tiên hiển thị cái này trước)
            if (isGVCN) {
                return await renderGVCN(req, res, profileId, lopChuNhiem, isGVBM); // Truyền thêm cờ isGVBM để hiện nút chuyển
            }

            // Trường hợp 3: Chỉ là GVBM bình thường (không chủ nhiệm)
            if (isGVBM) {
                return await renderGVBM(req, res, profileId, false);
            }

            // Trường hợp 4: Giáo viên mới, chưa được phân công gì cả
            return res.render('thongke/empty', { message: "Bạn chưa được phân công nhiệm vụ." });
        }
        
        else {
            return res.status(403).send("Không có quyền truy cập.");
        }

    } catch (error) {
        console.error("Lỗi Controller Thống kê:", error);
        res.status(500).send("Lỗi Server");
    }
};

// --- 2. CÁC HÀM RENDER RIÊNG BIỆT ---

// Giao diện BGH: Xem tất cả
async function renderBGH(req, res) {
    const dsLop = await Lop.findAll({ order: [['TenLop', 'ASC']] });
    const dsMon = await MonHoc.findAll({ order: [['TenMon', 'ASC']] });
    
    // Mặc định năm hiện tại
    const currentYear = new Date().getFullYear();
    const defaultNamHoc = `${currentYear}-${currentYear + 1}`;

    res.render('thongke/dashboard-bgh', {
        dsLop, dsMon, defaultNamHoc
    });
}

// Giao diện GVCN: Chỉ xem lớp mình, nhưng xem được Hạnh kiểm và Tất cả môn
async function renderGVCN(req, res, gvId, lopInfo, canSwitchToGVBM) {
    const dsMon = await MonHoc.findAll({ order: [['TenMon', 'ASC']] });
    const currentYear = new Date().getFullYear();
    const defaultNamHoc = `${currentYear}-${currentYear + 1}`;
    const siSo = await HocSinh.count({ where: { id_Lop: lopInfo.id } });

    res.render('thongke/dashboard-gvcn', {
        lop: lopInfo,
        dsMon,
        siSo,
        defaultNamHoc,
        canSwitchToGVBM, // <-- Biến mới để hiện nút chuyển
        currentPage: '/thongke'
    });
}

// Giao diện GVBM: Chỉ xem môn mình dạy và các lớp được phân công
async function renderGVBM(req, res, gvId, canSwitchToGVCN) {
    const gv = await GiaoVien.findByPk(gvId, { include: [{model: MonHoc, as: 'chuyenMon'}] });
    
    const phanCong = await BangPhanCongGiaoVien.findAll({
        where: { id_GiaoVien: gvId },
        include: [{ model: Lop, as: 'lop' }]
    });

    const uniqueLops = [];
    const mapLop = new Map();
    phanCong.forEach(pc => {
        if (pc.lop && !mapLop.has(pc.lop.id)) {
            mapLop.set(pc.lop.id, true);
            uniqueLops.push(pc.lop);
        }
    });
    uniqueLops.sort((a, b) => a.TenLop.localeCompare(b.TenLop));

    const currentYear = new Date().getFullYear();
    const defaultNamHoc = `${currentYear}-${currentYear + 1}`;

    res.render('thongke/dashboard-gvbm', {
        dsLop: uniqueLops,
        monHoc: gv ? gv.chuyenMon : null,
        defaultNamHoc,
        canSwitchToGVCN, // <-- Biến mới để hiện nút chuyển
        currentPage: '/thongke'
    });
}

// --- 3. API LẤY DỮ LIỆU (DÙNG CHUNG CHO CẢ 3 VIEW) ---
exports.getStatisticsData = async (req, res) => {
    try {
        const { namHoc, hocKy, idLop, idMon } = req.body;

        // Validate required filters: năm học, học kỳ, lớp
        if (!namHoc || !hocKy || !idLop) {
            return res.json({ success: false, message: 'Vui lòng chọn Năm học, Học kỳ và Lớp để xem thống kê' });
        }

        // --- Điều kiện điểm ---
        const whereClause = {
            NamHoc: namHoc,
            HocKy: hocKy,
        };
        if (idMon) whereClause.id_MonHoc = idMon;

        // --- Điều kiện học sinh ---
        const studentWhere = {};
        if (idLop) studentWhere.id_Lop = idLop;

        // --- Truy vấn ---
        const listDiem = await DiemSo.findAll({
            where: whereClause,
            include: [
                {
                    model: HocSinh,
                    as: "hocSinh",
                    where: studentWhere,
                    include: [{ model: Lop, as: "lop" }],
                },
                {
                    model: MonHoc,
                    as: "monHoc",
                },
            ],
        });

        // --- Thống kê ---
        let stats = {
            total: listDiem.length,
            gioi: 0,
            kha: 0,
            tb: 0,
            yeu: 0,
            dat: 0,
            khongDat: 0,
        };

        const dataTable = listDiem.map((d) => {
            const {
                DiemTX1,
                DiemTX2,
                Diem1T1,
                Diem1T2,
                DiemGK,
                DiemCK,
                DiemTB,
            } = d;

            // --- Tính DTB nếu DB chưa có (weighted average) ---
            let dtb = DiemTB;
            if (dtb == null) {
                const weights = {
                    DiemTX1: 1,
                    DiemTX2: 1,
                    Diem1T1: 2,
                    Diem1T2: 2,
                    DiemGK: 2,
                    DiemCK: 3,
                };

                let numerator = 0;
                let denom = 0;
                for (const key of Object.keys(weights)) {
                    const v = d[key];
                    const w = weights[key];
                    if (typeof v === 'number' && !isNaN(v)) {
                        numerator += v * w;
                        denom += w;
                    }
                }

                dtb = denom > 0 ? numerator / denom : 0;
            }

// Apply custom rounding rule to dtb
                function customRoundDtb(v) {
                    if (v === null || v === undefined || isNaN(v)) return 0;
                    const intPart = Math.floor(v);
                    const firstDecimal = Math.floor((v * 10) % 10);
                    if (firstDecimal === 0) return Number(v.toFixed(2));
                    if (firstDecimal >= 1 && firstDecimal <= 4) return Number((intPart).toFixed(2));
                    if (firstDecimal === 5) return Number((intPart + 0.5).toFixed(2));
                    return Number((intPart + 1).toFixed(2));
                }

                dtb = customRoundDtb(dtb);

            // --- Xếp loại ---
            if (dtb >= 8) stats.gioi++;
            else if (dtb >= 6.5) stats.kha++;
            else if (dtb >= 5) stats.tb++;
            else stats.yeu++;

            if (dtb >= 5) stats.dat++;
            else stats.khongDat++;

            return {
                idDiem: d.id,
                maHS: d.hocSinh.MaHS,
                tenHS: d.hocSinh.HoVaTen,
                lop: d.hocSinh.lop.TenLop,
                mon: d.monHoc.TenMon,

                DiemTX1,
                DiemTX2,
                Diem1T1,
                Diem1T2,
                DiemGK,
                DiemCK,
                DiemTB: dtb,
            };
        });

        res.json({
            success: true,
            stats,
            data: dataTable,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
