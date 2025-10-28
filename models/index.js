const { sequelize } = require('../config/sequelize');
const TaiKhoan = require('./user');
const VaiTro = require('./role');
const HocSinh = require('./HocSinh');
const Lop = require('./Lop');
const Truong = require('./Truong');

// 👉 Khai báo các quan hệ ở đây (sau khi tất cả model được import)

// 1. Tài khoản & Vai trò
TaiKhoan.belongsTo(VaiTro, { foreignKey: 'id_role', as: 'role' });
VaiTro.hasMany(TaiKhoan, { foreignKey: 'id_role', as: 'accounts' });

// 2. Học sinh & Lớp & Trường
HocSinh.belongsTo(Lop, { foreignKey: 'id_Lop', as: 'lop' });
HocSinh.belongsTo(Truong, { foreignKey: 'id_school', as: 'truong' });
Lop.hasMany(HocSinh, { foreignKey: 'id_Lop', as: 'hocsinhs' });
Truong.hasMany(HocSinh, { foreignKey: 'id_school', as: 'hocsinhs' });

// Export tất cả model
module.exports = { sequelize, TaiKhoan, VaiTro, HocSinh, Lop, Truong };
