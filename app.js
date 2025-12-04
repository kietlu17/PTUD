const express = require('express');
const session = require('express-session');
const path = require('path');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const authRoutes = require('./routes/auth');

const soGiaoDucRoute = require('./routes/soGiaoDucRoute');
const giaoVienRoute = require('./routes/giaoVienRoute');
const adminRoute = require('./routes/adminRoute');
const bangiamhieuRoute = require('./routes/bangiamhieuRoute');
const { init: sequelizeInit } = require('./config/sequelize');
const phuHuynhRoute = require('./routes/phuHuynhRoute');
const app = express();


app.use(session({
  secret: 'secret',  // đổi thành secret thực tế
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 } // 1 giờ
}));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(methodOverride('_method'));
app.use(session({ secret: process.env.SESSION_SECRET || 'devsecret', resave: false, saveUninitialized: false }));


app.use(express.urlencoded({ extended: true }));
app.use(express.json());





// expose currentUser to views
app.use((req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  res.locals.role = req.session.user?.role || null;
  res.locals.profile = req.session.user?.profile || null;
  next();
});

function requireLogin(req, res, next) {
  if (!req.session.user) return res.redirect('/login');
  next();
}
app.use((req, res, next) => {
  res.locals.currentUrl = req.path; // tự động lấy đường dẫn hiện tại
  next();
});

app.use('/', authRoutes);
// app.use('/posts', postRoutes);

// app.get('/', (req, res) => {
//   res.render('dangnhap');
// });
app.use('/sogiaoduc', requireLogin,soGiaoDucRoute);
app.use('/giaovien', requireLogin, giaoVienRoute);
app.use('/admin',requireLogin,adminRoute);
app.use('/phuhuynh', requireLogin,phuHuynhRoute);
app.use('/bangiamhieu', requireLogin,bangiamhieuRoute);

const PORT = process.env.PORT || 3000;




sequelizeInit().then(() => {
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
}).catch(err => {
  console.error('Database initialization failed:', err);
  process.exit(1);
});