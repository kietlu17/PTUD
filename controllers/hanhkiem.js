const { Lop, HocSinh, HanhKiem, DiemSo } = require('../models');
const { Sequelize } = require('sequelize');
const qs =require('qs')

// 1️⃣ Hiển thị danh sách lớp giáo viên chủ nhiệm
exports.showClasses = async (req, res) => {
  try {
    const giaovienId = req.params.giaovienId;

    if (!giaovienId) {
      return res.status(400).send('Giáo viên ID không xác định');
    }

    const dsLop = await Lop.findAll({
      where: { id_GiaoVienChuNhiem: giaovienId }, // đúng tên cột trong DB
      include: [
        {
          model: HocSinh,
          as: 'hocsinhs',
          attributes: [],
          required: false,
        },
      ],
      attributes: [
        'id',
        'TenLop',
        [Sequelize.fn('COUNT', Sequelize.col('hocsinhs.id')), 'SoLuongHocSinh'],
      ],
      group: ['Lop.id'],
      subQuery: false,
      raw: true,
      nest: true,
    });

    res.render('dsLopHanhKiem', { dsLop, giaovienId });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách lớp của giáo viên:', error);
    res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
  }
};

// 2️⃣ Hiển thị danh sách học sinh trong lớp để nhập hạnh kiểm
exports.getHocSinhByLop = async (req, res) => {
  try {
    const { lopId, giaovienId } = req.params;

    const lop = await Lop.findByPk(lopId, {
      include: [
        { model: HocSinh, as: 'hocsinhs', include: [{ model: HanhKiem, as: 'hanhKiem', required: false }] },
      ],
    });

    if (!lop) {
      return res.status(404).send('Không tìm thấy lớp này');
    }

    // Lấy danh sách học sinh với điểm và hạnh kiểm
    const dsHocSinhWithInfo = await Promise.all(
      lop.hocsinhs.map(async hs => {
        // Lấy danh sách điểm trung bình từng môn
        const diemList = await DiemSo.findAll({
          where: { id_HocSinh: hs.id, HocKy: '1', NamHoc: '2025-2026' },
          attributes: ['id_MonHoc', 'DiemThuongKy', 'DiemGiuaKy', 'DiemCuoiKy', 'DiemTrungBinh'],
        });

        return {
          ...hs.toJSON(),
          diemList,
          hanhKiem: hs.hanhKiem || null,
        };
      })
    );

    res.render('nhapHanhKiem', { dsHocSinh: dsHocSinhWithInfo, lop, giaovienId });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách học sinh:', error);
    res.status(500).send('Lỗi máy chủ');
  }
};

exports.submitHanhKiem = async (req, res) => {
  const { lopId, giaovienId } = req.params;

  // In ra body gốc để kiểm tra
  console.log('📥 Hạnh kiểm raw body:', req.body);

  // Parse dữ liệu hanhKiem[<id>] và nhanXet[<id>]
  const hkEntries = Object.entries(req.body)
    .filter(([key]) => key.startsWith('hanhKiem['))
    .map(([key, value]) => {
      const match = key.match(/\[(\d+)\]/);
      const studentId = match ? parseInt(match[1]) : null;
      return { studentId, LoaiHanhKiem: value };
    })
    .filter(entry => entry.studentId !== null); // loại bỏ key không hợp lệ

  const nhanXetEntries = Object.entries(req.body)
    .filter(([key]) => key.startsWith('nhanXet['))
    .map(([key, value]) => {
      const match = key.match(/\[(\d+)\]/);
      const studentId = match ? parseInt(match[1]) : null;
      return { studentId, NhanXet: value };
    })
    .filter(entry => entry.studentId !== null);

  // Ghép hanhKiem + nhanXet theo studentId
  const mergedEntries = hkEntries.map(hk => {
    const nx = nhanXetEntries.find(n => n.studentId === hk.studentId);
    return {
      id_HocSinh: hk.studentId,
      LoaiHanhKiem: hk.LoaiHanhKiem,
      NhanXet: nx ? nx.NhanXet : '',
    };
  });

  console.log('📤 Hạnh kiểm parsed:', mergedEntries);

  if (mergedEntries.length === 0) {
    return res.status(400).send('Không có dữ liệu hạnh kiểm để lưu');
  }

  try {
    for (const entry of mergedEntries) {
      await HanhKiem.upsert({
      id_HocSinh: entry.id_HocSinh,
      HocKy: '1',
      NamHoc: '2025-2026',
      LoaiHanhKiem: entry.LoaiHanhKiem,
      NhanXet: entry.NhanXet,
      NguoiDanhGia: giaovienId,
      NgayDanhGia: new Date(),
    },
  {
    conflictFields: ['id_HocSinh', 'HocKy', 'NamHoc'], // đây mới là quan trọng
  });

    
    }

    res.redirect(`/giaovien/hanhkiem/${giaovienId}/lop/${lopId}`);
  } catch (error) {
    console.error('Lỗi khi lưu hạnh kiểm:', error);
    res.status(500).send('Lỗi máy chủ khi lưu hạnh kiểm');
  }
};
