const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize');

const LichSuDiem = sequelize.define(
    'LichSuDiem',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },

      id_DiemSo: {
        type: DataTypes.INTEGER,
        allowNull: false
      },

      LoaiDiem: {
        type: DataTypes.STRING(50),
        allowNull: false
      },

      DiemCu: {
        type: DataTypes.DECIMAL(4, 2),
        allowNull: true
      },

      DiemMoi: {
        type: DataTypes.DECIMAL(4, 2),
        allowNull: true
      },

      NguoiSua: {
        type: DataTypes.INTEGER,
        allowNull: false
      },

      ThoiGian: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },

      LyDo: {
        type: DataTypes.TEXT,
        allowNull: true
      }
    },
    {
      tableName: 'LichSuDiem',
      timestamps: false
    }
  );


module.exports = LichSuDiem;