const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize');

const PhongThi = sequelize.define('PhongThi', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  truongid: {
    type: DataTypes.INTEGER,
    references: { model: 'Truong', key: 'id' }
  }
}, {
  tableName: 'PhongThi',
  timestamps: false
});

module.exports = PhongThi;