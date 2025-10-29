const { sequelize } = require('../config/sequelize');
const TaiKhoan = require('./user');
const VaiTro = require('./role');
const HocSinh = require('./HocSinh');
const Lop = require('./Lop');
const Truong = require('./Truong');

const NhanVienSo = require('./NhanVienSo'); // 👉 thêm model mới
const ThiSinh = require('./ThiSinh');
const DiemThi = require('./DiemThi');

// 👉 Tài khoản & Vai trò
TaiKhoan.belongsTo(VaiTro, { foreignKey: 'id_role', as: 'role' });
VaiTro.hasMany(TaiKhoan, { foreignKey: 'id_role', as: 'accounts' });

// 👉 Học sinh & Lớp & Trường


// 👉 Khai báo các quan hệ ở đây (sau khi tất cả model được import)
HocSinh.belongsTo(Lop, { foreignKey: 'id_Lop', as: 'lop' });
HocSinh.belongsTo(Truong, { foreignKey: 'id_school', as: 'truong' });
Lop.hasMany(HocSinh, { foreignKey: 'id_Lop', as: 'hocsinhs' });
Truong.hasMany(HocSinh, { foreignKey: 'id_school', as: 'hocsinhs' });

// 👉 NhanVienSo & TaiKhoan (1 nhân viên = 1 tài khoản)
NhanVienSo.belongsTo(TaiKhoan, { foreignKey: 'TaiKhoanID', as: 'taikhoan' });
TaiKhoan.hasOne(NhanVienSo, { foreignKey: 'TaiKhoanID', as: 'nhanvien' });

ThiSinh.hasOne(DiemThi, { foreignKey: 'thisinhid' });
DiemThi.belongsTo(ThiSinh, { foreignKey: 'thisinhid' });

module.exports = { sequelize, TaiKhoan, VaiTro, HocSinh, Lop, Truong, NhanVienSo };

