const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize');
const DiemThi = require('./DiemThi');

const ThiSinh = sequelize.define('ThiSinh', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  mahs: {
    type: DataTypes.STRING(10),
    allowNull: false,
    unique: true
  },
  hoten: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  ngaysinh: {
    type: DataTypes.DATE
  },
  phongthiid: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'PhongThi', key: 'id' }
  }
}, {
  tableName: 'ThiSinh',
  timestamps: false
});



module.exports = ThiSinh;