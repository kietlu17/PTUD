const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize');

const DiemDanh = sequelize.define('DiemDanh', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  student_id: { type: DataTypes.INTEGER, allowNull: false, field: 'student_id' },
  lop_id: { type: DataTypes.INTEGER, allowNull: false, field: 'lop_id' },
  monhoc_id: { type: DataTypes.INTEGER, field: 'monhoc_id' },
  giaovien_id: { type: DataTypes.INTEGER, allowNull: false, field: 'giaovien_id' },
  NgayHoc: { type: DataTypes.DATEONLY, allowNull: false, field: 'NgayHoc' },
  TinhTrang: { type: DataTypes.STRING, allowNull: false, field: 'TinhTrang' },
  created_at: { type: DataTypes.DATE, field: 'created_at' },
}, {
  tableName: 'DiemDanh',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
});

module.exports = DiemDanh