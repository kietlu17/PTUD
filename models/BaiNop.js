const { DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    const BaiNop = sequelize.define('BaiNop', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        FileNop: {
            type: DataTypes.STRING,
            allowNull: true
        },
        NgayNop: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        Diem: {
            type: DataTypes.FLOAT,
            allowNull: true
        },
        NhanXet: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        // Khóa ngoại
        id_BaiTap: { type: DataTypes.INTEGER, allowNull: false },
        id_HocSinh: { type: DataTypes.INTEGER, allowNull: false }
    }, {
        tableName: 'BaiNop',
        timestamps: true
    });

    return BaiNop;
};