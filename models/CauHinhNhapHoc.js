const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/sequelize");

const CauHinhNhapHoc = sequelize.define("CauHinhNhapHoc", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },

  Nam: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 2000,
      max: 2100,
    }
  },

  MoDangKy: {
    type: DataTypes.DATE,
    allowNull: false,
  },

  DongDangKy: {
    type: DataTypes.DATE,
    allowNull: false,
  }
}, {
  tableName: "CauHinhNhapHoc",
  timestamps: false,
});

module.exports = CauHinhNhapHoc;
