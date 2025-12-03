const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize');

const BanGiamHieu = sequelize.define('BanGiamHieu', {
    id: {type: DataTypes.INTEGER, primaryKey: true,allowNull: false}, 
    id_truong: { type: DataTypes.INTEGER},
<<<<<<< HEAD
    MaBGV: {type: DataTypes.STRING(255) },
=======
    MaBGH: {type: DataTypes.STRING(255) },
>>>>>>> 1f26f04d5f47ef00b6d633733decf4e26684f9b6
    HoVaTen: {type: DataTypes.STRING(255)},
    NgaySinh: {type: DataTypes.DATEONLY},
    GioiTinh: {type: DataTypes.STRING(10)},
    SDT: {type: DataTypes.STRING(15)},
    DiaChi: {type: DataTypes.STRING(255)},
    email: {type: DataTypes.STRING(255)},
}, {
    tableName: 'BanGiamHieu',
    timestamps: false,
});

module.exports = BanGiamHieu;