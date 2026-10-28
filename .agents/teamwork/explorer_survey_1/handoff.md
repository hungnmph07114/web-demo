# BÁO CÁO KHẢO SÁT KIẾN TRÚC TOÀN DIỆN HỆ THỐNG
**Agent**: Explorer 1 (Architecture Explorer)  
**Mục tiêu**: Khảo sát, định vị kiến trúc, tech stack, sơ đồ thư mục, các module chức năng, luồng dữ liệu, phụ thuộc liên module và danh mục toàn bộ tệp tin trong repository.  
**Thư mục làm việc**: `c:\Users\84123\OneDrive\Desktop\hoctap\.agents\teamwork\explorer_survey_1\`

---

## 1. Observation (Các Quan Sát Thực Tế & Bằng Chứng Mã Nguồn)

### 1.1. Tổng quan Dự án & Hồ sơ Kỹ thuật
- **Tên dự án thực tế**: `TechPulse / ATELIER & CO. Modular E-Commerce Engine` (được định danh là `render-supabase-demo` trong `package.json:2`).
- **Mục tiêu / Bản chất hệ thống**: Nền tảng thương mại điện tử đa ngành (Flagship Retail Store) và quản trị bán hàng đa biến thể lấy cảm hứng từ kiến trúc của **MedusaJS**, tích hợp cổng thanh toán VietQR NAPAS 24/7 tự động đối soát qua Webhook ngân hàng (SePay / Casso / MBBank), quản lý kho theo thời gian thực (ACID Transaction với khóa dòng `FOR UPDATE`), lộ trình bưu tá đa đối tác (GHN, GHTK, Viettel Post, Hỏa tốc 2H), thông báo email giao dịch (Nodemailer), đánh giá sản phẩm có chứng nhận mua hàng và danh sách yêu thích lưu trữ lai.
- **Mô hình kiến trúc tổng thể**: Monorepo tích hợp / Unified Fullstack Application.
  - Tầng Backend phục vụ API chuẩn RESTful tại tiền tố `/api`.
  - Tầng Frontend React 19 SPA (Vite) được build tĩnh ra `frontend/dist` và được Express phục vụ trực tiếp tại root (`*`), có cơ chế fallback sang `public/` (giao diện HTML/JS thuần tĩnh cũ).
  - Tầng Cơ sở dữ liệu: Kết nối đám mây Supabase PostgreSQL qua giao thức Connection Pooler (cổng 6543 SSL), có cơ chế tự động chuyển đổi sang Embedded PostgreSQL Engine (`@electric-sql/pglite`) lưu trữ cục bộ tại `.pglite-data` nếu mạng ngoại vi hoặc thông tin database Supabase không khả dụng.

### 1.2. Tech Stack Chi Tiết
Dữ liệu đối chiếu từ `package.json` và `frontend/package.json`:

| Phân tầng | Công nghệ / Thư viện | Phiên bản | Vai trò & Mục đích sử dụng |
| :--- | :--- | :--- | :--- |
| **Backend Runtime** | Node.js | `>= 20.x` | Môi trường thực thi JavaScript server-side |
| **Web Framework** | Express.js | `^4.19.2` | Bộ định tuyến HTTP, middleware, phục vụ API & static SPA |
| **Database Client** | `pg` (node-postgres) | `^8.11.5` | Quản lý Connection Pool kết nối Supabase PostgreSQL |
| **Fallback DB Engine**| `@electric-sql/pglite`| `^0.5.11` | PostgreSQL WASM nhúng chạy offline không cần máy chủ ngoài |
| **Bảo mật & Auth** | `jsonwebtoken` | `^9.0.3` | Tạo và giải mã JWT token (thời hạn 7 ngày) |
| | `bcryptjs` | `^3.0.3` | Mã hóa salt băm mật khẩu người dùng (cost factor 10) |
| **CORS & Middleware**| `cors` | `^2.8.5` | Cho phép Cross-Origin Resource Sharing |
| **Biến môi trường** | `dotenv` | `^16.4.5` | Đọc cấu hình từ tệp `.env` vào `process.env` |
| **Gửi Email** | `nodemailer` | `^10.2.1` | Gửi email giao dịch (Gmail SMTP, Ethereal test, jsonTransport)|
| **Xử lý Bảng tính** | `xlsx` | `^0.18.5` | Tạo và xuất file Excel bàn giao nhiều sheet chuẩn UTF-8 |
| **Frontend Framework**| React | `^19.0.0` | Thư viện UI xây dựng Storefront & Admin Portal |
| **Frontend DOM** | `react-dom` | `^19.0.0` | Render cây component React 19 |
| **Bundler / Build** | Vite | `^6.2.0` | HMR dev server & tối ưu hóa bundle sản xuất |
| **Vite Plugin** | `@vitejs/plugin-react`| `^4.3.4` | Biên dịch JSX/React Fast Refresh |
| **Bộ Icon** | `lucide-react` | `^0.475.0` | Hệ thống vector icon giao diện người dùng |
| **Đóng gói Container**| Docker & Docker Compose | Multi-stage | Image node:20-alpine chia 2 stage (Build & Non-root Runner) |

### 1.3. Điểm Vào Chính (Primary Entry Points)
1. **Backend Server Entrypoint**: `server.js`
   - Khởi động môi trường qua `dotenv.config()`.
   - Khởi tạo kết nối DB và tự động chạy schema migration qua `initDatabase()` (`src/config/db.js:161`).
   - Nạp dữ liệu khởi tạo mặc định (admin, store settings, categories, products, orders mẫu) qua `seedDatabase()` (`src/config/seed.js:227`).
   - Lưu trữ `dbReadyPromise` vào `app.locals.dbReadyPromise` để làm barrier đồng bộ các request API đầu tiên (`server.js:22`).
   - Lắng nghe cổng mạng `process.env.PORT || 3000` trên giao diện mạng `0.0.0.0` (`server.js:24`).
   - Thiết lập cron job chạy ngầm định kỳ mỗi 60 giây (`server.js:36-49`) gọi `orderService.expireStaleVietQROrders(30)` để tự động hủy các đơn hàng VietQR chưa thanh toán quá 30 phút và hoàn lại tồn kho.
2. **Backend Application Config**: `src/app.js`
   - Cấu hình middleware an ninh `securityHeaders` (`src/middlewares/security.js:6`), `cors()`, `express.json({ limit: '12mb' })`.
   - Mount thư mục ảnh tải lên `/uploads` tĩnh từ `public/uploads` (`src/app.js:31`).
   - Phục vụ bản build React `frontend/dist` (hoặc fallback `public/`) (`src/app.js:34-39`).
   - Barrier chặn request `/api` nếu DB chưa sẵn sàng (`src/app.js:42-51`).
   - Mount API Router tại `/api` (`src/routes/api.js`).
   - Fallback route `app.get('*')` phục vụ `index.html` của SPA (`src/app.js:57-63`).
   - Global error handler (`src/middlewares/errorHandler.js:1-9`).
3. **API Routing Dispatcher**: `src/routes/api.js`
   - Khai báo 10 nhóm router tương ứng với 10 module chức năng.
4. **Frontend Client Entrypoint**: `frontend/src/main.jsx`
   - Mount React 19 Root Render vào thẻ `#root` trong `frontend/index.html`.
5. **Frontend Core Orchestrator**: `frontend/src/App.jsx`
   - Quản lý toàn bộ State ứng dụng: Giỏ hàng (`cart`), Bộ lọc (`categories`, `priceRange`, `inStockOnly`, `sortBy`, `searchQuery`), Theme (`light`/`dark`), Danh sách yêu thích (`wishlistIds`), Phiên đăng nhập (`user`, `token`), Điều hướng chế độ (`viewMode`: `'store'` hoặc `'admin'`).
