const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize');

const ChiTieu = sequelize.define('ChiTieu', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

  truongid: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  
  diemChuan: {
    type: DataTypes.FLOAT,
    allowNull: true,
    defaultValue: 0
  },

  soLuong: {
    type: DataTypes.INTEGER,
    allowNull: false
  }

}, {
  tableName: 'ChiTieu',
  timestamps: false
});

module.exports = ChiTieu;