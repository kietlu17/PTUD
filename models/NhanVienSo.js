const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/sequelize");

const NhanVienSo = sequelize.define(
  "NhanVienSo",
  {
    ID: { type: DataTypes.INTEGER, primaryKey: true }, // PK đúng
    MaSGD: { type: DataTypes.STRING, allowNull: false, unique: true },
    HoTen: DataTypes.STRING,
    GioiTinh: DataTypes.STRING,
    NgaySinh: DataTypes.DATEONLY,
    ChucVu: DataTypes.STRING,
    Email: DataTypes.STRING,
    SoDT: DataTypes.STRING,
    TrangThai: DataTypes.STRING,
    TaiKhoanID: DataTypes.INTEGER, // ✅ Tên cột đúng với DB
  },
  {
    tableName: "NhanVienSo",
    freezeTableName: true, // ✅ Không đổi tên bảng thành số nhiều
    timestamps: false,
  }
);

module.exports = NhanVienSo;
