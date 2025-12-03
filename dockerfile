<<<<<<< HEAD
<<<<<<< HEAD
# FROM node:18

# WORKDIR /app

# COPY package*.json ./
# RUN npm install

# COPY . .

# EXPOSE 3000

# CMD ["node", "app.js"]\


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
=======
=======
>>>>>>> main
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
<<<<<<< HEAD
CMD [ "node", "app.js" ]
>>>>>>> b138cbc (Update chuc nang phân công GVBM và GVCN)
=======
CMD [ "node", "app.js" ]
>>>>>>> main