6. **Docker Entrypoint**: `Dockerfile` (Multi-stage)
   - Stage 1: `node:20-alpine` (`WORKDIR /app/frontend`), chạy `npm ci && npm run build`.
   - Stage 2: `node:20-alpine` (`WORKDIR /app`), tạo user `techpulse` (UID 1001), cài dependency backend, copy `frontend/dist` từ Stage 1, cấu hình `HEALTHCHECK` tại `/api/health`, chạy `CMD ["node", "server.js"]`.

### 1.4. Cấu Trúc Cơ Sở Dữ Liệu (15 Bảng Quan Hệ)
Được định nghĩa chi tiết trong `src/config/db.js` (lines 161–432):

| STT | Tên Bảng (Table) | Khóa Chính | Khóa Ngoại / Quan Hệ | Mục Đích Lưu Trữ |
| :--- | :--- | :--- | :--- | :--- |
| 1 | `users` | `id SERIAL` | Không | Tài khoản khách hàng & quản trị viên (`role`: `'customer'`, `'admin'`), mật khẩu băm bcrypt |
| 2 | `categories` | `id SERIAL` | Không | Ngành hàng / danh mục (`slug` UNIQUE, `icon`, `name`, `description`) |
| 3 | `products` | `id SERIAL` | `category_id -> categories(id)` | Sản phẩm gốc (`slug` UNIQUE, `thumbnail`, `is_published`) |
| 4 | `product_options` | `id SERIAL` | `product_id -> products(id)` ON DELETE CASCADE | Thuộc tính tùy chọn (Màu sắc, Kích cỡ, Dung tích, Chất liệu) |
| 5 | `product_variants`| `id SERIAL` | `product_id -> products(id)` ON DELETE CASCADE | Biến thể SKU (`sku` UNIQUE, `price`, `inventory_quantity`, `options_json` JSONB) |
| 6 | `promotions` | `id SERIAL` | Không | Mã giảm giá (`code` UNIQUE, `type`: `percentage`/`fixed`, `min_order_value`, `max_discount`, `usage_limit`, `usage_count`) |
| 7 | `orders` | `id SERIAL` | `user_id -> users(id)` ON DELETE SET NULL | Đơn hàng với Máy trạng thái kép (`payment_status`, `fulfillment_status`), thông tin giao vận, mã VietQR |
| 8 | `order_items` | `id SERIAL` | `order_id -> orders(id)`, `variant_id -> product_variants(id)` | Chi tiết mặt hàng biến thể được đặt mua, số lượng, đơn giá chốt lúc mua |
| 9 | `order_logs` | `id SERIAL` | `order_id -> orders(id)` ON DELETE CASCADE | Nhật ký lịch sử các sự kiện và chuyển đổi trạng thái của đơn |
| 10 | `webhook_logs` | `id SERIAL` | `order_id -> orders(id)` ON DELETE SET NULL | Lịch sử tín hiệu biến động số dư Open Banking VietQR (`raw_payload` JSONB) |
| 11 | `reviews` | `id SERIAL` | `product_id -> products(id)`, `user_id -> users(id)` | Đánh giá sao (1–5★), nhận xét kèm cờ `verified_purchase` |
| 12 | `wishlists` | `id SERIAL` | `user_id -> users(id)`, `product_id -> products(id)` | Danh sách yêu thích, ràng buộc `UNIQUE(user_id, product_id)` |
| 13 | `shipment_tracking_events` | `id SERIAL` | `order_id -> orders(id)` ON DELETE CASCADE | Các mốc lộ trình bưu cục (Checkpoints: `status`, `hub_name`, `description`) |
| 14 | `email_logs` | `id SERIAL` | `order_id -> orders(id)` ON DELETE SET NULL | Nhật ký email giao dịch gửi qua Nodemailer (`template_type`, `preview_url`) |
| 15 | `store_settings` | `id INT (1)`| Khóa duy nhất `id = 1` | Cấu hình thương hiệu cửa hàng, ngân hàng VietQR thụ hưởng, biểu phí ship |

### 1.5. Cấu Trúc 10 Module Backend (`src/modules/`)
1. **`auth` (`authController.js`, `authService.js`)**: Đăng nhập, đăng ký, lấy thông tin cá nhân (`/auth/me`), cập nhật hồ sơ, đổi mật khẩu.
2. **`product` (`productController.js`, `productService.js`)**: Quản trị cấu hình cửa hàng (`store_settings`), upload ảnh base64 sang tệp vật lý tại `public/uploads`, CRUD danh mục (`categories`), CRUD sản phẩm (`products`), CRUD biến thể SKU (`product_variants`).
3. **`promotion` (`promotionController.js`, `promotionService.js`)**: Danh sách voucher, kiểm tra hợp lệ coupon (`/promotions/validate`), tạo voucher mới, bật/tắt kích hoạt voucher (`toggle`).
4. **`order` (`orderController.js`, `orderService.js`)**: Tạo đơn hàng ACID Transaction (trừ kho với `FOR UPDATE`), tra cứu đơn hàng, đơn hàng của tôi (`my-orders`), hủy đơn hoàn kho (`cancelMyOrder`), cập nhật thanh toán/giao vận, cron tự động thu hồi đơn quá hạn VietQR 30 phút.
5. **`dashboard` (`dashboardController.js`, `dashboardService.js`)**: Tổng hợp số liệu tài chính: Doanh thu thực nhận (`payment_status = 'captured'`), số lượng đơn theo trạng thái, doanh số theo ngành hàng, cảnh báo biến thể sắp hết kho (`inventory_quantity <= 8`), top sản phẩm bán chạy.
6. **`webhook` (`webhookController.js`, `webhookService.js`)**: Tiếp nhận tín hiệu biến động số dư VietQR (`/webhooks/vietqr`), trích xuất regex mã đơn `TP-xxxx`, kiểm tra số tiền khớp lệnh, cập nhật `payment_status = 'captured'`, giả lập Webhook (`/webhooks/vietqr/simulate`), nhật ký webhook logs.
7. **`review` (`reviewController.js`, `reviewService.js`)**: Lấy danh sách đánh giá sản phẩm kèm tính điểm trung bình & phân bổ số sao, tạo nhận xét mới (tự động truy vấn lịch sử mua hàng để cấp cờ `verified_purchase`), xóa review.
8. **`wishlist` (`wishlistController.js`, `wishlistService.js`)**: Tra cứu sản phẩm yêu thích của user, bật/tắt yêu thích (`toggle`), đồng bộ danh sách từ LocalStorage lên database (`sync`).
9. **`shipping` (`shippingController.js`, `shippingService.js`)**: Tra cứu lộ trình bưu tá chi tiết theo mã đơn (`/shipping/tracking/:idOrDisplayId`), gán hãng vận chuyển (GHN, GHTK, Viettel Post, Hỏa tốc 2H) và bưu tá, giả lập bước di chuyển bưu cục tiếp theo (`simulate-step`).
10. **`notification` (`notificationController.js`, `notificationService.js`)**: Dịch vụ gửi email thông báo tự động (Xác nhận đặt hàng kèm QR, thông báo thanh toán thành công, thông báo bưu tá đi giao hàng), lưu vết `email_logs`, endpoint gửi email thử nghiệm.

