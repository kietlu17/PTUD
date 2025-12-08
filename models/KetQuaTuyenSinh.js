const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize');

const KetQuaTuyenSinh = sequelize.define('KetQuaTuyenSinh', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

  thisinhid: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  truongtrungtuyen: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  nguyenvongtrungtuyen: {
    type: DataTypes.INTEGER,
    allowNull: false
  }

}, {
  tableName: 'KetQuaTuyenSinh',
  timestamps: false
});

module.exports = KetQuaTuyenSinh;