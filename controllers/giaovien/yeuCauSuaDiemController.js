// controllers/yeuCauSuaDiem.controller.js
const { BangPhanCongGiaoVien, DiemSo, HocSinh, YeuCauSuaDiem } = require('../../models');

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
      success: null,
      error: null,
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
      return res.redirect(req.get('Referrer') || '/giaovien/nhap-diem');

    }

    await YeuCauSuaDiem.create({
      id_DiemSo: diemSo.id,
      id_GiaoVien: giaoVienId,
      NgayGui: new Date(),
      LoaiDiem: loaiDiem,
      DiemCu: diemSo[loaiDiem],
      DiemMoi: diemMoi,
      LyDo: lyDo,
      HocKy: phanCong.KyHoc,
      NamHoc: phanCong.NamHoc,
      TrangThai: 'Chờ duyệt'
    });




  } catch (err) {
    console.error('Lỗi guiYeuCau:', err);
    res.redirect(req.get('Referrer') || '/giaovien/nhap-diem');

  }
};
