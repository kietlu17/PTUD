const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize');

const HocSinh = sequelize.define('HocSinh', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  MaHS: { type: DataTypes.STRING, allowNull: false, unique: true },
  HoVaTen: { type: DataTypes.STRING, allowNull: false },
  NgaySinh: { type: DataTypes.DATEONLY, allowNull: false },
  GioiTinh: { type: DataTypes.STRING, allowNull: false },
  id_Lop: { type: DataTypes.INTEGER },
  id_school: { type: DataTypes.INTEGER },
}, {
  tableName: 'HocSinh',
  timestamps: false,
});
HocSinh.associate = function(models) {
    // HocSinh có thể có một hoặc nhiều PhuHuynh (One-to-Many)
    // Nếu mỗi học sinh chỉ có 1 phụ huynh, dùng hasOne
    // Nếu mỗi học sinh có nhiều phụ huynh (bố, mẹ, người giám hộ), dùng hasMany
    models.HocSinh.hasMany(models.PhuHuynh, {
        foreignKey: 'id_HocSinh',
        as: 'PhuHuynh'
    });
  };

module.exports = HocSinh;
