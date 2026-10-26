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

### 5. Cổng Webhook VietQR 24/7 Tự Động Khớp Tiền Tức Thì
* **Tự động bắt Webhook từ SePay / Casso / Open Banking:**
  * Endpoint: `POST /api/webhooks/vietqr`
  * Thuật toán Regex tự động bóc tách mã đơn `TP-xxxx` từ nội dung chuyển khoản.
  * Tự động kiểm tra đối soát số tiền chuyển so với `order.total_amount`.
  * Khớp thành công $\rightarrow$ Chuyển `payment_status = 'captured'`, lưu mã GD ngân hàng vào `transaction_ref`, tự động ghi nhật ký `order_logs` và `webhook_logs`.
* **Trình giả lập Webhook (Simulator):**
  * Endpoint: `POST /api/webhooks/vietqr/simulate`
  * Cung cấp nút bấm 1 chạm trên giao diện khách hàng và Admin để thử nghiệm luồng tiền mà không cần dùng tiền thật.
* **Cơ chế Polling Realtime:** Màn hình thanh toán và Tra cứu đơn hàng tự động thăm dò mỗi 2.5s để chúc mừng và hiển thị xác nhận đã nhận tiền ngay khi Webhook kích hoạt.

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

---

## ⭐ 5. Module Đánh Giá & Chấm Sao Khách Hàng (Reviews Module)

* **Bảng dữ liệu `reviews`**: Lưu trữ `product_id`, `user_id`, `user_name`, `rating` (1-5★), `title`, `comment`, `verified_purchase`, `created_at`.
* **Xác thực mua hàng tự động (`verified_purchase`)**: Hệ thống tự động kiểm tra xem khách hàng đã từng có đơn hàng hoàn tất (`captured` hoặc `delivered`) chứa biến thể của sản phẩm đó hay chưa để gắn huy hiệu xanh **"Đã mua tại TechPulse ✅"**.
* **Thống kê điểm & phân bổ sao**:
  * `averageRating`: Điểm trung bình làm tròn 1 chữ số thập phân (VD: 4.8 / 5.0).
  * `distribution`: Đếm số lượng đánh giá theo từng bậc 5★, 4★, 3★, 2★, 1★ kèm thanh % trực quan.
  * Lọc linh hoạt theo số sao hoặc chỉ xem đơn đã mua hàng thực tế.
* **Tích hợp giao diện**:
  * Hiển thị điểm sao trên từng card sản phẩm (`ProductCard.jsx`).
  * Bảng điều khiển đánh giá và form nhận xét tương tác trực tiếp trong modal chi tiết sản phẩm (`ProductModal.jsx` & `ProductReviews.jsx`).

---

## 📊 6. Tiện Ích Vận Hành: Xuất Excel & In Hóa Đơn

* **Xuất Excel / CSV chuẩn UTF-8**: Hàm `exportOrdersToCSV` bổ sung ký tự UTF-8 BOM (`\uFEFF`), hỗ trợ mở trực tiếp trong Microsoft Excel mà không bị lỗi font chữ tiếng Việt có dấu. Cho phép xuất toàn bộ đơn hoặc theo bộ lọc tìm kiếm.
* **In hóa đơn đóng gói (`🖨️ In Hóa Đơn`)**: Mở cửa sổ in ấn chuyên nghiệp với định dạng chuẩn phiếu giao hàng thương mại điện tử, bao gồm thông tin người gửi, người nhận, bảng danh sách sản phẩm, biến thể, đơn giá, mã giảm giá và tổng thanh toán.

---

## 💖 7. Module Danh Sách Yêu Thích (Wishlist Module)

* **Bảng dữ liệu `wishlists`**: Khóa duy nhất `UNIQUE(user_id, product_id)` lưu trữ các sản phẩm được người dùng yêu thích.
* **Cơ chế Lưu trữ Lai (Hybrid Persistence)**:
  * Khách vãng lai chưa đăng nhập: Lưu trữ danh sách ID yêu thích trong `localStorage` (`techpulse_wishlist`).
  * Khi đăng nhập tài khoản: Tự động gọi endpoint `POST /api/wishlist/sync` để đồng bộ hợp nhất danh sách từ thiết bị lên tài khoản máy chủ.
  * Thao tác 1 chạm `POST /api/wishlist/toggle`: Bật/tắt trạng thái yêu thích tức thời.
