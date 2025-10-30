const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize');

const ChiTiet_ToHopMon = sequelize.define('ChiTiet_ToHopMon', {
  subject_group_id: { type: DataTypes.INTEGER, primaryKey: true },
  subject_id: { type: DataTypes.INTEGER, primaryKey: true },
  Note: { type: DataTypes.STRING, allowNull: true },
}, {
  tableName: 'ChiTiet_ToHopMon',
  timestamps: false,
});

module.exports = ChiTiet_ToHopMon;
