const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize');
const HocSinh = require('./HocSinh'); // Import model HocSinh

const PhuHuynh = sequelize.define('PhuHuynh', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false // Giống như trong SQL: NOT NULL
    // Bạn đã đặt là int PRIMARY KEY NOT NULL trong SQL, nhưng không phải là autoIncrement
  },
  MaPH: {
    type: DataTypes.STRING(255),
    allowNull: true, // Nếu không có NOT NULL trong SQL, mặc định là true
  },
  HoVaTen: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  id_HocSinh: {
    type: DataTypes.INTEGER,
    // Cột khóa ngoại (Foreign Key)
    allowNull: true,
    references: {
      model: HocSinh, // Tham chiếu đến Model HocSinh
      key: 'id',      // Tham chiếu đến khóa chính 'id' của Model HocSinh
    },
  },
  SDT: {
    type: DataTypes.STRING(15),
    allowNull: true,
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  NgaySinh: {
    type: DataTypes.DATEONLY, // Dùng DATEONLY cho kiểu DATE
    allowNull: true,
  },
  GioiTinh: {
    type: DataTypes.STRING(10),
    allowNull: true,
  },
}, {
  tableName: 'PhuHuynh',
  timestamps: false,
});

module.exports = PhuHuynh;