const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize');

const GiaoVien = sequelize.define('GiaoVien', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    MaGV: { type: DataTypes.STRING, allowNull: false, unique: true },
    HoVaTen: { type: DataTypes.STRING, allowNull: false },
    NgaySinh: { type: DataTypes.DATEONLY, allowNull: false },
    GioiTinh: { type: DataTypes.STRING, allowNull: false },
<<<<<<< HEAD
    id_MonHoc: { 
=======
        id_MonHoc: { 
>>>>>>> 1f26f04d5f47ef00b6d633733decf4e26684f9b6
        type: DataTypes.INTEGER,
        allowNull: true // Có thể null nếu là GV chưa có chuyên môn hoặc GV đặc biệt
    },
    ViTri: { type: DataTypes.STRING, allowNull: false },
    SDT: { type: DataTypes.STRING, allowNull: false },
    DiaChi: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false },
    NgayThamGia: { type: DataTypes.DATEONLY, allowNull: false },
    id_truong: { type: DataTypes.INTEGER },
}, {
  tableName: 'GiaoVien',
  timestamps: false,
});

module.exports = GiaoVien;
