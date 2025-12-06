const { GiaoVien, BangPhanCongGiaoVien, Lop, HocSinh, DiemSo, MonHoc } = require('../../models');
const { Sequelize, Op } = require('sequelize');

/**
 * GVBM: Xem điểm lớp mình dạy (chỉ môn mình dạy)
 */
exports.xemDiemGVBoMon = async(req, res) => {
    try {
        const giaoVienId = req.params.giaovienId;
        const { lopId, hocKy, namHoc } = req.query;

        // ✅ Lấy danh sách năm học có sẵn trong database
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

        // 4. ✅ KIỂM TRA AN TOÀN
        if (!giaovien || !giaovien.chuyenMon) {
            return res.status(500).send('Không tìm thấy thông tin môn học của giáo viên');
        }

        // ✅ Đảm bảo chuyenMon là array
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

        // ✅ 5. LẤY DANH SÁCH ID HỌC SINH TRONG LỚP (FIX CHÍNH)
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

        // ✅ 6. XÂY DỰNG ĐIỀU KIỆN LỌC ĐIỂM (ĐÃ SỬA)
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

        // ✅ THÊM: Tính điểm trung bình cả năm cho từng học sinh-môn
        const diemHocSinhMap = {};
        
        diemData.forEach(d => {
            const key = `${d.id_HocSinh}-${d.id_MonHoc}`;
            const diemTB = d.DiemTrungBinh != null ? Number(d.DiemTrungBinh) : null;
            
            if (diemTB != null && !Number.isNaN(diemTB)) {
                if (!diemHocSinhMap[key]) {
                    diemHocSinhMap[key] = {
                        id_HocSinh: d.id_HocSinh,
                        id_MonHoc: d.id_MonHoc,
                        diems: [],
                        hocSinh: d.hocSinh,
                        monHoc: d.monHoc
                    };
                }
                diemHocSinhMap[key].diems.push(diemTB);
            }
        });

        // Tính điểm TB cả năm
        const diemCaNam = Object.keys(diemHocSinhMap).map(key => {
            const item = diemHocSinhMap[key];
            const tbCaNam = item.diems.reduce((a, b) => a + b, 0) / item.diems.length;
            
            return {
                id_HocSinh: item.id_HocSinh,
                id_MonHoc: item.id_MonHoc,
                DiemTrungBinh: tbCaNam,
                hocSinh: item.hocSinh,
                monHoc: item.monHoc
            };
        });

        // 7. Tính TB lớp cho mỗi môn + HK
        const groupByMonHoc = {};
        diemData.forEach(d => {
            const key = `${d.id_MonHoc}-${hocKy || 'all'}`; 
            
            const diem = d.DiemTrungBinh != null ? Number(d.DiemTrungBinh) : null;
            if (diem == null || Number.isNaN(diem) || diem <= 0) return;

            if (!groupByMonHoc[key]) {
                groupByMonHoc[key] = {
                    monHoc: d.monHoc.TenMon,
                    hocKyDisplay: hocKy ? `Học kỳ ${hocKy}` : 'Cả năm', 
                    diems: [],
                };
            }
            groupByMonHoc[key].diems.push(diem);
        });

        const classAverages = {};
        Object.keys(groupByMonHoc).forEach(key => {
            const diems = groupByMonHoc[key].diems;
            const tbLop = diems.length > 0 
                ? (diems.reduce((a, b) => a + b, 0) / diems.length).toFixed(2) 
                : '-';
            classAverages[key] = tbLop;
        });

        // 8. Render
        res.render('./giaovien/diem/xemDiemBoMon', {
            lop,
            dsLop,
            selectedLopId,
            diemData: hocKy ? diemData : diemCaNam, // ✅ Nếu không chọn HK, dùng điểm TB cả năm
            classAverages,
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

        // ✅ THÊM: Lấy danh sách năm học có sẵn trong database
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

        // 5. Tính TB HK1, HK2, TB Năm
        const allGradesForTB = await DiemSo.findAll({
            where: { 
                id_HocSinh: allHsIds,
                NamHoc: NamHocQuery 
            },
        });
        
        const map = {};
        lop.hocsinhs.forEach(hs => {
            map[hs.id] = { 
                id: hs.id, 
                HoVaTen: hs.HoVaTen, 
                tbHK1: null, 
                tbHK2: null, 
                tbNam: null, 
                _hk1: [], 
                _hk2: [] 
            };
        });

        allGradesForTB.forEach(d => {
            const hsId = d.id_HocSinh;
            if (!map[hsId]) return;
            const val = d.DiemTrungBinh != null ? Number(d.DiemTrungBinh) :
                (d.Diem != null ? Number(d.Diem) : null);
            if (val == null || Number.isNaN(val)) return;
            
            if (d.HocKy === '1') map[hsId]._hk1.push(val);
            else if (d.HocKy === '2') map[hsId]._hk2.push(val);
        });

        // 6. Hoàn tất tính TB
        Object.values(map).forEach(item => {
            if (item._hk1.length) item.tbHK1 = Number((item._hk1.reduce((a, b) => a + b, 0) / item._hk1.length).toFixed(2));
            if (item._hk2.length) item.tbHK2 = Number((item._hk2.reduce((a, b) => a + b, 0) / item._hk2.length).toFixed(2));
            const all = [...item._hk1, ...item._hk2];
            if (all.length) item.tbNam = Number((all.reduce((a, b) => a + b, 0) / all.length).toFixed(2));
            delete item._hk1;
            delete item._hk2;
        });

        const gv = await GiaoVien.findByPk(giaoVienId, { attributes: ['id', 'HoVaTen'] });

        // 7. Render View
        res.render('./giaovien/diem/xemDiemChuNhiem', {
            lop,
            gv,
            resultList: Object.values(map),
            details,
            NamHoc: NamHocQuery,
            selectedHsId: hsId, 
            selectedHocKy: hocKy,
            profile: req.session?.user?.profile,
            currentUser: req.session?.user,
            currentPage: '/xem-diem-chu-nhiem',
            danhSachNamHoc, // ✅ SỬA TẠI ĐÂY (danhSachNamHoc thay vì danhSachNamHocCN)
        });
    } catch (error) {
        console.error('Lỗi xem điểm GVCN:', error);
        res.status(500).send('Lỗi server: ' + error.message);
    }
};