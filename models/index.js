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
const PhuHuynh = require('./PhuHuynh')
const HanhKiem = require('./HanhKiem');
const DiemSo = require('./DiemSo');
const BangPhanCongChuNhiem = require('./BangPhanCongGiaoVienChuNhiem')
const BanGiamHieu = require('./BanGiamHieu')
const BaiTap = require('./BaiTap');
const NghiHoc = require('./NghiHoc')
const DangKyTuyenSinh = require('./DangKyTuyenSinh')
const CauHinhNhapHoc = require('./CauHinhNhapHoc')
// 👉 Khai báo các quan hệ ở đây (sau khi tất cả model được import)

// 1. Tài khoản & Vai trò
TaiKhoan.belongsTo(VaiTro, { foreignKey: 'id_role', as: 'role' });
VaiTro.hasMany(TaiKhoan, { foreignKey: 'id_role', as: 'accounts' });
TaiKhoan.belongsTo(Truong, { foreignKey: "id_truong", as: "truong" });
Truong.hasMany(TaiKhoan, { foreignKey: "id_truong", as: "users" });

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

// Tổ hợp - Chi tiết tổ hợp
ToHopMon.hasMany(ChiTiet_ToHopMon, {
    foreignKey: 'subject_group_id'
});
ChiTiet_ToHopMon.belongsTo(ToHopMon, {
    foreignKey: 'subject_group_id'
});

// Môn học - Chi tiết tổ hợp
MonHoc.hasMany(ChiTiet_ToHopMon, {
    foreignKey: 'subject_id'
});
ChiTiet_ToHopMon.belongsTo(MonHoc, {
    foreignKey: 'subject_id'
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

//học sinh với tổ hợp môn
ToHopMon.hasMany(HocSinh, { foreignKey: 'id_tohopmon', as: 'hocsinh' });
HocSinh.belongsTo(ToHopMon, { foreignKey: 'id_tohopmon', as: 'tohopmon' });

// Quan hệ BGH - Truong
BanGiamHieu.belongsTo(Truong, { foreignKey: 'id_truong', as: 'truong' });

// --- A. Quan hệ cho Bảng Phân công Chủ nhiệm ---
// (BangPhanCongGiaoVienChuNhiem liên kết với Lop và GiaoVien)
BangPhanCongChuNhiem.belongsTo(Lop, { foreignKey: 'id_Lop', as: 'lopChuNhiem' });
Lop.hasMany(BangPhanCongChuNhiem, { foreignKey: 'id_Lop' });

BangPhanCongChuNhiem.belongsTo(GiaoVien, { foreignKey: 'id_GiaoVien', as: 'giaoVien' });
GiaoVien.hasMany(BangPhanCongChuNhiem, { foreignKey: 'id_GiaoVien' });

// --- B. Quan hệ cho Bảng Phân công Bộ môn ---
// (BangPhanCongGiaoVien liên kết với Lop, GiaoVien và MonHoc)
BangPhanCongGiaoVien.belongsTo(Lop, { foreignKey: 'id_Lop', as: 'lopDayMon' });
Lop.hasMany(BangPhanCongGiaoVien, { foreignKey: 'id_Lop' });

BangPhanCongGiaoVien.belongsTo(GiaoVien, { foreignKey: 'id_GiaoVien', as: 'giaoVien' });
GiaoVien.hasMany(BangPhanCongGiaoVien, { foreignKey: 'id_GiaoVien' });

BangPhanCongGiaoVien.belongsTo(MonHoc, { foreignKey: 'id_MonHoc', as: 'monHoc' });
MonHoc.hasMany(BangPhanCongGiaoVien, { foreignKey: 'id_MonHoc' });

// THÊM QUAN HỆ GIỮA GIÁO VIÊN VÀ MÔN HỌC
GiaoVien.belongsTo(MonHoc, { foreignKey: 'id_MonHoc', as: 'chuyenMon' });
MonHoc.hasMany(GiaoVien, { foreignKey: 'id_MonHoc' });

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

// Export tất cả model
module.exports = { sequelize, TaiKhoan, VaiTro, HocSinh, Lop, Truong, PhongThi,ThiSinh ,DiemThi, NhanVienSo, QuanTriTruong, GiaoVien, MonHoc, ToHopMon, 
    ChiTiet_ToHopMon, BangPhanCongGiaoVien, DiemDanh, ThanhToanHocPhi, PhuHuynh, HanhKiem, DiemSo, BangPhanCongChuNhiem, BanGiamHieu, NghiHoc, BaiTap,
DangKyTuyenSinh, CauHinhNhapHoc };
