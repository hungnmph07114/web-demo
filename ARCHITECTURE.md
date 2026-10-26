# ⚡ TECHPULSE MODULAR E-COMMERCE ENGINE
## Kiến trúc Quản lý Bán hàng Đa Biến thể & Cổng VietQR 24/7 (Lấy cảm hứng từ MedusaJS)

Hệ thống được tái cấu trúc và phát triển mới hoàn toàn theo tư duy **Clean Modular Architecture** của **MedusaJS** kết hợp cơ sở dữ liệu **PostgreSQL (Supabase)** và **Node.js (Express)**.

---

## 🏛️ 1. Cấu Trúc Thư Mục Chuẩn Doanh Nghiệp (Modular Architecture)

```text
hoctap/
├── .env                                  # Biến môi trường (DATABASE_URL, JWT_SECRET, VIETQR_*)
├── .gitignore                            # Loại trừ node_modules, medusa-source, TechPulse-E-Commerce
├── package.json                          # Khai báo Express, pg, bcryptjs, jsonwebtoken, cors
├── server.js                             # Entrypoint: Khởi tạo database, seed dữ liệu mẫu & lắng nghe port 3000
│
├── src/                                  # 🧠 TẦNG BACKEND MODULAR (Node.js)
│   ├── app.js                            # Express app cấu hình middleware, API proxy & fallback phục vụ React build
│   ├── config/
│   │   ├── db.js                         # Kết nối Supabase PostgreSQL Pool & Auto-migrate Schema
│   │   └── seed.js                       # Nạp dữ liệu mẫu đồ công nghệ, biến thể, voucher, tài khoản
│   ├── middlewares/
│   │   ├── auth.js                       # Xác thực JWT Token & Phân quyền Role Guard (Admin / Customer)
│   │   └── errorHandler.js               # Bắt lỗi tập trung (Global Exception Handler & 404 API)
│   ├── routes/
│   │   └── api.js                        # Điểm định tuyến API tập trung (/api/auth, /api/products, /api/orders...)
│   └── modules/                          # 📦 CÁC MODULE ĐỘC LẬP THEO TƯ DUY MEDUSA:
│       ├── auth/                         # Module Xác thực: Đăng nhập, Đăng ký, Profile
│       ├── product/                      # Module Sản phẩm: Categories, Products, Options, Variants (SKU, Giá, Tồn kho)
│       ├── promotion/                    # Module Khuyến mãi: Voucher Code, Giảm %, Giảm cố định, Điều kiện tối thiểu
│       ├── order/                        # Module Đơn hàng: Máy trạng thái kép (PaymentStatus & FulfillmentStatus), trừ kho, VietQR
│       └── dashboard/                    # Module Thống kê: Doanh thu thực nhận, cảnh báo tồn kho, doanh số theo nhóm
│
├── frontend/                             # ⚛️ TẦNG GIAO DIỆN REACTJS (Vite + React 19 + Lucide Icons)
│   ├── index.html                        # HTML Root cho React SPA
│   ├── vite.config.js                    # Cấu hình proxy /api -> http://localhost:3000
│   ├── package.json                      # React 19, Lucide Icons, Vite
│   ├── dist/                             # Bản build sản xuất tối ưu (được Express phục vụ trực tiếp)
│   └── src/
│       ├── index.css                     # Design System (Dark Slate, Glassmorphism, Micro-animations)
│       ├── App.jsx                       # Nhạc trưởng ứng dụng React: State toàn cục, giỏ hàng, phân quyền
│       ├── main.jsx                      # React 19 Root Render
│       ├── services/api.js               # API Client kèm tự động gắn JWT Bearer Header
│       └── components/                   # Hệ thống Component chuẩn Medusa:
│           ├── Navbar.jsx                # Header, Live Search, Mode Switcher, Giỏ hàng
│           ├── HeroBanner.jsx            # Banner công nghệ cao cấp kèm mã voucher
│           ├── CategoryFilter.jsx        # Bộ lọc danh mục dạng tabs
│           ├── ProductCard.jsx           # Card sản phẩm hiển thị khoảng giá và số biến thể
│           ├── ProductModal.jsx          # Bộ chọn biến thể động (Màu sắc, RAM/SSD, SKU, giá, tồn kho)
│           ├── CartDrawer.jsx            # Drawer giỏ hàng trượt mượt mà, áp mã giảm giá
│           ├── CheckoutModal.jsx         # Form đặt hàng & Trình diễn mã VietQR NAPAS 247 đếm ngược
│           ├── AuthModal.jsx             # Đăng nhập / Đăng ký kèm nút điền nhanh tài khoản
│           ├── AdminPortal.jsx           # Bảng điều khiển quản trị (Dashboard, Đơn hàng, Kho, Voucher)
│           └── Toast.jsx                 # Hệ thống thông báo nổi góc màn hình
│
└── public/                               # 🎨 Static assets & Fallback giao diện
```

