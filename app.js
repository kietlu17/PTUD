const express = require('express');
const session = require('express-session');
const path = require('path');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const authRoutes = require('./routes/auth');
// const postRoutes = require('./routes/posts');
const diemThiRoutes = require('./routes/diemthi');
const giaovien = require('./routes/giaovien');
const quanlylop = require('./routes/quanlylop');
const { init: sequelizeInit } = require('./config/sequelize');
const paymentRoutes = require('./routes/payment');
const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(methodOverride('_method'));
app.use(session({ secret: process.env.SESSION_SECRET || 'devsecret', resave: false, saveUninitialized: false }));
app.use(bodyParser.json());

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json()); 
app.use(methodOverride('_method'));
app.use(session({ secret: process.env.SESSION_SECRET || 'devsecret', resave: false, saveUninitialized: false }));

// expose currentUser to views
app.use((req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  next();
});

app.use('/', authRoutes);
// app.use('/posts', postRoutes);

// app.get('/', (req, res) => {
//   res.render('dangnhap');
// });
app.use('/diemthi', diemThiRoutes);
app.use('/giaovien', giaovien);
app.use('/admin', quanlylop);

app.use('/', paymentRoutes);
const PORT = process.env.PORT || 3000;

sequelizeInit().then(() => {
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
}).catch(err => {
  console.error('Database initialization failed:', err);
  process.exit(1);
});
