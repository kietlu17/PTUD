const { sequelize } = require('../config/sequelize');
const TaiKhoan = require('./user');
const VaiTro = require('./role');
const HocSinh = require('./HocSinh');
const Lop = require('./Lop');
const Truong = require('./Truong');
<<<<<<< HEAD
const PhuHuynh = require('./PhuHuynh');
const ThanhToanHocPhi = require('./ThanhToanHocPhi');
=======
const ThiSinh = require('./ThiSinh');
const DiemThi = require('./DiemThi');
const NhanVienSo = require('./NhanVienSo');
const PhongThi = require('./PhongThi');
const QuanTriTruong = require('./QuanTriTruong');
const GiaoVien = require('./GiaoVien');
const BangPhanCongGiaoVien = require('./BangPhanCongGiaoVien');
const BangPhanCongChuNhiem = require('./BangPhanCongChuNhiem');
const MonHoc = require('./MonHoc');
const ToHopMon = require('./ToHopMon');
const ChiTiet_ToHopMon = require('./ChiTiet_ToHopMon');
const DiemDanh = require('./DiemDanh');
const ThanhToanHocPhi = require('./ThanhToanHocPhi');
const PhuHuynh = require('./PhuHuynh')
const HanhKiem = require('./HanhKiem');
const DiemSo = require('./DiemSo');
const BanGiamHieu = require('./BanGiamHieu');
>>>>>>> b138cbc (Update chuc nang phân công GVBM và GVCN)

// 👉 Khai báo các quan hệ ở đây (sau khi tất cả model được import)

// 1. Tài khoản & Vai trò
TaiKhoan.belongsTo(VaiTro, { foreignKey: 'id_role', as: 'role' });
VaiTro.hasMany(TaiKhoan, { foreignKey: 'id_role', as: 'accounts' });

// 2. Học sinh & Lớp & Trường
HocSinh.belongsTo(Lop, { foreignKey: 'id_Lop', as: 'lop' });
HocSinh.belongsTo(Truong, { foreignKey: 'id_school', as: 'truong' });
Lop.hasMany(HocSinh, { foreignKey: 'id_Lop', as: 'hocsinhs' });
Truong.hasMany(HocSinh, { foreignKey: 'id_school', as: 'hocsinhs' });

<<<<<<< HEAD
HocSinh.hasMany(PhuHuynh, { foreignKey: 'id_HocSinh', as: 'phuhuynhs' });
=======
// ✅ Liên kết (1 thí sinh có 1 điểm thi)
ThiSinh.hasOne(DiemThi, { foreignKey: 'thisinhid', as: 'diem' });
DiemThi.belongsTo(ThiSinh, { foreignKey: 'thisinhid', as: 'thisinh' });


ThiSinh.belongsTo(PhongThi, { foreignKey: 'phongthiid', as: 'phongthi' });
PhongThi.hasMany(ThiSinh, { foreignKey: 'phongthiid', as: 'thisinhs' });


QuanTriTruong.belongsTo(Truong, { foreignKey: 'id_school', as: 'truong' });
Truong.hasMany(QuanTriTruong, { foreignKey: 'id_school', as: 'quantri' });
Truong.hasMany(GiaoVien, { foreignKey: 'id_truong', as: 'giaovien' });

Lop.belongsTo(GiaoVien, { foreignKey: 'id_GiaoVienChuNhiem', as: 'gvcn' });

// Nếu muốn truy vấn ngược lại
GiaoVien.belongsTo(Truong, {foreignKey: 'id_truong', as: 'truong'});

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
>>>>>>> b138cbc (Update chuc nang phân công GVBM và GVCN)
PhuHuynh.belongsTo(HocSinh, { foreignKey: 'id_HocSinh', as: 'hocsinh' });

// Quan hệ One-to-Many: HocSinh có nhiều bản ghi ThanhToanHocPhi
HocSinh.hasMany(ThanhToanHocPhi, { foreignKey: 'id_HocSinh', as: 'thanh_toan_hoc_phi' });
ThanhToanHocPhi.belongsTo(HocSinh, { foreignKey: 'id_HocSinh', as: 'hocsinh' });

<<<<<<< HEAD
// Export tất cả model
module.exports = { sequelize, TaiKhoan, VaiTro, HocSinh, Lop, Truong , PhuHuynh , ThanhToanHocPhi };
=======
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

// Quan hệ BGH - Truong
BanGiamHieu.belongsTo(Truong, { foreignKey: 'id_truong', as: 'truong' });

// --- A. Quan hệ cho Bảng Phân công Chủ nhiệm ---
// (BangPhanCongGiaoVienChuNhiem liên kết với Lop và GiaoVien)
BangPhanCongChuNhiem.belongsTo(Lop, { foreignKey: 'id_Lop', as: 'lop' });
Lop.hasMany(BangPhanCongChuNhiem, { foreignKey: 'id_Lop' });

BangPhanCongChuNhiem.belongsTo(GiaoVien, { foreignKey: 'id_GiaoVien', as: 'giaoVien' });
GiaoVien.hasMany(BangPhanCongChuNhiem, { foreignKey: 'id_GiaoVien' });

// --- B. Quan hệ cho Bảng Phân công Bộ môn ---
// (BangPhanCongGiaoVien liên kết với Lop, GiaoVien và MonHoc)
BangPhanCongGiaoVien.belongsTo(Lop, { foreignKey: 'id_Lop', as: 'lop' });
Lop.hasMany(BangPhanCongGiaoVien, { foreignKey: 'id_Lop' });

BangPhanCongGiaoVien.belongsTo(GiaoVien, { foreignKey: 'id_GiaoVien', as: 'giaoVien' });
GiaoVien.hasMany(BangPhanCongGiaoVien, { foreignKey: 'id_GiaoVien' });

BangPhanCongGiaoVien.belongsTo(MonHoc, { foreignKey: 'id_MonHoc', as: 'monHoc' });
MonHoc.hasMany(BangPhanCongGiaoVien, { foreignKey: 'id_MonHoc' });

// THÊM QUAN HỆ GIỮA GIÁO VIÊN VÀ MÔN HỌC
GiaoVien.belongsTo(MonHoc, { foreignKey: 'id_MonHoc', as: 'chuyenMon' });
MonHoc.hasMany(GiaoVien, { foreignKey: 'id_MonHoc' });

// Export tất cả model
module.exports = { sequelize, TaiKhoan, VaiTro, HocSinh, Lop, Truong, PhongThi,ThiSinh ,DiemThi, NhanVienSo, QuanTriTruong, GiaoVien, MonHoc, ToHopMon, ChiTiet_ToHopMon, BangPhanCongGiaoVien, DiemDanh, ThanhToanHocPhi, PhuHuynh, HanhKiem, DiemSo , BanGiamHieu , BangPhanCongChuNhiem };
>>>>>>> b138cbc (Update chuc nang phân công GVBM và GVCN)
