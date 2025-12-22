const { GiaoVien, BangPhanCongGiaoVien, Lop, HocSinh, DiemSo, MonHoc } = require('../../models');
const { Sequelize, Op } = require('sequelize');

/**
 * GVBM: Xem điểm lớp mình dạy (chỉ môn mình dạy)
 */
exports.xemDiemGVBoMon = async(req, res) => {
    try {
        const giaoVienId = req.params.giaovienId;
        const { lopId, hocKy, namHoc } = req.query;


        const availableYears = await DiemSo.findAll({
            attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('NamHoc')), 'NamHoc']],
            where: { NamHoc: { [Op.ne]: null } },
            order: [['NamHoc', 'DESC']],
            raw: true
        });
        const danhSachNamHoc = availableYears.map(y => y.NamHoc);

        // 1. Lấy danh sách lớp mà GV dạy
        const dsLop = await BangPhanCongGiaoVien.findAll({
            where: { id_GiaoVien: giaoVienId },
            include: [{
                model: Lop,
                as: 'lop',
                attributes: ['id', 'TenLop'],
            }],
            attributes: ['id_Lop']
        });
 
        const lopIds = dsLop.map(x => x.id_Lop);

        // Nếu không chọn lớp, mặc định lớp đầu tiên
        const selectedLopId = lopId || lopIds[0];

        if (!lopIds.includes(parseInt(selectedLopId))) {
            return res.status(403).send('Bạn không có quyền xem điểm lớp này');
        }

        // 2. Lấy thông tin lớp
        const lop = await Lop.findByPk(selectedLopId, {
            include: [{
                model: HocSinh,
                as: 'hocsinhs',
                attributes: ['id', 'HoVaTen'],
            }],
        });

        if (!lop) {
            return res.status(404).send('Không tìm thấy lớp');
        }

        // 3. Lấy môn học của GV này
        const giaovien = await GiaoVien.findByPk(giaoVienId, {
            include: [{
                model: MonHoc,
                as: 'chuyenMon',
                attributes: ['id', 'TenMon'],
            }],
            raw: false,
        });


        if (!giaovien || !giaovien.chuyenMon) {
            return res.status(500).send('Không tìm thấy thông tin môn học của giáo viên');
        }


        let chuyenMonArray = [];
        if (Array.isArray(giaovien.chuyenMon)) {
            chuyenMonArray = giaovien.chuyenMon;
        } else if (giaovien.chuyenMon) {
            chuyenMonArray = [giaovien.chuyenMon];
        }

        if (chuyenMonArray.length === 0) {
            return res.status(500).send('Giáo viên chưa được phân công môn học nào');
        }

        const monHocIds = chuyenMonArray.map(mon => mon.id);


        const hocSinhIds = lop.hocsinhs.map(hs => hs.id);

        if (hocSinhIds.length === 0) {
            return res.render('./giaovien/diem/xemDiemBoMon', {
                lop,
                dsLop,
                selectedLopId,
                diemData: [],
                classAverages: {},
                giaovien: { ...giaovien.toJSON(), chuyenMon: chuyenMonArray },
                profile: req.session.user.profile,
                currentPage: '/xem-diem-bo-mon',
                currentUser: req.session.user,
                hocKy: hocKy || '',
                namHoc: namHoc || new Date().getFullYear(),
            });
        }

        const whereCondition = {
            id_HocSinh: hocSinhIds, // ← FIX: Dùng DANH SÁCH ID HỌC SINH
            id_MonHoc: monHocIds,
        };

        if (hocKy) {
            whereCondition.HocKy = hocKy;
        }

        if (namHoc) {
            whereCondition.NamHoc = String(namHoc);
        }

        const diemData = await DiemSo.findAll({
            where: whereCondition,
            include: [
                {
                    model: HocSinh,
                    as: 'hocSinh',
                    attributes: ['id', 'HoVaTen'],
                },
                {
                    model: MonHoc,
                    as: 'monHoc',
                    attributes: ['id', 'TenMon'],
                },
            ],
        });


       

        // 8. Render
        res.render('./giaovien/diem/xemDiemBoMon', {
            lop,
            dsLop,
            selectedLopId,
            diemData,
            giaovien: { ...giaovien.toJSON(), chuyenMon: chuyenMonArray },
            profile: req.session.user.profile,
            currentPage: '/xem-diem-bo-mon',
            currentUser: req.session.user,
            hocKy: hocKy || '',
            namHoc: namHoc || new Date().getFullYear(),
            danhSachNamHoc, // ← Thêm danh sách năm học
        });
    } catch (error) {
        console.error('Lỗi xem điểm GV bộ môn:', error);
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

/**
 * GVCN: Xem điểm lớp mình chủ nhiệm (tất cả môn)
 */
exports.xemDiemGVChuNhiem = async(req, res) => {
    try {
        const giaoVienId = req.params.giaovienId;
        const { namHoc, hsId, hocKy } = req.query; 


        const availableYears = await DiemSo.findAll({
            attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('NamHoc')), 'NamHoc']],
            where: { NamHoc: { [Op.ne]: null } },
            order: [['NamHoc', 'DESC']],
            raw: true
        });
        const danhSachNamHoc = availableYears.map(y => y.NamHoc); // KHAI BÁO BIẾN danhSachNamHoc

        // 1. Xử lý Năm Học
        let currentYear = new Date().getFullYear(); 
        let defaultNamHoc = `${currentYear}-${currentYear + 1}`; 
        const NamHocQuery = namHoc || defaultNamHoc;

        // 2. Lấy lớp mà GV là chủ nhiệm
        const lop = await Lop.findOne({
            where: { id_GiaoVienChuNhiem: giaoVienId },
            include: [{ model: HocSinh, as: 'hocsinhs', attributes: ['id', 'HoVaTen'] }]
        });
        
        if (!lop) {
            return res.status(403).send('Bạn không phải GVCN của lớp nào.');
        }

        const allHsIds = lop.hocsinhs.map(h => h.id);

        // 3. Xây dựng điều kiện lọc cho Chi tiết điểm
        const detailsWhereCondition = { 
            NamHoc: NamHocQuery,
            id_HocSinh: hsId ? parseInt(hsId) : allHsIds, 
        };

        if (hocKy) {
            detailsWhereCondition.HocKy = hocKy;
        }

        // 4. Lấy chi tiết điểm
        const details = await DiemSo.findAll({
            where: detailsWhereCondition,
            include: [
                { model: HocSinh, as: 'hocSinh', attributes: ['id', 'HoVaTen'] },
                { model: MonHoc, as: 'monHoc', attributes: ['id', 'TenMon'] }
            ],
            order: [
                ['id_HocSinh', 'ASC'],
                ['HocKy', 'ASC'],
                ['id_MonHoc', 'ASC']
            ],
            raw: false
        });


        const gv = await GiaoVien.findByPk(giaoVienId, { attributes: ['id', 'HoVaTen'] });

        // 7. Render View
        res.render('./giaovien/diem/xemDiemChuNhiem', {
            lop,
            gv,
            details,
            NamHoc: NamHocQuery,
            selectedHsId: hsId, 
            selectedHocKy: hocKy,
            profile: req.session?.user?.profile,
            currentUser: req.session?.user,
            currentPage: '/xem-diem-chu-nhiem',
            danhSachNamHoc, 
        });
    } catch (error) {
        console.error('Lỗi xem điểm GVCN:', error);
        res.status(500).send('Lỗi server: ' + error.message);
    }
};