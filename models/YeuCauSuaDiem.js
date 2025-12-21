const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/sequelize');
const YeuCauSuaDiem = sequelize.define(
    'YeuCauSuaDiem',
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

      id_GiaoVien: {
        type: DataTypes.INTEGER,
        allowNull: false
      },

      NamHoc: {
        type: DataTypes.STRING
      },

      HocKy: {
        type: DataTypes.STRING
      },

      LoaiDiem: {
        type: DataTypes.STRING(50)
      },

      DiemCu: {
        type: DataTypes.DECIMAL(4, 2)
      },

      DiemMoi: {
        type: DataTypes.DECIMAL(4, 2)
      },

      LyDo: {
        type: DataTypes.TEXT
      },

      TrangThai: {
        type: DataTypes.STRING(20),
        defaultValue: 'CHO_DUYET'
      },

      NgayGui: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      },

      NguoiDuyet: {
        type: DataTypes.INTEGER
      },

      ThoiGianDuyet: {
        type: DataTypes.DATE
      }
    },
    {
      tableName: 'YeuCauSuaDiem'
    }
  );
module.exports = YeuCauSuaDiem