# Sử dụng image Node.js làm base
FROM node:18

# Thiết lập thư mục làm việc bên trong container
WORKDIR /app

# Sao chép các file cấu hình và cài đặt dependency trước
# Điều này giúp tận dụng Docker cache, giúp build nhanh hơn
COPY package*.json ./
RUN npm install

# Sao chép toàn bộ mã nguồn của ứng dụng vào container
COPY . .

# Mở cổng mà ứng dụng Node.js của bạn lắng nghe (ví dụ: 3000)
# (Bạn cần đảm bảo app.js của bạn lắng nghe trên port này)
EXPOSE 3000

# Lệnh mặc định để chạy ứng dụng
CMD [ "node", "app.js" ]