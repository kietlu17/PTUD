const { GiaoVien, BangPhanCongGiaoVien, Lop, HocSinh, DiemDanh, NghiHoc } = require('../../models'); 
const { Sequelize, Op } = require('sequelize');

// 1. HIỂN THỊ DANH SÁCH LỚP
exports.showClasses = async (req, res) => {
    try {
        const giaoVienId = req.params.id;
        
        const dsLop = await BangPhanCongGiaoVien.findAll({
            where: { id_GiaoVien: giaoVienId },
            include: [{
                model: Lop, as: 'lop',
                include: [
                    { model: HocSinh, as: 'hocsinhs', attributes: [], required: false },
                    { model: GiaoVien, as: 'gvcn', attributes: ['id', 'HoVaTen'], required: false },
                ],
                attributes: ['id', 'TenLop', [Sequelize.fn('COUNT', Sequelize.col('lop->hocsinhs.id')), 'SoLuongHocSinh']],
            }],
            group: ['BangPhanCongGiaoVien.id', 'lop.id', 'lop->gvcn.id'],
            raw: true, nest: true,
        });

        res.status(200).render('./giaovien/diemdanh/diemdanh', { dsLop, currentPage: '/diemdanh' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server: ' + error.message });
    }
};

// 2. LẤY DANH SÁCH HỌC SINH (Kèm trạng thái cũ & Nghỉ phép)
exports.getHocSinhByLop = async (req, res) => {
    try {
        const { lopId, id } = req.params;

        // Lấy ngày hôm nay chuẩn
        const d = new Date();
        const dDate = d.getDate();
        const dMonth = d.getMonth() + 1;
        const dYear = d.getFullYear();
        const homNayStr = `${dYear}-${String(dMonth).padStart(2, '0')}-${String(dDate).padStart(2, '0')}`;

        console.log(`--- ĐANG ĐIỂM DANH NGÀY: ${homNayStr} ---`);

        const phanCong = await BangPhanCongGiaoVien.findOne({ where: { id_GiaoVien: id, id_Lop: lopId } });
        if (!phanCong) return res.status(403).send('Bạn không được phân công dạy lớp này.');

        const lop = await Lop.findByPk(lopId, {
            include: [{ model: GiaoVien, as: 'gvcn', attributes: ['id', 'HoVaTen'] }],
        });

        let dsHocSinh = await HocSinh.findAll({
            where: { id_Lop: lopId },
            attributes: ['id', 'HoVaTen', 'NgaySinh', 'GioiTinh'],
            order: [['HoVaTen', 'ASC']],
            raw: true
        });

        // Lấy điểm danh cũ
        const diemDanhCu = await DiemDanh.findAll({
            where: {
                lop_id: lopId,
                monhoc_id: phanCong.id_MonHoc,
                NgayHoc: homNayStr 
            },
            raw: true
        });

        // Lấy đơn nghỉ phép
        const tatCaDon = await NghiHoc.findAll({
            where: { TinhTrang: ['Đã duyệt', 'Approved'] },
            raw: true
        });

        dsHocSinh = dsHocSinh.map(hs => {
            const donNghi = tatCaDon.find(don => {
                const dbDate = new Date(don.NgayNghi);
                const isSameDate = 
                    dbDate.getDate() === dDate &&
                    dbDate.getMonth() + 1 === dMonth &&
                    dbDate.getFullYear() === dYear;
                const isSameID = String(don.student_id) === String(hs.id);
                return isSameID && isSameDate;
            });

            const recordCu = diemDanhCu.find(dd => String(dd.student_id) === String(hs.id));

            return {
                ...hs,
                trangThaiDiemDanh: recordCu ? recordCu.TinhTrang : null,
                coPhep: !!donNghi,
                lyDoNghi: donNghi ? donNghi.LyDo : ''
            };
        });

        res.status(200).render('./giaovien/diemdanh/danhsachlop', {
            id, monhocId: phanCong.id_MonHoc, lop, dsHocSinh, currentPage: '/diemdanh'
        });

    } catch (error) {
        console.error(error);
        res.status(500).send(error.message);
    }
};

// 3. LƯU ĐIỂM DANH
exports.submitAttendance = async (req, res) => {
    const { lopId, id } = req.params;
    try {
        const phanCong = await BangPhanCongGiaoVien.findOne({
            where: { id_GiaoVien: id, id_Lop: lopId },
            attributes: ['id_MonHoc'],
        });
        if (!phanCong) return res.status(404).json({ success: false, message: 'Lỗi phân công' });

        const monhocId = phanCong.id_MonHoc;
        const ngayHoc = new Date().toISOString().slice(0, 10);

        const attendanceEntries = Object.entries(req.body)
            .filter(([key]) => key.startsWith('status_'))
            .map(([key, value]) => ({
                studentId: parseInt(key.replace('status_', '')),
                status: value
            }));

        await DiemDanh.destroy({
            where: {
                lop_id: lopId, monhoc_id: monhocId, NgayHoc: ngayHoc, giaovien_id: id
            }
        });

        for (const { studentId, status } of attendanceEntries) {
            await DiemDanh.create({
                student_id: studentId, lop_id: lopId, monhoc_id: monhocId,
                giaovien_id: id, NgayHoc: ngayHoc, TinhTrang: status, created_at: new Date(),
            });
        }

        return res.status(200).json({ success: true, message: 'Điểm danh thành công!', currentPage: '/diemdanh' });
        
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

// 4. XEM LỊCH SỬ ĐIỂM DANH
exports.xemLichSuDiemDanh = async (req, res) => {
    try {
        const { lopId, id } = req.params;
        const lop = await Lop.findByPk(lopId);

        const lichSu = await DiemDanh.findAll({
            attributes: [
                'NgayHoc',
                [Sequelize.fn('COUNT', Sequelize.col('id')), 'SoLuong']
            ],
            where: { lop_id: lopId, giaovien_id: id },
            group: ['NgayHoc'],
            order: [['NgayHoc', 'DESC']],
            raw: true
        });

        res.render('giaovien/diemdanh/lichsu_diemdanh', {
            lop, lichSu, idGiaoVien: id, idLop: lopId, currentPage: '/diemdanh'
        });

    } catch (error) {
        console.error(error);
        res.status(500).send("Lỗi server: " + error.message);
    }
};

// 5. XEM CHI TIẾT 1 NGÀY CỤ THỂ
exports.xemChiTietNgay = async (req, res) => {
    try {
        const { lopId, id, ngayHoc } = req.params;

        const lop = await Lop.findByPk(lopId);

        let dsHocSinh = await HocSinh.findAll({
            where: { id_Lop: lopId },
            attributes: ['id', 'HoVaTen', 'NgaySinh'],
            order: [['HoVaTen', 'ASC']],
            raw: true
        });

        const chiTietDiemDanh = await DiemDanh.findAll({
            where: {
                lop_id: lopId,
                NgayHoc: ngayHoc 
            },
            raw: true
        });

        dsHocSinh = dsHocSinh.map(hs => {
            const record = chiTietDiemDanh.find(dd => String(dd.student_id) === String(hs.id));
            return {
                ...hs,
                trangThai: record ? record.TinhTrang : 'Chưa ghi nhận'
            };
        });

        res.render('giaovien/diemdanh/chitiet_ngay', {
            lop, dsHocSinh, ngayHoc, idGiaoVien: id, idLop: lopId, currentPage: '/diemdanh'
        });

    } catch (error) {
        console.error(error);
        res.status(500).send("Lỗi server: " + error.message );
    }
};