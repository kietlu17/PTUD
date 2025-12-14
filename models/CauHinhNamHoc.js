// models/CauHinhNamHoc.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize');

const CauHinhNamHoc = sequelize.define('CauHinhNamHoc', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  NamHoc: {
    type: DataTypes.STRING(20),
    allowNull: false, // ví dụ: "2025-2026"
  },

  HocKy: {
    type: DataTypes.STRING(10),
    allowNull: false, // "HK1", "HK2"
  },

  NgayBatDau: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },

  SoTuan: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 18 // mỗi học kỳ 18 tuần
  }

}, {
  tableName: 'CauHinhNamHoc',
  timestamps: false
});

module.exports = CauHinhNamHoc;
