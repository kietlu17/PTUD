const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize');

const TaiKhoanTuyenSinh = sequelize.define(
  'TaiKhoanTuyenSinh',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    soDinhDanh: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true
    },

    matKhau: {
      type: DataTypes.STRING, // lưu hash bcrypt
      allowNull: false
    },
     tenPH: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    sdt: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
        ngaysinh: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
        gioitinh: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
  },
  {
    tableName: 'TaiKhoanTuyenSinh',
    timestamps: false
  }
);

module.exports = TaiKhoanTuyenSinh;
