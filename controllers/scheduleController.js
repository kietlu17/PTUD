const { sequelize } = require('../config/sequelize');
const db = sequelize; // Giữ nguyên tên biến 'db' để tránh phải sửa các hàm query bên dưới

// Hiển thị thời khóa biểu cho học sinh
exports.viewScheduleStudent = async (req, res) => {
  try {
    const hocSinhId = req.params.hocSinhId || req.session.userId;

    // Lấy thông tin học sinh và lớp
    const [hocSinh] = await db.query(
      `SELECT hs.*, l."TenLop", l.id as "id_Lop" 
       FROM "HocSinh" hs 
       LEFT JOIN "Lop" l ON hs."id_Lop" = l.id 
       WHERE hs.id = $1`,
      [hocSinhId]
    );

    if (!hocSinh || hocSinh.length === 0) {
      return res.status(404).render('error', { message: 'Không tìm thấy học sinh' });
    }

    const student = hocSinh[0];

    // Lấy thời khóa biểu của lớp
    const [schedule] = await db.query(
      `SELECT tkb.*, m."TenMon", gv."HoVaTen" as "TenGiaoVien"
       FROM "ThoiKhoaBieu" tkb
       LEFT JOIN "MonHoc" m ON tkb."id_MonHoc" = m.id
       LEFT JOIN "GiaoVien" gv ON tkb."id_GiaoVien" = gv.id
       WHERE tkb."id_Lop" = $1 AND tkb."HocKy" = '1' AND tkb."NamHoc" = '2025-2026'
       ORDER BY 
         CASE tkb."Thu"
           WHEN 'Hai' THEN 1
           WHEN 'Ba' THEN 2
           WHEN 'Tu' THEN 3
           WHEN 'Nam' THEN 4
           WHEN 'Sau' THEN 5
           WHEN 'Bay' THEN 6
         END,
         tkb."Tiet"`,
      [student.id_Lop]
    );

    // Tổ chức dữ liệu theo thứ
    const scheduleByDay = {
      'Hai': [],
      'Ba': [],
      'Tu': [],
      'Nam': [],
      'Sau': [],
      'Bay': []
    };

    schedule.forEach(item => {
      if (scheduleByDay[item.Thu]) {
        scheduleByDay[item.Thu].push(item);
      }
    });

    res.render('hocsinh/schedule', {
      hocSinh: student,
      scheduleByDay,
      userType: 'hocsinh'
    });

  } catch (error) {
    console.error('Error loading schedule:', error);
    res.status(500).render('error', { message: 'Lỗi khi tải thời khóa biểu' });
  }
};

// Hiển thị thời khóa biểu cho phụ huynh
exports.viewScheduleParent = async (req, res) => {
  try {
    const phuHuynhId = req.session.userId;
    const hocSinhId = req.query.hocSinhId;
    if (!phuHuynhId) {
        // Nếu không có, đây là lỗi đăng nhập hoặc session hết hạn
        // Sử dụng mã lỗi 401 Unauthorized (Không được phép)
        return res.status(401).render('error', { message: 'Phiên đăng nhập đã hết hạn hoặc không tìm thấy ID người dùng.' });
    }
    // Lấy thông tin phụ huynh
    const [phuHuynh] = await db.query(
      `SELECT ph.*, hs.id as "id_HocSinh", hs."HoVaTen" as "TenCon"
       FROM "PhuHuynh" ph
       LEFT JOIN "HocSinh" hs ON ph."id_HocSinh" = hs.id
       WHERE ph.id = $1`,
      [phuHuynhId]
    );

    if (!phuHuynh || phuHuynh.length === 0) {
      return res.status(404).render('error', { message: 'Không tìm thấy phụ huynh' });
    }

    const parent = phuHuynh[0];
    const studentId = hocSinhId || parent.id_HocSinh;

    // Lấy thông tin học sinh và lớp
    const [hocSinh] = await db.query(
      `SELECT hs.*, l."TenLop", l.id as "id_Lop" 
       FROM "HocSinh" hs 
       LEFT JOIN "Lop" l ON hs."id_Lop" = l.id 
       WHERE hs.id = $1`,
      [studentId]
    );

    if (!hocSinh || hocSinh.length === 0) {
      return res.status(404).render('error', { message: 'Không tìm thấy học sinh' });
    }

    const student = hocSinh[0];

    // Kiểm tra quyền truy cập
    if (student.id !== parent.id_HocSinh) {
      return res.status(403).render('error', { message: 'Bạn không có quyền xem thông tin này' });
    }

    // Lấy thời khóa biểu
    const [schedule] = await db.query(
      `SELECT tkb.*, m."TenMon", gv."HoVaTen" as "TenGiaoVien"
       FROM "ThoiKhoaBieu" tkb
       LEFT JOIN "MonHoc" m ON tkb."id_MonHoc" = m.id
       LEFT JOIN "GiaoVien" gv ON tkb."id_GiaoVien" = gv.id
       WHERE tkb."id_Lop" = $1 AND tkb."HocKy" = '1' AND tkb."NamHoc" = '2025-2026'
       ORDER BY 
         CASE tkb."Thu"
           WHEN 'Hai' THEN 1
           WHEN 'Ba' THEN 2
           WHEN 'Tu' THEN 3
           WHEN 'Nam' THEN 4
           WHEN 'Sau' THEN 5
           WHEN 'Bay' THEN 6
         END,
         tkb."Tiet"`,
      [student.id_Lop]
    );

    // Tổ chức dữ liệu theo thứ
    const scheduleByDay = {
      'Hai': [],
      'Ba': [],
      'Tu': [],
      'Nam': [],
      'Sau': [],
      'Bay': []
    };

    schedule.forEach(item => {
      if (scheduleByDay[item.Thu]) {
        scheduleByDay[item.Thu].push(item);
      }
    });

    res.render('phuhuynh/schedule', {
      phuHuynh: parent,
      hocSinh: student,
      scheduleByDay,
      userType: 'phuhuynh'
    });

  } catch (error) {
    console.error('Error loading schedule:', error);
    res.status(500).render('error', { message: 'Lỗi khi tải thời khóa biểu' });
  }
};