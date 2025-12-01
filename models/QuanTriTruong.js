const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/sequelize');

  const QuanTriTruong = sequelize.define("QuanTriTruong",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true,},
      MaQTV: DataTypes.STRING,
      HoVaTen: DataTypes.STRING,
      NgaySinh: DataTypes.DATEONLY,
      GioiTinh: DataTypes.STRING(10),
      id_school: DataTypes.INTEGER,
    },
    {
      tableName: "QuanTriTruong",
      timestamps: false,
    }
  );

module.exports = QuanTriTruong;

