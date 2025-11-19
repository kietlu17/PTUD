const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize');

const BangPhanCongGiaoVien = sequelize.define('BangPhanCongGiaoVien', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_GiaoVien: { type: DataTypes.INTEGER, allowNull: false },
  id_MonHoc: { type: DataTypes.INTEGER, allowNull: false },
  id_Lop: { type: DataTypes.INTEGER, allowNull: false },
  KyHoc: { type: DataTypes.STRING(10), allowNull: true },
  NamHoc: { type: DataTypes.STRING(20), allowNull: true },
  NgayPhanCong: { type: DataTypes.DATE, allowNull: true },
}, {
  tableName: 'BangPhanCongGiaoVien',
  timestamps: false,
});

module.exports = BangPhanCongGiaoVien;