### 1.6. Danh Mục 20 Component Frontend (`frontend/src/components/`)
1. `Navbar.jsx`: Thanh điều hướng chính, logo thương hiệu động, ô tìm kiếm Live Search, nút chuyển đổi Cửa hàng / Quản trị, bộ chọn Theme Sáng / Tối, nút Đơn của tôi, Tra cứu đơn, Yêu thích và Giỏ hàng.
2. `HeroBanner.jsx`: Banner hình ảnh Editorial với tiêu đề, phụ đề, ảnh banner động từ `store_settings` và dải voucher kèm nút sao chép 1-click.
3. `CategoryFilter.jsx`: Bộ lọc danh mục dạng tab, kết hợp thanh lọc nâng cao (khoảng giá 4 nấc, chỉ hiển thị còn hàng, sắp xếp theo giá / mới nhất).
4. `ProductCard.jsx`: Thẻ sản phẩm chuẩn Editorial, hiển thị ảnh tỉ lệ 4:3, tên danh mục, tiêu đề, khoảng giá min-max, số biến thể, điểm sao đánh giá và nút thả tim yêu thích.
5. `ProductModal.jsx`: Modal chi tiết sản phẩm, bộ chọn biến thể động (Màu sắc, Size, Dung tích...), tự động cập nhật giá, SKU và tồn kho khi chọn option; tích hợp form đánh giá và danh sách nhận xét khách hàng.
6. `ProductReviews.jsx`: Component hiển thị chi tiết điểm trung bình, thanh phân bổ 1-5 sao, huy hiệu "Đã mua tại cửa hàng ✅" và form gửi nhận xét.
7. `CartDrawer.jsx`: Drawer giỏ hàng trượt từ phải sang, tăng giảm số lượng (kiểm soát trần tồn kho), xóa món, nhập mã voucher và hiển thị tạm tính/chiết khấu.
8. `CheckoutModal.jsx`: Form nhập thông tin người nhận (Họ tên, SĐT, Tỉnh/thành, Địa chỉ, Ghi chú), lựa chọn hình thức (VietQR hoặc COD); màn hình hiển thị mã VietQR động NAPAS 247 kèm đồng hồ đếm ngược 15 phút và cơ chế tự động thăm dò kết quả thanh toán.
9. `OrderTrackingModal.jsx`: Modal tra cứu hành trình đơn hàng công khai, hiển thị timeline bưu cục, mã vận đơn, thông tin bưu tá (họ tên, SĐT gọi trực tiếp), và nút giả lập thanh toán nhanh.
10. `MyOrdersModal.jsx`: Danh sách các đơn hàng đã đặt của tài khoản khách hàng, trạng thái thanh toán/vận chuyển, nút xem chi tiết và nút tự hủy đơn (nếu chưa đóng gói).
11. `WishlistDrawer.jsx`: Drawer danh sách sản phẩm yêu thích trượt từ bên phải, hiển thị giá và nút mở nhanh cấu hình để đặt hàng.
12. `AuthModal.jsx`: Modal đăng nhập và đăng ký tài khoản, tích hợp nút điền nhanh tài khoản demo Admin (`admin@techpulse.vn`) và Customer (`user@techpulse.vn`).
13. `AdminPortal.jsx`: Bảng điều khiển quản trị trung tâm với 8 tab: Dashboard, Quản lý Đơn hàng, Sản phẩm & Biến thể SKU, Mã Khuyến Mãi, Thương hiệu & Cài đặt, Cổng Webhook VietQR, Nhật ký Email, và Cẩm nang Tài liệu Vận hành.
14. `AdminOrderDetailModal.jsx`: Chi tiết đơn hàng phía Admin: đối soát thanh toán, đổi trạng thái giao vận, cập nhật đối tác vận chuyển, mô phỏng mốc bưu cục và in hóa đơn giao hàng.
15. `AdminCreateProductModal.jsx`: Form tạo sản phẩm mới, upload ảnh đại diện và tạo danh sách các biến thể ban đầu.
16. `AdminEditProductModal.jsx`: Form cập nhật thông tin chung, mô tả, ảnh và danh mục của sản phẩm.
17. `AdminVariantEditModal.jsx`: Form chỉnh sửa chi tiết từng biến thể: SKU, giá bán, giá gốc, tồn kho và các thuộc tính JSON.
18. `AdminCreatePromoModal.jsx`: Form tạo mã khuyến mãi mới (theo % hoặc số tiền cố định, giá trị đơn tối thiểu, chiết khấu tối đa, giới hạn lượt dùng).
19. `AdminDocsTab.jsx`: Tab tài liệu hướng dẫn kỹ thuật trên giao diện Admin, hiển thị thông số kết nối, liên kết UptimeRobot, Render dashboard và hướng dẫn cấu hình môi trường.
20. `Toast.jsx`: Hệ thống thông báo nổi (Toast notifications) góc màn hình, tự động biến mất sau 3.5 giây.

### 1.7. Danh Mục Toàn Bộ 70 Tệp Tin Trong Repository (Phân Loại & Vai Trò)
Dưới đây là danh mục toàn diện tất cả các tệp mã nguồn và cấu hình trong không gian làm việc (loại trừ `node_modules`, `.git`, `.agents`, `.pglite-data`):

