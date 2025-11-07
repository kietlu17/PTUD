const { Sequelize } = require('sequelize');
const { Lop, GiaoVien, HocSinh } = require('../models');

const { render } = require('ejs');

exports.getAllLop = async (req, res) => {
  try {
    const idTruong = req.session.user.profile.id_school;
    const dsLop = await Lop.findAll({
      attributes: [
        'id',
        'TenLop',
        // Thêm số lượng học sinh
        [Sequelize.fn('COUNT', Sequelize.col('hocsinhs.id')), 'SoLuongHocSinh'],
      ],
      where: { id_truong: idTruong },
      include: [
        {
          model: GiaoVien,
          as: 'gvcn',
          attributes: ['id', 'HoVaTen'],
        },
        {
          model: HocSinh,
          as: 'hocsinhs',
          attributes: [],
          required: false, // 👈 để lấy lớp không có học sinh
        },
      ],
      group: ['Lop.id', 'gvcn.id'], // 👈 group theo lớp & giáo viên
      subQuery: false, // 👈 tránh Sequelize sinh subquery làm mất count
      raw: true,       // 👈 ép trả dữ liệu "phẳng" dễ truy cập
      nest: true,      // 👈 nếu muốn giữ cấu trúc lồng (lop.gvcn)
    });

    res.status(200).render('quanlylop', { dsLop });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách lớp:', error);
    res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
  }
};

exports.getHocSinhByLop = async (req, res) => {
  try {
    const id = req.params.id;
    console.log( id )
    // Kiểm tra lớp có tồn tại không
    const lop = await Lop.findByPk(id, {
      include: [
        { model: GiaoVien, as: 'gvcn', attributes: ['id', 'HoVaTen'] },
      ],
    });

    if (!lop) {
      return res.status(404).json({ message: 'Không tìm thấy lớp này' });
    }

    // Lấy danh sách học sinh thuộc lớp đó
    const dsHocSinh = await HocSinh.findAll({
      where: { id_Lop: id },
      attributes: ['id', 'HoVaTen', 'NgaySinh', 'GioiTinh'],
      order: [['HoVaTen', 'ASC']],
    });

    res.status(200).render('danhsachlop', {
      lop,
      dsHocSinh,
    });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách học sinh:', error);
    res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
  }

  // Hiển thị form chuyển lớp

};

exports.showChuyenLopForm = async (req, res) => {
  try {
    const { id } = req.params;
    const hocSinh = await HocSinh.findByPk(id, {
      include: [{ model: Lop, as: 'lop', attributes: ['id', 'TenLop'] }]
    });

    if (!hocSinh) {
      return res.status(404).send('Không tìm thấy học sinh');
    }

    const dsLop = await Lop.findAll({ attributes: ['id', 'TenLop'] });

    res.render('chuyenlop', { hocSinh, dsLop });
  } catch (error) {
    console.error('Lỗi khi hiển thị form chuyển lớp:', error);
    res.status(500).send('Lỗi máy chủ');
  }
};

// Xử lý cập nhật lớp cho học sinh
exports.handleChuyenLop = async (req, res) => {
  try {
    const { id } = req.params;
    const { id_lop_moi } = req.body;

    const hocSinh = await HocSinh.findByPk(id);
    if (!hocSinh) {
      return res.status(404).send('Không tìm thấy học sinh');
    }

    await hocSinh.update({ id_Lop: id_lop_moi });

    res.redirect(`/admin/quanlylop/${id_lop_moi}/hocsinh`);
  } catch (error) {
    console.error('Lỗi khi chuyển lớp:', error);
    res.status(500).send('Lỗi máy chủ');
  }
};
