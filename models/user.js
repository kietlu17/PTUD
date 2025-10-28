const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize');

const TaiKhoan = sequelize.define('TaiKhoan', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  username: { type: DataTypes.STRING(255), allowNull: false },
  password: { type: DataTypes.STRING(255), allowNull: false },
  id_role: { type: DataTypes.INTEGER, allowNull: false },
}, {
  tableName: 'TaiKhoan',
  timestamps: false,
});

module.exports = TaiKhoan;
