const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize');

const DiemThi = sequelize.define('DiemThi', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  thisinhid: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'ThiSinh', key: 'id' }
  },
  toan: { type: DataTypes.FLOAT, allowNull: true },
  nguvan: { type: DataTypes.FLOAT, allowNull: true },
  tienganh: { type: DataTypes.FLOAT, allowNull: true },
  tong: { type: DataTypes.FLOAT, allowNull: true }
}, {
  tableName: 'DiemThi',
  timestamps: false
});

module.exports = DiemThi;