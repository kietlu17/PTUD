const { DiemSo, MonHoc, HocSinh } = require('../../models');

exports.showGradesForStudent = async (req, res) => {
    try {
        // --- 1. Lấy id học sinh ---
        const hocSinhId =
            (req.session && req.session.hocSinhId) ||
            req.params.hocSinhId ||
            req.query.hocSinhId;

        if (!hocSinhId) {
            return res.status(400).send('Chưa xác định học sinh.');
        }

        // --- 2. Lấy thông tin học sinh ---
        const hocSinh = await HocSinh.findByPk(hocSinhId);
        if (!hocSinh) {
            return res.status(404).send('Không tìm thấy học sinh.');
        }

        // --- 3. Lấy toàn bộ điểm ---
        const scoresRaw = await DiemSo.findAll({
            where: { id_HocSinh: hocSinhId },
            include: [
                { model: MonHoc, as: 'monHoc', required: false }
            ],
            order: [
                ['NamHoc', 'ASC'],
                ['HocKy', 'ASC'],
                ['id_MonHoc', 'ASC']
            ]
        });

        // --- 4. Chuẩn hóa dữ liệu ---
        const scores = scoresRaw.map(s => {
            const json = s.toJSON();
            const mon = json.monHoc || json.MonHoc;

            // Tính DTB nếu chưa có
            let dtb = json.DiemTB;
            if (dtb == null) {
                const diemArr = [
                    json.DiemTX1,
                    json.DiemTX2,
                    json.Diem1T1,
                    json.Diem1T2,
                    json.DiemGK,
                    json.DiemCK
                ].filter(d => typeof d === 'number');

                dtb = diemArr.length
                    ? diemArr.reduce((a, b) => a + b, 0) / diemArr.length
                    : null;
            }

            return {
                id: json.id,
                NamHoc: json.NamHoc,
                HocKy: json.HocKy,
                id_MonHoc: json.id_MonHoc,
                TenMon: mon?.TenMon || mon?.TenMonHoc || json.id_MonHoc,

                // ---- ĐIỂM ----
                DiemTX1: json.DiemTX1,
                DiemTX2: json.DiemTX2,
                Diem1T1: json.Diem1T1,
                Diem1T2: json.Diem1T2,
                DiemGK: json.DiemGK,
                DiemCK: json.DiemCK,
                DiemTB: dtb != null ? Number(dtb.toFixed(2)) : null,
            };
        });

        // --- 5. Render view ---
        res.render('./hocsinh/diem/diem', {
            scores,
            hocSinh,
            currentPage: '/diem'
        });

    } catch (err) {
        console.error(err);
        res.status(500).send('Lỗi máy chủ.');
    }
};

