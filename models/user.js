const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize');
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;

const TaiKhoan = sequelize.define('TaiKhoan', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  username: { type: DataTypes.STRING(255), allowNull: false, unique: true },
  password: { type: DataTypes.STRING(255), allowNull: false },
  id_role: { type: DataTypes.INTEGER, allowNull: false },
}, {
  tableName: 'TaiKhoan',
  timestamps: false,
  hooks: {
    // Khi tạo 1 tài khoản
    beforeCreate: async (user) => {
      if (user.password && !user.password.startsWith('$2b$')) { // tránh băm lại nếu đã hash
        user.password = await bcrypt.hash(user.password, SALT_ROUNDS);
      }
    },

    // Khi tạo nhiều tài khoản cùng lúc (bulk)
    beforeBulkCreate: async (users) => {
      for (const user of users) {
        if (user.password && !user.password.startsWith('$2b$')) {
          user.password = await bcrypt.hash(user.password, SALT_ROUNDS);
        }
      }
    },
  },
});

module.exports = TaiKhoan;
