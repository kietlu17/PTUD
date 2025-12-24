const { Lop, HocSinh, HanhKiem, DiemSo } = require('../../models');
const { Sequelize } = require('sequelize');
const qs = require('qs')

exports.showClasses = async(req, res) => {
    try {
        const ALLOWED_END_MONTHS = [11, 12]; 
        const nowMonth = new Date().getMonth() + 1;
        const KyHoc = req.query.KyHoc || '1';
        let allowEdit = ALLOWED_END_MONTHS.includes(nowMonth);
        const giaovienId = req.params.giaovienId;

        if (!giaovienId) {
            return res.status(400).send('Giáo viên ID không xác định');
        }

        // 1️ Lấy dsLop với số lượng học sinh
        const dsLop = await Lop.findAll({
            where: { id_GiaoVienChuNhiem: giaovienId },
            include: [{
                model: HocSinh,
                as: 'hocsinhs',
                attributes: [], // chỉ đếm thôi
                required: false,
            }, ],
            attributes: [
                'id',
                'TenLop', [Sequelize.fn('COUNT', Sequelize.col('hocsinhs.id')), 'SoLuongHocSinh'],
            ],
            group: ['Lop.id'],
            raw: true,
            nest: true,
        });

        // 2️ Lấy học sinh từng lớp
        const lopIds = dsLop.map(l => l.id);
        const hocsinhByLop = await HocSinh.findAll({
          where: { id_Lop: lopIds },
          include: [{
            model: HanhKiem,
            as: 'hanhKiem',
            required: false,
            where: {
              HocKy: KyHoc
            }
          }],
          attributes: ['id', 'HoVaTen', 'NgaySinh', 'GioiTinh', 'id_Lop'],
        });


        // 3️ Gán học sinh về từng lớp
        dsLop.forEach(lop => {
            lop.hocsinhs = hocsinhByLop.filter(hs => hs.id_Lop === lop.id);
        });

        res.render('./giaovien/hanhkiem/nhaphanhkiem', { dsLop,KyHoc, giaovienId, currentPage: '/hanhkiem', allowEdit });

    } catch (error) {
        console.error('Lỗi khi lấy danh sách lớp của giáo viên:', error);
        res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
    }
};

// Lưu hạnh kiểm
// Lưu hạnh kiểm chỉ insert mới
exports.submitHanhKiem = async (req, res) => {
  const { lopId, giaovienId } = req.params;
  const { hanhKiem, nhanXet, NamHoc, KyHoc } = req.body;

  if (!hanhKiem || !nhanXet || !NamHoc || !KyHoc) {
    return res.status(400).json({ message: 'Dữ liệu không đầy đủ' });
  }

  try {
    // Chuyển dữ liệu từ object sang mảng để insert
    const entries = Object.entries(hanhKiem).map(([id_HocSinh, LoaiHanhKiem]) => ({
      id_HocSinh: parseInt(id_HocSinh),
      LoaiHanhKiem,
      NhanXet: nhanXet[id_HocSinh] || '',
      HocKy: KyHoc,
      NamHoc
    }));

    // Lưu vào DB
    for (const entry of entries) {
      await HanhKiem.create({
        id_HocSinh: entry.id_HocSinh,
        HocKy: entry.HocKy,
        NamHoc: entry.NamHoc,
        LoaiHanhKiem: entry.LoaiHanhKiem,
        NhanXet: entry.NhanXet,
        NguoiDanhGia: giaovienId,
        NgayDanhGia: new Date(),
      });
    }

    // Tùy chọn: load lại lớp + học sinh nếu cần render lại view
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
      return res.status(404).json({ message: 'Không tìm thấy lớp này' });
    }

    return res.status(200).json({ message: 'Lưu hạnh kiểm thành công', lop });

  } catch (error) {
    console.error('Lỗi khi lưu hạnh kiểm:', error);
    return res.status(500).json({ message: 'Lỗi máy chủ khi lưu hạnh kiểm', error: error.message });
  }
};
