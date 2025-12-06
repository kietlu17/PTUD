const { CauHinhNhapHoc } = require('../models');
const { Op } = require('sequelize');

module.exports =  async function checkDangKyToHop(req, res, next){

    const hs = req.session.user.profile; // học sinh

    const config = await CauHinhNhapHoc.findOne({
        where: { Nam: hs.NamNhapHoc }
    });

    const now = new Date();
    if (!config) {
    return res.render('./hocsinh/dangkynhaphoc/hethandk', {
        message: `Hiện chưa có cấu hình đăng ký nhập học cho năm ${hs.NamNhapHoc}.`
    });
}
    // Hết hạn đăng ký
    if (now < config.MoDangKy || now > config.DongDangKy) {
        return res.render('./hocsinh/dangkynhaphoc/hethandk', {
            message: "Hiện không trong thời gian đăng ký nhập học."
        });
    }

    // Nếu chưa chọn tổ hợp → bắt buộc chuyển đến trang chọn
    if (!hs.DaDangKyToHop) {
        return res.redirect('/hocsinh/nhaphoc/tohop');
    }

    next();
};

