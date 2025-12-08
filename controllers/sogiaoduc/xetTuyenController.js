const {
  ThiSinh,
  DiemThi,
  Truong,
  HoSoTuyenSinh,
  ChiTieu,
  KetQuaTuyenSinh
} = require('../../models');


// ✅ Trang xét tuyển
exports.showPage = async (req, res) => {
  res.render('sogiaoduc/xettuyen/xettuyen', {
    profile: req.session.user.profile,
    // use hyphenated currentUrl to match nav and mounted paths
    currentUrl: '/xet-tuyen',
    ketqua: null
  });
};


// ✅ TIẾN HÀNH XÉT TUYỂN NGUYỆN VỌNG 1
exports.tienHanhXetTuyen = async (req, res) => {
  try {
    const truongs = await Truong.findAll();
    // nếu chưa có bất kỳ chỉ tiêu nào -> trả lỗi rõ ràng
    const totalChitieu = await ChiTieu.count();
    if (!totalChitieu) {
      return res.json({ success: false, error: 'Chưa có chỉ tiêu và điểm chuẩn tuyển sinh - vui lòng nhập chỉ tiêu trước khi xét tuyển' });
    }
    // Build quick lookup for quotas and thresholds
    const chiTieuRows = await ChiTieu.findAll();
    const quotaByTruong = new Map();
    for (const c of chiTieuRows) quotaByTruong.set(c.truongid, { soLuong: c.soLuong, diemChuan: c.diemChuan ?? 0 });

    let ketqua = [];
    const admitted = new Set(); // thisinh ids already admitted
    const admittedCount = new Map(); // truongid -> count

    // Process nguyện vọng 1 -> 3
    for (let nv = 1; nv <= 3; nv++) {
      for (const truong of truongs) {
        const q = quotaByTruong.get(truong.id);
        if (!q) continue; // no quota for this school

        const currentCount = admittedCount.get(truong.id) || 0;
        const remaining = q.soLuong - currentCount;
        if (remaining <= 0) continue;

        // Get applicants for this preference
        const ds = await HoSoTuyenSinh.findAll({
          where: { truongid: truong.id, nguyenvong: nv },
          include: [{ model: ThiSinh, include: [{ model: DiemThi, as: 'diem' }] }]
        });

        // filter out already admitted and those without score or below cutoff
        const candidates = ds
          .map(item => ({ item, ts: item.ThiSinh }))
          .filter(({ item, ts }) => ts && !admitted.has(ts.id) && (ts.diem?.tong ?? -Infinity) >= (q.diemChuan ?? 0));

        // sort: total desc, tie-break Toán desc, Ngữ văn desc, id asc
        candidates.sort((a, b) => {
          const at = a.ts.diem?.tong ?? 0;
          const bt = b.ts.diem?.tong ?? 0;
          if (bt !== at) return bt - at;
          const aToan = a.ts.diem?.toan ?? 0;
          const bToan = b.ts.diem?.toan ?? 0;
          if (bToan !== aToan) return bToan - aToan;
          const aNV = a.ts.diem?.nguvan ?? 0;
          const bNV = b.ts.diem?.nguvan ?? 0;
          if (bNV !== aNV) return bNV - aNV;
          return (a.ts.id || 0) - (b.ts.id || 0);
        });

        const selected = candidates.slice(0, remaining);
        for (const s of selected) {
          const item = s.item;
          const ts = s.ts;
          ketqua.push({ thisinhid: item.thisinhid, truongid: truong.id, nguyenvong: nv, hoten: ts.hoten || '', tong: ts.diem?.tong ?? 0 });
          admitted.add(ts.id);
        }

        admittedCount.set(truong.id, (admittedCount.get(truong.id) || 0) + selected.length);
      }
    }

    res.json({ success: true, ketqua });

  } catch (err) {
    console.error('Lỗi xét tuyển:', err);
    res.status(500).json({ error: 'Không thể xét tuyển' });
  }
};


// ✅ LƯU KẾT QUẢ VÀO KetQuaTuyenSinh
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