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
// 👉 Khai báo các quan hệ ở đây (sau khi tất cả model được import)

// 1. Tài khoản & Vai trò
TaiKhoan.belongsTo(VaiTro, { foreignKey: 'id_role', as: 'role' });
VaiTro.hasMany(TaiKhoan, { foreignKey: 'id_role', as: 'accounts' });

// 2. Học sinh & Lớp & Trường
HocSinh.belongsTo(Lop, { foreignKey: 'id_Lop', as: 'lop' });
HocSinh.belongsTo(Truong, { foreignKey: 'id_school', as: 'truong' });
Lop.hasMany(HocSinh, { foreignKey: 'id_Lop', as: 'hocsinhs' });
Truong.hasMany(HocSinh, { foreignKey: 'id_school', as: 'hocsinhs' });
Truong.hasMany(Lop,{foreignKey: 'id_truong', as: 'lops'})

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
GiaoVien.belongsTo(Truong, {foreignKey: 'id_truong', as: 'truong'});
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
// Export tất cả model
module.exports = { sequelize, TaiKhoan, VaiTro, HocSinh, Lop, Truong, PhongThi,ThiSinh ,DiemThi, NhanVienSo, QuanTriTruong, GiaoVien, MonHoc, ToHopMon, ChiTiet_ToHopMon, BangPhanCongGiaoVien, DiemDanh };
