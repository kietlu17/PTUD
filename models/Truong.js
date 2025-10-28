const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize');

const Truong = sequelize.define('Truong', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: true, // hoặc false nếu bạn muốn bắt buộc nhập tên
  },
}, {
  tableName: 'Truong', // 👈 đúng với tên bảng trong DB
  timestamps: false,    // vì bạn không có createdAt / updatedAt
});

module.exports = Truong;
