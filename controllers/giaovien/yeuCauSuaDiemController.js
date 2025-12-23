// controllers/yeuCauSuaDiem.controller.js
const { BangPhanCongGiaoVien, DiemSo, HocSinh, YeuCauSuaDiem, LichSuDiem, sequelize } = require('../../models');

/**
 * GET: Hiển thị form yêu cầu sửa điểm
 */


exports.formSuaDiem = async (req, res) => {
  try {
    const { hocSinhId, monHocId } = req.params;
    const giaoVienId = req.session.user.profile.id;

    // 1. Lấy phân công để biết HỌC KỲ + NĂM HỌC
    const phanCong = await BangPhanCongGiaoVien.findOne({
      where: {
        id_GiaoVien: giaoVienId,
        id_MonHoc: monHocId
      }
    });

    // Pull any flash messages (set by POST) and clear
    const flash = req.session.flash || {};
    delete req.session.flash;

    if (!phanCong) {
      return res.json({
        message: 'Không tìm thấy phân công giảng dạy'
      });
    }

    const hocKy = phanCong.KyHoc;   // ví dụ: HK1, HK2
    const namHoc = phanCong.NamHoc; // ví dụ: 2024-2025

    // 2. Lấy điểm số theo học kỳ + năm học
    const diemSo = await DiemSo.findOne({
      where: {
        id_HocSinh: hocSinhId,
        id_MonHoc: monHocId,
        HocKy: hocKy,
        NamHoc: namHoc
      },
      include: [{
        model: HocSinh,
        as: 'hocSinh'
      }]
    });

    if (!diemSo) {
      return res.render('error', {
        message: 'Học sinh chưa có điểm ở học kỳ này'
      });
    }

    // 3. Lịch sử / yêu cầu sửa điểm
    const lichSu = await YeuCauSuaDiem.findAll({
      where: { id_DiemSo: diemSo.id },
      order: [['NgayGui', 'DESC']]
    });

    // 4. Render view
    res.render('giaovien/suadiem/suadiem', {
      diemSo,
      hocKy,
      namHoc,
      lichSu,
      success: flash.success || null,
      error: flash.error || null,
      currentPage: '/nhapdiem'
    });

  } catch (err) {
    console.error('Lỗi formSuaDiem:', err);
    res.json({
      message: 'Không thể tải form sửa điểm'
    });
  }
};



/**
 * POST: Gửi yêu cầu sửa điểm
 */
exports.guiYeuCau = async (req, res) => {
  try {
    const { hocSinhId, monHocId } = req.params;
    const { loaiDiem, diemMoi, lyDo } = req.body;
    const giaoVienId = req.session.user.profile.id;

    // Lấy phân công
    const phanCong = await BangPhanCongGiaoVien.findOne({
      where: {
        id_GiaoVien: giaoVienId,
        id_MonHoc: monHocId
      }
    });

    const diemSo = await DiemSo.findOne({
      where: {
        id_HocSinh: hocSinhId,
        id_MonHoc: monHocId,
        HocKy: phanCong.KyHoc,
        NamHoc: phanCong.NamHoc
      }
    });

    if (!diemSo) {
      req.session.flash = { error: 'Không tìm thấy điểm để sửa.' };
      return res.redirect(req.get('Referrer') || '/giaovien/nhap-diem');

    }

    // Validate new score
    const newScore = parseFloat(diemMoi);
    if (!isFinite(newScore) || newScore < 0 || newScore > 10) {
      // invalid input: redirect back with error message
      return res.redirect(req.get('Referrer') || '/giaovien/nhap-diem');
    }

    // Ensure we have an account id for FK
    const accountId = req.session.user?.id;
    if (!accountId) {
      req.session.flash = { error: 'Không xác định tài khoản hiện tại. Vui lòng đăng xuất và đăng nhập lại.' };
      return res.redirect(req.get('Referrer') || '/giaovien/nhap-diem');
    }

    // Auto-approve: do all updates inside a transaction
    await sequelize.transaction(async (t) => {
      // Create the request record with approved status
      await YeuCauSuaDiem.create({
        id_DiemSo: diemSo.id,
        id_GiaoVien: giaoVienId,
        NgayGui: new Date(),
        LoaiDiem: loaiDiem,
        DiemCu: diemSo[loaiDiem],
        DiemMoi: newScore,
        LyDo: lyDo,
        HocKy: phanCong.KyHoc,
        NamHoc: phanCong.NamHoc,
        TrangThai: 'Đã duyệt',
        NguoiDuyet: null,
        ThoiGianDuyet: new Date()
      }, { transaction: t });

      // Update the DiemSo value
      const oldVal = diemSo[loaiDiem];
      await diemSo.update({ [loaiDiem]: newScore }, { transaction: t });

      // Recalculate DiemTB using weighted average per school rule
      await diemSo.reload({ transaction: t });
      const weights = {
        DiemTX1: 1,
        DiemTX2: 1,
        Diem1T1: 2,
        Diem1T2: 2,
        DiemGK: 2,
        DiemCK: 3,
      };

      let numerator = 0;
      let denom = 0;
      for (const key of Object.keys(weights)) {
        const val = diemSo[key];
        const w = weights[key];
        if (typeof val === 'number' && !isNaN(val)) {
          numerator += val * w;
          denom += w;
        }
      }

      const rawDtb = denom > 0 ? numerator / denom : null;

      // Apply custom rounding rule: .1-.4 -> round down, .5 -> keep .5, .6-.9 -> round up
      function customRoundDtb(v) {
        if (v === null || v === undefined || isNaN(v)) return null;
        const intPart = Math.floor(v);
        const firstDecimal = Math.floor((v * 10) % 10);
        if (firstDecimal === 0) return Number(v.toFixed(2)); // keep as-is for .00 - .09
        if (firstDecimal >= 1 && firstDecimal <= 4) return Number((intPart).toFixed(2));
        if (firstDecimal === 5) return Number((intPart + 0.5).toFixed(2));
        return Number((intPart + 1).toFixed(2));
      }

      const dtb = customRoundDtb(rawDtb);
      await diemSo.update({ DiemTB: dtb }, { transaction: t });

      // Record change in LichSuDiem
      await LichSuDiem.create({
        id_DiemSo: diemSo.id,
        LoaiDiem: loaiDiem,
        DiemCu: oldVal,
        DiemMoi: newScore,
        NguoiSua: accountId,
        ThoiGian: new Date(),
        LyDo: lyDo
      }, { transaction: t });
    });

    // Set flash success message and redirect back to form (it will show updated history)
    req.session.flash = { success: 'Yêu cầu đã được tự động duyệt và điểm đã được cập nhật.' };
    return res.redirect(req.get('Referrer') || '/giaovien/nhap-diem');




  } catch (err) {
    console.error('Lỗi guiYeuCau:', err);
    req.session.flash = { error: 'Có lỗi khi xử lý yêu cầu sửa điểm. Vui lòng thử lại.' };
    return res.redirect(req.get('Referrer') || '/giaovien/nhap-diem');

  }
};
