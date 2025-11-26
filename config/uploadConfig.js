const multer = require('multer');
const path = require('path');
const fs = require('fs'); // 1. Import thư viện quản lý file

// 2. Định nghĩa đường dẫn thư mục lưu
const uploadDir = path.join(__dirname, '../public/uploads/baitap');

// 3. Kiểm tra nếu chưa có thư mục thì TỰ ĐỘNG TẠO
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log("--> Đã tạo thư mục lưu trữ: public/uploads/baitap");
}

// Cấu hình nơi lưu và tên file
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, uploadDir); // Lưu vào thư mục đã đảm bảo tồn tại
    },
    filename: function(req, file, cb) {
        // Đặt tên file chống trùng: Thời gian + Số ngẫu nhiên + Đuôi file gốc
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

// Kiểm tra định dạng file
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf|doc|docx|xls|xlsx|ppt|pptx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('Định dạng file không hợp lệ! Chỉ chấp nhận ảnh, PDF, Office.'));
    }
};

// Giới hạn kích thước 5MB
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: fileFilter
});

module.exports = upload;