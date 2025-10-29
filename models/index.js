const { sequelize } = require('../config/sequelize');
const TaiKhoan = require('./user');
const VaiTro = require('./role');
const HocSinh = require('./HocSinh');
const Lop = require('./Lop');
const Truong = require('./Truong');
const GiaoVien = require('./GiaoVien');
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

GiaoVien.belongsTo(Truong, { foreignKey: 'id_truong', as: 'truong' });
Truong.hasMany(GiaoVien, { foreignKey: 'id_truong', as: 'giaoviens' });

// 3. Lớp & Giáo viên phụ trách
GiaoVien.hasMany(Lop, { foreignKey: 'id_giaovien_phutrach', as: 'lopPhuTrach' });
Lop.belongsTo(GiaoVien, { foreignKey: 'id_giaovien_phutrach', as: 'giaovienPhuTrach' });

// 4. Lớp & Giáo viên chủ nhiệm
GiaoVien.hasMany(Lop, { foreignKey: 'id_giaovien_chunhiem', as: 'lopChuNhiem' });
Lop.belongsTo(GiaoVien, { foreignKey: 'id_giaovien_chunhiem', as: 'giaovienChuNhiem' });

// 5. Điểm danh & Học sinh & Giáo viên & Lớp
DiemDanh.belongsTo(HocSinh, { foreignKey: 'id_HocSinh', as: 'hocSinh' });
DiemDanh.belongsTo(GiaoVien, { foreignKey: 'id_GiaoVien', as: 'giaoVien' });
DiemDanh.belongsTo(Lop, { foreignKey: 'id_Lop', as: 'lop' });

HocSinh.hasMany(DiemDanh, { foreignKey: 'id_HocSinh', as: 'diemDanhs' });
GiaoVien.hasMany(DiemDanh, { foreignKey: 'id_GiaoVien', as: 'diemDanhs' });
Lop.hasMany(DiemDanh, { foreignKey: 'id_Lop', as: 'diemDanhs' });

// Export tất cả model
module.exports = { sequelize, TaiKhoan, VaiTro, HocSinh, Lop, Truong };