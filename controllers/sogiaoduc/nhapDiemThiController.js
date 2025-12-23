const { Truong, PhongThi, ThiSinh, DiemThi, HoSoTuyenSinh, DangKyTuyenSinh } = require('../../models');


// Kiểm tra giá trị điểm hợp lệ: >0 và <10, phần thập phân chỉ được 0, .25, .50, .75
function isValidScoreValue(val) {
  const v = parseFloat(val);
  if (!isFinite(v)) return false;
  if (v <= 0 || v >= 10) return false;
  // Tránh lỗi float, lấy phần thập phân theo cent
  const cents = Math.round((v * 100) % 100);
  return [0, 25, 50, 75].includes(cents);
}

// Hiển thị trang nhập điểm
exports.showNhapDiem = async (req, res) => {
  try {
    const truongs = await Truong.findAll();

    return res.render('./sogiaoduc/nhapdiemthi/nhapdiemthi', {
      truongs,
      profile: req.session.user.profile,
      currentUrl: '/diemthi'
    });
  } catch (err) {
    console.error("Lỗi load trang nhập điểm:", err);
    return res.status(500).send("Lỗi load trang nhập điểm.");
  }
};

// Lấy danh sách phòng thi theo trường
exports.getPhongThi = async (req, res) => {
  try {
    const phongthi = await PhongThi.findAll({
      where: { truongid: req.params.truongId }
    });
    return res.json(phongthi);
  } catch (err) {
    console.error("Lỗi lấy phòng thi:", err);
    return res.status(500).json({ error: 'Lỗi lấy phòng thi.' });
  }
};

// Lấy danh sách thí sinh theo phòng + điểm
exports.getThiSinh = async (req, res) => {
  try {
    const thisinh = await ThiSinh.findAll({
      where: { phongthiid: req.params.phongId },
      include: [{
        model: DiemThi,
        as: 'diem',
        attributes: ['toan', 'nguvan', 'tienganh', 'tong']
      }]
    });
    return res.json(thisinh);
  } catch (err) {
    console.error("Lỗi lấy thí sinh:", err);
    return res.status(500).json({ error: "Lỗi lấy thí sinh." });
  }
};

// Lưu tất cả điểm 1 lần
exports.saveAllScores = async (req, res) => {
  try {
    const dsDiem = req.body.dsDiem;
    if (!Array.isArray(dsDiem)) return res.status(400).json({ success: false, error: 'Dữ liệu dsDiem không hợp lệ' });

    for (const d of dsDiem) {
      const { thisinhid } = d;
      const toan = parseFloat(d.toan);
      const nguvan = parseFloat(d.nguvan);
      const tienganh = parseFloat(d.tienganh);

      // Validate each score
      if (!isValidScoreValue(toan)) {
        return res.status(400).json({ success: false, error: `Điểm Toán không hợp lệ cho thí sinh id=${thisinhid}. Phải là số >0 và <10, phần thập phân chỉ .25, .5, .75 hoặc nguyên.` });
      }
      if (!isValidScoreValue(nguvan)) {
        return res.status(400).json({ success: false, error: `Điểm Ngữ Văn không hợp lệ cho thí sinh id=${thisinhid}. Phải là số >0 và <10, phần thập phân chỉ .25, .5, .75 hoặc nguyên.` });
      }
      if (!isValidScoreValue(tienganh)) {
        return res.status(400).json({ success: false, error: `Điểm Tiếng Anh không hợp lệ cho thí sinh id=${thisinhid}. Phải là số >0 và <10, phần thập phân chỉ .25, .5, .75 hoặc nguyên.` });
      }

      const tong = toan + nguvan + tienganh;

      const [diem, created] = await DiemThi.findOrCreate({
        where: { thisinhid },
        defaults: {
          toan,
          nguvan,
          tienganh,
          tong
        }
      });

      if (!created) {
        await diem.update({
          toan,
          nguvan,
          tienganh,
          tong
        });
      }
    }

    return res.json({ success: true });

  } catch (err) {
    console.error("Lỗi lưu tất cả điểm:", err);
    return res.status(500).json({ success: false });
  }
};

exports.showDashboard = async (req, res) => {
  try {
    // profile lấy từ session (chắc bạn đang set req.session.user.profile khi login)
    const profile = req.session.user?.profile || null;

    // Lấy danh sách trường
    const truongs = await Truong.findAll();

    res.render('dashboard-sogiaoduc', {
      profile,
      truongs,
      currentUrl: '/dashboard-sogiaoduc'
    });
  } catch (err) {
    console.error('Lỗi load dashboard sở:', err);
    res.status(500).send('Lỗi tải dashboard.');
  }
};

