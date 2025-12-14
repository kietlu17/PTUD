const { ThoiKhoaBieu, MonHoc, Lop, CauHinhNamHoc, GiaoVien } = require('../../models');
const { Op } = require('sequelize');
const dayjs = require('dayjs');

/**
 * Tính tuần hiện tại
 */
function tinhTuanHienTai(ngayBatDau) {
  const start = dayjs(ngayBatDau);
  const now = dayjs();
  const diffWeek = Math.floor(now.diff(start, 'day') / 7) + 1;
  return diffWeek < 1 ? 1 : diffWeek;
}

/**
 * HỌC SINH xem TKB
 */
exports.viewTKBHocSinh = async (req, res) => {
  try {
    const hocSinh = req.session.user.profile;
    const week = parseInt(req.query.week || 0);
    const today = new Date();

        const cauHinh = await CauHinhNamHoc.findOne({
        where: {
            NgayBatDau: { [Op.lte]: today }
        },
        order: [['NgayBatDau', 'DESC']]
        });

    if (!cauHinh) {
      return res.json({ message: 'Chưa cấu hình năm học' });
    }

    const currentWeek = week || tinhTuanHienTai(cauHinh.NgayBatDau);

    const tkb = await ThoiKhoaBieu.findAll({
        where: { id_Lop: hocSinh.id_Lop, NamHoc: cauHinh.NamHoc, HocKy: cauHinh.HocKy },
        include: [{ model: GiaoVien, as: 'giaoVien' }, { model: MonHoc, as: 'monHoc' }]
    });


    res.render('./hocsinh/tkb/create', {
      tkb,
      week: currentWeek,
      maxWeek: cauHinh.SoTuan
    });

  } catch (err) {
    console.error(err);
    res.json({ message: 'Không thể tải thời khóa biểu' });
  }
};

/**
 * GIÁO VIÊN xem TKB
 */
exports.viewTKBGiaoVien = async (req, res) => {
  try {
    const gv = req.session.user.profile;

    const week = parseInt(req.query.week || 0);
    const today = new Date();
        const cauHinh = await CauHinhNamHoc.findOne({
        where: {
            NgayBatDau: { [Op.lte]: today }
        },
        order: [['NgayBatDau', 'DESC']]
        });

    const currentWeek = week || tinhTuanHienTai(cauHinh.NgayBatDau);

    const tkb = await ThoiKhoaBieu.findAll({
      where: {
        id_GiaoVien: gv.id,
        NamHoc: cauHinh.NamHoc,
        HocKy: cauHinh.HocKy
      },
      include: [
        { model: MonHoc, as: 'monHoc' },
        { model: Lop, as: 'lop' }
      ]
    });

    res.render('./giaovien/tkb/create', {
      tkb,
      week: currentWeek,
      maxWeek: cauHinh.SoTuan
    });

  } catch (err) {
    console.error(err);
    res.render('tkb/error', { message: 'Không thể tải thời khóa biểu' });
  }
};
