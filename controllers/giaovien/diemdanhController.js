const { GiaoVien, BangPhanCongGiaoVien, Lop, HocSinh, DiemDanh, NghiHoc } = require('../../models'); 
// Bây giờ import như này CHẮC CHẮN chạy được
const { Sequelize, Op } = require('sequelize');

// 1. Hiển thị danh sách lớp
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
        res.status(200).render('./giaovien/diemdanh/diemdanh', { dsLop });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// 2. Lấy danh sách học sinh & Tự động tích phép (Chuẩn nhất)
exports.getHocSinhByLop = async (req, res) => {
    try {
        const { lopId, id } = req.params;

        // Lấy ngày hôm nay để log
        const d = new Date();
        console.log(`--- TÌM ĐƠN NGÀY: ${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()} ---`);

        const phanCong = await BangPhanCongGiaoVien.findOne({ where: { id_GiaoVien: id, id_Lop: lopId } });
        if (!phanCong) return res.status(403).send('Chưa phân công.');

        const lop = await Lop.findByPk(lopId, {
            include: [{ model: GiaoVien, as: 'gvcn', attributes: ['id', 'HoVaTen'] }],
        });

        let dsHocSinh = await HocSinh.findAll({
            where: { id_Lop: lopId },
            attributes: ['id', 'HoVaTen', 'NgaySinh', 'GioiTinh'],
            order: [['HoVaTen', 'ASC']],
            raw: true
        });

        // Lấy đơn nghỉ phép (Lấy hết để JS xử lý ngày)
        const tatCaDon = await NghiHoc.findAll({
            where: { TinhTrang: ['Đã duyệt', 'Approved'] },
            raw: true
        });

        // So sánh ngày chính xác 100%
        dsHocSinh = dsHocSinh.map(hs => {
            const donNghi = tatCaDon.find(don => {
                const dbDate = new Date(don.NgayNghi);
                const isSameDate = 
                    dbDate.getDate() === d.getDate() &&
                    dbDate.getMonth() === d.getMonth() &&
                    dbDate.getFullYear() === d.getFullYear();
                
                const isSameID = String(don.student_id) === String(hs.id);
                
                if (isSameID && isSameDate) console.log(`✅ HS ID ${hs.id} có phép.`);
                
                return isSameID && isSameDate;
            });

            return {
                ...hs,
                coPhep: !!donNghi,
                lyDoNghi: donNghi ? donNghi.LyDo : ''
            };
        });

        res.status(200).render('./giaovien/diemdanh/danhsachlop', {
            id, monhocId: phanCong.id_MonHoc, lop, dsHocSinh,
        });

    } catch (error) {
        console.error(error);
        res.status(500).send(error.message);
    }
};

// 3. Lưu điểm danh
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

        // Xóa điểm danh cũ của hôm nay (nếu muốn ghi đè) hoặc chỉ insert mới
        // Ở đây mình dùng create (như cũ)
        for (const { studentId, status } of attendanceEntries) {
            await DiemDanh.create({
                student_id: studentId, lop_id: lopId, monhoc_id: monhocId,
                giaovien_id: id, NgayHoc: ngayHoc, TinhTrang: status, created_at: new Date(),
            });
        }

        return res.status(200).json({ success: true, message: 'Thành công!' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};