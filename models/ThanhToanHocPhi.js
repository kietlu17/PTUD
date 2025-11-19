const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize');
const HocSinh = require('./HocSinh'); // Import để thiết lập quan hệ

const ThanhToanHocPhi = sequelize.define('ThanhToanHocPhi', {
  id: { 
    type: DataTypes.INTEGER, 
    primaryKey: true, 
    allowNull: false 
  },
  id_HocSinh: { 
    type: DataTypes.INTEGER,
    // Khóa ngoại được thiết lập trong index.js, nhưng ta vẫn giữ cột ở đây
    allowNull: true
  },
  HocKy: { 
    type: DataTypes.STRING(10), 
    allowNull: true 
  },
  NamHoc: { 
    type: DataTypes.STRING(20), 
    allowNull: true 
  },
  // Sử dụng DECIMAL để xử lý chính xác các giá trị tiền tệ (12 chữ số tổng, 2 chữ số thập phân)
  CongNo: { 
    type: DataTypes.DECIMAL(12, 2), 
    allowNull: true 
  },
  TienDaNop: { 
    type: DataTypes.DECIMAL(12, 2), 
    allowNull: true 
  },
  NgayThanhToan: { 
    type: DataTypes.DATE, 
    allowNull: true 
  },
  PhuongThuc: { 
    type: DataTypes.STRING(50), 
    allowNull: true 
  },
  TrangThai: { 
    type: DataTypes.STRING(20), 
    allowNull: true 
  },
}, {
  tableName: 'ThanhToanHocPhi',
  timestamps: false,
});

// Thêm hàm associate để nhất quán (Quan hệ sẽ được xử lý trong index.js)
ThanhToanHocPhi.associate = function(models) {
  // Quan hệ: ThanhToanHocPhi.belongsTo(models.HocSinh, { foreignKey: 'id_HocSinh', as: 'hocsinh' });
};

module.exports = ThanhToanHocPhi;