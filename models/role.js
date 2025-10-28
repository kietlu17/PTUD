const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize');

const VaiTro = sequelize.define('VaiTro', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  TenVaiTro: { type: DataTypes.STRING(255), allowNull: false },
  mota: { type: DataTypes.STRING(255) },
}, {
  tableName: 'VaiTro',
  timestamps: false,
});

module.exports = VaiTro;