const { HocSinh, ToHopMon } = require('../../models');
const { Op } = require('sequelize');

exports.viewForm = async (req, res) => {
  const userId = req.session.user.username; 

  const hs = await HocSinh.findOne({ where: { MaHS: userId } });

  const toHop = await ToHopMon.findAll();

  res.render('./hocsinh/dangkynhaphoc/tohop', { hs, toHop });
};


exports.submit = async (req, res) => {
  const userId = req.session.user.username; 

  const hs = await HocSinh.findOne({ where: { MaHS: userId } });
  const { id_tohopmon } = req.body;


  if (!hs)  
    res.status(404).json({ message: "Không tìm thấy học sinh" });

  hs.id_tohopmon = id_tohopmon;
  hs.DaDangKyToHop = true;
  hs.ThoiGianDangKy = new Date();

  await hs.save();

   res.status(200).json({ message: "Đăng ký tổ hợp môn thành công!" });
};
