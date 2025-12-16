const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize');

const DangKyTuyenSinh = sequelize.define('DangKyTuyenSinh', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

  // Thông tin thí sinh
  HoVaTen: { type: DataTypes.STRING, allowNull: false },
  NgaySinh: { type: DataTypes.DATEONLY, allowNull: false },
  GioiTinh: { type: DataTypes.STRING, allowNull: false },
  DiaChi: { type: DataTypes.STRING, allowNull: false },
  DanToc: { type: DataTypes.STRING, allowNull: true },
  TonGiao: { type: DataTypes.STRING, allowNull: true },
  CCCD: {type: DataTypes.STRING, allowNull: true},

  // 3 nguyện vọng
  NV1: { type: DataTypes.INTEGER, allowNull: false }, 
  NV2: { type: DataTypes.INTEGER, allowNull: true },
  NV3: { type: DataTypes.INTEGER, allowNull: true },

  // Trạng thái hồ sơ
  TrangThai: { type: DataTypes.STRING, defaultValue: 'Đã duyệt' },

  // Điểm tổng kết cấp 2
  DiemTongKet_Lop6: { type: DataTypes.FLOAT, allowNull: true },
  DiemTongKet_Lop7: { type: DataTypes.FLOAT, allowNull: true },
  DiemTongKet_Lop8: { type: DataTypes.FLOAT, allowNull: true },
  DiemTongKet_Lop9: { type: DataTypes.FLOAT, allowNull: true },

  // Hạnh kiểm từng năm
  HanhKiem_Lop6: { type: DataTypes.STRING, allowNull: true },
  HanhKiem_Lop7: { type: DataTypes.STRING, allowNull: true },
  HanhKiem_Lop8: { type: DataTypes.STRING, allowNull: true },
  HanhKiem_Lop9: { type: DataTypes.STRING, allowNull: true },

  // Gmail
  Gmail: { type: DataTypes.STRING, allowNull: true }
}, {
  tableName: 'DangKyTuyenSinh',
  timestamps: false,
});

  module.exports = DangKyTuyenSinh