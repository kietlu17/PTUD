// middleware/checkTuyenSinhLogin.js
// middlewares/tuyenSinhAuth.js
module.exports = function (req, res, next) {
  if (!req.session.tuyenSinh) {
    return res.redirect('/tuyensinh/login');
  }
  next();
};



