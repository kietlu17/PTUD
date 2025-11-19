const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize');

const MonHoc = sequelize.define('MonHoc', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  TenMon: { type: DataTypes.STRING, allowNull: false },
  SoTiet: { type: DataTypes.INTEGER, allowNull: true },
}, {
  tableName: 'MonHoc',
  timestamps: false,
});

module.exports = MonHoc;
