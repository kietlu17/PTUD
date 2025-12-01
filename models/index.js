const Sequelize = require('sequelize'); // Import thư viện Sequelize
const { sequelize } = require('../config/sequelize'); // Import kết nối Database

// --- 1. IMPORT CÁC MODEL CŨ ---
const TaiKhoan = require('./user');
const VaiTro = require('./role');
const HocSinh = require('./HocSinh');
const Lop = require('./Lop');
const Truong = require('./Truong');
const ThiSinh = require('./ThiSinh');
const DiemThi = require('./DiemThi');
const NhanVienSo = require('./NhanVienSo');
const PhongThi = require('./PhongThi');
const QuanTriTruong = require('./QuanTriTruong');
const GiaoVien = require('./GiaoVien');
const BangPhanCongGiaoVien = require('./BangPhanCongGiaoVien');
const MonHoc = require('./MonHoc');
const ToHopMon = require('./ToHopMon');
const ChiTiet_ToHopMon = require('./ChiTiet_ToHopMon');
const DiemDanh = require('./DiemDanh');
const ThanhToanHocPhi = require('./ThanhToanHocPhi');
const PhuHuynh = require('./PhuHuynh');
const HanhKiem = require('./HanhKiem');
const DiemSo = require('./DiemSo'); // Model cũ (nếu có) hoặc dùng cái mới bên dưới

// --- 2. IMPORT CÁC MODEL MỚI (Dùng cú pháp inject DataTypes) ---
// Lưu ý: Chúng ta truyền Sequelize.DataTypes vào để tránh lỗi "Class constructor..."
const NghiHoc = require('./NghiHoc')(sequelize, Sequelize.DataTypes);
const BaiTap = require('./BaiTap')(sequelize, Sequelize.DataTypes);
const BaiNop = require('./BaiNop')(sequelize, Sequelize.DataTypes);

// Nếu DiemSo của bạn viết theo kiểu mới thì dùng dòng này, nếu cũ thì giữ nguyên dòng import ở trên
// const DiemSo = require('./DiemSo')(sequelize, Sequelize.DataTypes); 


// ====================================================
// KHAI BÁO MỐI QUAN HỆ (ASSOCIATIONS)
// ====================================================

// 1. Tài khoản & Vai trò
TaiKhoan.belongsTo(VaiTro, { foreignKey: 'id_role', as: 'role' });
VaiTro.hasMany(TaiKhoan, { foreignKey: 'id_role', as: 'accounts' });

// 2. Học sinh & Lớp & Trường
HocSinh.belongsTo(Lop, { foreignKey: 'id_Lop', as: 'lop' });
HocSinh.belongsTo(Truong, { foreignKey: 'id_school', as: 'truong' });
Lop.hasMany(HocSinh, { foreignKey: 'id_Lop', as: 'hocsinhs' });
Truong.hasMany(HocSinh, { foreignKey: 'id_school', as: 'hocsinhs' });
Truong.hasMany(Lop, { foreignKey: 'id_truong', as: 'lops' })

// 3. Thi cử
ThiSinh.hasOne(DiemThi, { foreignKey: 'thisinhid', as: 'diem' });
DiemThi.belongsTo(ThiSinh, { foreignKey: 'thisinhid', as: 'thisinh' });
ThiSinh.belongsTo(PhongThi, { foreignKey: 'phongthiid', as: 'phongthi' });
PhongThi.hasMany(ThiSinh, { foreignKey: 'phongthiid', as: 'thisinhs' });

// 4. Quản trị & Giáo viên
QuanTriTruong.belongsTo(Truong, { foreignKey: 'id_school', as: 'truong' });
Truong.hasMany(QuanTriTruong, { foreignKey: 'id_school', as: 'quantri' });
Truong.hasMany(GiaoVien, { foreignKey: 'id_truong', as: 'giaovien' });
GiaoVien.belongsTo(Truong, { foreignKey: 'id_truong', as: 'truong' });

// 5. Lớp & Phân công
Lop.belongsTo(GiaoVien, { foreignKey: 'id_GiaoVienChuNhiem', as: 'gvcn' });

BangPhanCongGiaoVien.belongsTo(GiaoVien, { foreignKey: 'id_GiaoVien', as: 'giaovien' });
BangPhanCongGiaoVien.belongsTo(MonHoc, { foreignKey: 'id_MonHoc', as: 'monhoc' });
BangPhanCongGiaoVien.belongsTo(Lop, { foreignKey: 'id_Lop', as: 'lop' });

GiaoVien.hasMany(BangPhanCongGiaoVien, { foreignKey: 'id_GiaoVien', as: 'phancongday' });
MonHoc.hasMany(BangPhanCongGiaoVien, { foreignKey: 'id_MonHoc', as: 'phancongmon' });
Lop.hasMany(BangPhanCongGiaoVien, { foreignKey: 'id_Lop', as: 'phanconglop' });

