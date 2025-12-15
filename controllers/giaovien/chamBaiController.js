const { BaiTap, BaiNop, Lop, MonHoc, HocSinh, GiaoVien } = require('../../models');

// Bước 1: Hiện danh sách các bài tập đã giao (để chọn chấm)
exports.dsBaiTapCanCham = async (req, res) => {
    try {
        const user = req.session.user;
        
        // 1. Tìm Giáo viên theo MaGV (để khớp với username đăng nhập)
        const gv = await GiaoVien.findOne({ where: { MaGV: user.username } });
        // Nếu không thấy (do data lệch) thì lấy ID=1 để test
        const idGiaoVien = gv ? gv.id : 1; 
        
        const dsBaiTap = await BaiTap.findAll({
            where: { id_GiaoVien: idGiaoVien },
            include: [
                { model: Lop, as: 'lop', attributes: ['TenLop'] },
                // Sửa tên cột: TenMon (không phải TenMonHoc)
                { model: MonHoc, as: 'monhoc', attributes: ['TenMon'] } 
            ],
            // Sửa tên cột: NgayGiao (không phải createdAt)
            order: [['NgayGiao', 'DESC']] 
        });

        // Đảm bảo bạn đã tạo file view này
        res.render('giaovien/chambai/ds_baitap', { dsBaiTap, currentPage :'/cham-bai' });
    } catch (error) {
        console.error(error);
        res.status(500).send("Lỗi server: " + error.message);
    }
};

// Bước 2: Hiện danh sách bài nộp của học sinh trong bài tập đó
exports.chiTietBaiCham = async (req, res) => {
    try {
        const idBaiTap = req.params.idBaiTap;
        const baiTap = await BaiTap.findByPk(idBaiTap, {
            include: [
                { model: Lop, as: 'lop' }, 
                { model: MonHoc, as: 'monhoc', attributes: ['TenMon'] } // Sửa TenMon
            ]
        });

        if (!baiTap) return res.status(404).send("Bài tập không tồn tại");

        // Lấy tất cả học sinh trong lớp
        const dsHocSinh = await HocSinh.findAll({
            where: { id_Lop: baiTap.id_Lop },
            include: [{
                model: BaiNop,
                as: 'dsBaiNop',
                required: false,
                where: { id_BaiTap: idBaiTap }
            }],
            order: [['HoVaTen', 'ASC']]
        });

        res.render('giaovien/chambai/cham_diem_form', { 
            baiTap, 
            dsHocSinh, 
            error: null, 
            success: null ,
            currentPage :'/cham-bai'
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Lỗi server: " + error.message);
    }
};
// Bước 3: Lưu điểm (Chấm hàng loạt)
exports.luuDiemBaiTap = async (req, res) => {
    const idBaiTap = req.params.idBaiTap;
    
    try {
        const { grades } = req.body; // Nhận object chứa toàn bộ điểm

        // Kiểm tra dữ liệu
        if (!grades) {
            return res.status(400).json({ success: false, message: "Không có dữ liệu chấm bài." });
        }

        // Duyệt qua từng bài nộp để cập nhật
        // grades có dạng: { 'id_bai_nop_1': { diem: 9, nhanXet: 'Tot' }, ... }
        for (const idBaiNop in grades) {
            const data = grades[idBaiNop];
            
            // Chỉ update nếu có nhập điểm (khác rỗng)
            if (data.diem !== "") {
                const diemSo = parseFloat(data.diem);
                
                // Validate 0-10
                if (diemSo >= 0 && diemSo <= 10) {
                    await BaiNop.update(
                        { 
                            Diem: diemSo, 
                            NhanXet: data.nhanXet 
                        },
                        { where: { id: idBaiNop } }
                    );
                }
            }
        }

        // Trả về JSON để frontend hiển thị popup
        return res.json({ success: true, message: "Đã lưu kết quả chấm bài thành công!", currentPage :'/cham-bai' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Lỗi server: " + error.message, currentPage :'/cham-bai' });
    }
};