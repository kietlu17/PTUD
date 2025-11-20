const express = require('express');
const session = require('express-session');
const path = require('path');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const { init: sequelizeInit, sequelize } = require('./config/sequelize');

<<<<<<< HEAD
const paymentRoutes = require('./routes/payment');
// const postRoutes = require('./routes/posts');
const { init: sequelizeInit } = require('./config/sequelize');

const app = express();

=======
// Import Routes
const authRoutes = require('./routes/auth');
const soGiaoDucRoute = require('./routes/soGiaoDucRoute');
const giaoVienRoute = require('./routes/giaoVienRoute');
const adminRoute = require('./routes/adminRoute');
const phuHuynhRoute = require('./routes/phuHuynhRoute');
const bangiamhieuRoute = require('./routes/bangiamhieuRoute');
// QUAN TRỌNG: Bạn cần import route cho BGH
// const banGiamHieuRoute = require('./routes/banGiamHieuRoute'); 

const app = express();

// 1. View Engine Setup
>>>>>>> b138cbc (Update chuc nang phân công GVBM và GVCN)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 2. Middleware Cơ bản (Chỉ khai báo 1 lần duy nhất)
app.use(express.static(path.join(__dirname, 'public')));
<<<<<<< HEAD
// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(methodOverride('_method'));
// app.use(session({ secret: process.env.SESSION_SECRET || 'devsecret', resave: false, saveUninitialized: false }));
// app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json()); 
app.use(methodOverride('_method'));
app.use(session({ secret: process.env.SESSION_SECRET || 'devsecret', resave: false, saveUninitialized: false }));

// expose currentUser to views
app.use((req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  next();
});
=======
app.use(express.urlencoded({ extended: true })); // Thay thế cho bodyParser.urlencoded
app.use(express.json()); // Thay thế cho bodyParser.json
app.use(methodOverride('_method'));

// 3. Session Configuration (Chỉ khai báo 1 lần duy nhất)
app.use(session({
  secret: process.env.SESSION_SECRET || 'your_secret_key_here', // Đặt secret cố định để test
  resave: false,
  saveUninitialized: false,
  cookie: { 
      secure: false, // Set true nếu dùng HTTPS
      maxAge: 1000 * 60 * 60 * 24 // 24 giờ
  }
}));

// 4. Global Variables Middleware
app.use((req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  res.locals.role = req.session.user?.role || null;
  res.locals.profile = req.session.user?.profile || null;
  res.locals.currentUrl = req.path;
  next();
});

// 5. Auth Middleware
function requireLogin(req, res, next) {
  if (!req.session.user) {
      console.log("Access denied. Redirecting to login.");
      return res.redirect('/login');
  }
  next();
}
>>>>>>> b138cbc (Update chuc nang phân công GVBM và GVCN)

// 6. Routes
app.use('/', authRoutes);
<<<<<<< HEAD

app.use('/', paymentRoutes);
// app.use('/posts', postRoutes);

// app.get('/', (req, res) => {
//   res.render('dangnhap');
// });

const PORT = process.env.PORT || 3000;

sequelizeInit().then(() => {
=======

// Áp dụng middleware bảo vệ
app.use('/sogiaoduc', requireLogin, soGiaoDucRoute);
app.use('/giaovien', requireLogin, giaoVienRoute);
app.use('/admin', requireLogin, adminRoute);
app.use('/phuhuynh', requireLogin, phuHuynhRoute);
app.use('/bangiamhieu', requireLogin, bangiamhieuRoute);

// Thêm route cho dashboard BGH (Bạn đã khai báo trong authRoutes nhưng nếu tách riêng file route thì thêm vào đây)
// app.use('/bangiamhieu', requireLogin, banGiamHieuRoute);

// ============================================================
// HÀM TỰ ĐỘNG ĐỒNG BỘ ID (FIX LỖI SEQUENCE)
// ============================================================
async function autoFixSequence() {
  console.log("🔄 Đang kiểm tra và đồng bộ bộ đếm ID (Sequences)...");
  
  // Danh sách các bảng cần fix ID tự tăng
  const tables = [
    'BangPhanCongGiaoVien',
    'BangPhanCongGiaoVienChuNhiem',
    'Lop',
    'GiaoVien',
    'HocSinh',
    'MonHoc',
    'TaiKhoan',
    'BaiTap',
    'BaiNop',
    'DiemDanh',
    'ThongBao'
  ];

  try {
    for (const table of tables) {
      // Lệnh SQL này tìm ID lớn nhất hiện có và đặt bộ đếm nhảy lên +1
      await sequelize.query(`
        SELECT setval(pg_get_serial_sequence('"${table}"', 'id'), COALESCE(MAX(id), 0) + 1, false) 
        FROM "${table}";
      `);
    }
    console.log("✅ Đã đồng bộ xong toàn bộ ID!");
  } catch (err) {
    console.error("⚠️ Lỗi khi đồng bộ ID (Có thể bỏ qua nếu bảng chưa có dữ liệu):", err.message);
  }
}
// ============================================================

const PORT = process.env.PORT || 3000;

// Khởi động Server
sequelizeInit().then(async () => {
  
  // CHẠY HÀM FIX LỖI TRƯỚC KHI MỞ CỔNG
  await autoFixSequence(); 
  
>>>>>>> b138cbc (Update chuc nang phân công GVBM và GVCN)
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
}).catch(err => {
  console.error('Database initialization failed:', err);
  process.exit(1);
});