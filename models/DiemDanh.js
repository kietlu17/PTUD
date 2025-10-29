const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize');
const HocSinh = require('./HocSinh'); // Import model HocSinh để tạo quan hệ

const DiemDanh = sequelize.define('DiemDanh', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true, // tự tăng id
    },
    id_HocSinh: {
        type: DataTypes.INTEGER,
        allowNull: false, // học sinh nào được điểm danh
    },
    id_GiaoVien: {
        type: DataTypes.INTEGER,
        allowNull: true, // giáo viên thực hiện điểm danh
    },
    id_Lop: {
        type: DataTypes.INTEGER,
        allowNull: true, // lớp mà học sinh thuộc về
    },
    NgayDiemDanh: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: DataTypes.NOW, // mặc định ngày hiện tại
    },
    TrangThai: {
        type: DataTypes.STRING(20),
        allowNull: false,
        comment: 'Có mặt, Vắng (KP), Đi muộn', // mô tả trạng thái
    },
    GhiChu: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
}, {
    tableName: 'DiemDanh',
    timestamps: false,
});

// Thiết lập quan hệ
DiemDanh.associate = function(models) {
    // Một bản ghi điểm danh thuộc về 1 học sinh
    DiemDanh.belongsTo(models.HocSinh, {
        foreignKey: 'id_HocSinh',
        as: 'hocSinh',
    });

    // Một bản ghi điểm danh thuộc về 1 giáo viên
    DiemDanh.belongsTo(models.GiaoVien, {
        foreignKey: 'id_GiaoVien',
        as: 'giaoVien',
    });

    // Một bản ghi điểm danh thuộc về 1 lớp
    DiemDanh.belongsTo(models.Lop, {
        foreignKey: 'id_Lop',
        as: 'lop',
    });
};

module.exports = DiemDanh;