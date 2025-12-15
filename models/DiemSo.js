const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize');

const DiemSo = sequelize.define('DiemSo', {
   id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

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

    DiemTX1: DataTypes.FLOAT,
    DiemTX2: DataTypes.FLOAT,
    Diem1T1: DataTypes.FLOAT,
    Diem1T2: DataTypes.FLOAT,
    DiemGK: DataTypes.FLOAT,
    DiemCK: DataTypes.FLOAT,
    DiemTB: DataTypes.FLOAT,

    HocKy: DataTypes.STRING,
    NamHoc: DataTypes.STRING
  }, {
    tableName: 'DiemSo'
  });

module.exports = DiemSo;