| STT | Đường Dẫn Tệp | Kích Thước | Vai Trò & Chức Năng Cụ Thể |
| :--- | :--- | :--- | :--- |
| **Gốc Dự Án (Root)** | | | |
| 1 | `package.json` | 636 B | Định nghĩa dự án backend Node.js, khai báo dependencies chính và scripts (`start`, `dev`, `build`) |
| 2 | `package-lock.json` | 47,354 B | Khóa phiên bản chi tiết của cây dependency backend |
| 3 | `bun.lock` | 20,495 B | Tệp khóa package nếu sử dụng Bun runtime |
| 4 | `server.js` | 2,110 B | Điểm khởi chạy chính: kết nối DB, seed dữ liệu mẫu, lắng nghe port 3000, chạy cron expire đơn VietQR |
| 5 | `.env` | 379 B | Tệp biến môi trường cục bộ (DATABASE_URL, JWT_SECRET, VIETQR_*) |
| 6 | `.env.example` | 256 B | Tệp mẫu hướng dẫn cấu hình biến môi trường cho lập trình viên |
| 7 | `.gitignore` | 72 B | Khai báo các thư mục và tệp tin bị loại trừ khỏi theo dõi Git |
| 8 | `.dockerignore` | 178 B | Khai báo các thư mục và tệp tin bị loại trừ khi build Docker image |
| 9 | `Dockerfile` | 1,566 B | Tệp cấu hình Docker đa tầng (Multi-stage: build React SPA và chạy Node.js non-root) |
| 10 | `docker-compose.yml` | 1,699 B | Cấu hình triển khai container `app` và cơ sở dữ liệu `db` PostgreSQL 16 local |
| 11 | `render.yaml` | 227 B | Blueprint cấu hình triển khai hạ tầng Web Service tự động trên Render.com |
| 12 | `metadata.json` | 395 B | Tệp mô tả thông tin và giới hạn môi trường của dự án |
| 13 | `ARCHITECTURE.md` | 15,293 B | Tài liệu đặc tả kiến trúc kỹ thuật hệ thống, các tư duy MedusaJS và hướng dẫn vận hành |
| 14 | `DEPLOYMENT.md` | 6,087 B | Hướng dẫn chi tiết triển khai lên Docker, Render, Railway, VPS Ubuntu (PM2 & Nginx) |
| 15 | `HUONG_DAN_TRIEN_KHAI_RENDER.md` | 14,031 B | Cẩm nang chi tiết triển khai ứng dụng lên Render.com từ A-Z |
| 16 | `HO_SO_BAN_GIAO_HE_THONG_ATELIER.xlsx` | 51,887 B | Tệp bảng tính Excel 8 sheet tổng hợp toàn bộ hồ sơ kỹ thuật, KPI và hướng dẫn bàn giao |
| **Backend Source (`src/`)** | | | |
| 17 | `src/app.js` | 2,098 B | Cấu hình ứng dụng Express: middleware, static files, barrier chờ DB, router API, error handlers |
| 18 | `src/config/db.js` | 16,511 B | Quản lý kết nối Pool PostgreSQL Supabase / PGlite fallback và khởi tạo schema 15 bảng |
| 19 | `src/config/seed.js` | 23,951 B | Khởi tạo dữ liệu mẫu: tài khoản Admin/User, Store Settings, 5 ngành hàng, 6 sản phẩm đa biến thể, đơn hàng mẫu |
| 20 | `src/middlewares/auth.js` | 1,414 B | Middleware xác thực JWT token (`authenticate`, `optionalAuth`) và phân quyền Admin (`requireAdmin`) |
| 21 | `src/middlewares/security.js` | 2,292 B | Middleware thiết lập HTTP Security Headers và bộ giới hạn tần suất sliding-window theo IP |
| 22 | `src/middlewares/errorHandler.js` | 575 B | Bộ xử lý lỗi tập trung (Global Exception Handler & 404 Not Found Handler) |
| 23 | `src/routes/api.js` | 8,524 B | Bộ định tuyến trung tâm mount toàn bộ endpoints của 10 module chức năng |
| 24 | `src/modules/auth/authController.js` | 1,587 B | Điều phối HTTP request/response cho luồng đăng nhập, đăng ký, thông tin tài khoản |
| 25 | `src/modules/auth/authService.js` | 4,328 B | Xử lý logic nghiệp vụ xác thực người dùng, băm mật khẩu bcrypt, tạo JWT token |
| 26 | `src/modules/product/productController.js` | 6,273 B | Điều phối request cho sản phẩm, upload ảnh base64, danh mục và cấu hình cửa hàng |
| 27 | `src/modules/product/productService.js` | 14,247 B | Xử lý nghiệp vụ danh mục, cấu hình thương hiệu/ngân hàng, truy vấn lọc sản phẩm và biến thể SKU |
| 28 | `src/modules/promotion/promotionController.js` | 1,320 B | Điều phối request cho danh sách, kiểm tra hợp lệ và tạo mã khuyến mãi |
| 29 | `src/modules/promotion/promotionService.js` | 3,092 B | Xử lý logic kiểm tra điều kiện áp mã (đơn tối thiểu, hạn mức %, số lượt dùng, giảm tối đa) |
| 30 | `src/modules/order/orderController.js` | 3,344 B | Điều phối request tạo đơn, danh sách đơn, chi tiết đơn, hủy đơn và cập nhật trạng thái |
| 31 | `src/modules/order/orderService.js` | 22,038 B | Xử lý nghiệp vụ đơn hàng: ACID Transaction, khóa dòng `FOR UPDATE`, trừ kho, sinh VietQR, cron hủy đơn |
| 32 | `src/modules/dashboard/dashboardController.js` | 321 B | Điều phối request lấy số liệu thống kê Dashboard Admin |
| 33 | `src/modules/dashboard/dashboardService.js` | 4,198 B | Truy vấn thống kê tài chính: doanh thu thực nhận, cảnh báo tồn kho, top bán chạy, cơ cấu ngành |
| 34 | `src/modules/webhook/webhookController.js` | 2,852 B | Điều phối webhook tiếp nhận biến động số dư ngân hàng VietQR và endpoint giả lập simulator |
| 35 | `src/modules/webhook/webhookService.js` | 8,452 B | Bóc tách regex mã đơn TP-xxxx từ nội dung CK, đối soát số tiền, chuyển `payment_status = 'captured'` |
| 36 | `src/modules/review/reviewController.js` | 1,993 B | Điều phối request đánh giá sản phẩm (lấy danh sách, tạo review, xóa review) |
| 37 | `src/modules/review/reviewService.js` | 4,213 B | Xử lý đánh giá sản phẩm: tính sao trung bình, phân bổ 1-5★, xác thực đơn mua (`verified_purchase`) |
| 38 | `src/modules/shipping/shippingController.js` | 1,693 B | Điều phối request tra cứu vận đơn, gán hãng vận chuyển và mô phỏng tiến trình giao vận |
| 39 | `src/modules/shipping/shippingService.js` | 8,370 B | Xử lý nghiệp vụ logistics: metadata 4 nhà vận chuyển (GHN, GHTK, VTP, Hỏa tốc), timeline checkpoints |
| 40 | `src/modules/wishlist/wishlistController.js` | 1,643 B | Điều phối request danh sách yêu thích (lấy danh sách, toggle tim, sync LocalStorage) |
| 41 | `src/modules/wishlist/wishlistService.js` | 3,551 B | Xử lý nghiệp vụ yêu thích: lưu database, bật/tắt tim, đồng bộ danh sách LocalStorage |
| 42 | `src/modules/notification/notificationController.js` | 1,978 B | Điều phối request xem nhật ký email và gửi email kiểm thử |
| 43 | `src/modules/notification/notificationService.js` | 14,781 B | Dịch vụ gửi email HTML tự động (xác nhận đơn, thanh toán thành công, bưu tá giao hàng) qua Nodemailer |
| 44 | `src/scripts/cleanMockData.js` | 2,735 B | Script dọn dẹp sạch toàn bộ dữ liệu mẫu (đơn hàng, đánh giá, sản phẩm) trước khi bàn giao |
| 45 | `src/scripts/exportHandoverExcel.js` | 27,997 B | Script tự động tổng hợp thông số hệ thống và xuất tệp Excel bàn giao 8 sheet |
| **Giao Diện Frontend React (`frontend/`)** | | | |
| 46 | `frontend/package.json` | 393 B | Khai báo cấu hình frontend: React 19, Lucide Icons, Vite 6 và scripts dev/build |
| 47 | `frontend/vite.config.js` | 279 B | Cấu hình Vite bundler, plugin `@vitejs/plugin-react` và proxy API |
| 48 | `frontend/index.html` | 1,507 B | HTML template điểm vào của ứng dụng React SPA |
| 49 | `frontend/src/main.jsx` | 235 B | Điểm vào JavaScript render cây component `App` vào DOM |
| 50 | `frontend/src/App.jsx` | 17,748 B | Nhạc trưởng giao diện React: quản lý state toàn cục (Cart, Filter, Auth, Theme, ViewMode) |
| 51 | `frontend/src/index.css` | 40,096 B | Design system CSS: biến màu sắc, dark/light theme, typography, bố cục lưới, glassmorphism |
| 52 | `frontend/src/services/api.js` | 6,750 B | Client gọi API backend kèm Bearer token, upload ảnh Canvas nén, xuất báo cáo CSV UTF-8 |
| 53 | `frontend/src/components/Navbar.jsx` | 7,174 B | Component header điều hướng, live search, chuyển chế độ Store/Admin, nút giỏ hàng, auth, theme |
| 54 | `frontend/src/components/HeroBanner.jsx` | 3,719 B | Component banner chiến dịch Editorial, hiển thị mã ưu đãi và nút copy 1-click |
| 55 | `frontend/src/components/CategoryFilter.jsx` | 7,044 B | Component bộ lọc danh mục và bộ lọc nâng cao (khoảng giá, tình trạng tồn kho, sắp xếp) |
| 56 | `frontend/src/components/ProductCard.jsx` | 3,327 B | Component thẻ hiển thị sản phẩm, ảnh 4:3, khoảng giá, số biến thể, đánh giá sao, nút tim |
| 57 | `frontend/src/components/ProductModal.jsx` | 11,409 B | Modal chi tiết sản phẩm: chọn biến thể động, cập nhật giá/tồn kho, thêm vào giỏ, đánh giá |
| 58 | `frontend/src/components/ProductReviews.jsx` | 22,071 B | Bảng điều khiển đánh giá, phân bổ 5 bậc sao, huy hiệu xác thực mua hàng và form nhận xét |
| 59 | `frontend/src/components/CartDrawer.jsx` | 8,725 B | Drawer giỏ hàng trượt: chỉnh số lượng, xóa sản phẩm, áp dụng mã voucher, tính tổng tiền |
| 60 | `frontend/src/components/CheckoutModal.jsx` | 21,891 B | Modal thanh toán: điền địa chỉ giao hàng, lựa chọn VietQR/COD, sinh QR NAPAS 247, đếm ngược 15p |
| 61 | `frontend/src/components/OrderTrackingModal.jsx` | 28,370 B | Modal tra cứu vận đơn: timeline trạm bưu cục, thông tin bưu tá liên hệ, polling đối soát VietQR |
| 62 | `frontend/src/components/MyOrdersModal.jsx` | 14,459 B | Modal danh sách đơn hàng của khách hàng, theo dõi tiến độ và hỗ trợ tự hủy đơn |
| 63 | `frontend/src/components/WishlistDrawer.jsx` | 7,297 B | Drawer hiển thị danh sách sản phẩm đã thả tim yêu thích kèm nút đặt hàng nhanh |
| 64 | `frontend/src/components/AuthModal.jsx` | 11,434 B | Modal đăng nhập / đăng ký kèm nút điền nhanh tài khoản demo Admin và Customer |
| 65 | `frontend/src/components/AdminPortal.jsx` | 119,249 B | Bảng điều khiển quản trị toàn diện 8 tab: Dashboard, Đơn hàng, Kho SKU, Voucher, Cấu hình, Webhook, Email, Docs |
| 66 | `frontend/src/components/AdminOrderDetailModal.jsx` | 34,006 B | Modal chi tiết đơn hàng quản trị: cập nhật thanh toán, đổi trạng thái giao vận, mô phỏng mốc bưu cục, in hóa đơn |
| 67 | `frontend/src/components/AdminCreateProductModal.jsx` | 16,845 B | Modal quản trị tạo sản phẩm mới, tải ảnh và thiết lập biến thể ban đầu |
| 68 | `frontend/src/components/AdminEditProductModal.jsx` | 9,276 B | Modal quản trị cập nhật thông tin chung, mô tả, ảnh thumbnail của sản phẩm |
| 69 | `frontend/src/components/AdminVariantEditModal.jsx` | 13,239 B | Modal quản trị chỉnh sửa giá, tồn kho, SKU và thuộc tính biến thể cụ thể |
| 70 | `frontend/src/components/AdminCreatePromoModal.jsx` | 8,580 B | Modal quản trị tạo mã ưu đãi / voucher khuyến mãi mới |
| 71 | `frontend/src/components/AdminDocsTab.jsx` | 24,324 B | Component hiển thị cẩm nang vận hành, thông số máy chủ, link UptimeRobot và Render |
| 72 | `frontend/src/components/Toast.jsx` | 496 B | Component thông báo nổi đa trạng thái (success, error, info) |
| **Tài Nguyên Đồ Họa Frontend (`frontend/public/assets/editorial/` & `dist/`)** | | | |
| 73 | `audio-studio.svg` | 878 B | Đồ họa vector minh họa sản phẩm Thiết bị & Âm thanh Hi-Fi |
| 74 | `beauty-serum.svg` | 1,478 B | Đồ họa vector minh họa sản phẩm Mỹ phẩm & Hương thơm Thảo mộc |
| 75 | `coffee-roast.svg` | 1,312 B | Đồ họa vector minh họa sản phẩm Cà phê Đặc sản & Dụng cụ pha chế |
| 76 | `fashion-trench.svg` | 1,365 B | Đồ họa vector minh họa sản phẩm Thời trang Trench Coat Linen |
| 77 | `hero-flagship.svg` | 2,325 B | Đồ họa vector minh họa banner chiến dịch trang chủ Flagship Store |
| 78 | `leather-tote.svg` | 844 B | Đồ họa vector minh họa sản phẩm Túi Da Thuộc Minimalist |
| 79 | `living-chair.svg` | 1,215 B | Đồ họa vector minh họa sản phẩm Ghế Gỗ Sồi Bắc Âu Scandi |
| **Frontend Production Build (`frontend/dist/`)** | | | |
| 80 | `frontend/dist/index.html` | 1,603 B | Bản HTML sản xuất đã qua tối ưu hóa bundle |
| 81 | `frontend/dist/assets/index-D3k3moGt.css` | 30,718 B | Bản CSS sản xuất (gzipped: 5.94 kB) |
| 82 | `frontend/dist/assets/index-BpX9HFM9.js` | 475,729 B | Bản JS sản xuất đóng gói React + Lucide Icons (gzipped: 123.95 kB) |
| **Giao Diện HTML Tĩnh Cũ / Fallback (`public/`)** | | | |
| 83 | `public/index.html` | 24,753 B | File HTML giao diện tĩnh gốc (TechPulse Modular Engine v2) |
| 84 | `public/app.js` | 44,623 B | File JavaScript vanilla điều khiển giao diện tĩnh gốc và gọi API |
| 85 | `public/style.css` | 34,522 B | File CSS stylesheet phong cách Dark/Neon gốc cho giao diện tĩnh |

