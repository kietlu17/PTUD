const { GiaoVien, BangPhanCongGiaoVien, Lop, HocSinh, DiemDanh } = require('../../models');
const { Sequelize } = require('sequelize');
const qs = require('qs');

exports.showClasses = async (req, res) => {
  try {
    const giaoVienId = req.params.id;

    const dsLop = await BangPhanCongGiaoVien.findAll({
      where: { id_GiaoVien: giaoVienId },
      include: [
        {
          model: Lop,
          as: 'lop', // alias phải trùng với model BangPhanCongGiaoVien
          include: [
            {
              model: HocSinh,
              as: 'hocsinhs', // alias phải trùng với model Lop
              attributes: [],
              required: false,
            },
            {
              model: GiaoVien,
              as: 'gvcn', // alias của giáo viên chủ nhiệm trong model Lop
              attributes: ['id', 'HoVaTen'],
              required: false,
            },
          ],
          attributes: [
            'id',
            'TenLop',
            [Sequelize.fn('COUNT', Sequelize.col('lop->hocsinhs.id')), 'SoLuongHocSinh'],
          ],
        },
      ],
      group: ['BangPhanCongGiaoVien.id', 'lop.id', 'lop->gvcn.id'],
      subQuery: false,
      raw: true,
      nest: true,
    });

    console.log(dsLop); //  in thử ra console để xem cấu trúc dữ liệu

    res.status(200).render('./giaovien/diemdanh/diemdanh', { dsLop, currentPage: '/diemdanh' });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách lớp của giáo viên:', error);
    res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
  }
};

exports.getHocSinhByLop = async (req, res) => {
  try {
    const { lopId, id } = req.params;
    console.log( id )

    const phanCong = await BangPhanCongGiaoVien.findOne({
    where: { id_GiaoVien: id, id_Lop: lopId },
  })
    // Kiểm tra lớp có tồn tại không
    const lop = await Lop.findByPk(lopId, {
      include: [
        { model: GiaoVien, as: 'gvcn', attributes: ['id', 'HoVaTen'] },
      ],
    });

    if (!lop) {
      return res.status(404).json({ message: 'Không tìm thấy lớp này' });
    }

    // Lấy danh sách học sinh thuộc lớp đó
    const dsHocSinh = await HocSinh.findAll({
      where: { id_Lop: lopId },
      attributes: ['id', 'HoVaTen', 'NgaySinh', 'GioiTinh'],
      order: [['HoVaTen', 'ASC']],
    });

    res.status(200).render('./giaovien/diemdanh/danhsachlop', {
      id,
      monhocId: phanCong.id_MonHoc,
      lop,
      dsHocSinh,
      currentPage: '/diemdanh'
    });

  } catch (error) {
    console.error('Lỗi khi lấy danh sách học sinh:', error);
    res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
  }
};

exports.submitAttendance = async (req, res) => {
  const { lopId, id } = req.params;

  // In ra body gốc để kiểm tra
  console.log('Attendance raw body:', req.body);

  // Parse đúng ID học sinh
  const attendanceEntries = Object.entries(req.body)
    .filter(([key]) => key.startsWith('status_'))       // chỉ lấy các field status
    .map(([key, value]) => {
      const studentId = parseInt(key.replace('status_', '')); // tách id
      return {
        studentId,
        status: value
      };
    });

  console.log('Attendance parsed:', attendanceEntries);
  console.log('Lớp:', lopId, 'Giáo viên:', id);

  try {
    const phanCong = await BangPhanCongGiaoVien.findOne({
      where: { id_GiaoVien: id, id_Lop: lopId },
      attributes: ['id_MonHoc'],
    });

    if (!phanCong)
      return res.status(404).send('Không tìm thấy phân công giáo viên cho lớp này');

    const monhocId = phanCong.id_MonHoc;
    const ngayHoc = new Date().toISOString().slice(0, 10);

    // Lưu từng học sinh
    for (const { studentId, status } of attendanceEntries) {
      console.log(`Lưu: HS=${studentId}, TT=${status}`);
      await DiemDanh.create({
        student_id: studentId,
        lop_id: lopId,
        monhoc_id: monhocId,
        giaovien_id: id,
        NgayHoc: ngayHoc,
        TinhTrang: status,
        created_at: new Date(),
      });
    }

    console.log('Điểm danh thành công!');
    res.send('Điểm danh thành công!');// // sửa phần này để server xử lý thành công r mới hiện thông báo thành công bên view
  } catch (error) {
    console.error('Lỗi khi lưu điểm danh:', error);
    res.status(500).send('Lỗi máy chủ khi lưu điểm danh');
  }
};
