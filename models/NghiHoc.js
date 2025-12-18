const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize');

  const NghiHoc = sequelize.define('NghiHoc', {
 application_id: {
            type: DataTypes.INTEGER,
            primaryKey: true, // Xác định là khóa chính
            autoIncrement: true // Để DB tự sinh ID tăng dần
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
            type: DataTypes.TEXT,
            allowNull: false
        },
        TinhTrang: {
            type: DataTypes.STRING,
            defaultValue: 'Đã duyệt'
        }
    }, {
        tableName: 'NghiHoc',
        timestamps: false
    });

module.exports = NghiHoc