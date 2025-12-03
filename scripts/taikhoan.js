const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const TaiKhoan = require('../models/user');
const { sequelize } = require('../config/sequelize');

// ======= HÀM PHỤ =======

// Rút gọn tên trường -> 3 ký tự đầu, viết hoa, bỏ ký tự đặc biệt
function shortTruongName(name) {
  return name
    .normalize('NFD')               // bỏ dấu tiếng Việt
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z]/g, '')      // chỉ giữ chữ cái
    .substring(0, 3)
    .toUpperCase();
}




// Sinh username: <TRUONG>.<ROLE>.<NAM>.<MÃ_4_SỐ>
function generateUsername(truong, role, year, index) {
  const truongCode = shortTruongName(truong);
  const roleCode = role.toUpperCase();
  const num = String(index).padStart(4, '0');
  return `${truongCode}.${roleCode}.${year}.${num}`;
}

// ======= XỬ LÝ CSV =======
async function importHocSinhFromCSV(filename = 'hocsinh.csv' , year = 2025) {
  const filePath = path.join(__dirname, filename); // Luôn đúng dù chạy ở đâu

  const accounts = [];
  const outputRows = [];

  let index = 1;

  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv({ separator: ',' }))
      .on('data', (row) => {
        const hoTen = row['ho_ten']?.trim();
        const phuHuynh = row['phu_huynh']?.trim();
        const truong = row['truong']?.trim();

        if (!hoTen || !truong) return;

        const username = generateUsername(truong, 'HS', year, index++);
        const password = '1111'; // mặc định
        const id_role = 1;       // học sinh

        accounts.push({ username, password, id_role });
        outputRows.push({ hoTen, phuHuynh, truong, username, password });
      })
      .on('end', async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();

    // 🧩 RESET SEQUENCE để tránh lỗi trùng id
    await sequelize.query(`
      SELECT setval(
        pg_get_serial_sequence('"TaiKhoan"', 'id'),
        COALESCE((SELECT MAX(id) FROM "TaiKhoan"), 0) + 1,
        false
      );
    `);

    // 🧩 Thực hiện insert
    await TaiKhoan.bulkCreate(accounts, {
      ignoreDuplicates: true,
      individualHooks: true, // đảm bảo password được hash
    });

    console.log(`Đã tạo ${accounts.length} tài khoản học sinh.`);

    // 🧾 Xuất CSV chứa thông tin gốc
    const header = 'ho_ten,phu_huynh,truong,username,password\n';
    const lines = outputRows.map(u =>
      `${u.hoTen},${u.phuHuynh},${u.truong},${u.username},${u.password}`
    );
    fs.writeFileSync('tai_khoan_hocsinh.csv', header + lines.join('\n'), 'utf8');
    console.log('Đã lưu danh sách tài khoản gốc: tai_khoan_hocsinh.csv');

    resolve();
  } catch (err) {
    console.error('Lỗi khi tạo tài khoản:', err);
    reject(err);
  } finally {
    await sequelize.close();
  }
});
  });
}

importHocSinhFromCSV('./hocsinh.csv', 2025);
