const {
  ThiSinh,
  DiemThi,
  Truong,
  HoSoTuyenSinh,
  ChiTieu,
  DangKyTuyenSinh,
  KetQuaTuyenSinh
} = require('../../models');


//  Trang xét tuyển
exports.showPage = async (req, res) => {
  res.render('sogiaoduc/xettuyen/xettuyen', {
    profile: req.session.user.profile,
    // use hyphenated currentUrl to match nav and mounted paths
    currentUrl: '/xet-tuyen',
    ketqua: null
  });
};


exports.tienHanhXetTuyen = async (req, res) => {
  try {
    // 1. Lấy chỉ tiêu + điểm chuẩn
    const chiTieuRows = await ChiTieu.findAll();
    if (!chiTieuRows.length) {
      return res.json({
        success: false,
        message: 'Chưa cấu hình chỉ tiêu'
      });
    }

    const quotaMap = new Map();
    chiTieuRows.forEach(c => {
      quotaMap.set(c.truongid, {
        soLuong: c.soLuong,
        diemChuan: c.diemChuan || 0,
        daNhan: 0
      });
    });


    // 2. Lấy toàn bộ hồ sơ + thí sinh + điểm
    const danhSach = await DangKyTuyenSinh.findAll({
      where: { TrangThai: 'Đã chuyển' },
      include: [{
        model: ThiSinh,
        as: 'thisinh',
        include: [{
          model: DiemThi,
          as: 'diem'
        }]
      }]
    });


    const daTrungTuyen = new Set();
    const ketqua = [];

    // 3. Xét theo NV1 → NV3
    for (let nv = 1; nv <= 3; nv++) {
      for (const hs of danhSach) {
        const truongId = hs[`NV${nv}`];
        if (!truongId) continue;

        const quota = quotaMap.get(truongId);
        if (!quota) continue;
        if (quota.daNhan >= quota.soLuong) continue;

        const ts = hs.thisinh;
        if (!ts || !ts.diem) continue;
        if (daTrungTuyen.has(ts.id)) continue;

        const diemTong = ts.diem.tong || 0;
        if (diemTong < quota.diemChuan) continue;

        //  ĐỦ ĐIỀU KIỆN TRÚNG TUYỂN
        ketqua.push({
          thisinhid: ts.id,
          hoten: ts.hoten,
          truongid: truongId,
          nguyenvong: nv,
          tong: diemTong
        });

        quota.daNhan++;
        daTrungTuyen.add(ts.id);
      }
    }

    return res.json({
      success: true,
      tongTrungTuyen: ketqua.length,
      ketqua
    });

  } catch (err) {
    console.error('Lỗi xét tuyển:', err);
    res.status(500).json({ success: false, error: 'Không thể xét tuyển' });
  }
};

// LƯU KẾT QUẢ VÀO KetQuaTuyenSinh
exports.luuKetQua = async (req, res) => {
  try {
    const ds = req.body.danhsach;

    await KetQuaTuyenSinh.destroy({ where: {} });

    for (const item of ds) {
      await KetQuaTuyenSinh.create({
        thisinhid: item.thisinhid,
        truongtrungtuyen: item.truongid,
        nguyenvongtrungtuyen: item.nguyenvong
      });
    }

    res.json({ success: true });

  } catch (err) {
    console.error('Lỗi lưu kết quả:', err);
    res.status(500).json({ error: 'Không thể lưu kết quả' });
  }
};