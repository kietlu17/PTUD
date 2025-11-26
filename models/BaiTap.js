const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize');

    const BaiTap = sequelize.define('BaiTap', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        TieuDe: {
            type: DataTypes.STRING,
            allowNull: false
        },
        NoiDung: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        // KHỚP DB: Cột tên là 'File'
        File: {
            type: DataTypes.STRING,
            allowNull: true
        },
        // Trong DB bạn là timestamp
        HanNop: {
            type: DataTypes.DATE,
            allowNull: false
        },
        id_Lop: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        id_MonHoc: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        id_GiaoVien: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        TrangThai: {
            type: DataTypes.STRING,
            defaultValue: 'Đang giao'
        }
    }, {
        tableName: 'BaiTap',
        // Cấu hình để Sequelize tự động lưu NgayGiao khi tạo mới
        timestamps: true,
        createdAt: 'NgayGiao', // Map createdAt thành NgayGiao
        updatedAt: false // Tắt updatedAt vì DB không có cột này
    });

module.exports = BaiTap