---

## 💡 2. Những Tư Duy MedusaJS Đã Được Hiện Thực Hóa

### 1. Mô hình Biến thể Sản phẩm (Product Variants & Options)
* Thay vì 1 sản phẩm chỉ có 1 giá và 1 tồn kho, hệ thống phân tách:
  * `products`: Tên chung, mô tả, ảnh đại diện.
  * `product_options`: Danh mục thuộc tính (ví dụ: `Màu sắc`, `Dung lượng/Cấu hình`).
  * `product_variants`: Từng tổ hợp phiên bản cụ thể (Ví dụ: `Titan Tự Nhiên / 256GB` - SKU: `IP15PM-NT-256`, Giá: `29.990.000đ`, Tồn kho: `15`).
* Khách hàng chọn Màu và Dung lượng $\rightarrow$ Giao diện tự động nhảy giá và kiểm tra tồn kho chính xác của biến thể đó.

### 2. Máy Trạng Thái Kép Cho Đơn Hàng (Dual State Machine)
Tách biệt hoàn toàn 2 vòng đời:
* **Trạng thái Thanh toán (`payment_status`):**
  * `awaiting_vietqr`: Khách hàng đang quét mã QR (15 phút)
  * `captured`: Quản trị viên đối soát biến động số dư và xác nhận nhận tiền thành công
  * `refunded`: Đã hoàn tiền cho khách
* **Trạng thái Vận chuyển (`fulfillment_status`):**
  * `processing`: Đơn hàng mới tiếp nhận
  * `packing`: Đang đóng gói tại kho
  * `shipped`: Đã giao cho đơn vị vận chuyển
  * `delivered`: Khách hàng đã nhận máy
  * `canceled`: Đã hủy đơn

### 3. Tích Hợp Cổng VietQR Chuẩn NAPAS 247
* Tạo ảnh VietQR động theo từng đơn hàng từ dịch vụ `img.vietqr.io`.
* Tự động điền: **Số tài khoản**, **Số tiền chính xác đến từng đồng**, **Nội dung chuyển khoản chứa mã đơn hàng**.
* Đồng hồ đếm ngược 15 phút bảo mật.
* Hỗ trợ nút sao chép nhanh (1-Click Copy) cho khách hàng.

### 4. Quản Lý Kho & Trừ Tồn Kho Thời Gian Thực
* Khi khách hàng đặt hàng thành công, hệ thống sử dụng Transaction của PostgreSQL (`BEGIN ... FOR UPDATE ... COMMIT`) để kiểm tra tồn kho từng biến thể và trừ trực tiếp `inventory_quantity`.
* Nếu số lượng mua vượt quá số lượng còn lại trong kho, hệ thống trả về thông báo lỗi chi tiết kèm số lượng máy còn lại.

---

## 🔑 3. Tài Khoản Trải Nghiệm Có Sẵn

Hệ thống đã tự động tạo sẵn 2 tài khoản mẫu:

| Vai trò | Email đăng nhập | Mật khẩu | Quyền hạn |
| :--- | :--- | :--- | :--- |
| 👑 **Quản trị viên (Admin)** | `admin@techpulse.vn` | `admin123` | Toàn quyền xem Dashboard, Quản lý đơn hàng, Xác nhận thanh toán VietQR, Cập nhật tiến độ giao hàng, Xem tồn kho |
| 👤 **Khách hàng (Customer)** | `user@techpulse.vn` | `user123` | Xem sản phẩm, Chọn biến thể cấu hình, Thêm giỏ hàng, Áp mã voucher, Đặt hàng VietQR |

*(Trên giao diện đăng nhập có sẵn nút **"⚡ Điền nhanh tài khoản thử nghiệm"** để đăng nhập 1 chạm).*

---

## 🏷️ 4. Mã Khuyến Mãi Có Sẵn Để Thử Nghiệm

* `TECHPULSE50K`: Giảm trực tiếp **50.000đ** cho đơn từ 500.000đ.
* `VIP10`: Giảm **10%** (tối đa 2.000.000đ) cho đơn từ 15.000.000đ.
* `FREESHIP`: Miễn phí giao hàng (trợ giá 30.000đ).
