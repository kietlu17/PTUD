const { Lop, HocSinh, HanhKiem, DiemSo } = require('../../models');
const { Sequelize } = require('sequelize');
const qs =require('qs')

exports.showClasses = async (req, res) => {
  try {
    const giaovienId = req.params.giaovienId;

    if (!giaovienId) {
      return res.status(400).send('Giáo viên ID không xác định');
    }

    // 1️ Lấy dsLop với số lượng học sinh
    const dsLop = await Lop.findAll({
      where: { id_GiaoVienChuNhiem: giaovienId },
      include: [
        {
          model: HocSinh,
          as: 'hocsinhs',
          attributes: [], // chỉ đếm thôi
          required: false,
        },
      ],
      attributes: [
        'id',
        'TenLop',
        [Sequelize.fn('COUNT', Sequelize.col('hocsinhs.id')), 'SoLuongHocSinh'],
      ],
      group: ['Lop.id'],
      raw: true,
      nest: true,
    });

    // 2️ Lấy học sinh từng lớp
    const lopIds = dsLop.map(l => l.id);
    const hocsinhByLop = await HocSinh.findAll({
      where: { id_Lop: lopIds },
      include: [
        { model: HanhKiem, as: 'hanhKiem', required: false } // lấy hạnh kiểm nếu đã có
      ],
      attributes: ['id', 'HoVaTen', 'NgaySinh', 'GioiTinh', 'id_Lop'],
    });

    // 3️ Gán học sinh về từng lớp
    dsLop.forEach(lop => {
      lop.hocsinhs = hocsinhByLop.filter(hs => hs.id_Lop === lop.id);
    });

    res.render('./giaovien/hanhkiem/nhaphanhkiem', { dsLop, giaovienId });

  } catch (error) {
    console.error('Lỗi khi lấy danh sách lớp của giáo viên:', error);
    res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
  }
};




// Lưu hạnh kiểm
exports.submitHanhKiem = async (req, res) => {
  const { lopId, giaovienId } = req.params;

  // Xử lý dữ liệu hạnh kiểm
  const hkEntries = Object.entries(req.body)
    .filter(([key]) => key.startsWith('hanhKiem['))
    .map(([key, value]) => {
      const match = key.match(/\[(\d+)\]/);
      const studentId = match ? parseInt(match[1]) : null;
      return { studentId, LoaiHanhKiem: value };
    })
    .filter(e => e.studentId !== null);

  const nhanXetEntries = Object.entries(req.body)
    .filter(([key]) => key.startsWith('nhanXet['))
    .map(([key, value]) => {
      const match = key.match(/\[(\d+)\]/);
      const studentId = match ? parseInt(match[1]) : null;
      return { studentId, NhanXet: value };
    })
    .filter(e => e.studentId !== null);

  const mergedEntries = hkEntries.map(hk => {
    const nx = nhanXetEntries.find(n => n.studentId === hk.studentId);
    return {
      id_HocSinh: hk.studentId,
      LoaiHanhKiem: hk.LoaiHanhKiem,
      NhanXet: nx ? nx.NhanXet : '',
    };
  });

  try {
    // Lưu hạnh kiểm
    for (const entry of mergedEntries) {
      await HanhKiem.upsert({
        id_HocSinh: entry.id_HocSinh,
        HocKy: '1',
        NamHoc: '2025-2026',
        LoaiHanhKiem: entry.LoaiHanhKiem,
        NhanXet: entry.NhanXet,
        NguoiDanhGia: giaovienId,
        NgayDanhGia: new Date(),
      }, {
        conflictFields: ['id_HocSinh', 'HocKy', 'NamHoc'],
      });
    }

    // Load lại lớp và học sinh sau khi lưu
    const lop = await Lop.findByPk(lopId, {
      include: [
        {
          model: HocSinh,
          as: 'hocsinhs',
          include: [{ model: HanhKiem, as: 'hanhKiem', required: false }]
        }
      ]
    });

    if (!lop) {
      return res.status(404).send('Không tìm thấy lớp này');
    }

    // Render lại view với thông báo thành công
    res.send('Luu thanh cong')

  } catch (error) {
    console.error('Lỗi khi lưu hạnh kiểm:', error);
    res.status(500).send('Lỗi máy chủ khi lưu hạnh kiểm');
  }
};
