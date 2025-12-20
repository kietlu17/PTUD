// controllers/yeuCauSuaDiem.controller.js
const { LichSuDiem, DiemSo, HocSinh } = require('../../models');

/**
 * GET: Hiển thị form yêu cầu sửa điểm
 */


exports.formSuaDiem = async (req, res) => {
  try {
    const { hocSinhId, monHocId } = req.params;

    // Lấy học kỳ – năm học hiện tại (ví dụ

    //  Tìm điểm số
    const diemSo = await DiemSo.findOne({
      where: {
        id_HocSinh: hocSinhId,
        id_MonHoc: monHocId,
      },
      include: [{
        model: HocSinh,
        as: 'hocSinh'
      }]
    });

    if (!diemSo) {
      return res.render('error', {
        message: 'Học sinh này chưa có điểm cho môn học này'
      });
    }

    // 2 Lịch sử sửa điểm
    const lichSu = await LichSuDiem.findAll({
      where: { id_DiemSo: diemSo.id },
      order: [['ThoiGian', 'DESC']]
    });

    //  Render form
    res.render('giaovien/suadiem/suadiem', {
      diemSo,
      lichSu,
      hocKy: diemSo.HocKy,
      namHoc: diemSo.NamHoc,
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

    // 1. Lấy điểm hiện tại
    const diemSo = await DiemSo.findOne({
      where: {
        id_HocSinh: hocSinhId,
        id_MonHoc: monHocId
      }
    });

    if (!diemSo) {
      return res.json({
        message: 'Không tìm thấy bảng điểm của học sinh'
      });
    }

    // 2. Kiểm tra loại điểm hợp lệ
    const cacLoaiDiemHopLe = [
      'DiemTX1',
      'DiemTX2',
      'Diem1T1',
      'Diem1T2',
      'DiemGK',
      'DiemCK'
    ];

    if (!cacLoaiDiemHopLe.includes(loaiDiem)) {
      return res.json({
        message: 'Loại điểm không hợp lệ'
      });
    }

    // 3. Lưu lịch sử sửa điểm
    await LichSuDiem.create({
      id_DiemSo: diemSo.id,
      LoaiDiem: loaiDiem,
      DiemCu: diemSo[loaiDiem],
      DiemMoi: diemMoi,
      NguoiSua: req.session.user.id, // giáo viên
      LyDo: lyDo,
      ThoiGian: new Date()
    });

    // 4. Không sửa trực tiếp điểm – chỉ gửi yêu cầu
    res.redirect('back');

  } catch (err) {
    console.error(err);
    res.json({
      message: 'Lỗi khi gửi yêu cầu sửa điểm'
    });
  }
};
