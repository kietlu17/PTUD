const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize');
const DangKyTuyenSinh = require('./DangKyTuyenSinh');

const ThiSinh = sequelize.define('ThiSinh', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  mahs: {
    type: DataTypes.STRING(10),
    allowNull: false,
    unique: true
  },
  hoten: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  ngaysinh: {
    type: DataTypes.DATE
  },
  phongthiid: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: 'PhongThi', key: 'id' }
  },
  id_dangky: {
   type: DataTypes.INTEGER,
   references: { model: DangKyTuyenSinh, key: 'id' }
}
}, {
  tableName: 'ThiSinh',
  timestamps: false
});



module.exports = ThiSinh;