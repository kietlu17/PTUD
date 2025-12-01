const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize');

const Lop = sequelize.define('Lop', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true
  },
  TenLop: {
    type: DataTypes.STRING(10),
    allowNull: true,
  },
  id_truong: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  id_ToHopMon: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  id_GiaoVienChuNhiem: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
}, {
  tableName: 'Lop',    // tên bảng trong CSDL
  timestamps: false,   // vì bạn không có createdAt/updatedAt
});

module.exports = Lop;
