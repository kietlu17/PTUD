const { sequelize, DangKyTuyenSinh, ThiSinh, LichSuDongBoThiSinh } = require('../models');

async function dongBoThiSinh() {
  const t = await sequelize.transaction();

  let tong = 0, thanhcong = 0, thatbai = 0;

  try {
    const danhSach = await DangKyTuyenSinh.findAll({
      where: { TrangThai: "Đã duyệt" }
    });

    tong = danhSach.length;

    for (const hs of danhSach) {
      try {
        const ts = await ThiSinh.create({
          mahs: taoMaThiSinh(hs.id),
          hoten: hs.HoVaTen,
          ngaysinh: hs.NgaySinh,
          phongthiid: null,
          id_dangky: hs.id
        }, { transaction: t });

        await hs.update({ TrangThai: "Đã chuyển" }, { transaction: t });
        thanhcong++;
      } catch (err) {
         console.error("Lỗi khi thêm hồ sơ:", hs.id, err.message);
        thatbai++;
      }
    }

    await LichSuDongBoThiSinh.create({
      thoigian: new Date(),
      tong,
      thanhcong,
      thatbai,
      ghichu: thatbai > 0 ? "Có lỗi trong một số bản ghi" : "OK"
    }, { transaction: t });

    await t.commit();
    return { tong, thanhcong, thatbai };

  } catch (err) {
    await t.rollback();
    throw err;
  }
}

function taoMaThiSinh(id) {
  return "TS" + id.toString().padStart(5, "0");
}

module.exports = { dongBoThiSinh };
