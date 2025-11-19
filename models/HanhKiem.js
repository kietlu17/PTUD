const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize');

const HanhKiem = sequelize.define('HanhKiem', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  id_HocSinh: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'HocSinh', // Hoặc model HocSinh nếu import
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
  LoaiHanhKiem: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  NhanXet: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  NguoiDanhGia: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'GiaoVien', // Hoặc model GiaoVien nếu import
      key: 'id',
    },
  },
  NgayDanhGia: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'HanhKiem',
  timestamps: false,
});

module.exports = HanhKiem;
