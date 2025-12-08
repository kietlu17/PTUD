const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize');

const ThoiKhoaBieu = sequelize.define('ThoiKhoaBieu', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    id_Lop: { type: DataTypes.INTEGER, allowNull: false },
    id_MonHoc: { type: DataTypes.INTEGER, allowNull: false },
    id_GiaoVien: { type: DataTypes.INTEGER, allowNull: false },
    Thu: { type: DataTypes.STRING(10), allowNull: false }, // "2", "3", "4"...
    Tiet: { type: DataTypes.INTEGER, allowNull: false }, // 1 -> 10
    HocKy: { type: DataTypes.STRING(10) },
    NamHoc: { type: DataTypes.STRING(20) }
}, {
    tableName: 'ThoiKhoaBieu',
    timestamps: false
});

module.exports = ThoiKhoaBieu;