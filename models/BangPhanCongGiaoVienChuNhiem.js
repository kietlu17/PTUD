const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize');

const BangPhanCongChuNhiem = sequelize.define('BangPhanCongGiaoVienChuNhiem', {
    id: { 
        type: DataTypes.INTEGER, 
        primaryKey: true, 
        autoIncrement: true 
    },
    id_GiaoVien: { 
        type: DataTypes.INTEGER,
        allowNull: false 
    },
    id_Lop: { 
        type: DataTypes.INTEGER,
        allowNull: false
    },
    NamHoc: { 
        type: DataTypes.STRING(20) 
    },
    NgayPhanCong: { 
        type: DataTypes.DATE, 
        defaultValue: DataTypes.NOW 
    }
}, {
    tableName: 'BangPhanCongGiaoVienChuNhiem',
    timestamps: false,
});

module.exports = BangPhanCongChuNhiem;