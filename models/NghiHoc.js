const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize');

  const NghiHoc = sequelize.define('NghiHoc', {
    application_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    student_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'HocSinh', // Tên bảng liên kết
        key: 'id'
      }
    },
    NgayNghi: {
      type: DataTypes.DATEONLY, // Chỉ lấy ngày, không lấy giờ (quan trọng để so sánh)
      allowNull: false
    },
    LyDo: {
      type: DataTypes.STRING,
      allowNull: true
    },
    TinhTrang: {
      type: DataTypes.STRING, // Ví dụ: 'Đã duyệt', 'Chờ duyệt'
      defaultValue: 'Chờ duyệt'
    },
    NgayNop: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    approved_by: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    tableName: 'NghiHoc', // Tên bảng trong Database Adminer
    timestamps: false     // Bảng này không có cột createdAt/updatedAt
  });

module.exports = NghiHoc