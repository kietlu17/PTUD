const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize');

const HoSoTuyenSinh = sequelize.define('HoSoTuyenSinh', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

  thisinhid: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  nguyenvong: {
    type: DataTypes.INTEGER,
    allowNull: false // 1, 2, 3
  },

  truongid: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  hoten: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  ngaysinh: {
    type: DataTypes.DATE,
    allowNull: false
  }

}, {
  tableName: 'HoSoTuyenSinh',
  timestamps: false
});

module.exports = HoSoTuyenSinh;