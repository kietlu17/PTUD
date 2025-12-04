


# Sử dụng image Node.js làm base
FROM node:18-alpine

# Thiết lập thư mục làm việc
WORKDIR /usr/src/app

# Sao chép package.json
COPY package*.json ./

# Cài đặt dependencies và nodemon global
# (Hoặc thêm nodemon vào devDependencies trong package.json và chỉ chạy npm install)
RUN npm install 

# Sao chép toàn bộ mã nguồn
COPY . .

# Mở cổng mà ứng dụng sẽ chạy
EXPOSE 3000

# Lệnh mặc định sẽ được ghi đè bởi command trong docker-compose.yml (npm run dev)
CMD [ "npm", "start" ]
