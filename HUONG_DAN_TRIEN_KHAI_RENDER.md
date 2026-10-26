# CẨM NANG HƯỚNG DẪN TRIỂN KHAI VÀ VẬN HÀNH TRÊN RENDER.COM TỪ A - Z
## DỰ ÁN THƯƠNG MẠI ĐIỆN TỬ ATELIER & CO. (SHOP CHY CHY)

Tài liệu này được biên soạn dành riêng cho dự án, làm tài liệu tham khảo kỹ thuật và hướng dẫn vận hành chi tiết khi triển khai, cập nhật và duy trì hệ thống chạy trực tuyến 24/7 trên **Render.com**.

> [!IMPORTANT]
> ### 📌 HỒ SƠ DỊCH VỤ & THÔNG SỐ ĐANG HOẠT ĐỘNG THỰC TẾ (LIVE)
> | Dịch vụ | Mục | Thông tin chi tiết |
> | :--- | :--- | :--- |
> | **Render.com** (Web Service) | Tên dịch vụ | `shopchychy` (Slug: `web-demo-app`) |
> | | Service ID | `srv-dbe83css728c73bbh7g0` |
> | | Email tài khoản Render | `itisloves2@gmail.com` (Workspace: *My Workspace*) |
> | | Trang quản trị Render | [dashboard.render.com/web/srv-dbe83css728c73bbh7g0](https://dashboard.render.com/web/srv-dbe83css728c73bbh7g0) |
> | | API Key | `rnd_VRDeFOy2odVHNB3CFVNkRYrED2NE` |
> | | **Trang Web Trực Tuyến 1** | **[https://shopchychy.foo.ng](https://shopchychy.foo.ng)** (Tên miền riêng chính thức) |
> | | **Trang Web Trực Tuyến 2** | **[https://web-demo-app.onrender.com](https://web-demo-app.onrender.com)** (Render Subdomain) |
> | | **Healthcheck URL** | **[https://shopchychy.foo.ng/api/health](https://shopchychy.foo.ng/api/health)** |
> | | Kho lưu trữ GitHub | [https://github.com/hungnmph07114/web-demo](https://github.com/hungnmph07114/web-demo) (Branch: `main`) |
> | **Supabase** (PostgreSQL) | Trang quản trị DB | [supabase.com/dashboard/project/oecgyiaetefmxkrndcvk](https://supabase.com/dashboard/project/oecgyiaetefmxkrndcvk) |
> | | Mật khẩu Database | `manhhung0423` |
> | | **Chuỗi kết nối (DATABASE_URL)** | `postgresql://postgres.oecgyiaetefmxkrndcvk:manhhung0423@aws-0-ap-south-1.pooler.supabase.com:6543/postgres` |
> | **Tài khoản mặc định** | Admin Quản trị | `admin@techpulse.vn` / `admin123` |
> | | Khách hàng Demo | `user@techpulse.vn` / `user123` |

---

## MỤC LỤC
1. [Hiểu về Render & Đặc điểm gói Miễn Phí (Free Tier)](#1-hieu-ve-render--dac-diem-goi-mien-phi-free-tier)
2. [Các quy tắc "sống còn" khi viết code deploy lên Render](#2-cac-quy-tac-song-con-khi-viet-code-deploy-len-render)
3. [Cấu hình môi trường & Lệnh khởi chạy của dự án](#3-cau-hinh-moi-truong--lenh-khoi-chay-cua-du-an)
4. [Quy trình Triển khai Tự động (Auto Deploy qua GitHub)](#4-quy-trinh-trien-khai-tu-dong-auto-deploy-qua-github)
5. [Quản lý và kích hoạt triển khai bằng Render API (cURL)](#5-quan-ly-va-kich-hoat-trien-khai-bang-render-api-curl)
6. [Mẹo giữ Server 24/7 không bị ngủ đông (Keep-Alive qua UptimeRobot)](#6-meo-giu-server-247-khong-bi-ngu-dong-keep-alive-qua-uptimerobot)
7. [Các lỗi thường gặp và cách xử lý (Troubleshooting)](#7-cac-loi-thuong-gap-va-cach-xu-ly-troubleshooting)

---

## 1. Hiểu về Render & Đặc điểm gói Miễn Phí (Free Tier)

Render cung cấp gói miễn phí mạnh mẽ cho các dự án web cá nhân và khởi nghiệp:

| Loại tài nguyên | Thông số gói Free | Lưu ý vận hành |
| :--- | :--- | :--- |
| **Web Service (Full-stack)** | 512 MB RAM, 0.1 CPU, 750 giờ/tháng | **Tự động ngủ đông (Spin down)** sau **15 phút** không có lượt truy cập. Khi có khách vào, mất khoảng 30–50 giây để khởi động lại (khắc phục bằng Mục 6). |
| **Băng thông (Bandwidth)** | 100 GB/tháng, CDN toàn cầu | Đáp ứng thoải mái cho hàng chục nghìn lượt xem sản phẩm mỗi tháng. |
| **Cơ sở dữ liệu (PostgreSQL)** | Kết nối qua **Supabase Cloud** | Miễn phí 500 MB vĩnh viễn, kết nối an toàn qua Transaction Pooler cổng `6543` hỗ trợ SSL. |
| **Chứng chỉ bảo mật** | SSL / TLS tự động | Render tự cấp chứng chỉ HTTPS miễn phí cho cả subdomain `.onrender.com` và tên miền riêng `shopchychy.foo.ng`. |

---

## 2. Các quy tắc "sống còn" khi viết code deploy lên Render

Để ứng dụng không bị lỗi ngay khi vừa deploy, toàn bộ mã nguồn của dự án đã được thiết kế tuân thủ nghiêm ngặt 3 nguyên tắc sau:

### 2.1. Không hardcode cổng (Port)
Render tự động phân bổ một cổng ngẫu nhiên thông qua biến môi trường `PORT`. Server Node.js lắng nghe cổng này:
```javascript
// src/server.js
const PORT = process.env.PORT || 3000;
```

### 2.2. Luôn bind vào địa chỉ `0.0.0.0`
Không bind vào `localhost` hoặc `127.0.0.1` vì proxy của Render sẽ không forward được traffic từ ngoài Internet vào trong container:
```javascript
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server đang chạy tại: http://localhost:${PORT}`);
});
```

### 2.3. Không bao giờ đưa file `.env` lên GitHub
File `.env` được đưa vào `.gitignore`. Mọi biến nhạy cảm (chuỗi kết nối Database, khóa bí mật JWT, mã tài khoản ngân hàng) được cấu hình tại mục **Environment Variables** trên Render Dashboard.

---

## 3. Cấu hình môi trường & Lệnh khởi chạy của dự án

Hệ thống sử dụng cơ chế **Unified Container Hosting**:
- **Backend API:** Node.js Express phục vụ toàn bộ các module API (`/api/products`, `/api/orders`, `/api/webhooks/vietqr`, `/api/shipping`, `/api/notifications`).
- **Frontend SPA:** React + Vite được biên dịch thành thư mục tĩnh `frontend/dist/`. Express tự động phục vụ file `index.html` cho người dùng khi vào trang chủ hoặc các đường dẫn phụ.

### 3.1. Thiết lập trên Render Dashboard
- **Build Command:** `npm install && npm run build` *(hoặc `npm install`)*
- **Start Command:** `npm start` (thực thi `node server.js`)
- **Region:** `Singapore` (độ trễ thấp nhất về Việt Nam)

### 3.2. Bảng biến môi trường (Environment Variables)

Truy cập **Render Dashboard > shopchychy > Environment** để kiểm tra:

| Tên biến (Key) | Giá trị mẫu | Mục đích |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Bật chế độ tối ưu hiệu năng sản xuất |
| `DATABASE_URL` | `postgresql://postgres.oecgyiaetefmxkrndcvk:manhhung0423@aws-0-ap-south-1.pooler.supabase.com:6543/postgres` | Kết nối cơ sở dữ liệu Supabase |
| `JWT_SECRET` | `techpulse_secret_jwt_super_key_2026` | Khóa mã hóa phiên đăng nhập |
| `VIETQR_BANK_ID` | `MB` | Mã ngân hàng tạo mã QR chuyển khoản |
| `VIETQR_ACCOUNT_NO` | `0987654321` | Số tài khoản nhận tiền của chủ shop |
| `VIETQR_ACCOUNT_NAME` | `NGUYEN MANH HUNG` | Tên in hoa không dấu của chủ shop |
| `SMTP_HOST` | `smtp.gmail.com` *(hoặc để trống)* | Máy chủ gửi email xác nhận đơn |
| `SMTP_USER` | `email_cua_ban@gmail.com` | Email người gửi |
| `SMTP_PASS` | `xxxx xxxx xxxx xxxx` | Mật khẩu ứng dụng Google (App Password) |

---

## 4. Quy trình Triển khai Tự động (Auto Deploy qua GitHub)

Dịch vụ Render `shopchychy` đã được kết nối trực tiếp với nhánh `main` của kho lưu trữ GitHub:
```
https://github.com/hungnmph07114/web-demo.git
```

Mỗi khi bạn thực hiện cập nhật code và đẩy lên GitHub:
```bash
git add .
git commit -m "feat: cap nhat tinh nang moi"
git push origin main
```

1. GitHub gửi tín hiệu Webhook tức thì sang Render.
2. Render tự động kéo bản dựng mới về máy chủ Singapore.
3. Chạy `npm install` và `npm run build`.
4. Cập nhật phiên bản chạy mới mà không làm gián đoạn người dùng đang truy cập (**Zero-downtime rolling update**).

---

## 5. Quản lý và kích hoạt triển khai bằng Render API (cURL)

Bạn có thể quản lý dịch vụ từ xa thông qua Render API Key: `rnd_VRDeFOy2odVHNB3CFVNkRYrED2NE`.

### 5.1. Kích hoạt Deploy thủ công tức thì:
```bash
curl -X POST https://api.render.com/v1/services/srv-dbe83css728c73bbh7g0/deploys \
  -H "Authorization: Bearer rnd_VRDeFOy2odVHNB3CFVNkRYrED2NE" \
  -H "Accept: application/json"
```

### 5.2. Kiểm tra tiến độ bản Deploy gần nhất:
```bash
curl -s -H "Authorization: Bearer rnd_VRDeFOy2odVHNB3CFVNkRYrED2NE" \
  https://api.render.com/v1/services/srv-dbe83css728c73bbh7g0/deploys?limit=1
```

### 5.3. Kiểm tra chi tiết trạng thái dịch vụ (Service Details):
```bash
curl -s -H "Authorization: Bearer rnd_VRDeFOy2odVHNB3CFVNkRYrED2NE" \
  https://api.render.com/v1/services/srv-dbe83css728c73bbh7g0
```

---

## 6. Mẹo giữ Server 24/7 không bị ngủ đông (Keep-Alive qua UptimeRobot)

Để khắc phục hoàn toàn nhược điểm "ngủ đông sau 15 phút" của gói miễn phí Render, hãy thiết lập **[UptimeRobot](https://uptimerobot.com)** (hoàn toàn miễn phí):

1. Đăng ký tài khoản tại [uptimerobot.com](https://uptimerobot.com).
2. Nhấn nút **+ Add New Monitor**:
   - **Monitor Type:** Chọn `HTTP(s)`
   - **Friendly Name:** `ShopChyChy Keep-Alive`
   - **URL (or IP):** `https://shopchychy.foo.ng/api/health` *(hoặc `https://web-demo-app.onrender.com/api/health`)*
   - **Monitoring Interval:** Chọn **5 minutes** (hoặc 10 minutes)
   - **Alert Contacts:** Tích chọn email của bạn để nhận thông báo nếu web gặp sự cố.
3. Nhấn **Create Monitor**.

> [!TIP]
> Endpoint `/api/health` được tối ưu phản hồi siêu tốc (<15ms) và trả về định dạng JSON:
> ```json
> {
>   "status": "ok",
>   "uptime": 360,
>   "timestamp": "2026-10-26T09:33:53.631Z",
>   "service": "TechPulse Modular E-Commerce Engine"
> }
> ```
> Nhờ có request tự động mỗi 5 phút, Render ghi nhận ứng dụng luôn có người dùng hoạt động và **không bao giờ rơi vào trạng thái ngủ đông**, website luôn tải nhanh tức thì!

---

## 7. Các lỗi thường gặp và cách xử lý (Troubleshooting)

| Hiện tượng lỗi | Nguyên nhân gốc | Cách khắc phục |
| :--- | :--- | :--- |
| **`Timed out waiting for port`** | Server lắng nghe trên cổng tĩnh (cứng `3000`) hoặc bind vào `127.0.0.1`. | Đã xử lý trong `server.js`: đọc `process.env.PORT` và bind vào `0.0.0.0`. |
| **Lỗi `Connection terminated unexpectedly`** | Chuỗi kết nối Supabase bị ngắt do vượt giới hạn kết nối đồng thời. | Sử dụng cổng kết nối **Transaction Pooler `6543`** thay vì cổng trực tiếp `5432`. |
| **Lỗi 404 khi người dùng F5 tại trang con** | Single Page Application (React Router) chưa được định tuyến fallback. | Đã cấu hình trong `src/app.js`: `app.get('*', ... sendFile('index.html'))`. |
| **Ảnh sản phẩm không hiển thị** | URL hình ảnh bị chặn CORS hoặc link ảnh demo bị hết hạn. | Dùng tính năng tải ảnh trong Admin Portal hoặc sử dụng URL trực tiếp từ Unsplash / Cloudinary / Imgur có giao thức HTTPS. |
