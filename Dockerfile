# Base image
FROM node:18

# Tạo thư mục làm việc
WORKDIR /app

# Copy package và cài đặt dependencies
COPY package*.json ./
RUN npm install

# Copy toàn bộ project vào container
COPY . .

# Expose cổng server (ví dụ app chạy ở cổng 3000)
EXPOSE 3000

# Lệnh khởi động app
CMD ["npm", "start"]