---

## 2. Logic Chain (Chuỗi Lập Luận & Phân Tích Kiến Trúc)

### 2.1. Phân Tích Luồng Dữ Liệu Cốt Lõi (Core Data Flows)

#### Luồng 1: Khám Phá Sản Phẩm & Bộ Lọc Đa Biến Thể (Catalog & Filtering Flow)
1. **Khởi tạo**: Khi truy cập trang chủ, `App.jsx` kích hoạt song song `loadCategories()` (`GET /api/products/categories`) và `GET /api/store/settings`. Dữ liệu cấu hình (`store_settings`) thiết lập tiêu đề, tagline, hero banner và theme mặc định (`light` hoặc `dark`).
2. **Truy vấn danh sách**: `loadProducts()` gửi request `GET /api/products` kèm các tham số truy vấn: `category`, `search`, `priceRange`, `inStockOnly`, `sortBy`.
3. **Phía Server**: `productService.listProducts()` thực hiện phép JOIN giữa `products`, `categories`, và `product_variants`. Sử dụng các hàm tổng hợp `MIN(v.price) AS min_price`, `MAX(v.price) AS max_price`, `SUM(v.inventory_quantity) AS total_inventory`, `AVG(r.rating) AS average_rating` gom nhóm theo `p.id, c.id` để cung cấp dữ liệu thẻ sản phẩm gọn nhẹ mà không tải toàn bộ thông số chi tiết.
4. **Mở cấu hình**: Khi người dùng nhấn vào thẻ sản phẩm, `ProductModal.jsx` gọi `GET /api/products/:idOrSlug`. Server trả về toàn bộ thông tin sản phẩm, danh mục các tùy chọn (`options`: e.g. "Màu sắc", "Kích cỡ") và toàn bộ danh sách các biến thể cụ thể (`variants` kèm `options_json`).
5. **Chọn biến thể**: Khi khách hàng nhấp chọn từng giá trị thuộc tính trên UI, thuật toán so khớp tìm biến thể có `options_json` tương ứng, lập tức chuyển đổi hiển thị: SKU chính xác, giá tiền riêng, số lượng tồn kho khả dụng và ảnh thumbnail của phiên bản đó.

