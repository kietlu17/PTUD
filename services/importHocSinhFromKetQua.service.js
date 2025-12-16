const { sequelize } = require("../config/sequelize");

const {
  KetQuaTuyenSinh,
  DangKyTuyenSinh,
  HocSinh,
  PhuHuynh,
  ThiSinh,
  TaiKhoan
} = require("../models");
const TaiKhoanTuyenSinh = require('../models/TaiKhoanTuyenSinh')
const { sendAccountMail } = require("../utils/mailer");

async function importHocSinhFromKetQua() {
  const transaction = await sequelize.transaction();
const mailQueue = []; // lưu danh sách mail cần gửi
  try {
            const ketQuaList = await KetQuaTuyenSinh.findAll({
            include: [
                {
                model: ThiSinh,
                as: 'thiSinh',
                include: [
                    {
                    model: DangKyTuyenSinh,
                    as: 'dangky',
                    },
                ],
                },
            ],
            });
        for (const kq of ketQuaList) {
        const thiSinh = kq.thiSinh;
        if (!thiSinh) {
            console.log(' Không có thí sinh');
            continue;
        }

        const dk = thiSinh.dangky;
        if (!dk) {
            console.log(' Không có đăng ký');
            continue;
        }


      // ===============================
      // 2. Tạo HỌC SINH
      // ===============================
            const namNhapHoc = new Date().getFullYear(); // lấy năm hiện tại

            const hocSinh = await HocSinh.create(
            {
                MaHS: `HS${Date.now()}`,          // hoặc theo rule riêng
                HoVaTen: dk.HoVaTen,
                NgaySinh: dk.NgaySinh,
                GioiTinh: dk.GioiTinh,

                id_school: kq.truongtrungtuyen,  // ⭐ TRƯỜNG TRÚNG TUYỂN
                NamNhapHoc: namNhapHoc,           // ⭐ NĂM NHẬP HỌC
            },
            { transaction }
            );
    // ===============================
        // 2.1 TẠO TÀI KHOẢN HỌC SINH
        // ===============================
        const usernameHS = `${hocSinh.MaHS}`;

        // kiểm tra tồn tại
        const tkHSExist = await TaiKhoan.findOne({
        where: { username: usernameHS },
        transaction,
        });

        if (!tkHSExist) {
        await TaiKhoan.create(
            {
            username: usernameHS,
            password: '123456',   // mật khẩu mặc định (sẽ được hash)
            id_role: 1,           // 
            id_truong: null,
            isFirstLogin: true,
            },
            { transaction }
        );
        }
      // ===============================
      // 3. Lấy tài khoản phụ huynh
      // ===============================
      const taiKhoanPH = await TaiKhoanTuyenSinh.findOne({
  transaction,
});


      // ===============================
      // 4. Kiểm tra PH đã tồn tại chưa
      // ===============================
      let phuHuynh = await PhuHuynh.findOne({
        where: {
          id_HocSinh: hocSinh.id,
        },
        transaction,
      });

      if (!phuHuynh) {
        //  TẠO ID THỦ CÔNG CHO PHUHUYNH
        const maxId = await PhuHuynh.max("id", { transaction });
        const newId = (maxId || 0) + 1;

        phuHuynh = await PhuHuynh.create(
          {
            id: newId,
            MaPH: `PH${newId}`,
            HoVaTen: taiKhoanPH.tenPH,
            SDT: taiKhoanPH.sdt,
            email: taiKhoanPH.email || null,
            NgaySinh: taiKhoanPH.ngaysinh,
            GioiTinh: taiKhoanPH.gioitinh,
            id_HocSinh: hocSinh.id,
          },
          { transaction }
        );

        }            // ===============================
            // 4.1 TẠO TÀI KHOẢN PHỤ HUYNH
            // ===============================
            const usernamePH = `${phuHuynh.MaPH}`;

            const tkPHExist = await TaiKhoan.findOne({
            where: { username: usernamePH },
            transaction,
            });

            if (!tkPHExist) {
            await TaiKhoan.create(
                {
                username: usernamePH,
                password: '123456',   // mật khẩu mặc định
                id_role: 2,           
                id_truong: null,
                isFirstLogin: true,
                },
                { transaction }
            );
        }
            mailQueue.push({
            to: dk.Gmail,   //  GMAIL LẤY TỪ DangKyTuyenSinh
            hocSinh: {
                username: usernameHS,
                password: '123456',
            },
            phuHuynh: {
                username: usernamePH,
                password: '123456',
            },
            });

        }

    await transaction.commit();

for (const mail of mailQueue) {
  try {
    await sendAccountMail(mail);
  } catch (err) {
    console.error(" Gửi mail lỗi:", mail.to, err.message);
  }
}


  } catch (error) {
    await transaction.rollback();
    throw error;
  }
    // ===============================
  // 📧 GỬI MAIL SAU COMMIT
  // ===============================
  for (const mail of mailQueue) {
    try {
      await sendAccountMail(mail);
    } catch (mailErr) {
      console.error(" Gửi mail thất bại:", mail.to, mailErr.message);
      // ❗ KHÔNG throw nữa
    }
  }

  return {
    success: true,
    message: "Import học sinh & phụ huynh thành công",
  };
}


module.exports = {
  importHocSinhFromKetQua,
};
