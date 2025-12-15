const { dongBoThiSinh } = require("../../services/dongboTuyenSinh");
const DangKyTuyenSinh = require('../../models/DangKyTuyenSinh')
exports.chayDongBo = async (req, res) => {
  try {
    const ketqua = await dongBoThiSinh();
    res.json({ success: true, ...ketqua });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

exports.viewDongBo = async (req, res) => {
    const soChoDongBo = await DangKyTuyenSinh.count({
        where: { TrangThai: 'Đã duyệt' }
    });

    res.render('sogiaoduc/dongbo_thisinh', {
        soChoDongBo, 
        currentUrl:'dongbo'
    });
};