#### Luồng 2: Đặt Hàng & Kiểm Soát Tồn Kho ACID (Order & Inventory Reservation Flow)
1. **Gửi đơn đặt hàng**: Khách hàng điền form tại `CheckoutModal.jsx` và bấm đặt hàng -> `POST /api/orders`.
2. **Giao dịch Cơ sở dữ liệu (Database Transaction)**: `orderService.createOrder()` bắt đầu bằng `BEGIN`:
   - Duyệt qua từng món trong `items`. Với mỗi món, chạy câu lệnh truy vấn có khóa dòng:
     ```sql
     SELECT v.*, p.title AS product_title FROM product_variants v JOIN products p ON v.product_id = p.id WHERE v.id = $1 AND v.is_active = true FOR UPDATE;
     ```
   - **Xác thực tồn kho**: Kiểm tra nếu `variant.inventory_quantity < quantity` thì lập tức ném lỗi chi tiết kèm số máy còn lại và kích hoạt `ROLLBACK`.
   - **Trừ kho tức thì**: Chạy `UPDATE product_variants SET inventory_quantity = inventory_quantity - $qty WHERE id = $variant_id`.
3. **Áp dụng Mã Khuyến Mãi (Promotions)**:
   - Nếu có `promotion_code`, truy vấn `promotions WHERE code = $code FOR UPDATE`.
   - Kiểm tra hạn mức sử dụng (`usage_count < usage_limit`), giá trị đơn tối thiểu (`subtotal >= min_order_value`).
   - Tính toán mức chiết khấu (% hoặc tiền cố định, khống chế bởi `max_discount`) và tăng `usage_count = usage_count + 1`.
4. **Tính Phí Vận Chuyển Động**: Đọc cấu hình từ `store_settings`: nếu `subtotal >= free_shipping_threshold` thì phí vận chuyển = 0đ, ngược lại áp dụng `base_shipping_fee` (mặc định 30.000đ).
5. **Khởi Tạo Máy Trạng Thái Kép (Dual State Machine)**:
   - `payment_status`: Thiết lập là `'awaiting_vietqr'` (nếu chọn VietQR) hoặc `'awaiting_cod'` (nếu chọn COD).
   - `fulfillment_status`: Luôn khởi tạo là `'processing'`.
6. **Sinh Mã VietQR Động NAPAS 24/7**:
   - Sinh mã đơn hiển thị ngẫu nhiên `displayId` dạng `TP-xxxx` (e.g. `TP-8802`).
   - Tạo nội dung chuyển khoản chuẩn: `TP-8802 [SĐT_khách_hàng]`.
   - Sinh URL ảnh VietQR chuẩn NAPAS 247 từ dịch vụ `https://img.vietqr.io/image/{bank_id}-{account_no}-compact2.png?amount={totalAmount}&addInfo={content}&accountName={accountName}`.
7. **Commit & Gửi Thông Báo**: Chạy `COMMIT`. Sau khi hoàn tất giao dịch, gọi hàm bất đồng bộ `notificationService.sendOrderConfirmation()` gửi email xác nhận đặt hàng kèm chi tiết đơn và mã QR cho khách.

#### Luồng 3: Thanh Toán VietQR Tự Động Qua Webhook & Cơ Chế Auto-Expire
1. **Khách hàng quét mã QR**: Khách mở app ngân hàng quét mã VietQR, tiền được chuyển đến tài khoản của shop.
2. **Webhook Ngân Hàng Gọi Về**: Dịch vụ Open Banking (SePay / Casso) hoặc hệ thống ngân hàng bắn `POST /api/webhooks/vietqr` kèm payload giao dịch.
3. **Khớp Lệnh Thanh Toán**:
   - `webhookService.processBankTransfer()` chạy regex bóc tách mã đơn `TP-([0-9]{4,6})` từ nội dung chuyển khoản (`content`).
   - Tìm kiếm đơn hàng trong bảng `orders` theo `display_id`.
   - So sánh số tiền thực nhận (`transferAmount`) với tổng tiền đơn hàng (`total_amount`).
   - Nếu số tiền nhận đủ: cập nhật `payment_status = 'captured'`, lưu mã giao dịch ngân hàng vào `transaction_ref`, ghi nhật ký `order_logs` và `webhook_logs`.
   - Kích hoạt email thông báo thanh toán thành công qua `notificationService.sendPaymentSuccess()`.
4. **Realtime Polling Phía Client**: Màn hình `CheckoutModal.jsx` và `OrderTrackingModal.jsx` kích hoạt bộ đếm thời gian polling gọi lại API mỗi 2.5–3 giây. Ngay khi nhận được `payment_status === 'captured'`, giao diện lập tức phát hiệu ứng chúc mừng và hoàn tất đơn hàng mà không cần người dùng tải lại trang.
5. **Cơ Chế Thu Hồi Đơn Treo Quá Hạn (Auto-Expire Cron)**:
   - Tại `server.js:36-45`, một tiến trình `setInterval` chạy mỗi 60 giây gọi `orderService.expireStaleVietQROrders(30)`.
   - Truy vấn các đơn có `payment_status = 'awaiting_vietqr'`, `fulfillment_status != 'canceled'`, và `created_at < NOW() - INTERVAL '30 minutes'`.
   - Tự động chuyển `fulfillment_status = 'canceled'`, gọi hàm `restoreInventoryAndPromoIfNeeded()` để cộng lại tồn kho cho từng biến thể và hoàn lại lượt dùng mã giảm giá.

#### Luồng 4: Vận Chuyển, Giao Vận & Lộ Trình Bưu Tá Thời Gian Thực (Logistics Flow)
1. **Khởi tạo vận đơn**: Khi đơn hàng được tạo, hệ thống tự động sinh mã vận đơn (`tracking_code`) và gán đơn vị vận chuyển mặc định (GHN), đồng thời ghi mốc lộ trình đầu tiên vào `shipment_tracking_events` (`order_received`).
2. **Quản trị viên xử lý**: Trong `AdminOrderDetailModal.jsx`, Admin có thể:
   - Chuyển đổi giữa 4 đơn vị vận chuyển: GHN, GHTK, Viettel Post, Hỏa Tốc 2H.
   - Bấm nút `⚡ Mô phỏng mốc bưu tá tiếp theo`: gọi `POST /api/shipping/:orderId/simulate-step`.
   - Hệ thống tự động đẩy sự kiện lộ trình mới (`picked_up` -> `in_sorting_hub` -> `out_for_delivery` -> `delivered`), đồng bộ `fulfillment_status` tương ứng (`packing` -> `shipped` -> `delivered`).
   - Khi bưu tá đi giao (`out_for_delivery`), tự động kích hoạt gửi email thông báo kèm SĐT bưu tá cho khách hàng.
3. **Khách hàng tra cứu**: Khách hàng mở `OrderTrackingModal.jsx`, nhập mã đơn `TP-xxxx` để xem biểu đồ timeline lộ trình bưu cục với chấm xanh phát sáng ở mốc mới nhất và số hotline hỗ trợ của đơn vị vận chuyển.