// Tạo phân phòng cho các thí sinh chưa có phòng (preview, không lưu)
exports.phanThiSinhPreview = async (req, res) => {
  try {
    // lấy tất cả trường kèm phòng
    const truongs = await Truong.findAll({ order: [['id', 'ASC']] });
    const allRooms = await PhongThi.findAll({ order: [['id', 'ASC']] });

        // Lấy danh sách đăng ký (id -> NV1)
      const hs = await DangKyTuyenSinh.findAll({ attributes: ['id', 'NV1'] });
      // Tạo map: idDangKy -> truongId (NV1)
      const mapDangKy = new Map();
      const dangKyIds = [];
      for (const h of hs) {
        mapDangKy.set(h.id, h.NV1);
        dangKyIds.push(h.id);
      }

      // Lấy thí sinh chưa có phòng nhưng đã được sinh từ hồ sơ đăng ký
      // => WHERE id_dangky IN (dangKyIds) AND phongthiid IS NULL
      if (dangKyIds.length === 0) {
        return res.json({ success: false, error: 'Không có hồ sơ đăng ký.' });
      }

      const existingThiSinh = await ThiSinh.findAll({
        where: {
          id_dangky: dangKyIds,
          phongthiid: null
        },
        attributes: ['id', 'hoten', 'id_dangky'],
        order: [['hoten', 'ASC']]
      });

      // Build candidates: chỉ lấy thí sinh mà mapDangKy có entry
      const candidates = existingThiSinh
        .map(ts => {
          const truongid = mapDangKy.get(ts.id_dangky);
          if (!truongid) return null; // không tìm thấy NV1 => bỏ
          return { id: ts.id, hoten: ts.hoten, truongid };
        })
        .filter(Boolean);

    if (candidates.length === 0) return res.json({ success: false, error: 'Không có thí sinh chưa được phân phòng.' });
    if (allRooms.length === 0) return res.json({ success: false, error: 'Không có phòng thi trong hệ thống.' });

    // phân theo yêu cầu: mỗi phòng tối thiểu 10 thí sinh
    const N = candidates.length;
    // số phòng sẽ dùng = min(totalRooms, floor(N/10)) nhưng >=1
    const totalRooms = allRooms.length;
    let R = Math.min(totalRooms, Math.max(1, Math.floor(N / 10)));
    // nếu N < 10, dùng 1 room
    if (R < 1) R = 1;

    // sort candidates by name
    candidates.sort((a, b) => (a.hoten || '').localeCompare(b.hoten || ''));

    // choose rooms to use -> take first R rooms from allRooms
    const roomsToUse = allRooms.slice(0, R);

    const base = Math.floor(N / R);
    let remainder = N - base * R;

    const assignments = [];
    let idx = 0;
    for (let i = 0; i < roomsToUse.length; i++) {
      const room = roomsToUse[i];
      let count = base + (remainder > 0 ? 1 : 0);
      if (remainder > 0) remainder--;

      const assigned = candidates.slice(idx, idx + count);
      idx += count;

      assignments.push({
        truongid: room.truongid,
        truongName: (truongs.find(t => t.id === room.truongid) || {}).name || '',
        phongId: room.id,
        phongName: room.name,
        assignedCount: assigned.length,
        candidates: assigned
      });
    }

    return res.json({ success: true, assignments });
  } catch (err) {
    console.error('Lỗi phân phòng preview:', err);
    return res.status(500).json({ success: false, error: 'Lỗi phân phòng' });
  }
};

// Xác nhận phân phòng và lưu phongthiid cho từng thí sinh
exports.phanThiSinhConfirm = async (req, res) => {
  try {
    const { assignments } = req.body; // array of {phongId, candidates: [{id}]}
    if (!assignments || !Array.isArray(assignments)) return res.status(400).json({ success: false, error: 'Dữ liệu không hợp lệ' });

    for (const a of assignments) {
      const pid = parseInt(a.phongId, 10);
      if (!pid) continue;
      const ids = (a.candidates || []).map(c => c.id).filter(Boolean);
      if (ids.length === 0) continue;

      await ThiSinh.update({ phongthiid: pid }, { where: { id: ids } });
    }

    return res.json({ success: true });
  } catch (err) {
    console.error('Lỗi lưu phân phòng:', err);
    return res.status(500).json({ success: false, error: 'Không thể lưu phân phòng' });
  }
};