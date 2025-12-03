const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize');

const DiemSo = sequelize.define('DiemSo', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  id_HocSinh: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'HocSinh', // hoặc model HocSinh nếu import
      key: 'id',
    },
  },
  id_MonHoc: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'MonHoc', // hoặc model MonHoc nếu import
      key: 'id',
    },
  },
  HocKy: {
    type: DataTypes.STRING(10),
    allowNull: true,
  },
  NamHoc: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  DiemThuongKy: {
    type: DataTypes.DECIMAL(4,2),
    allowNull: true,
  },
  DiemGiuaKy: {
    type: DataTypes.DECIMAL(4,2),
    allowNull: true,
  },
  DiemCuoiKy: {
    type: DataTypes.DECIMAL(4,2),
    allowNull: true,
  },
  DiemTrungBinh: {
    type: DataTypes.DECIMAL(4,2),
    allowNull: true,
  },
}, {    
  tableName: 'DiemSo',
  timestamps: false,
});

module.exports = DiemSo;