// 6. Môn học & Tổ hợp
ToHopMon.belongsToMany(MonHoc, { through: ChiTiet_ToHopMon, foreignKey: 'subject_group_id', otherKey: 'subject_id', as: 'danhsachmon' });
MonHoc.belongsToMany(ToHopMon, { through: ChiTiet_ToHopMon, foreignKey: 'subject_id', otherKey: 'subject_group_id', as: 'tohoplienquan' });

// 7. Điểm Danh
DiemDanh.belongsTo(HocSinh, { foreignKey: 'student_id', as: 'hocSinh' });
DiemDanh.belongsTo(Lop, { foreignKey: 'lop_id', as: 'lop' });
DiemDanh.belongsTo(MonHoc, { foreignKey: 'monhoc_id', as: 'monHoc' });
DiemDanh.belongsTo(GiaoVien, { foreignKey: 'giaovien_id', as: 'giaoVien' });
HocSinh.hasMany(DiemDanh, { foreignKey: 'student_id', as: 'diemDanhs' });

// 8. Phụ Huynh
HocSinh.hasMany(PhuHuynh, { foreignKey: 'id_HocSinh', as: 'phuhuynh' });
PhuHuynh.belongsTo(HocSinh, { foreignKey: 'id_HocSinh', as: 'hocsinh' });

// 9. Hạnh Kiểm
HocSinh.hasMany(HanhKiem, { foreignKey: 'id_HocSinh', as: 'hanhKiem' });
HanhKiem.belongsTo(HocSinh, { foreignKey: 'id_HocSinh', as: 'hocSinh' });
GiaoVien.hasMany(HanhKiem, { foreignKey: 'NguoiDanhGia', as: 'danhGia' });
HanhKiem.belongsTo(GiaoVien, { foreignKey: 'NguoiDanhGia', as: 'giaovienDanhGia' });

// 10. ĐIỂM SỐ 
HocSinh.hasMany(DiemSo, { foreignKey: 'id_HocSinh', as: 'bangDiem' });
DiemSo.belongsTo(HocSinh, { foreignKey: 'id_HocSinh', as: 'hocSinh' });
MonHoc.hasMany(DiemSo, { foreignKey: 'id_MonHoc', as: 'bangDiem' });
DiemSo.belongsTo(MonHoc, { foreignKey: 'id_MonHoc', as: 'monHoc' });

// 11. NGHI HỌC
HocSinh.hasMany(NghiHoc, { foreignKey: 'student_id', as: 'dsNghiHoc' });
NghiHoc.belongsTo(HocSinh, { foreignKey: 'student_id', as: 'hocSinh' });

// 12. BÀI TẬP (Quan trọng cho chức năng Giao bài)
Lop.hasMany(BaiTap, { foreignKey: 'id_Lop', as: 'dsBaiTap' });
BaiTap.belongsTo(Lop, { foreignKey: 'id_Lop', as: 'lop' });
MonHoc.hasMany(BaiTap, { foreignKey: 'id_MonHoc', as: 'dsBaiTap' });
BaiTap.belongsTo(MonHoc, { foreignKey: 'id_MonHoc', as: 'monhoc' });
GiaoVien.hasMany(BaiTap, { foreignKey: 'id_GiaoVien', as: 'dsBaiTap' });
BaiTap.belongsTo(GiaoVien, { foreignKey: 'id_GiaoVien', as: 'giaoVien' });

// 13. BÀI NỘP (Quan trọng cho chức năng Chấm bài)
BaiTap.hasMany(BaiNop, { foreignKey: 'id_BaiTap', as: 'dsBaiNop' });
BaiNop.belongsTo(BaiTap, { foreignKey: 'id_BaiTap', as: 'baiTap' });
HocSinh.hasMany(BaiNop, { foreignKey: 'id_HocSinh', as: 'dsBaiNop' });
BaiNop.belongsTo(HocSinh, { foreignKey: 'id_HocSinh', as: 'hocSinh' });


// ====================================================
// EXPORT TẤT CẢ
// ====================================================
module.exports = {
    sequelize,
    TaiKhoan,
    VaiTro,
    HocSinh,
    Lop,
    Truong,
    PhongThi,
    ThiSinh,
    DiemThi,
    NhanVienSo,
    QuanTriTruong,
    GiaoVien,
    MonHoc,
    ToHopMon,
    ChiTiet_ToHopMon,
    BangPhanCongGiaoVien,
    DiemDanh,
    ThanhToanHocPhi,
    PhuHuynh,
    HanhKiem,
    // Các model mới
    DiemSo,
    NghiHoc,
    BaiTap,
    BaiNop
};