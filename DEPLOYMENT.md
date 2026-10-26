# 🚀 Hướng Dẫn Triển Khai Hệ Thống TechPulse (Production Deployment Guide)

Tài liệu này cung cấp hướng dẫn chi tiết từng bước để triển khai nền tảng **TechPulse Modular E-Commerce** lên môi trường Production trên các nền tảng Cloud phổ biến (Docker, Render, Railway, VPS).

---

## 📋 Mục Lục
1. [Yêu Cầu Môi Trường (Prerequisites)](#1-yêu-cầu-môi-trường)
2. [Triển Khai Bằng Docker & Docker Compose](#2-triển-khai-bằng-docker--docker-compose)
3. [Triển Khai Lên Render.com (Khuyên dùng - Miễn phí)](#3-triển-khai-lên-rendercom)
4. [Triển Khai Lên Railway.app](#4-triển-khai-lên-railwayapp)
5. [Triển Khai Lên Máy Chủ Riêng (VPS Ubuntu / PM2 / Nginx)](#5-triển-khai-lên-máy-chủ-riêng-vps-ubuntu)
6. [Cấu Hình Cơ Sở Dữ Liệu Supabase PostgreSQL](#6-cấu-hình-supabase-postgresql)
7. [Healthcheck & Giám Sát Hoạt Động](#7-healthcheck--giám-sát-hoạt-động)

---

## 1. Yêu Cầu Môi Trường

* **Node.js**: Phiên bản `>= 20.x`
* **Docker & Docker Compose** (nếu triển khai bằng container)
* **Cơ sở dữ liệu PostgreSQL**: Bản v14 trở lên (khuyên dùng [Supabase](https://supabase.com) miễn phí).

---

## 2. Triển Khai Bằng Docker & Docker Compose

Dự án đã tích hợp sẵn **Multi-Stage Dockerfile** tối ưu hóa dung lượng (chỉ ~150MB):
* **Stage 1**: Tự động cài đặt thư viện và build React SPA (`npm run build`).
* **Stage 2**: Khởi tạo container Node.js siêu nhẹ (Alpine Linux), chạy với tài khoản `non-root` bảo mật và phục vụ toàn bộ API lẫn Giao diện web tại cổng `3000`.

### Bước 1: Chuẩn bị biến môi trường
Tạo file `.env` tại thư mục gốc:
```bash
cp .env.example .env
```
Điền chuỗi kết nối `DATABASE_URL` (ví dụ từ Supabase) và `JWT_SECRET`.

### Bước 2: Khởi chạy với Docker Compose
```bash
# Xây dựng image và khởi chạy nền
docker compose up -d --build

# Xem nhật ký logs theo thời gian thực
docker compose logs -f app
```

Sau khi hoàn tất, hệ thống sẽ chạy tại địa chỉ: `http://localhost:3000`.

---

## 3. Triển Khai Lên Render.com

Render là nền tảng Cloud hiện đại hỗ trợ Node.js Web Services rất mượt mà.

### Các bước thực hiện:
1. Đẩy mã nguồn dự án lên kho lưu trữ **GitHub** hoặc **GitLab**.
2. Đăng nhập [Render.com](https://render.com) -> Chọn **New +** -> **Web Service**.
3. Chọn Repository dự án `TechPulse`.
4. Điền cấu hình cơ bản:
   * **Name**: `techpulse-ecommerce`
   * **Region**: `Singapore` (để tối ưu độ trễ cho người dùng Việt Nam)
   * **Branch**: `main`
   * **Runtime**: `Node`
   * **Build Command**: 
     ```bash
     npm install && cd frontend && npm install && npm run build && cd ..
     ```
   * **Start Command**: 
     ```bash
     node server.js
     ```
5. Thêm các biến môi trường (**Environment Variables**):
   * `NODE_ENV`: `production`
   * `PORT`: `3000`
   * `DATABASE_URL`: `[Chuỗi kết nối Supabase PostgreSQL của bạn]`
   * `JWT_SECRET`: `[Mã bí mật JWT ngẫu nhiên]`
6. Bấm **Create Web Service**. Render sẽ tự động build và cấp phát URL dạng: `https://techpulse-ecommerce.onrender.com`.

---

## 4. Triển Khai Lên Railway.app

1. Đăng nhập [Railway.app](https://railway.app) -> Chọn **New Project**.
2. Chọn **Deploy from GitHub repo** và chọn repository dự án.
3. Railway sẽ tự động nhận diện `Dockerfile` đa tầng có sẵn trong dự án và kích hoạt build tự động.
4. Trong mục **Variables**, thêm các biến `DATABASE_URL` và `JWT_SECRET`.
5. Trong mục **Settings** -> **Networking** -> Bấm **Generate Domain** để nhận tên miền HTTPS công khai.

---

## 5. Triển Khai Lên Máy Chủ Riêng (VPS Ubuntu)

Nếu bạn sử dụng VPS (DigitalOcean, Vultr, Linode, AWS EC2, Viettel Cloud):

### Bước 1: Cài đặt Node.js & PM2
```bash
# Cài đặt Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs git

# Cài đặt trình quản lý tiến trình PM2
sudo npm install -g pm2
```

### Bước 2: Clone dự án và Build
```bash
git clone https://github.com/your-username/techpulse.git /var/www/techpulse
cd /var/www/techpulse

# Cài đặt backend
npm ci --omit=dev

# Cài đặt & Build React frontend
cd frontend
npm ci
npm run build
cd ..

# Thiết lập file .env
nano .env
```

### Bước 3: Khởi chạy bằng PM2
```bash
pm2 start server.js --name "techpulse-engine"
pm2 save
pm2 startup
```

### Bước 4: Cấu hình Nginx Reverse Proxy
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 6. Cấu Hình Supabase PostgreSQL

Để đảm bảo kết nối ổn định không bị timeout trong môi trường serverless/container:
1. Sử dụng cổng **Connection Pooler (6543)** thay vì cổng trực tiếp (5432).
2. Định dạng chuỗi kết nối chuẩn:
   ```
   postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true
   ```

---

## 7. Healthcheck & Giám Sát Hoạt Động

Dự án cung cấp sẵn endpoint kiểm tra tình trạng dịch vụ tại:
```
GET /api/health
```

**Phản hồi mẫu:**
```json
{
  "status": "ok",
  "uptime": 3600,
  "timestamp": "2026-10-26T14:45:00.000Z",
  "service": "TechPulse Modular E-Commerce Engine"
}
```

Bạn có thể cấu hình endpoint này vào các dịch vụ giám sát tự động như **UptimeRobot**, **BetterStack** hoặc Docker healthcheck probe để đảm bảo hệ thống luôn sẵn sàng 24/7!
