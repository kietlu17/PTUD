const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize');

const HocSinh = sequelize.define('HocSinh', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  MaHS: { type: DataTypes.STRING, allowNull: false, unique: true },
  HoVaTen: { type: DataTypes.STRING, allowNull: false },
  NgaySinh: { type: DataTypes.DATEONLY, allowNull: false },
  GioiTinh: { type: DataTypes.STRING, allowNull: false },
  NamNhapHoc: { type: DataTypes.INTEGER },
  id_tohopmon: { type: DataTypes.INTEGER },
  id_Lop: { type: DataTypes.INTEGER },
  id_school: { type: DataTypes.INTEGER },
}, {
  tableName: 'HocSinh',
  timestamps: false,
});




module.exports = HocSinh;
