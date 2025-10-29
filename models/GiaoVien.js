const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize');

const GiaoVien = sequelize.define('GiaoVien', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true
    },
    HoVaTen: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    NgaySinh: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    GioiTinh: {
        type: DataTypes.STRING(10),
        allowNull: true
    },
    ViTri: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    SDT: {
        type: DataTypes.STRING(15),
        allowNull: true
    },
    DiaChi: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    NgayThamGia: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    id_truong: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'Truong',
            key: 'id'
        }
    }
}, {
    tableName: 'GiaoVien',
    timestamps: false
});

GiaoVien.associate = function(models) {
    // Một giáo viên thuộc về một trường
    GiaoVien.belongsTo(models.Truong, {
        foreignKey: 'id_truong',
        as: 'truong'
    });

    // Một giáo viên có thể là giáo viên chủ nhiệm của nhiều lớp
    GiaoVien.hasMany(models.Lop, {
        foreignKey: 'id_GiaoVienChuNhiem',
        as: 'lopChuNhiem'
    });
};

module.exports = GiaoVien;