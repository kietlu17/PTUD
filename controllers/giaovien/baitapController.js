const { BaiTap, BangPhanCongGiaoVien, Lop, MonHoc, GiaoVien } = require('../../models');

// --- FLOW 1: HIỂN THỊ DANH SÁCH LỚP ---
exports.hienThiDanhSachLop = async (req, res) => {
    try {
        const user = req.session.user;
        if (!user) return res.redirect('/login');



        // Tìm Giáo viên theo MaGV
        const gvInfo = await GiaoVien.findOne({ where: { MaGV: user.username } });
        
        // Fallback ID=1 nếu đang test và data bị lệch
        const idGiaoVienThat = gvInfo ? gvInfo.id : 1; 


        const dsPhanCong = await BangPhanCongGiaoVien.findAll({
            where: { id_GiaoVien: idGiaoVienThat },
            include: [
                { model: Lop, as: 'lop', attributes: ['id', 'TenLop'] }, 
                { model: MonHoc, as: 'monhoc', attributes: ['id', 'TenMon'] }
            ],
            raw: true,
            nest: true
        });

        res.render('giaovien/taobaitap/chon_lop', { dsPhanCong,  currentPage:'/giao-bai-tap'});

    } catch (error) {
        console.error(error);
        res.status(500).send("Lỗi server: " + error.message);
    }
};

// --- FLOW 2: HIỂN THỊ FORM GIAO BÀI ---
exports.hienThiFormGiaoBai = async (req, res) => {
    try {
        const idPhanCong = req.params.idPhanCong;

        const phanCong = await BangPhanCongGiaoVien.findByPk(idPhanCong, {
            include: [
                { model: Lop, as: 'lop' },
                { model: MonHoc, as: 'monhoc' }
            ]
        });

        if (!phanCong) return res.status(404).send("Không tìm thấy thông tin phân công.");

        res.render('giaovien/taobaitap/tao_baitap', { 
            phanCong, error: null, success: null, currentPage:'/giao-bai-tap'
        });

    } catch (error) {
        console.error("Lỗi hiển thị form:", error);
        res.status(500).send("Lỗi server: " + error.message);
    }
};

// --- FLOW 3: LƯU BÀI TẬP ---
exports.luuBaiTap = async (req, res) => {
    const idPhanCong = req.params.idPhanCong;
    const user = req.session.user;
    
    const getPhanCong = async () => {
        return await BangPhanCongGiaoVien.findByPk(idPhanCong, {
            include: [{ model: Lop, as: 'lop' }, { model: MonHoc, as: 'monhoc' }]
        });
    };

    try {
        const gvInfo = await GiaoVien.findOne({ where: { MaGV: user.username } });
        const idGiaoVien = gvInfo ? gvInfo.id : 1; 

        const { tieuDe, noiDung, hanNop } = req.body;
        const file = req.file;
        const phanCong = await getPhanCong();

        if (!tieuDe || tieuDe.trim() === "") {
            return res.render('giaovien/taobaitap/tao_baitap', { 
                phanCong, error: "Vui lòng nhập tiêu đề!", success: null , currentPage:'/giao-bai-tap'
            });
        }

        const filePath = file ? `/uploads/baitap/${file.filename}` : null;

        await BaiTap.create({
            TieuDe: tieuDe,
            NoiDung: noiDung,
            File: filePath,
            HanNop: hanNop,
            id_Lop: phanCong.id_Lop,      
            id_MonHoc: phanCong.id_MonHoc,
            id_GiaoVien: idGiaoVien
        });

        res.render('giaovien/taobaitap/tao_baitap', { 
            phanCong, error: null, success: "Giao bài tập thành công!" , currentPage:'/giao-bai-tap'
        });

    } catch (error) {
        console.error("Lỗi lưu:", error);
        const phanCong = await getPhanCong();
        res.render('giaovien/taobaitap/tao_baitap', { 
            phanCong, error: "Lưu thất bại: " + error.message, success: null , currentPage:'/giao-bai-tap'
        });
    }
};

// --- FLOW 4: XEM DANH SÁCH BÀI ĐÃ GIAO ---
exports.xemDanhSachBaiDaGiao = async (req, res) => {
    try {
        const idPhanCong = req.params.idPhanCong;

        const phanCong = await BangPhanCongGiaoVien.findByPk(idPhanCong, {
            include: [
                { model: Lop, as: 'lop' },
                { model: MonHoc, as: 'monhoc' }
            ]
        });

        if (!phanCong) return res.status(404).send("Không tìm thấy phân công.");

        const dsBaiTap = await BaiTap.findAll({
            where: {
                id_Lop: phanCong.id_Lop,
                id_MonHoc: phanCong.id_MonHoc,
                id_GiaoVien: phanCong.id_GiaoVien
            },
            order: [['NgayGiao', 'DESC']]
        });

        res.render('giaovien/taobaitap/ds_baitap_dagiao', { 
            phanCong, 
            dsBaiTap, currentPage:'/giao-bai-tap'
        });

    } catch (error) {
        console.error(error);
        res.status(500).send("Lỗi server: " + error.message);
    }
};

// --- FLOW 5: HIỂN THỊ FORM SỬA BÀI TẬP ---
exports.hienThiFormSua = async (req, res) => {
    try {
        const idBaiTap = req.params.idBaiTap;
        
        const baiTap = await BaiTap.findByPk(idBaiTap, {
            include: [
                { model: Lop, as: 'lop' },
                { model: MonHoc, as: 'monhoc' }
            ]
        });

        if (!baiTap) return res.status(404).send("Không tìm thấy bài tập");

        res.render('giaovien/taobaitap/sua_baitap', { 
            baiTap, 
            error: null, 
            success: null,
            currentPage:'/giao-bai-tap'
        });

    } catch (error) {
        console.error(error);
        res.status(500).send("Lỗi server");
    }
};

// --- FLOW 6: LƯU CẬP NHẬT BÀI TẬP ---
exports.capNhatBaiTap = async (req, res) => {
    const idBaiTap = req.params.idBaiTap;
    
    try {
        const { tieuDe, noiDung, hanNop } = req.body;
        const file = req.file;
        
        const dataUpdate = {
            TieuDe: tieuDe,
            NoiDung: noiDung,
            HanNop: hanNop
        };

        if (file) {
            dataUpdate.File = `/uploads/baitap/${file.filename}`;
        }

        await BaiTap.update(dataUpdate, { where: { id: idBaiTap } });

        const baiTapMoi = await BaiTap.findByPk(idBaiTap, {
            include: [{ model: Lop, as: 'lop' }, { model: MonHoc, as: 'monhoc' }]
        });

        res.render('giaovien/taobaitap/sua_baitap', { 
            baiTap: baiTapMoi, 
            error: null, 
            success: "Cập nhật thành công!", currentPage:'/giao-bai-tap'
        });

    } catch (error) {
        console.error(error);
        res.status(500).send("Lỗi cập nhật: " + error.message);
    }
};