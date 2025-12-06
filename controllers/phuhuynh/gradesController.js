const { DiemSo, MonHoc, HocSinh } = require('../../models');

exports.showGradesForParent = async(req, res) => {
    try {
        const phuHuynhId = req.params.phuHuynhId;
        const hocSinhId = req.query.hocSinhId || req.params.hocSinhId;
        if (!hocSinhId) return res.status(400).send('Chưa chọn học sinh.');

        const hocSinh = await HocSinh.findByPk(hocSinhId);
        if (!hocSinh) return res.status(404).send('Không tìm thấy học sinh.');

        const scoresRaw = await DiemSo.findAll({
            where: { id_HocSinh: hocSinhId },
            include: [{ model: MonHoc, as: 'monHoc', required: false }],
            order: [
                ['HocKy', 'ASC'],
                ['id_MonHoc', 'ASC']
            ]
        });

        // map dữ liệu cho view (tên môn + đảm bảo các field tồn tại)
        const scores = scoresRaw.map(s => {
            const json = s.toJSON();
            const assoc = s.MonHoc || s.monHoc || json.MonHoc || json.monHoc;
            return {
                ...json,
                TenMon: (assoc && (assoc.TenMon || assoc.TenMonHoc)) || json.id_MonHoc,
                DiemThuongKy: json.DiemThuongKy,
                DiemGiuaKy: json.DiemGiuaKy,
                DiemCuoiKy: json.DiemCuoiKy,
                DiemTrungBinh: json.DiemTrungBinh
            };
        });
<<<<<<< HEAD
        res.render('phuhuynh/diem', { scores, hocSinh, phuHuynhId, currentPage: '/xem-diem' });
=======
        res.render('./phuhuynh/diem/diem', { scores, hocSinh, phuHuynhId, currentUrl: '/diem' });
>>>>>>> main
    } catch (err) {
        console.error(err);
        res.status(500).send('Lỗi máy chủ.');
    }
};

exports.showGradesForStudent = async(req, res) => {
    try {
        // ưu tiên lấy từ session nếu có, fallback param/query
        const hocSinhId = (req.session && req.session.hocSinhId) || req.params.hocSinhId || req.query.hocSinhId;
        if (!hocSinhId) return res.status(400).send('Chưa xác định học sinh.');

        const hocSinh = await HocSinh.findByPk(hocSinhId);
        if (!hocSinh) return res.status(404).send('Không tìm thấy học sinh.');

        const scoresRaw = await DiemSo.findAll({
            where: { id_HocSinh: hocSinhId },
            include: [{ model: MonHoc, as: 'monHoc', required: false }],
            order: [
                ['HocKy', 'ASC'],
                ['id_MonHoc', 'ASC']
            ]
        });

        const scores = scoresRaw.map(s => {
            const json = s.toJSON();
            const assoc = s.MonHoc || s.monHoc || json.MonHoc || json.monHoc;
            return {
                ...json,
                TenMon: (assoc && (assoc.TenMon || assoc.TenMonHoc)) || json.id_MonHoc,
                DiemThuongKy: json.DiemThuongKy,
                DiemGiuaKy: json.DiemGiuaKy,
                DiemCuoiKy: json.DiemCuoiKy,
<<<<<<< HEAD
                DiemTrungBinh: json.DiemTrungBinh
            };
        });

        res.render('hocsinh/diem', { scores, hocSinh, currentPage: '/xem-diem' });
=======
                DiemTrungBinh: json.DiemTrungBinh,
                
            };
        });

        res.render('./phuhuynh/diem/diem', { scores, hocSinh, currentUrl: '/diem', });
>>>>>>> main
    } catch (err) {
        console.error(err);
        res.status(500).send('Lỗi máy chủ.');
    }
<<<<<<< HEAD
};
=======
};
>>>>>>> main
