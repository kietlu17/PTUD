const { Lop, HocSinh, HanhKiem, DiemSo } = require('../../models');
const { Sequelize } = require('sequelize');
const qs = require('qs')

exports.showClasses = async(req, res) => {
    try {
<<<<<<< HEAD
        const giaovienId = req.params.giaovienId;

=======
        const ALLOWED_END_MONTHS = [11, 12]; 
        const nowMonth = new Date().getMonth() + 1;

        let allowEdit = ALLOWED_END_MONTHS.includes(nowMonth);
        const giaovienId = req.params.giaovienId;

>>>>>>> main
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
            include: [
                { model: HanhKiem, as: 'hanhKiem', required: false } // lấy hạnh kiểm nếu đã có
            ],
            attributes: ['id', 'HoVaTen', 'NgaySinh', 'GioiTinh', 'id_Lop'],
        });

        // 3️ Gán học sinh về từng lớp
        dsLop.forEach(lop => {
            lop.hocsinhs = hocsinhByLop.filter(hs => hs.id_Lop === lop.id);
        });

<<<<<<< HEAD
        res.render('./giaovien/hanhkiem/nhaphanhkiem', { dsLop, giaovienId, currentPage: '/hanhkiem' });
=======
        res.render('./giaovien/hanhkiem/nhaphanhkiem', { dsLop, giaovienId, currentPage: '/hanhkiem', allowEdit });
>>>>>>> main

    } catch (error) {
        console.error('Lỗi khi lấy danh sách lớp của giáo viên:', error);
        res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
    }
};

// Lưu hạnh kiểm
<<<<<<< HEAD
exports.submitHanhKiem = async(req, res) => {
    const { lopId, giaovienId } = req.params;

    // Ràng buộc: chỉ cho phép điều chỉnh ở cuối học kỳ
    // Chỉnh ALLOWED_END_MONTHS theo lịch của trường (ví dụ: 1 = Jan, 6 = Jun)
    const ALLOWED_END_MONTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]; // <-- điều chỉnh nếu cần, hiện tại cho phép tất cả các tháng
    const nowMonth = new Date().getMonth() + 1;
    if (!ALLOWED_END_MONTHS.includes(nowMonth)) {
        return res.status(403).json({ message: 'Chỉ được điều chỉnh hạnh kiểm vào cuối học kỳ.' });
    }

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
            include: [{
                model: HocSinh,
                as: 'hocsinhs',
                include: [{ model: HanhKiem, as: 'hanhKiem', required: false }]
            }]
        });

        if (!lop) {
            return res.status(404).send('Không tìm thấy lớp này');
        }

        // Render lại view với thông báo thành công
        //res.send('Luu thanh cong') // sửa phần này để server xử lý thành công r mới hiện thông báo thành công bên view
        return res.status(200).json({ message: 'Lưu hạnh kiểm thành công' });

    } catch (error) {
        console.error('Lỗi khi lưu hạnh kiểm:', error);
        res.status(500).send('Lỗi máy chủ khi lưu hạnh kiểm');
    }
};
=======
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
>>>>>>> main
