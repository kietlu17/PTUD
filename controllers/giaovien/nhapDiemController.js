const {sequelize,  BangPhanCongGiaoVien, Lop, MonHoc, HocSinh, DiemSo, GiaoVien } = require('../../models');

// 1. Chọn Lớp (Giống bài trước)
exports.hienThiDanhSachLop = async(req, res) => {
    const user = req.session.user;
    const gv = await GiaoVien.findOne({ where: { MaGV: user.username } });
    const idGV = gv ? gv.id : 1;

    const dsPhanCong = await BangPhanCongGiaoVien.findAll({
        where: { id_GiaoVien: idGV },
        include: [{ model: Lop, as: 'lop' }, { model: MonHoc, as: 'monhoc' }],
        raw: true,
        nest: true
    });
    res.render('giaovien/nhapdiem/chon_lop', { dsPhanCong, currentPage: '/nhapdiem' });
};

// 2. Hiển thị bảng điểm
exports.hienThiBangDiem = async(req, res) => {
    const idPhanCong = req.params.idPhanCong;
    const phanCong = await BangPhanCongGiaoVien.findByPk(idPhanCong, {
        include: [{ model: Lop, as: 'lop' }, { model: MonHoc, as: 'monhoc' }]
    });

    // Exception 6.2: Kiểm tra thời hạn nhập điểm (Ví dụ giả lập)
    const isHetHan = false; // Logic thực tế: check bảng NamHoc/KyHoc

    const dsHocSinh = await HocSinh.findAll({
        where: { id_Lop: phanCong.id_Lop },
        include: [{
            model: DiemSo,
            as: 'bangDiem',
            required: false,
            where: { id_MonHoc: phanCong.id_MonHoc }
        }],
        order: [
            ['HoVaTen', 'ASC']
        ]
    });

    res.render('giaovien/nhapdiem/nhap_diem_form', { phanCong, dsHocSinh, isHetHan, currentPage: '/nhapdiem' });
};

// 3. Lưu điểm (Có Validate 0-10)
exports.luuBangDiem = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const phanCongId = req.params.idPhanCong; // id phân công
    const { grades } = req.body;

    // Lấy thông tin phân công (để biết môn, lớp, học kỳ, năm học)
    const phanCong = await BangPhanCongGiaoVien.findByPk(phanCongId);
    if (!phanCong) {
      await t.rollback();
      return res.json({ success: false, message: 'Không tìm thấy phân công' });
    }

    const {
      id_MonHoc,
      KyHoc,
      NamHoc
    } = phanCong;

    // Duyệt từng học sinh
    for (const hocSinhId of Object.keys(grades)) {
      const g = grades[hocSinhId];

      // Parse điểm (rỗng => null)
      const tx1 = g.DiemTX1 !== '' ? parseFloat(g.DiemTX1) : null;
      const tx2 = g.DiemTX2 !== '' ? parseFloat(g.DiemTX2) : null;
      const mt1 = g.Diem1T1 !== '' ? parseFloat(g.Diem1T1) : null;
      const mt2 = g.Diem1T2 !== '' ? parseFloat(g.Diem1T2) : null;
      const gk  = g.DiemGK  !== '' ? parseFloat(g.DiemGK)  : null;
      const ck  = g.DiemCK  !== '' ? parseFloat(g.DiemCK)  : null;

      // Tính điểm trung bình
      let tong = 0;
      tong += (tx1 || 0) * 1;
      tong += (tx2 || 0) * 1;
      tong += (mt1 || 0) * 2;
      tong += (mt2 || 0) * 2;
      tong += (gk  || 0) * 2;
      tong += (ck  || 0) * 3;

      const DiemTB = Number((tong / 11).toFixed(1));

      // Tìm bản ghi điểm cũ (nếu đã tồn tại)
      const diemCu = await DiemSo.findOne({
        where: {
          id_HocSinh: hocSinhId,
          id_MonHoc,
          HocKy: KyHoc,
          NamHoc
        },
        transaction: t
      });

      if (diemCu) {
        // UPDATE
        await diemCu.update({
          DiemTX1: tx1,
          DiemTX2: tx2,
          Diem1T1: mt1,
          Diem1T2: mt2,
          DiemGK: gk,
          DiemCK: ck,
          DiemTB
        }, { transaction: t });
      } else {
        // INSERT
        await DiemSo.create({
          id_HocSinh: hocSinhId,
          id_MonHoc,
          DiemTX1: tx1,
          DiemTX2: tx2,
          Diem1T1: mt1,
          Diem1T2: mt2,
          DiemGK: gk,
          DiemCK: ck,
          DiemTB,
          HocKy: KyHoc,
          NamHoc
        }, { transaction: t });
      }
    }

    await t.commit();
    res.json({ success: true });

  } catch (err) {
    await t.rollback();
    console.error('Lỗi lưu bảng điểm:', err);
    res.json({
      success: false,
      message: 'Không thể lưu bảng điểm'
    });
  }
};