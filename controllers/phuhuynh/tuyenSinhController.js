const DangKyTuyenSinh = require('../../models/DangKyTuyenSinh');
const Truong = require('../../models/Truong'); // bảng trường để lấy danh sách nguyện vọng

// Hiển thị form đăng ký tuyển sinh
exports.showFormDangKy = async (req, res) => {
  try {
    const danhSachTruong = await Truong.findAll(); // lấy danh sách trường để chọn NV1, NV2, NV3
    res.render('./phuhuynh/dangky/dangkyForm', { danhSachTruong });
  } catch (error) {
    console.error('Lỗi khi hiển thị form:', error);
    res.status(500).send('Lỗi máy chủ');
  }
};

// Xử lý submit form đăng ký tuyển sinh
exports.submitDangKy = async (req, res) => {
  try {
    const {
      HoVaTen,
      NgaySinh,
      GioiTinh,
      DiaChi,
      DanToc,
      TonGiao,
      CCCD,
      NV1, NV2, NV3,
      DiemTongKet_Lop6, DiemTongKet_Lop7, DiemTongKet_Lop8, DiemTongKet_Lop9,
      HanhKiem_Lop6, HanhKiem_Lop7, HanhKiem_Lop8, HanhKiem_Lop9,
      KhoiThi
    } = req.body;

    await DangKyTuyenSinh.create({
      HoVaTen,
      NgaySinh,
      GioiTinh,
      DiaChi,
      DanToc,
      TonGiao,
      CCCD,
      NV1, NV2, NV3,
      DiemTongKet_Lop6, DiemTongKet_Lop7, DiemTongKet_Lop8, DiemTongKet_Lop9,
      HanhKiem_Lop6, HanhKiem_Lop7, HanhKiem_Lop8, HanhKiem_Lop9,
      TrangThai: 'Chờ duyệt'
    });

    res.status(201).json({message: 'Đăng ký thành công! Hồ sơ đang chờ duyệt.'});

  } catch (error) {
    console.error('Lỗi khi lưu đăng ký:', error);
    res.status(500).json({message: 'Lỗi máy chủ khi đăng ký'});
  }
};
