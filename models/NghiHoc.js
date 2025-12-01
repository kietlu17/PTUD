const { DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    const NghiHoc = sequelize.define('NghiHoc', {
        application_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        student_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        NgayNghi: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        LyDo: {
            type: DataTypes.STRING,
            allowNull: true
        },
        TinhTrang: {
            type: DataTypes.STRING,
            defaultValue: 'Chờ duyệt'
        },
        NgayNop: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        approved_by: {
            type: DataTypes.INTEGER,
            allowNull: true
        }
    }, {
        tableName: 'NghiHoc',
        timestamps: false
    });

    return NghiHoc;
};