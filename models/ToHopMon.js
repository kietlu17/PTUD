const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize');

const ToHopMon = sequelize.define('ToHopMon', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  TenToHop: { type: DataTypes.STRING, allowNull: false },
  mota: { type: DataTypes.STRING, allowNull: true },
}, {
  tableName: 'ToHopMon',
  timestamps: false,
});

module.exports = ToHopMon;