#### Luồng 5: Đánh Giá Khách Hàng (Reviews) & Danh Sách Yêu Thích (Wishlist)
1. **Xác thực Mua Hàng Tự Động**: Khi người dùng gửi đánh giá tại `ProductReviews.jsx`, server kiểm tra trong bảng `order_items` và `orders` xem email hoặc ID người dùng đã từng có đơn hàng hoàn tất (`captured` hoặc `delivered`) chứa biến thể của sản phẩm này hay chưa. Nếu có, cấp cờ `verified_purchase = true` để hiển thị huy hiệu xanh uy tín.
2. **Lưu Trữ Lai Wishlist**:
   - Khi chưa đăng nhập: Danh sách ID sản phẩm yêu thích được lưu trong `localStorage` (`techpulse_wishlist`).
   - Khi đăng nhập thành công: `App.jsx` tự động gọi `POST /api/wishlist/sync` gửi mảng ID lên máy chủ để hợp nhất vào bảng `wishlists` với mệnh đề `ON CONFLICT (user_id, product_id) DO NOTHING`.

### 2.2. Phụ Thuộc Liên Module (Inter-Module Dependencies)
- `orderService` phụ thuộc vào:
  - `productService`: Truy vấn thông tin sản phẩm và kiểm tra tồn kho biến thể.
  - `promotionService`: Kiểm tra tính hợp lệ và cập nhật số lượt sử dụng voucher.
  - `notificationService`: Gửi email xác nhận đơn hàng khi tạo đơn thành công.
  - `db.pool`: Quản lý transaction PostgreSQL.
- `webhookService` phụ thuộc vào:
  - `orderService`: Trích xuất và cập nhật đơn hàng khi có tiền về.
  - `notificationService`: Gửi email thông báo thanh toán thành công.
- `shippingService` phụ thuộc vào:
  - `notificationService`: Gửi email thông báo khi bưu tá đi phát hàng (`out_for_delivery`).
- `reviewService` phụ thuộc vào:
  - `orderService` & bảng `orders`, `order_items`: Xác thực trạng thái mua hàng (`verified_purchase`).
- `dashboardService` phụ thuộc vào:
  - Toàn bộ các bảng `orders`, `order_items`, `products`, `product_variants`, `categories` để tổng hợp báo cáo BI.

### 2.3. Đánh Giá Điểm Mạnh Kiến Trúc (Architectural Strengths)
1. **Tư duy Kiến trúc MedusaJS sắc nét**: Phân tách rõ ràng giữa sản phẩm trừu tượng (`products`), thuộc tính (`product_options`) và biến thể cụ thể (`product_variants`). Điều này cho phép mở rộng bán lẻ bất kỳ ngành hàng nào mà không cần sửa cấu trúc bảng.
2. **Thiết kế Máy trạng thái kép (Dual State Machine)**: Tách bạch hoàn toàn giữa vòng đời dòng tiền (`payment_status`) và vòng đời vận chuyển hàng hóa (`fulfillment_status`), ngăn chặn triệt để tình trạng giao hàng khi chưa nhận tiền hoặc xử lý sai lệch khi hoàn tiền.
3. **An toàn Kho hàng (Concurrency Control)**: Sử dụng cơ chế khóa dòng bi quan (`SELECT ... FOR UPDATE`) bên trong ACID Transaction của PostgreSQL, đảm bảo tuyệt đối không xảy ra tình trạng bán vượt tồn kho (overselling) khi nhiều khách cùng đặt hàng một biến thể vào cùng một thời điểm.
4. **Cơ chế Khả dụng cao Cơ sở dữ liệu (Database Resiliency)**: Khả năng tự động phát hiện và chuyển đổi dự phòng từ PostgreSQL Supabase sang Embedded PGlite Engine giúp hệ thống có thể chạy demo hoặc vận hành ngoại tuyến mà không bị sập hoàn toàn khi mạng gián đoạn.
5. **Cổng VietQR Tự động hóa Toàn diện**: Tích hợp luồng khép kín từ tạo mã QR động NAPAS, bắt Webhook ngân hàng tự động đối soát, giả lập cho môi trường staging, cho đến cron job tự động thu hồi và hoàn trả kho cho các đơn treo quá 30 phút.

### 2.4. Đánh Giá Các Lỗ Hổng & Rủi Ro Kiến Trúc (Architectural Vulnerabilities & Risks)
Dựa trên bằng chứng kiểm tra mã nguồn thực tế, hệ thống tồn tại các rủi ro cấu trúc nghiêm trọng cần được ưu tiên xử lý trong các báo cáo audit tiếp theo:

1. **RỦI RO BẢO MẬT CỰC KỲ NGHIÊM TRỌNG: Lộ lọt Thông tin Đăng nhập & API Key Trực tiếp trong Mã Nguồn Tracked**
   - **Vị trí 1**: `frontend/src/components/AdminDocsTab.jsx:85, 117`
     - Dòng 85: Hardcode Render API Key bí mật: `rnd_VRDeFOy2odVHNB3CFVNkRYrED2NE`.
     - Dòng 117: Hardcode chuỗi kết nối database đầy đủ kèm mật khẩu: `postgresql://postgres.oecgyiaetefmxkrndcvk:manhhung0423@aws-0-ap-south-1.pooler.supabase.com:6543/postgres`.
     - *Hệ quả*: File này được đóng gói vào bundle JS phía client (`dist/assets/index-BpX9HFM9.js`). Bất kỳ người dùng nào mở website đều có thể xem mã nguồn và chiếm toàn quyền kiểm soát cả máy chủ Render lẫn cơ sở dữ liệu Supabase!
   - **Vị trí 2**: `src/scripts/exportHandoverExcel.js:61, 85, 91`
     - Tệp này được commit lên Git repo và chứa toàn bộ thông tin nhạy cảm nêu trên.
   - **Vị trí 3**: `HUONG_DAN_TRIEN_KHAI_RENDER.md:11, 15, 16`
     - Tệp Markdown được theo dõi trong Git và ghi rõ ràng Render API Key, Database Password và Connection String.
2. **RỦI RO CHẤT LƯỢNG & ĐỘ TIN CẬY: Hoàn Toàn Không Có Bộ Kiểm Thử Tự Động (Automated Test Suite)**
   - Tìm kiếm `*test*` và `*spec*` trong toàn bộ repository trả về **0 kết quả**.
   - Cả `package.json` gốc lẫn `frontend/package.json` đều không cài đặt bất kỳ test framework nào (không có Jest, Mocha, Vitest, Cypress, Playwright hay Supertest).
   - Không có cấu hình linter (ESLint) hoặc định dạng mã (Prettier) trong dự án.
3. **RỦI RO HIỆU NĂNG & MỞ RỘNG (Scalability & Memory Leaks)**
   - **Rate Limiter trong bộ nhớ RAM (`middlewares/security.js:14`)**: Sử dụng cấu trúc `new Map()` trên biến bộ nhớ tiến trình đơn. Nếu triển khai multi-instance (cluster hoặc nhiều container đằng sau Load Balancer), bộ đếm rate limit không được chia sẻ giữa các instance và sẽ bị mất hoàn toàn mỗi khi server khởi động lại.
   - **Lưu trữ tệp tải lên cục bộ (`productController.js:63`)**: Ảnh sản phẩm được ghi trực tiếp vào đĩa máy chủ tại `public/uploads`. Trên các nền tảng PaaS như Render gói Free (ephemeral disk), toàn bộ ảnh do Admin tải lên sẽ bị xóa sạch mỗi khi container restart hoặc redeploy!
