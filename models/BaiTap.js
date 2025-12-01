const { DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const BaiTap = sequelize.define('BaiTap', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    TieuDe: { type: DataTypes.STRING, allowNull: false },
    NoiDung: { type: DataTypes.TEXT, allowNull: true },
    File: { type: DataTypes.STRING, allowNull: true },
    HanNop: { type: DataTypes.DATE, allowNull: false },
    id_Lop: { type: DataTypes.INTEGER, allowNull: false },
    id_MonHoc: { type: DataTypes.INTEGER, allowNull: false },
    id_GiaoVien: { type: DataTypes.INTEGER, allowNull: false },
    TrangThai: { type: DataTypes.STRING, defaultValue: 'Đang giao' },
    
    // Khai báo cột NgayGiao
    NgayGiao: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  }, {
    tableName: 'BaiTap',
    
    // CẤU HÌNH QUAN TRỌNG:
    timestamps: true,       
    createdAt: 'NgayGiao',   // Ánh xạ createdAt thành NgayGiao
    updatedAt: false         // Tắt updatedAt vì DB không có
  });

  return BaiTap;
};