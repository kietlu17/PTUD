const { sequelize } = require('../config/sequelize');
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
const DiemSo = require('./DiemSo');

// --- IMPORT NGHI HỌC ---
const NghiHoc = require('./NghiHoc')(sequelize, require('sequelize'));

// --- IMPORT BÀI TẬP (Thêm mới) ---
const BaiTap = require('./BaiTap')(sequelize, require('sequelize'));
// ------------------------------

// 👉 Khai báo các quan hệ ở đây

// 1. Tài khoản & Vai trò
TaiKhoan.belongsTo(VaiTro, { foreignKey: 'id_role', as: 'role' });
VaiTro.hasMany(TaiKhoan, { foreignKey: 'id_role', as: 'accounts' });

// 2. Học sinh & Lớp & Trường
HocSinh.belongsTo(Lop, { foreignKey: 'id_Lop', as: 'lop' });
HocSinh.belongsTo(Truong, { foreignKey: 'id_school', as: 'truong' });
Lop.hasMany(HocSinh, { foreignKey: 'id_Lop', as: 'hocsinhs' });
Truong.hasMany(HocSinh, { foreignKey: 'id_school', as: 'hocsinhs' });
Truong.hasMany(Lop, { foreignKey: 'id_truong', as: 'lops' })

// ✅ Liên kết (1 thí sinh có 1 điểm thi)
ThiSinh.hasOne(DiemThi, { foreignKey: 'thisinhid', as: 'diem' });
DiemThi.belongsTo(ThiSinh, { foreignKey: 'thisinhid', as: 'thisinh' });

ThiSinh.belongsTo(PhongThi, { foreignKey: 'phongthiid', as: 'phongthi' });
PhongThi.hasMany(ThiSinh, { foreignKey: 'phongthiid', as: 'thisinhs' });

QuanTriTruong.belongsTo(Truong, { foreignKey: 'id_school', as: 'truong' });
Truong.hasMany(QuanTriTruong, { foreignKey: 'id_school', as: 'quantri' });
Truong.hasMany(GiaoVien, { foreignKey: 'id_truong', as: 'giaovien' });

Lop.belongsTo(GiaoVien, { foreignKey: 'id_GiaoVienChuNhiem', as: 'gvcn' });

BangPhanCongGiaoVien.belongsTo(GiaoVien, { foreignKey: 'id_GiaoVien', as: 'giaovien' });
BangPhanCongGiaoVien.belongsTo(MonHoc, { foreignKey: 'id_MonHoc', as: 'monhoc' });
BangPhanCongGiaoVien.belongsTo(Lop, { foreignKey: 'id_Lop', as: 'lop' });

// Nếu muốn truy vấn ngược lại
GiaoVien.hasMany(BangPhanCongGiaoVien, { foreignKey: 'id_GiaoVien', as: 'phancongday' });
GiaoVien.belongsTo(Truong, { foreignKey: 'id_truong', as: 'truong' });
MonHoc.hasMany(BangPhanCongGiaoVien, { foreignKey: 'id_MonHoc', as: 'phancongmon' });
Lop.hasMany(BangPhanCongGiaoVien, { foreignKey: 'id_Lop', as: 'phanconglop' });

ToHopMon.belongsToMany(MonHoc, {
    through: ChiTiet_ToHopMon,
    foreignKey: 'subject_group_id',
    otherKey: 'subject_id',
    as: 'danhsachmon'
});

MonHoc.belongsToMany(ToHopMon, {
    through: ChiTiet_ToHopMon,
    foreignKey: 'subject_id',
    otherKey: 'subject_group_id',
    as: 'tohoplienquan'
});

DiemDanh.belongsTo(HocSinh, { foreignKey: 'student_id', as: 'hocSinh' });
DiemDanh.belongsTo(Lop, { foreignKey: 'lop_id', as: 'lop' });
DiemDanh.belongsTo(MonHoc, { foreignKey: 'monhoc_id', as: 'monHoc' });
DiemDanh.belongsTo(GiaoVien, { foreignKey: 'giaovien_id', as: 'giaoVien' });

HocSinh.hasMany(DiemDanh, { foreignKey: 'student_id', as: 'diemDanhs' });

HocSinh.hasMany(PhuHuynh, { foreignKey: 'id_HocSinh', as: 'phuhuynh' });
PhuHuynh.belongsTo(HocSinh, { foreignKey: 'id_HocSinh', as: 'hocsinh' });

HocSinh.hasMany(HanhKiem, { foreignKey: 'id_HocSinh', as: 'hanhKiem' });
HanhKiem.belongsTo(HocSinh, { foreignKey: 'id_HocSinh', as: 'hocSinh' });

// Quan hệ HanhKiem - GiaoVien
GiaoVien.hasMany(HanhKiem, { foreignKey: 'NguoiDanhGia', as: 'danhGia' });
HanhKiem.belongsTo(GiaoVien, { foreignKey: 'NguoiDanhGia', as: 'giaovienDanhGia' });

HocSinh.hasMany(DiemSo, { foreignKey: 'id_HocSinh', as: 'diem' });
DiemSo.belongsTo(HocSinh, { foreignKey: 'id_HocSinh', as: 'hocSinh' });

// Quan hệ Diem - MonHoc
MonHoc.hasMany(DiemSo, { foreignKey: 'id_MonHoc', as: 'diem' });
DiemSo.belongsTo(MonHoc, { foreignKey: 'id_MonHoc', as: 'monHoc' });

// --- QUAN HỆ CHO NGHI HỌC ---
HocSinh.hasMany(NghiHoc, { foreignKey: 'student_id', as: 'dsNghiHoc' });
NghiHoc.belongsTo(HocSinh, { foreignKey: 'student_id', as: 'hocSinh' });

// --- QUAN HỆ CHO BÀI TẬP (Thêm mới) ---
Lop.hasMany(BaiTap, { foreignKey: 'id_Lop', as: 'dsBaiTap' });
BaiTap.belongsTo(Lop, { foreignKey: 'id_Lop', as: 'lop' });

MonHoc.hasMany(BaiTap, { foreignKey: 'id_MonHoc', as: 'dsBaiTap' });
BaiTap.belongsTo(MonHoc, { foreignKey: 'id_MonHoc', as: 'monHoc' });

GiaoVien.hasMany(BaiTap, { foreignKey: 'id_GiaoVien', as: 'dsBaiTap' });
BaiTap.belongsTo(GiaoVien, { foreignKey: 'id_GiaoVien', as: 'giaoVien' });
// --------------------------------------


// Export tất cả model
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
    DiemSo,
    NghiHoc,
    BaiTap // <--- Đừng quên export BaiTap
};