const nodemailer = require("nodemailer");
require('dotenv').config();
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS, // App Password
  },
});

async function sendAccountMail({ to, hocSinh, phuHuynh }) {
  const html = `
    <h2>Thông tin tài khoản tuyển sinh</h2>
    <p>Xin chào phụ huynh,</p>

    <h3> Tài khoản học sinh</h3>
    <ul>
      <li>Username: <b>${hocSinh.username}</b></li>
      <li>Password: <b>${hocSinh.password}</b></li>
    </ul>

    <h3> Tài khoản phụ huynh</h3>
    <ul>
      <li>Username: <b>${phuHuynh.username}</b></li>
      <li>Password: <b>${phuHuynh.password}</b></li>
    </ul>

    <p>Vui lòng đổi mật khẩu khi đăng nhập lần đầu.</p>
  `;

  await transporter.sendMail({
    from: `"Tuyển Sinh Nhà Trường" <${process.env.MAIL_USER}>`,
    to,
    subject: "Thông tin tài khoản tuyển sinh",
    html,
  });
}

module.exports = { sendAccountMail };
