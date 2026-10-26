# CẨM NANG HƯỚNG DẪN TRIỂN KHAI ỨNG DỤNG LÊN RENDER.COM TỪ A - Z

Tài liệu này được biên soạn dành riêng cho dự án **TechPulse Modular E-Commerce Engine** để lưu trữ trong thư mục làm việc, làm tài liệu tham khảo chi tiết khi vận hành, bảo trì và triển khai ứng dụng web lên Internet với **Render.com**.

> [!IMPORTANT]
> ### 📌 HỒ SƠ DỊCH VỤ & THÔNG SỐ ĐANG HOẠT ĐỘNG (LIVE)
> | Dịch vụ | Mục | Thông tin chi tiết |
> | :--- | :--- | :--- |
> | **Render.com** (Web Service) | Service ID | `srv-dbe83css728c73bbh7g0` (Slug: `web-demo-app`) |
> | | Email tài khoản | `itisloves2@gmail.com` (Workspace: *My Workspace*) |
> | | Trang quản trị Render | [dashboard.render.com/web/srv-dbe83css728c73bbh7g0](https://dashboard.render.com/web/srv-dbe83css728c73bbh7g0) |
> | | API Key | `rnd_VRDeFOy2odVHNB3CFVNkRYrED2NE` |
> | | **Trang Web Trực Tuyến 1** | **[https://shopchychy.foo.ng](https://shopchychy.foo.ng)** (Tên miền riêng chính thức) |
> | | **Trang Web Trực Tuyến 2** | **[https://web-demo-app.onrender.com](https://web-demo-app.onrender.com)** (Render Subdomain) |
> | | **Healthcheck URL** | `https://shopchychy.foo.ng/api/health` |
> | | Kho lưu trữ GitHub | [https://github.com/hungnmph07114/web-demo](https://github.com/hungnmph07114/web-demo) (Branch: `main`) |
> | **Supabase** (PostgreSQL) | Trang quản trị | [supabase.com/dashboard/project/oecgyiaetefmxkrndcvk](https://supabase.com/dashboard/project/oecgyiaetefmxkrndcvk) |
> | | Mật khẩu Database | `manhhung0423` |
> | | **Chuỗi kết nối (DATABASE_URL)** | `postgresql://postgres.oecgyiaetefmxkrndcvk:manhhung0423@aws-0-ap-south-1.pooler.supabase.com:6543/postgres` |
> | **Tài khoản mặc định** | Admin Quản trị | `admin@techpulse.vn` / `admin123` |
> | | Khách hàng Demo | `user@techpulse.vn` / `user123` |

---

## MỤC LỤC
1. [Kiến trúc triển khai TechPulse trên Render](#1-kien-truc-trien-khai-techpulse-tren-render)
2. [Các biến môi trường (Environment Variables) bắt buộc trên Render](#2-cac-bien-moi-truong-environment-variables-bat-buoc-tren-render)
3. [Quy trình Triển khai Tự động (Auto Deploy via GitHub)](#3-quy-trinh-trien-khai-tu-dong-auto-deploy-via-github)
4. [Tự động hoá bằng Render API & Scripts cURL](#4-tu-dong-hoa-bang-render-api--scripts-curl)
5. [Giải pháp giữ Server 24/7 không bị ngủ đông (Keep-Alive)](#5-giai-phap-giu-server-247-khong-bi-ngu-dong-keep-alive)
6. [Xử lý sự cố & Kiểm tra Logs trên Render](#6-xu-ly-su-co--kiem-tra-logs-tren-render)

---

## 1. Kiến trúc triển khai TechPulse trên Render

Hệ thống được đóng gói theo cơ chế **Unified Container Hosting** (Máy chủ thống nhất):
- **Backend API:** Node.js Express phục vụ toàn bộ REST API tại `/api/*`.
- **Frontend SPA:** Single Page Application (React + Vite) được biên dịch thành các tài nguyên tĩnh trong thư mục `frontend/dist/`. Express tự động điều hướng và phục vụ `index.html` cho tất cả các route người dùng (client-side routing).
- **Cơ sở dữ liệu:** Supabase PostgreSQL (Managed Cloud Database) kết nối an toàn qua giao thức Connection Pooling (cổng 6543) hỗ trợ SSL tự động.

---

## 2. Các biến môi trường (Environment Variables) bắt buộc trên Render

Truy cập **Render Dashboard > shopchychy > Environment** và đảm bảo các biến sau đã được thiết lập:

| Tên biến (Key) | Giá trị mẫu / Ý nghĩa | Bắt buộc |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Có |
| `PORT` | *(Render tự sinh, server đọc qua `process.env.PORT \|\| 3000`)* | Tự động |
| `DATABASE_URL` | `postgresql://postgres.oecgyiaetefmxkrndcvk:manhhung0423@aws-0-ap-south-1.pooler.supabase.com:6543/postgres` | Có |
| `JWT_SECRET` | Chuỗi bí mật ký Token (VD: `techpulse_secret_jwt_super_key_2026`) | Có |
| `VIETQR_BANK_ID` | `MB` (Ngân hàng Quân Đội) | Tùy chọn |
| `VIETQR_ACCOUNT_NO` | `0987654321` | Tùy chọn |
| `VIETQR_ACCOUNT_NAME` | `NGUYEN MANH HUNG` | Tùy chọn |
| `SMTP_HOST` | Host SMTP gửi mail (để trống hệ thống tự dùng Ethereal Sandbox) | Tùy chọn |
| `SMTP_USER` | Email hoặc user SMTP | Tùy chọn |
| `SMTP_PASS` | Mật khẩu ứng dụng SMTP | Tùy chọn |

---

## 3. Quy trình Triển khai Tự động (Auto Deploy via GitHub)

Dịch vụ Render `shopchychy` đã được liên kết trực tiếp với nhánh `main` của repository GitHub:
```
https://github.com/hungnmph07114/web-demo.git
```

Mỗi khi bạn thực hiện `git push origin main`:
1. GitHub Webhook sẽ tự động thông báo tới Render.
2. Render kéo mã nguồn mới nhất về máy chủ tại Singapore.
3. Chạy lệnh **Build Command:** `npm install`.
4. Khởi chạy **Start Command:** `npm start` (thực thi `node server.js`).
5. Kiểm tra trạng thái và cập nhật bản dựng mới mà không làm gián đoạn người dùng (Zero-downtime rolling update).

---

## 4. Tự động hoá bằng Render API & Scripts cURL

Bạn có thể quản lý, kiểm tra trạng thái và kích hoạt triển khai bằng API Key cá nhân:
`rnd_VRDeFOy2odVHNB3CFVNkRYrED2NE`

### 4.1. Kích hoạt Deploy lại thủ công (Trigger Manual Deploy)
Chạy lệnh sau trên terminal (PowerShell hoặc Bash):
```bash
curl -X POST https://api.render.com/v1/services/srv-dbe83css728c73bbh7g0/deploys \
  -H "Authorization: Bearer rnd_VRDeFOy2odVHNB3CFVNkRYrED2NE" \
  -H "Accept: application/json"
```

### 4.2. Kiểm tra tiến độ bản Deploy gần nhất
```bash
curl -s -H "Authorization: Bearer rnd_VRDeFOy2odVHNB3CFVNkRYrED2NE" \
  https://api.render.com/v1/services/srv-dbe83css728c73bbh7g0/deploys?limit=1
```

### 4.3. Kiểm tra thông số dịch vụ (Service Details)
```bash
curl -s -H "Authorization: Bearer rnd_VRDeFOy2odVHNB3CFVNkRYrED2NE" \
  https://api.render.com/v1/services/srv-dbe83css728c73bbh7g0
```

---

## 5. Giải pháp giữ Server 24/7 không bị ngủ đông (Keep-Alive)

Trên gói **Free Tier** của Render, Web Service sẽ tạm thời chuyển sang trạng thái ngủ đông (Sleep) nếu không có lượt truy cập nào trong vòng **15 phút**. Khi người dùng vào lại, server cần khoảng 30–50 giây để khởi động lại.

### Cách cấu hình UptimeRobot (Hoàn toàn Miễn phí):
1. Đăng ký tài khoản tại [uptimerobot.com](https://uptimerobot.com).
2. Nhấn **Add New Monitor**:
   - **Monitor Type:** `HTTP(s)`
   - **Friendly Name:** `TechPulse Render Keep-Alive`
   - **URL (or IP):** `https://shopchychy.foo.ng/api/health` *(hoặc `https://web-demo-app.onrender.com/api/health`)*
   - **Monitoring Interval:** Chọn **5 minutes** (hoặc 10 minutes)
3. Nhấn **Create Monitor**.

> [!TIP]
> Endpoint `GET /api/health` trả về kết quả JSON siêu nhẹ:
> ```json
> {
>   "status": "ok",
>   "uptime": 120,
>   "timestamp": "2026-10-26T08:04:34.960Z",
>   "service": "TechPulse Modular E-Commerce Engine"
> }
> ```
> Nhờ có ping tự động mỗi 5-10 phút, máy chủ Render sẽ luôn nhận định là có lưu lượng truy cập và **không bao giờ rơi vào trạng thái ngủ đông**.

---

## 6. Xử lý sự cố & Kiểm tra Logs trên Render

### 6.1. Xem nhật ký hoạt động thời gian thực (Live Logs)
- Truy cập mục **Logs** trong trang quản trị: [dashboard.render.com/web/srv-dbe83css728c73bbh7g0/logs](https://dashboard.render.com/web/srv-dbe83css728c73bbh7g0/logs)
- Khi khởi động thành công, log sẽ hiển thị:
  ```text
  ⚡ Đang khởi động hệ thống TechPulse E-Commerce Engine...
  ✅ Ket noi Supabase PostgreSQL thanh cong!
  🚀 TechPulse E-Commerce Server đang chạy tại: http://localhost:3000
  ```

### 6.2. Các lỗi thường gặp & Cách khắc phục:
1. **Lỗi `Port scan timeout`:**
   - Đảm bảo `server.js` lắng nghe trên `0.0.0.0` và cổng `process.env.PORT || 3000`.
2. **Lỗi `getaddrinfo ENOTFOUND` hoặc `Connection terminated unexpectedly`:**
   - Kiểm tra chuỗi `DATABASE_URL` trong mục Environment. Đảm bảo sử dụng cổng Pooler `6543` của Supabase.
3. **Lỗi `404 Not Found` khi truy cập đường dẫn con:**
   - Đã được xử lý triệt để trong `src/app.js` bằng wildcard fallback `app.get('*', ... res.sendFile('index.html'))`.
