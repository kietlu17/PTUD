const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize');
  const LichSuDongBoThiSinh = sequelize.define("LichSuDongBoThiSinh", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    thoigian: { type: DataTypes.DATE, allowNull: false },
    tong: { type: DataTypes.INTEGER, allowNull: false },
    thanhcong: { type: DataTypes.INTEGER, allowNull: false },
    thatbai: { type: DataTypes.INTEGER, allowNull: false },
    ghichu: { type: DataTypes.TEXT },
  }, {
    tableName: "LichSuDongBoThiSinh"
  });

module.exports = LichSuDongBoThiSinh