* **Tích hợp giao diện**:
  * Nút thả tim nổi trên từng thẻ sản phẩm (`ProductCard.jsx`) với hiệu ứng scale và tim đỏ rực.
  * Nút lưu yêu thích trong modal chi tiết sản phẩm (`ProductModal.jsx`).
  * Nút **Yêu thích** trên Navbar kèm huy hiệu đếm số lượng thời gian thực (`Navbar.jsx`).
  * Drawer danh sách yêu thích trượt từ bên phải ([`WishlistDrawer.jsx`](file:///c:/Users/84123/OneDrive/Desktop/hoctap/frontend/src/components/WishlistDrawer.jsx)) giúp khách hàng dễ dàng xem lại, theo dõi mức giá và mở nhanh cấu hình để đặt hàng.

---

## 🚚 8. Module Giao Vận & Lộ Trình Bưu Tá Thời Gian Thực (Shipping & Logistics)

* **Bảng dữ liệu `shipment_tracking_events`**: Lưu vết từng mốc bưu cục (`hub_name`), trạng thái (`status`), ghi chú chi tiết (`description`) và mốc thời gian thực (`created_at`).
* **Hỗ trợ 4 đơn vị vận chuyển lớn**:
  * ⚡ **Giao Hàng Nhanh Express (GHN)**: Hotline 1900 636677.
  * 🛵 **Giao Hàng Tiết Kiệm (GHTK)**: Hotline 1900 6092.
  * 📮 **Viettel Post (VTP Logistics)**: Hotline 1900 8095.
  * 🚀 **TechPulse Now Hỏa Tốc (2 Giờ)**: Dành cho nội thành Hà Nội & TP.HCM.
* **Mã vận đơn & Thẻ bưu tá**:
  * Tự động sinh mã vận đơn chuẩn hãng (VD: `GHN-HN839102`, `GHTK-66863626`).
  * Thông tin bưu tá giao hàng (Họ tên, Số điện thoại hỗ trợ bấm gọi trực tiếp, Dự kiến ngày nhận).
* **Công cụ giả lập tiến trình cho Quản trị viên (Admin Simulator)**:
  * Nút bấm `⚡ Mô phỏng mốc bưu tá tiếp theo` trong [`AdminOrderDetailModal.jsx`](file:///c:/Users/84123/OneDrive/Desktop/hoctap/frontend/src/components/AdminOrderDetailModal.jsx) cho phép quản trị viên giả lập kiện hàng qua các trạm (Xuất kho -> Trung chuyển SOC -> Bưu tá đi giao -> Khách ký nhận).
  * Tự động đồng bộ trạng thái giao vận `fulfillment_status` tương ứng.
* **Tra cứu công khai trực quan ([`OrderTrackingModal.jsx`](file:///c:/Users/84123/OneDrive/Desktop/hoctap/frontend/src/components/OrderTrackingModal.jsx))**:
  * Khách hàng nhập mã đơn (hoặc bấm từ màn hình "Đơn của tôi") để theo dõi timeline lộ trình bưu cục chi tiết với chấm xanh phát sáng ở mốc mới nhất.

---

## 🐳 9. Đóng Gói Container & Triển Khai Production (Docker & Cloud)

* **Multi-stage Dockerfile ([`Dockerfile`](file:///c:/Users/84123/OneDrive/Desktop/hoctap/Dockerfile))**:
  * **Stage 1 (Frontend Builder)**: Sử dụng `node:20-alpine` build React SPA, tối ưu hóa bundle.
  * **Stage 2 (Runner)**: Chạy với người dùng bảo mật `non-root`, phục vụ toàn bộ API Express và giao diện React từ `frontend/dist`.
  * Tích hợp sẵn `HEALTHCHECK` tự động probe endpoint `/api/health`.
* **Cấu hình Docker Compose ([`docker-compose.yml`](file:///c:/Users/84123/OneDrive/Desktop/hoctap/docker-compose.yml))**:
  * Chạy trọn gói ứng dụng `app` kèm tùy chọn cơ sở dữ liệu `db` PostgreSQL nội bộ có sẵn volume lưu trữ bền vững.
* **Tài liệu hướng dẫn triển khai ([`DEPLOYMENT.md`](file:///c:/Users/84123/OneDrive/Desktop/hoctap/DEPLOYMENT.md))**:
  * Hướng dẫn chi tiết từng bước deploy lên Render, Railway, VPS Ubuntu (PM2 & Nginx) và cấu hình Supabase Connection Pooler (cổng 6543).