4. **BẤT ĐỒNG BỘ CẤU HÌNH DEPLOY RENDER (`render.yaml` vs `package.json`)**
   - Trong `render.yaml:7`: `buildCommand: npm install`.
   - Tuy nhiên, để frontend React được biên dịch sang thư mục `frontend/dist`, câu lệnh bắt buộc phải là `npm run build` (tương đương `npm --prefix frontend install --include=dev && npm --prefix frontend run build`). Nếu Render chỉ chạy `npm install`, thư mục `frontend/dist` sẽ không được tạo mới trong quá trình build tự động, buộc máy chủ phải rơi về phục vụ tệp HTML tĩnh cũ tại `public/`.

---

## 3. Caveats (Phạm Vi Khảo Sát & Các Giả Định)

1. **Phạm vi khảo sát (Scope Boundary)**:
   - Cuộc khảo sát này tuân thủ nghiêm ngặt nguyên tắc **Read-Only** (chỉ đọc, không can thiệp sửa đổi mã nguồn ứng dụng).
   - Chỉ ghi các tệp báo cáo, kế hoạch và nhật ký bên trong thư mục được phân quyền: `c:\Users\84123\OneDrive\Desktop\hoctap\.agents\teamwork\explorer_survey_1\`.
2. **Giả định về Cơ sở dữ liệu**:
   - Kiểm tra mã nguồn cho thấy ứng dụng được thiết kế để kết nối Supabase PostgreSQL qua kết nối mạng ngoài. Trong trường hợp không có mạng hoặc chuỗi kết nối bị lỗi, cơ chế PGlite fallback sẽ khởi chạy. Trong khuôn khổ khảo sát tĩnh và build kiểm chứng, chưa thực hiện ghi/xóa dữ liệu thực tế vào database sản xuất của khách hàng.
3. **Các khía cạnh chuyển giao cho các lượt Audit tiếp theo**:
   - Đánh giá lỗ hổng bảo mật chuyên sâu (SAST/DAST, injection, auth bypass, exposed secrets) sẽ do sub-agent phụ trách **Bảo mật (Security Pillar)** thực hiện chi tiết.
   - Đánh giá tải, benchmark tốc độ và profiling tài nguyên sẽ do sub-agent phụ trách **Hiệu năng (Performance Pillar)** thực hiện.
   - Đánh giá chuẩn mã nguồn, quy tắc đặt tên, code smell và nợ kỹ thuật sẽ do sub-agent phụ trách **Chất lượng mã nguồn (Code Quality Pillar)** thực hiện.
   - Đánh giá CI/CD pipeline, Docker hardening, Nginx config và Render blueprint sẽ do sub-agent phụ trách **Cấu hình Triển khai / DevOps** thực hiện.

---

## 4. Conclusion (Kết Luận Khảo Sát Kiến Trúc)

1. **Đánh Giá Tổng Thể**:
   - Dự án sở hữu một kiến trúc e-commerce rất tiến bộ, hiện đại và được tổ chức bài bản. Ý tưởng mô phỏng kiến trúc headless của MedusaJS với mô hình biến thể sản phẩm, máy trạng thái kép cho đơn hàng, khóa giao dịch ACID chống bán âm kho và cổng thanh toán tự động VietQR NAPAS 24/7 là những điểm sáng nổi bật, đáp ứng rất tốt bài toán kinh doanh bán lẻ đa ngành.
   - Ứng dụng có thể build thành công 100% bằng Vite và React 19 (`npm run build` hoàn thành không lỗi), cú pháp toàn bộ tệp JavaScript đều vượt qua kiểm tra tĩnh (`node --check`).
2. **Khuyến Nghị Trọng Yếu Cần Khắc Phục Ngay**:
   - **Khẩn cấp 1 (Critical)**: Thu hồi và tái tạo (rotate) ngay lập tức Render API Key (`rnd_VRDe...`) và mật khẩu database Supabase (`manhhung0423`). Xóa toàn bộ chuỗi kết nối và API key khỏi `AdminDocsTab.jsx`, `exportHandoverExcel.js` và `HUONG_DAN_TRIEN_KHAI_RENDER.md`. Thay thế bằng cách đọc từ biến môi trường phía server hoặc che dấu (masking).
   - **Khẩn cấp 2 (High)**: Xây dựng bộ test suite tự động tối thiểu (chí ít là Integration tests cho luồng trừ kho và khớp Webhook VietQR) bằng Vitest / Supertest.
   - **Khẩn cấp 3 (Medium)**: Chuyển dịch hệ thống lưu trữ ảnh tải lên (`/uploads`) sang Cloud Object Storage (như Supabase Storage, Cloudinary hoặc AWS S3) để tránh mất dữ liệu ảnh khi container khởi động lại trên Render.
   - **Khẩn cấp 4 (Medium)**: Chỉnh sửa `render.yaml` để `buildCommand` bao gồm lệnh build frontend React: `npm install && npm run build`.

---

## 5. Verification Method (Phương Pháp & Câu Lệnh Kiểm Chứng Độc Lập)

Bất kỳ chuyên viên kiểm toán hoặc agent tiếp nhận nào cũng có thể kiểm chứng độc lập toàn bộ các kết luận trong báo cáo này thông qua các câu lệnh sau:

### 1. Kiểm chứng Biên dịch Frontend React (Build Test):
Chạy lệnh trong terminal (Windows Command Prompt / PowerShell):
```powershell
cmd /c "npm run build"
```
**Kết quả ghi nhận thực tế**:
```text
vite v6.4.5 building for production...
✓ 1611 modules transformed.
dist/index.html                   1.60 kB │ gzip:   0.92 kB
dist/assets/index-D3k3moGt.css   30.72 kB │ gzip:   5.94 kB
dist/assets/index-BpX9HFM9.js   475.73 kB │ gzip: 123.95 kB
✓ built in 34.19s
Exit code: 0
```

### 2. Kiểm chứng Cú pháp JavaScript Toàn Hệ Thống (Syntax Check):
Chạy lệnh kiểm tra cú pháp trên toàn bộ file `.js`:
```powershell
Get-ChildItem -Recurse -Filter *.js | Where-Object { $_.FullName -notmatch '[\\/](\.git|\.agents|node_modules|\.pglite-data|dist)[\\/]' } | ForEach-Object { node --check $_.FullName; if ($LASTEXITCODE -ne 0) { Write-Host ("Lỗi cú pháp tại: " + $_.FullName) } }
```
**Kết quả ghi nhận thực tế**:
`0 lỗi cú pháp`. Toàn bộ file backend và script đều hợp lệ về mặt ngữ pháp Node.js.

### 3. Kiểm chứng Lộ Lọt Thông Tin Bảo Mật Nghiêm Trọng (Hardcoded Secrets Verification):
Chạy lệnh tìm kiếm chuỗi nhạy cảm:
```powershell
# Tìm kiếm Render API Key trong mã nguồn frontend
Select-String -Path "frontend\src\components\AdminDocsTab.jsx" -Pattern "rnd_"

# Tìm kiếm mật khẩu Database trong mã nguồn frontend và script
Select-String -Path "frontend\src\components\AdminDocsTab.jsx", "src\scripts\exportHandoverExcel.js" -Pattern "manhhung0423"
```
**Kết quả ghi nhận thực tế**:
- `frontend\src\components\AdminDocsTab.jsx:85`: Lộ `rnd_VRDeFOy2odVHNB3CFVNkRYrED2NE`.
- `frontend\src\components\AdminDocsTab.jsx:117`: Lộ `manhhung0423` trong chuỗi kết nối `postgresql://postgres.oecgyiaetefmxkrndcvk:...`.
- `src\scripts\exportHandoverExcel.js:61, 85, 91`: Lộ các thông tin tương tự.

---
*Báo cáo được khởi tạo tự động và xác thực độc lập bởi Explorer Survey 1.*
