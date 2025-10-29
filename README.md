# Hướng Dẫn Sử Dụng Ứng Dụng PERN

## 1. Cài Đặt Môi Trường

### Yêu Cầu:
- Node.js (phiên bản mới nhất)
- PostgreSQL
- Docker (nếu sử dụng Docker Compose)

### Các Bước Cài Đặt:
1. Clone dự án:
   ```bash
   git clone <repository-url>
   cd pern
   ```

2. Cài đặt các gói phụ thuộc:
   ```bash
   npm install
   ```

<!-- 3. Cấu hình cơ sở dữ liệu:
   - Mở file `.env` và chỉnh sửa thông tin kết nối cơ sở dữ liệu:
     ```env
     DB_HOST=localhost
     DB_PORT=5432
     DB_USER=postgres
     DB_PASSWORD=yourpassword
     DB_NAME=pern_db -->
     ```

4. Khởi chạy cơ sở dữ liệu bằng Docker Compose (tùy chọn):
   ```bash
   docker-compose up -d
   ```

5. Khởi tạo cơ sở dữ liệu:
   ```bash
   npm run db:init
   ```

## 2. Chạy Ứng Dụng

1. Khởi động server:
   ```bash
   npm start
   ```

2. Truy cập ứng dụng tại:
   [http://localhost:3000](http://localhost:3000)

## 3. Thêm Dữ Liệu Giả Để Test

### Cách Thêm Dữ Liệu:
1. Mở file `scripts/seed.js` và chỉnh sửa dữ liệu giả nếu cần.
2. Chạy lệnh seed để thêm dữ liệu vào cơ sở dữ liệu:
   ```bash
   npm run seed
   ```

### Dữ Liệu Mẫu:
- **Bảng `TaiKhoan`**:
  ```sql
  INSERT INTO "TaiKhoan" (username, password, roleId) VALUES
  ('hocsinh1', '123456', 1),
  ('phuhuynh1', '123456', 2),
  ('giaovien1', '123456', 3);
  ```

- **Bảng `VaiTro`**:
  ```sql
  INSERT INTO "VaiTro" (id, TenVaiTro) VALUES
  (1, 'học sinh'),
  (2, 'phụ huynh'),
  (3, 'giáo viên');
  ```

## 4. Các Tính Năng Chính
- Đăng nhập và phân quyền theo vai trò.
- Dashboard cho từng vai trò.
- Quản lý thông tin học sinh, thời khóa biểu, bài tập.


