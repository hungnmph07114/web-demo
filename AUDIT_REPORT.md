# BÁO CÁO REVIEW VÀ KIỂM TOÁN TOÀN DIỆN HỆ THỐNG
# (COMPREHENSIVE TECHNICAL AUDIT & ARCHITECTURE REVIEW REPORT)

**Dự án**: TechPulse / ATELIER & CO. Modular E-Commerce Engine (`render-supabase-demo`)  
**Ngày thực hiện**: 28/10/2026  
**Phiên bản hệ thống**: 1.0.0 (Production Candidate)  
**Tiêu chuẩn đánh giá**: OWASP Top 10:2021, CWE/SANS Top 25, 12-Factor App Methodology, Clean Architecture & ACID Database Standards  
**Trạng thái kiểm toán**: Hoàn tất khảo sát, phân tích tĩnh và đối chiếu thực nghiệm mã nguồn  

---

## MỤC LỤC BÁO CÁO

1. [TỔNG QUAN ĐIỀU HÀNH & ĐÁNH GIÁ MỨC ĐỘ SẴN SÀNG (EXECUTIVE SUMMARY)](#1-tổng-quan-điều-hành--đánh-giá-mức-độ-sẵn-sàng)
   - 1.1. Bối cảnh & Mục tiêu kiểm toán
   - 1.2. Đánh giá mức độ sẵn sàng triển khai (Production Readiness Assessment)
   - 1.3. Bảng tổng hợp thống kê phát hiện theo mức độ nghiêm trọng
2. [TRỤ CỘT 1: KIẾN TRÚC HỆ THỐNG & LUỒNG DỮ LIỆU (SYSTEM ARCHITECTURE)](#2-trụ-cột-1-kiến-trúc-hệ-thống--luồng-dữ-liệu)
   - 2.1. Đánh giá mô hình kiến trúc Monolithic & Cảm hứng MedusaJS
   - 2.2. Thiết kế Máy trạng thái kép (Dual State Machine Engine)
   - 2.3. Phân tích 5 Luồng dữ liệu cốt lõi (Core Data Flows)
   - 2.4. Cấu trúc Cơ sở dữ liệu & Mô hình dữ liệu quan hệ (15 Tables)
   - 2.5. Danh mục Module Backend (10 Modules) & Giao diện Frontend (20 Components)
3. [TRỤ CỘT 2: AN TOÀN THÔNG TIN & QUẢN LÝ BÍ MẬT (INFORMATION SECURITY)](#3-trụ-cột-2-an-toàn-thông-tin--quản-lý-bí-mật)
   - 3.1. Rà soát rò rỉ bí mật & Khóa bảo mật (Secret Scanning)
   - 3.2. Đánh giá Xác thực, Phân quyền & Quản lý phiên (Authentication & Authorization)
   - 3.3. Bảo mật Cổng thanh toán & Webhook (Payment Security & Signature Verification)
   - 3.4. Kiểm soát Dữ liệu đầu vào, XSS & Upload tệp tin
   - 3.5. Mã hóa kênh truyền & Cấu hình TLS/SSL
4. [TRỤ CỘT 3: HIỆU NĂNG & KHẢ NĂNG MỞ RỘNG (PERFORMANCE & SCALABILITY)](#4-trụ-cột-3-hiệu-năng--khả-năng-mở-rộng)
   - 4.1. Phân tích Chỉ mục Cơ sở dữ liệu (Database Indexing Deficit)
   - 4.2. Chiến lược Phân trang & Tối ưu hóa Truy vấn (Pagination & Query Load)
   - 4.3. Độc lập truy vấn & Xử lý bất đồng bộ (Concurrency & Promise.all)
   - 4.4. Đánh giá I/O Đĩa & Node.js Event Loop Blocking
   - 4.5. Cơ chế PGlite Fallback Mutex & Khả năng chịu tải
5. [TRỤ CỘT 4: CHẤT LƯỢNG MÃ NGUỒN & NỢ KỸ THUẬT (CODE QUALITY & TECH DEBT)](#5-trụ-cột-4-chất-lượng-mã-nguồn--nợ-kỹ-thuật)
   - 5.1. Hiện trạng Kiểm thử tự động (Zero Automated Testing)
   - 5.2. Cấu trúc Component Frontend & Monolithic God Component
   - 5.3. Lỗi tiềm ẩn logic (Logic Bugs & Attribute Mismatch)
   - 5.4. Đụng độ định danh ngẫu nhiên (Identifier Collision Risk)
   - 5.5. Quản lý thư viện phụ thuộc & Xung đột Package Manager
6. [TRỤ CỘT 5: CẤU HÌNH TRIỂN KHAI & DEVOPS (DEPLOYMENT & INFRASTRUCTURE)](#6-trụ-cột-5-cấu-hình-triển-khai--devops)
   - 6.1. Đóng gói Container đa tầng (Docker & Docker Compose Analysis)
   - 6.2. Cấu hình PaaS Render.com & Lỗi lệch lệnh Build (`render.yaml`)
   - 6.3. Đường ống CI/CD & Tự động hóa kiểm soát chất lượng
   - 6.4. Giám sát vận hành, Healthcheck & Logging tập trung
7. [MA TRẬN PHÁT HIỆN TOÀN DIỆN & PHÂN TÍCH CHI TIẾT (FINDINGS MATRIX)](#7-ma-trận-phát-hiện-toàn-diện--phân-tích-chi-tiết)
   - 7.1. Bảng ma trận tổng hợp phát hiện (Consolidated Matrix)
   - 7.2. Chi tiết từng phát hiện, Bằng chứng mã nguồn & Phương án khắc phục kỹ thuật
8. [KIỂM CHỨNG THỰC TẾ & ĐỐI CHIẾU TÀI NGUYÊN (PRACTICAL VERIFICATION & BENCHMARKS)](#8-kiểm-chứng-thực-tế--đối-chiếu-tài-nguyên)
   - 8.1. Kết quả thực thi các lệnh kiểm tra tự động
   - 8.2. Hướng dẫn từng bước tái hiện lỗi (Step-by-Step Reproduction Guide)
9. [LỘ TRÌNH KHẮC PHỤC ƯU TIÊN (ACTIONABLE REMEDIATION ROADMAP)](#9-lộ-trình-khắc-phục-ưu-tiên)
   - Giai đoạn 1: Khắc phục Khẩn cấp (0 – 24 giờ)
   - Giai đoạn 2: Tối ưu Cốt lõi (1 – 3 ngày)
   - Giai đoạn 3: Chuẩn hóa & Mở rộng (3 – 7 ngày)

---

## 1. TỔNG QUAN ĐIỀU HÀNH & ĐÁNH GIÁ MỨC ĐỘ SẴN SÀNG

### 1.1. Bối cảnh & Mục tiêu kiểm toán
Hệ thống **TechPulse / ATELIER & CO. Modular E-Commerce Engine** là một nền tảng thương mại điện tử đa ngành (Flagship Store) thế hệ mới, tích hợp cổng thanh toán tự động VietQR NAPAS 24/7, đối soát biến động số dư qua Webhook ngân hàng, máy trạng thái kép quản lý đơn hàng và giao vận, kiểm soát tồn kho theo thời gian thực (ACID Transaction với khóa dòng `FOR UPDATE`), quản lý lộ trình bưu tá đa đối tác (GHN, GHTK, Viettel Post, Hỏa tốc 2H) và thông báo giao dịch tự động qua email.

Cuộc kiểm toán này được thực hiện nhằm rà soát toàn diện và khách quan toàn bộ repository dự án (bao gồm 70 tệp tin mã nguồn, 10 module backend, 20 component React 19, 15 bảng cơ sở dữ liệu và cấu hình triển khai Docker/Render). Quá trình đánh giá kết hợp giữa khảo sát tĩnh, phân tích luồng dữ liệu, thực thi kiểm thử độc lập (`npm run build`, `npm audit`, `node -c`) và đối soát bảo mật theo các chuẩn mực quốc tế như OWASP Top 10 và CWE Top 25.

### 1.2. Đánh giá mức độ sẵn sàng triển khai (Production Readiness Assessment)

| Tiêu chí Đánh giá | Trọng số | Điểm số (Thang 10) | Trạng thái | Đánh giá Tóm tắt |
| :--- | :---: | :---: | :---: | :--- |
| **Kiến trúc Hệ thống (Architecture)** | 20% | **8.5 / 10** | **ĐẠT (Tốt)** | Tư duy MedusaJS mạch lạc, phân tách rõ options/variants, máy trạng thái kép và ACID transaction rất chuẩn mực. |
| **An toàn Bảo mật (Security)** | 30% | **3.0 / 10** | **CẢNH BÁO ĐỎ (Nguy hiểm)** | Tồn tại lỗ hổng nghiêm trọng: lộ lọt khóa Supabase/Render trong client bundle và Git; webhook không xác thực; IDOR tra cứu đơn hàng. |
| **Hiệu năng & Mở rộng (Performance)** | 20% | **4.5 / 10** | **DƯỚI CHUẨN** | Thiếu 100% index trên khóa ngoại; không phân trang ở API sản phẩm/đơn hàng; truy vấn dashboard tuần tự; blocking I/O. |
| **Chất lượng Mã nguồn (Quality)** | 15% | **5.0 / 10** | **CẦN CẢI THIỆN** | Hoàn toàn thiếu kiểm thử tự động (0% tests); component AdminPortal quá lớn (>2650 dòng); lỗi thuộc tính token. |
| **Hạ tầng & Triển khai (DevOps)** | 15% | **5.5 / 10** | **DƯỚI CHUẨN** | Dockerfile non-root xung đột quyền PGlite; `render.yaml` cấu hình sai lệnh build khiến không build được React SPA. |
| **TỔNG KẾT MỨC ĐỘ SẴN SÀNG** | **100%** | **5.15 / 10** | **CHƯA ĐỦ ĐIỀU KIỆN GO-LIVE SẢN XUẤT** | **Hệ thống có nền tảng tính năng rất tốt nhưng BẮT BUỘC phải vá triệt để các lỗ hổng Critical & High trước khi nhận thanh toán thật.** |

### 1.3. Bảng tổng hợp thống kê phát hiện theo mức độ nghiêm trọng

Hệ thống ghi nhận tổng cộng **20 phát hiện kỹ thuật** được phân loại nghiêm ngặt:

```
┌─────────────────────────────────────────────────────────────┐
│              THỐNG KÊ MỨC ĐỘ NGHIÊM TRỌNG (SEVERITY)        │
├───────────────────┬───────────┬─────────────────────────────┤
│ Mức độ (Severity) │ Số lượng  │ Tỷ lệ (%)                   │
├───────────────────┼───────────┼─────────────────────────────┤
│ 🔴 CRITICAL       │     2     │ 10.0%                       │
│ 🟠 HIGH           │     6     │ 30.0%                       │
│ 🟡 MEDIUM         │     7     │ 35.0%                       │
│ 🔵 LOW            │     3     │ 15.0%                       │
│ ⚪ INFORMATIONAL   │     2     │ 10.0%                       │
├───────────────────┼───────────┼─────────────────────────────┤
│ TỔNG CỘNG         │    20     │ 100.0%                      │
└───────────────────┴───────────┴─────────────────────────────┘
```

---

## 2. TRỤ CỘT 1: KIẾN TRÚC HỆ THỐNG & LUỒNG DỮ LIỆU

### 2.1. Đánh giá mô hình kiến trúc Monolithic & Cảm hứng MedusaJS
Dự án áp dụng mô hình **Modular Monolithic Fullstack**:
- **Backend**: Xây dựng trên nền Node.js/Express, chia thành 10 module độc lập tương ứng với các nghiệp vụ thương mại điện tử chuyên biệt (Auth, Product, Promotion, Order, Dashboard, Webhook, Review, Wishlist, Shipping, Notification).
- **Frontend**: Ứng dụng SPA hiện đại viết bằng React 19 kết hợp Vite 6, đóng gói toàn bộ chức năng khách hàng (Storefront) và bảng điều khiển quản trị (Admin Portal) trong cùng một mã nguồn.
- **Tư duy MedusaJS**: Kiến trúc sản phẩm áp dụng nguyên lý tách bạch cấp tiến:
  - `products` (Sản phẩm trừu tượng): Lưu trữ thông tin định danh, danh mục, tiêu đề, mô tả và ảnh đại diện.
  - `product_options` (Các chiều thuộc tính): Định nghĩa linh hoạt các trục biến thể (ví dụ: Màu sắc, Kích cỡ, Dung tích, Chất liệu).
  - `product_variants` (Biến thể cụ thể - Stock Keeping Unit): Chứa SKU duy nhất, giá tiền riêng, số lượng tồn kho và cấu hình thuộc tính dạng JSONB (`options_json`).
  *Ưu điểm*: Cấu trúc này cho phép hệ thống bán lẻ bất kỳ ngành hàng nào (từ thời trang, nội thất, mỹ phẩm, đồ uống tới điện tử) mà không cần thay đổi lược đồ cơ sở dữ liệu.

```
       ┌─────────────────────────────────────────────────────────────────┐
       │                       TECHPULSE CLIENT (SPA)                    │
       │     React 19 + Lucide Icons (Storefront & Admin Portal)         │
       └────────────────────────────────┬────────────────────────────────┘
                                        │ HTTP REST (JSON) / Bearer JWT
                                        ▼
       ┌─────────────────────────────────────────────────────────────────┐
       │                   EXPRESS API BACKEND (server.js)               │
       │  ┌───────────────────────────────────────────────────────────┐  │
       │  │ Middlewares: securityHeaders, CORS, RateLimiter, JWT Auth │  │
       │  └─────────────────────────────┬─────────────────────────────┘  │
       │                                ▼                                │
       │  ┌───────────────────────────────────────────────────────────┐  │
       │  │ 10 Modular Services: Order, Product, Webhook, Shipping... │  │
       │  └─────────────────────────────┬─────────────────────────────┘  │
       └────────────────────────────────┼────────────────────────────────┘
                                        │ SQL Queries (pg Pool)
                    ┌───────────────────┴───────────────────┐
                    ▼                                       ▼
       ┌────────────────────────┐              ┌────────────────────────┐
       │  Supabase PostgreSQL   │              │   Embedded PGlite      │
       │  (Connection Pooler)   │ ──Fallback──▶│   Postgres WASM        │
       │  aws-0-ap-south-1:6543 │              │   (.pglite-data)       │
       └────────────────────────┘              └────────────────────────┘
```

### 2.2. Thiết kế Máy trạng thái kép (Dual State Machine Engine)
Khác biệt với các hệ thống thương mại điện tử truyền thống gộp chung trạng thái đơn hàng, TechPulse thiết kế độc lập hai trục vòng đời:

```
[TRỤC THANH TOÁN - payment_status]
  ┌─────────────────┐      Khách quét QR       ┌─────────────────┐
  │ awaiting_vietqr │ ───────────────────────▶ │    captured     │ ──▶ [HOÀN TẤT DÒNG TIỀN]
  └────────┬────────┘      Webhook ngân hàng   └─────────────────┘
           │ Quá 30 phút
           ▼ (Auto-expire cron)
  ┌─────────────────┐
  │    refunded     │
  └─────────────────┘

[TRỤC VẬN HÀNH & GIAO VẬN - fulfillment_status]
  ┌────────────┐       Xuất kho        ┌─────────┐      Bưu tá lấy hàng   ┌─────────┐      Phát thành công   ┌───────────┐
  │ processing │ ────────────────────▶ │ packing │ ─────────────────────▶ │ shipped │ ─────────────────────▶ │ delivered │
  └─────┬──────┘                       └─────────┘                        └─────────┘                        └───────────┘
        │ Hủy đơn trước khi đóng gói
        ▼ (Hoàn kho tự động)
  ┌────────────┐
  │  canceled  │
  └────────────┘
```
*Đánh giá*: Thiết kế này ngăn chặn triệt để tình trạng giao hàng khi chưa nhận tiền hoặc xử lý sai lệch tồn kho khi khách hàng hủy đơn.

### 2.3. Phân tích 5 Luồng dữ liệu cốt lõi (Core Data Flows)

1. **Luồng Khám phá Sản phẩm & Bộ lọc Biến thể (Catalog Flow)**:
   - Client gọi `GET /api/products` kèm query params (`category`, `search`, `priceRange`, `inStockOnly`, `sortBy`).
   - Server thực hiện JOIN giữa `products`, `categories` và `product_variants`. Tổng hợp `MIN(v.price)`, `MAX(v.price)`, `SUM(v.inventory_quantity)`, `AVG(r.rating)`.
   - Khi xem chi tiết, Client gọi `GET /api/products/:idOrSlug` nhận toàn bộ danh sách `options` và `variants`. Client tự động chuyển đổi hiển thị giá, SKU, tồn kho khi khách chọn option.

2. **Luồng Đặt hàng & Đặt chỗ Tồn kho ACID (Order Reservation Flow)**:
   - Khách gửi `POST /api/orders`.
   - Server mở giao dịch `BEGIN`. Khóa dòng kiểm tra tồn kho từng biến thể:
     `SELECT v.* FROM product_variants v WHERE v.id = $1 FOR UPDATE`.
   - Nếu tồn kho đủ: Trừ kho ngay lập tức (`UPDATE product_variants SET inventory_quantity = inventory_quantity - $qty`).
   - Kiểm tra và tăng lượt dùng voucher khuyến mãi (`FOR UPDATE`). Tính phí vận chuyển theo cấu hình.
   - Tạo đơn hàng với mã ngẫu nhiên `displayId` (dạng `TP-xxxx`), sinh mã VietQR động NAPAS 24/7 và `COMMIT`.
   - Gửi email xác nhận đơn hàng bất đồng bộ.

3. **Luồng Thanh toán Tự động VietQR & Auto-Expire Cron**:
   - Khách quét mã VietQR ngân hàng. Hệ thống Open Banking gửi `POST /api/webhooks/vietqr`.
   - Server bóc tách regex mã đơn `TP-([0-9]{4,6})`, kiểm tra số tiền khớp lệnh.
   - Cập nhật `payment_status = 'captured'`, ghi log và gửi email báo thành công.
   - Client thực hiện polling mỗi 2.5s; ngay khi nhận được trạng thái `captured`, UI phát hiệu ứng thành công.
   - Tại `server.js`, cron ngầm mỗi 60s gọi `orderService.expireStaleVietQROrders(30)`: Tự động hủy các đơn VietQR chưa thanh toán quá 30 phút và hoàn lại tồn kho biến thể.

4. **Luồng Giao vận & Lộ trình Bưu tá (Logistics Flow)**:
   - Khi tạo đơn, hệ thống tự động sinh mã vận đơn và gán hãng mặc định (GHN), ghi mốc bưu cục đầu tiên `order_received`.
   - Admin có thể chuyển đổi giữa 4 hãng: GHN, GHTK, Viettel Post, Hỏa tốc 2H và bấm nút mô phỏng bước di chuyển tiếp theo (`simulate-step`).
   - Khách hàng tra cứu tiến trình trên timeline bưu cục và gọi trực tiếp số điện thoại bưu tá.

5. **Luồng Đánh giá & Danh sách Yêu thích Lai (Reviews & Wishlist)**:
   - Khi khách gửi review, server tự động kiểm tra bảng `order_items` và `orders` xem email/userId đã mua sản phẩm chưa để cấp cờ `verified_purchase = true`.
   - Wishlist hỗ trợ lưu trữ kép: Khách vãng lai lưu tại `localStorage`; khi đăng nhập, hệ thống tự động gọi API `POST /api/wishlist/sync` đồng bộ vào database.

### 2.4. Cấu trúc Cơ sở dữ liệu (15 Bảng Quan hệ)
Lược đồ cơ sở dữ liệu được định nghĩa trong `src/config/db.js` bao gồm 15 bảng:
1. `users`: Tài khoản khách hàng và quản trị viên (`role`: 'customer', 'admin').
2. `categories`: Ngành hàng / danh mục sản phẩm (`slug` UNIQUE).
3. `products`: Sản phẩm gốc (`slug` UNIQUE, `category_id`).
4. `product_options`: Thuộc tính tùy chọn (`product_id`).
5. `product_variants`: Biến thể SKU (`sku` UNIQUE, `product_id`, `options_json` JSONB).
6. `promotions`: Mã ưu đãi giảm giá (`code` UNIQUE, `usage_limit`, `usage_count`).
7. `orders`: Đơn hàng (`display_id` UNIQUE, `payment_status`, `fulfillment_status`).
8. `order_items`: Chi tiết mặt hàng trong đơn (`order_id`, `variant_id`).
9. `order_logs`: Nhật ký chuyển đổi trạng thái đơn hàng (`order_id`).
10. `webhook_logs`: Nhật ký giao dịch webhook ngân hàng (`order_id`, `raw_payload`).
11. `reviews`: Đánh giá 1-5 sao (`product_id`, `user_id`, `verified_purchase`).
12. `wishlists`: Sản phẩm yêu thích (`UNIQUE(user_id, product_id)`).
13. `shipment_tracking_events`: Mốc lộ trình bưu tá (`order_id`, `status`).
14. `email_logs`: Lịch sử email giao dịch đã gửi (`order_id`, `template_type`).
15. `store_settings`: Cấu hình thương hiệu, biểu phí vận chuyển và tài khoản VietQR thụ hưởng (`id = 1`).

### 2.5. Danh mục Module Backend & Giao diện Frontend
- **10 Module Backend (`src/modules/`)**: `auth`, `product`, `promotion`, `order`, `dashboard`, `webhook`, `review`, `wishlist`, `shipping`, `notification`.
- **20 Component Frontend (`frontend/src/components/`)**: `Navbar`, `HeroBanner`, `CategoryFilter`, `ProductCard`, `ProductModal`, `ProductReviews`, `CartDrawer`, `CheckoutModal`, `OrderTrackingModal`, `MyOrdersModal`, `WishlistDrawer`, `AuthModal`, `AdminPortal`, `AdminOrderDetailModal`, `AdminCreateProductModal`, `AdminEditProductModal`, `AdminVariantEditModal`, `AdminCreatePromoModal`, `AdminDocsTab`, `Toast`.
- **Tổng số tệp tin quản lý trong repo**: 70 tệp tin chính thức (chi tiết đã được định danh tại Báo cáo Khảo sát 1).

---

## 3. TRỤ CỘT 2: AN TOÀN THÔNG TIN & QUẢN LÝ BÍ MẬT

### 3.1. Rà soát rò rỉ bí mật & Khóa bảo mật (Secret Scanning)
- **Rò rỉ nghiêm trọng (Hardcoded Credentials)**:
  - Khóa API Render (`rnd_VRDeFOy2odVHNB3CFVNkRYrED2NE`) và chuỗi kết nối Supabase kèm mật khẩu plaintext (`manhhung0423`) bị hardcode trực tiếp trong component frontend `frontend/src/components/AdminDocsTab.jsx` tại dòng 85 và 117.
  - Khi chạy `npm run build`, các chuỗi bí mật này bị đóng gói thẳng vào file tĩnh `frontend/dist/assets/index-BpX9HFM9.js` và được phân phối công khai tới trình duyệt người dùng.
  - Các thông tin này cũng bị commit công khai trong tệp tài liệu `HUONG_DAN_TRIEN_KHAI_RENDER.md` (dòng 11, 15, 16) và tệp xuất báo cáo `src/scripts/exportHandoverExcel.js` (dòng 61, 85, 91).
- **Rủi ro**: Bất kỳ người dùng nào mở trang web đều có thể trích xuất API Key và chuỗi kết nối để chiếm đoạt toàn quyền cơ sở dữ liệu Supabase và máy chủ Render.

### 3.2. Đánh giá Xác thực, Phân quyền & Quản lý phiên
- **Cơ chế Fallback JWT Secret nguy hiểm**:
  - Tại `src/middlewares/auth.js:3`: `const JWT_SECRET = process.env.JWT_SECRET || 'techpulse_modular_jwt_secret_key_2026';`.
  - Tại `docker-compose.yml:19`: `JWT_SECRET=${JWT_SECRET:-techpulse_secret_key_production_2026}`.
  - Việc hardcode secret dự phòng cho phép kẻ tấn công tự sinh JWT token với quyền `admin` mà không cần biết mật khẩu của hệ thống.
- **Thiếu cơ chế thu hồi token (Token Invalidation)**:
  - Sau khi người dùng hoặc quản trị viên đổi mật khẩu (`authService.changePassword`), token JWT cũ vẫn có hiệu lực 7 ngày (`expiresIn: '7d'`) do hệ thống không có blacklist token hoặc cơ chế versioning (`token_version`).
- **Mật khẩu quản trị mặc định (Default Admin Credential)**:
  - Trong `src/config/seed.js:233`, hệ thống tự động chèn tài khoản `admin@techpulse.vn` với mật khẩu mặc định `admin123` nếu chưa có admin trong cơ sở dữ liệu.

### 3.3. Bảo mật Cổng thanh toán & Webhook
- **Webhook Endpoint hoàn toàn không bắt buộc xác thực**:
  - Tại `src/modules/webhook/webhookController.js:13-24`, logic kiểm tra:
    ```javascript
    const configuredSecret = (process.env.WEBHOOK_SECRET && ...) || (process.env.VIETQR_SECRET_TOKEN && ...) || null;
    if (configuredSecret && apiKey !== configuredSecret) { return res.status(401)...; }
    ```
    Trong file `.env`, cả hai biến trên đều không được định nghĩa (`configuredSecret = null`). Do đó điều kiện `configuredSecret && ...` trở thành `false`, cho phép bất kỳ request nào trên internet cũng được xử lý mà không cần API key.
- **Public Simulator Endpoint cho phép thanh toán 0 đồng**:
  - Endpoint `POST /api/webhooks/vietqr/simulate` (`src/routes/api.js:91`) hoàn toàn không yêu cầu quyền Admin, không có xác thực và không kiểm tra môi trường production. Kẻ xấu có thể gửi request `{"display_id": "TP-xxxx"}` để tự động biến đơn hàng thành `captured` (đã thanh toán) mà không hề chuyển tiền.

### 3.4. Kiểm soát Dữ liệu đầu vào, XSS & Upload tệp tin
- **Lỗ hổng IDOR & Thu thập dữ liệu khách hàng (PII Scraping)**:
  - Tại `src/modules/order/orderService.js:337-370`, việc kiểm tra quyền truy cập chỉ được áp dụng khi tham số tra cứu là số (`isNum === true`).
  - Khi tra cứu bằng mã hiển thị `display_id` (ví dụ `TP-8801`), toàn bộ kiểm tra quyền bị bỏ qua, trả về trọn vẹn thông tin nhạy cảm: Họ tên khách hàng, số điện thoại, địa chỉ nhà, danh sách mặt hàng, mã vận đơn, tên và SĐT bưu tá.
  - Do `display_id` chỉ được sinh ngẫu nhiên từ 1000 đến 9999 (chỉ có 9.000 khả năng), kẻ tấn công có thể quét sạch toàn bộ danh sách khách hàng và đơn hàng trong vài phút.
- **Lỗ hổng Stored XSS trong Client cũ & Upload file SVG tùy tiện**:
  - Tệp client cũ `public/app.js` (dòng 375, 494, 640, 1007, 1063) gán trực tiếp dữ liệu người dùng vào `innerHTML`.
  - Tại `src/modules/product/productController.js:51`, hệ thống cho phép upload file ảnh định dạng `.svg` mà không qua bất kỳ bộ lọc XML nào. Kẻ tấn công có thể chèn mã `<script>` vào file SVG và lưu vào `public/uploads` để kích hoạt Stored XSS khi có người xem ảnh.

### 3.5. Mã hóa kênh truyền & Cấu hình TLS/SSL
- **Vô hiệu hóa xác thực chứng chỉ TLS (`rejectUnauthorized: false`)**:
  - Tại `src/config/db.js:30-33`:
    ```javascript
    ssl: process.env.DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false }
    ```
    Cấu hình này tắt hoàn toàn việc kiểm tra chuỗi chứng chỉ SSL của cơ sở dữ liệu, khiến kết nối giữa Backend và Supabase dễ dàng bị tấn công Man-in-the-Middle (MITM) trên đường truyền mạng công cộng.

---

## 4. TRỤ CỘT 3: HIỆU NĂNG & KHẢ NĂNG MỞ RỘNG

### 4.1. Phân tích Chỉ mục Cơ sở dữ liệu (Database Indexing Deficit)
Qua rà soát toàn bộ tệp khởi tạo lược đồ `src/config/db.js` (dòng 161–420), **hoàn toàn không có bất kỳ lệnh `CREATE INDEX` nào** ngoại trừ các chỉ mục mặc định trên khóa chính (PK) và ràng buộc duy nhất (UNIQUE).
- Các cột khóa ngoại thường xuyên tham gia JOIN như:
  - `orders(user_id)`
  - `order_items(order_id, variant_id)`
  - `product_variants(product_id)`
  - `products(category_id)`
  - `reviews(product_id, user_id)`
  - `shipment_tracking_events(order_id)`
- Các cột thường xuyên lọc và sắp xếp:
  - `orders(payment_status, fulfillment_status, created_at)`
  - `product_variants(is_active, inventory_quantity, price)`
- **Hệ quả**: Mọi câu lệnh JOIN và cron job quét đơn hàng hết hạn định kỳ đều phải quét tuần tự toàn bộ bảng (Sequential Table Scan). Khi số lượng đơn hàng vượt quá 10.000 dòng, thời gian thực thi truy vấn sẽ tăng từ vài mili-giây lên hàng giây, dẫn tới kiệt quệ Connection Pool (`max: 10`).

### 4.2. Chiến lược Phân trang & Tối ưu hóa Truy vấn
- API danh sách sản phẩm `GET /api/products` (`src/modules/product/productService.js:136-217`) và danh sách đơn hàng `GET /api/orders` (`src/modules/order/orderService.js:259-308`) hoàn toàn **không áp dụng phân trang (Pagination)**.
- Toàn bộ bản ghi kèm các phép gom nhóm `JSON_AGG` và tính toán `MIN/MAX/AVG` đều được nạp đồng loạt vào bộ nhớ Node.js. Điều này gây lãng phí băng thông mạng, tràn bộ nhớ RAM máy chủ và làm chậm thời gian render của giao diện frontend khi dữ liệu tăng trưởng.

### 4.3. Độc lập truy vấn & Xử lý bất đồng bộ
- Tại `src/modules/dashboard/dashboardService.js:6-82`, 6 câu truy vấn thống kê (doanh thu, tổng sản phẩm, cơ cấu ngành, đơn gần nhất, cảnh báo tồn kho, top bán chạy) được thực thi **hoàn toàn tuần tự** bằng các lệnh `await` nối tiếp nhau:
  ```javascript
  const revRes = await pool.query(...);
  const prodCountRes = await pool.query(...);
  const categoryStatsRes = await pool.query(...);
  const recentOrdersRes = await pool.query(...);
  const lowStockRes = await pool.query(...);
  const topProductsRes = await pool.query(...);
  ```
- **Hệ quả**: Thời gian phản hồi của trang Dashboard bằng tổng thời gian của cả 6 truy vấn cộng lại ($T = \sum_{i=1}^6 t_i$). Thay vì vậy, các truy vấn này hoàn toàn độc lập và có thể chạy song song qua `Promise.all` để thời gian phản hồi chỉ còn bằng truy vấn dài nhất ($T = \max t_i$).

### 4.4. Đánh giá I/O Đĩa & Node.js Event Loop Blocking
- **Chặn Event Loop bằng hàm đồng bộ**:
  - Tại `src/app.js:59`, trong route catch-all phục vụ SPA `app.get('*')`, hàm `fs.existsSync(frontendDist)` được gọi đồng bộ trên mỗi HTTP GET request không phải API.
  - Tại `src/modules/product/productController.js:64-67`, các hàm `fs.existsSync`, `fs.mkdirSync` và `fs.writeFileSync` được gọi đồng bộ khi upload ảnh. Dưới tải nhiều người dùng tải ảnh, luồng thực thi đơn của Node.js sẽ bị đóng băng (blocking), làm gián đoạn toàn bộ các request khác.
- **Rủi ro lưu trữ cục bộ trên Cloud PaaS**:
  - Ảnh tải lên được ghi vào thư mục đĩa cục bộ `public/uploads`. Trên các nền tảng PaaS như Render (gói Free hoặc không gắn Persistent Disk), toàn bộ ảnh sẽ bị xóa sạch mỗi khi container khởi động lại hoặc redeploy.

### 4.5. Cơ chế PGlite Fallback Mutex & Khả năng chịu tải
- Tại `src/config/db.js:13, 100-112`, để tránh lỗi đồng thời của engine PGlite nhúng, hệ thống sử dụng một biến mutex toàn cục `let pgliteMutex = Promise.resolve();` để tuần tự hóa toàn bộ các truy vấn cơ sở dữ liệu thành một chuỗi Promise FIFO.
- **Hệ quả**: Trong chế độ fallback, mọi request đồng thời từ người dùng đều phải xếp hàng đợi thực thi lần lượt, biến hệ thống thành nút thắt cổ chai đơn luồng nghiêm trọng.

---

## 5. TRỤ CỘT 4: CHẤT LƯỢNG MÃ NGUỒN & NỢ KỸ THUẬT

### 5.1. Hiện trạng Kiểm thử tự động (Zero Automated Testing)
- **Tình trạng kiểm thử**: Rà soát toàn bộ dự án ghi nhận **0 bài kiểm thử tự động** (0 unit tests, 0 integration tests, 0 E2E tests).
- Cả `package.json` và `frontend/package.json` đều không cài đặt bất kỳ test framework nào (không có Jest, Vitest, Mocha, Supertest hay Playwright).
- Không có cấu hình linter (ESLint) hoặc định dạng mã nguồn (Prettier).
- Việc đảm bảo chất lượng hiện nay hoàn toàn phụ thuộc vào kiểm thử thủ công và các endpoint giả lập (`/simulate`). Đây là rủi ro cực lớn đối với việc mở rộng hoặc bảo trì dự án.

### 5.2. Cấu trúc Component Frontend & Monolithic God Component
- Component `frontend/src/components/AdminPortal.jsx` có kích thước lên tới **2.657 dòng mã** trong một tệp tin duy nhất.
- Tệp này gộp chung quá nhiều chức năng không liên quan: Dashboard thống kê, quản lý đơn hàng, bộ lọc bưu tá, quản lý sản phẩm, chỉnh sửa biến thể, quản lý mã giảm giá, cấu hình thương hiệu ngân hàng, cổng test webhook và xuất báo cáo CSV.
- Cấu trúc này vi phạm nguyên lý Single Responsibility Principle (SRP), gây khó khăn cho việc bảo trì và tăng nguy cơ gây lỗi hồi quy (regression bugs) khi chỉnh sửa.

### 5.3. Lỗi tiềm ẩn logic (Logic Bugs & Attribute Mismatch)
- **Lỗi hiển thị tên tác giả đánh giá sản phẩm**:
  - Tại `src/modules/review/reviewController.js:29`:
    `const authorName = userName || (req.user ? req.user.fullName : 'Khách hàng TechPulse');`
  - Tuy nhiên, trong `src/modules/auth/authService.js:28, 69`, payload của JWT token được tạo ra với thuộc tính `full_name` (snake_case), chứ không phải `fullName`.
  - Do đó, `req.user.fullName` luôn luôn là `undefined`. Khi khách hàng đã đăng nhập gửi đánh giá mà không điền form tên, hệ thống luôn ghi nhận tên người đánh giá là `'Khách hàng TechPulse'`, làm mất dấu tên thật của khách.

### 5.4. Đụng độ định danh ngẫu nhiên (Identifier Collision Risk)
- Tại `src/modules/order/orderService.js:133`:
  `const displayId = `TP-${Math.floor(1000 + Math.random() * 9000)}`;`
- Cột `display_id` trong bảng `orders` có ràng buộc duy nhất `UNIQUE` (`src/config/db.js:251`).
- Việc chỉ sử dụng số ngẫu nhiên 4 chữ số (từ 1000 đến 9999, tương đương 9.000 giá trị) theo nghịch lý ngày sinh (Birthday Paradox) sẽ dẫn tới tỷ lệ đụng độ mã đơn hàng rất cao sau vài trăm đơn hàng, gây lỗi 500 ném ra cho khách hàng khi thanh toán.

### 5.5. Quản lý thư viện phụ thuộc & Xung đột Package Manager
- Trong thư mục gốc tồn tại song song cả `package-lock.json` (npm) và `bun.lock` (bun).
- Kiểm tra `npm audit` phát hiện thư viện `xlsx@0.18.5` có 2 cảnh báo an ninh mức độ **High** (GHSA-4r6h-8v6p-xvw6 về Prototype Pollution và GHSA-5pgg-2g8v-p4x9 về ReDoS) mà không có bản vá chính thức trên npm registry.

---

## 6. TRỤ CỘT 5: CẤU HÌNH TRIỂN KHAI & DEVOPS

### 6.1. Đóng gói Container đa tầng (Docker & Docker Compose)
- **Điểm sáng**: `Dockerfile` sử dụng kỹ thuật multi-stage build với base image `node:20-alpine`, tạo user non-root `techpulse` (UID 1001), cài đặt `HEALTHCHECK` tại `/api/health`.
- **Lỗ hổng phân quyền thư mục PGlite**:
  - Người dùng non-root `techpulse` chỉ được phân quyền sở hữu trên `/app/frontend/dist`. Thư mục gốc `/app` thuộc quyền `root`.
  - Khi triển khai container mà không có biến `DATABASE_URL` (hoặc mạng lỗi), hệ thống chuyển sang PGlite và cố gắng tạo thư mục `/app/.pglite-data`. Thao tác này sẽ bị hệ điều hành từ chối quyền truy cập (`EACCES`), buộc PGlite phải chạy trên RAM tạm thời và làm mất sạch toàn bộ dữ liệu khi container restart.

### 6.2. Cấu hình PaaS Render.com & Lỗi lệch lệnh Build (`render.yaml`)
- Trong tệp `render.yaml:7`, lệnh build được cấu hình là:
  ```yaml
  buildCommand: npm install
  ```
- Tuy nhiên, trong `package.json` gốc không có script `postinstall`. Để build được frontend React SPA, lệnh bắt buộc phải là `npm run build` (chạy `npm --prefix frontend install --include=dev && npm --prefix frontend run build`).
- **Hệ quả**: Nếu Render triển khai tự động dựa theo tệp `render.yaml`, thư mục `frontend/dist` sẽ **không bao giờ được tạo ra**. Máy chủ Express sẽ buộc phải rơi về phục vụ các tệp HTML tĩnh cũ trong thư mục `public/`, làm mất toàn bộ giao diện React 19 và các tính năng mới của cửa hàng!

### 6.3. Đường ống CI/CD & Tự động hóa
- Dự án hoàn toàn thiếu vắng thư mục `.github/workflows` hoặc bất kỳ tệp cấu hình CI/CD nào (`GitLab CI`, `Bitbucket Pipelines`).
- Không có quy trình tự động chạy linter, kiểm thử đơn vị hay quét lỗ hổng phụ thuộc khi có commit mới hoặc pull request.

### 6.4. Giám sát vận hành, Healthcheck & Logging tập trung
- Endpoint `/api/health` đã được thiết lập, trả về trạng thái máy chủ, uptime và thông tin dịch vụ.
- Tuy nhiên, hệ thống chưa có cấu hình xử lý tín hiệu tắt mềm (`SIGTERM`, `SIGINT`) để đóng kết nối database pool một cách an toàn (Graceful Shutdown), và các bản ghi nhật ký (logging) hiện chỉ sử dụng `console.log` mà không có cấu hình Structured Logging (như Winston hay Pino) để chuyển tiếp lên các hệ thống giám sát log tập trung.

---

## 7. MA TRẬN PHÁT HIỆN TOÀN DIỆN & PHÂN TÍCH CHI TIẾT

### 7.1. Bảng ma trận tổng hợp phát hiện (Consolidated Matrix)

| ID | Trụ cột | Tiêu đề Phát hiện | Mức độ | Phân loại Chuẩn | Vị trí Tệp & Dòng mã | Trạng thái |
| :---: | :---: | :--- | :---: | :---: | :--- | :---: |
| **SEC-01** | Bảo mật | Lộ lọt mật khẩu Supabase & Render API Key trong Frontend Bundle & Git | 🔴 **CRITICAL** | CWE-798 / OWASP A02 | `AdminDocsTab.jsx:85,117`, `HUONG_DAN_TRIEN_KHAI_RENDER.md:11` | CẦN XỬ LÝ NGAY |
| **SEC-02** | Bảo mật | Webhook VietQR thiếu xác thực & Public Simulator bypass thanh toán | 🔴 **CRITICAL** | CWE-306 / OWASP A07 | `webhookController.js:13-24,37-65`, `api.js:90-91` | CẦN XỬ LÝ NGAY |
| **SEC-03** | Bảo mật | Lỗ hổng IDOR và rò rỉ PII khách hàng qua tra cứu Display ID | 🟠 **HIGH** | CWE-639 / OWASP A01 | `orderService.js:337-370`, `api.js:77` | CẦN KHẮC PHỤC |
| **SEC-04** | Bảo mật | Hardcode JWT Secret dự phòng & Thiếu cơ chế vô hiệu hóa Token | 🟠 **HIGH** | CWE-1188 / OWASP A02 | `middlewares/auth.js:3`, `docker-compose.yml:19` | CẦN KHẮC PHỤC |
| **SEC-05** | Bảo mật | Vô hiệu hóa xác thực chứng chỉ TLS Database (`rejectUnauthorized: false`)| 🟠 **HIGH** | CWE-295 / OWASP A02 | `src/config/db.js:30-33` | CẦN KHẮC PHỤC |
| **SEC-06** | Bảo mật | Stored XSS trong Client cũ (`innerHTML`) & Upload file SVG tùy tiện | 🟠 **HIGH** | CWE-79, CWE-434 / OWASP A03 | `public/app.js:375`, `productController.js:51` | CẦN KHẮC PHỤC |
| **SEC-07** | Bảo mật | Thư viện xử lý Excel `xlsx` dính lỗi Prototype Pollution & ReDoS | 🟠 **HIGH** | CWE-1321, CWE-1333 / OWASP A06 | `package.json:19` (`xlsx@^0.18.5`) | CẦN KHẮC PHỤC |
| **SEC-08** | Bảo mật | Rate Limiter dễ bị giả mạo IP (`X-Forwarded-For`) & Body parser 12MB | 🟡 **MEDIUM** | CWE-290 / OWASP A05 | `middlewares/security.js:31-32`, `src/app.js:28` | NÊN CẢI THIỆN |
| **SEC-09** | Bảo mật | Tự động chèn tài khoản Admin với mật khẩu mặc định `admin123` | 🟡 **MEDIUM** | CWE-1188 / OWASP A07 | `src/config/seed.js:233` | NÊN CẢI THIỆN |
| **SEC-10** | Bảo mật | Thiếu các HTTP Security Headers thiết yếu (CSP, HSTS) & Wildcard CORS | 🔵 **LOW** | CWE-1021 / OWASP A05 | `middlewares/security.js:6-11`, `src/app.js:25` | NÊN CẢI THIỆN |
| **PERF-01**| Hiệu năng| Thiếu 100% Index trên Khóa ngoại và Cột lọc dữ liệu của 15 Bảng | 🟠 **HIGH** | CWE-400 / Kiến trúc DB | `src/config/db.js:161-420` | CẦN KHẮC PHỤC |
| **PERF-02**| Hiệu năng| Thiếu phân trang trên API danh sách sản phẩm và đơn hàng | 🟠 **HIGH** | CWE-770 / Tài nguyên | `productService.js:136-217`, `orderService.js:259-308` | CẦN KHẮC PHỤC |
| **PERF-03**| Hiệu năng| Thực thi tuần tự 6 truy vấn độc lập trong Dashboard Service | 🟡 **MEDIUM** | Hiệu năng / Concurrency | `dashboardService.js:6-82` | NÊN CẢI THIỆN |
| **PERF-04**| Hiệu năng| Sử dụng hàm I/O đồng bộ gây chặn Node.js Event Loop | 🟡 **MEDIUM** | CWE-400 / Node.js Runtime | `src/app.js:59`, `productController.js:64-67` | NÊN CẢI THIỆN |
| **PERF-05**| Hiệu năng| Global Mutex trong PGlite làm nghẽn toàn bộ kết nối đồng thời | 🟡 **MEDIUM** | Nút thắt cổ chai hệ thống | `src/config/db.js:13, 100-112` | NÊN CẢI THIỆN |
| **QUAL-01**| Chất lượng| Hoàn toàn thiếu vắng bộ kiểm thử tự động (0% Test Coverage) | 🟠 **HIGH** | Nợ kỹ thuật / Reliability | `package.json:6-10`, `frontend/package.json:6-10` | CẦN KHẮC PHỤC |
| **QUAL-02**| Chất lượng| Monolithic God Component (`AdminPortal.jsx` > 2.650 dòng) | 🟡 **MEDIUM** | Khả năng bảo trì mã nguồn | `frontend/src/components/AdminPortal.jsx` | NÊN CẢI THIỆN |
| **QUAL-03**| Chất lượng| Lỗi thuộc tính token người dùng trong Review (`req.user.fullName`) | 🔵 **LOW** | Lỗi Logic / Functional Defect | `src/modules/review/reviewController.js:29` | NÊN CẢI THIỆN |
| **QUAL-04**| Chất lượng| Rủi ro đụng độ mã đơn hàng ngẫu nhiên `display_id` (1000 - 9999) | 🟡 **MEDIUM** | Tính toàn vẹn dữ liệu | `src/modules/order/orderService.js:133` | NÊN CẢI THIỆN |
| **QUAL-05**| DevOps | Lệnh build trong `render.yaml` không biên dịch Frontend React SPA | 🟡 **MEDIUM** | Cấu hình triển khai | `render.yaml:7` (`buildCommand: npm install`) | CẦN KHẮC PHỤC |

---

### 7.2. Chi tiết từng phát hiện, Bằng chứng mã nguồn & Phương án khắc phục kỹ thuật

#### 🔴 PHÁT HIỆN SEC-01: Lộ lọt Mật khẩu Supabase & Render API Key trong Frontend Bundle & Git
- **Mức độ**: 🔴 **CRITICAL** (CVSS: 9.8)
- **Tiêu chuẩn**: CWE-798 (Use of Hard-coded Credentials), OWASP Top 10:2021-A02 (Cryptographic Failures).
- **Vị trí tệp & dòng mã**:
  - `frontend/src/components/AdminDocsTab.jsx:85, 117`
  - `frontend/dist/assets/index-BpX9HFM9.js` (Bản build đóng gói ra client)
  - `HUONG_DAN_TRIEN_KHAI_RENDER.md:11, 15, 16`
  - `src/scripts/exportHandoverExcel.js:61, 85, 91`
- **Bằng chứng mã nguồn (Code Snippet)**:
  ```jsx
  // frontend/src/components/AdminDocsTab.jsx
  85:  onClick={() => copyToClipboard('rnd_VRDeFOy2odVHNB3CFVNkRYrED2NE', 'apikey', 'Render API Key')}
  ...
  117: onClick={() => copyToClipboard('postgresql://postgres.oecgyiaetefmxkrndcvk:manhhung0423@aws-0-ap-south-1.pooler.supabase.com:6543/postgres', 'dburl', 'DATABASE_URL')}
  ```
- **Phân tích nguyên nhân & Rủi ro**: Lập trình viên đưa các khóa bí mật vào giao diện để tiện sao chép trong quá trình demo. Tuy nhiên, Vite đóng gói toàn bộ mã nguồn component vào bundle JavaScript tĩnh phía client. Bất kỳ ai mở F12 hoặc gọi file JS đều xem được mật khẩu quản trị database và API key của Render, cho phép xóa toàn bộ bảng dữ liệu hoặc chiếm quyền kiểm soát hạ tầng đám mây.
- **Giải pháp khắc phục chi tiết**:
  1. *Ngay lập tức*: Truy cập `supabase.com` đổi mật khẩu database; truy cập `dashboard.render.com` thu hồi và cấp lại API Key mới.
  2. *Sửa mã nguồn*: Xóa bỏ hoàn toàn chuỗi ký tự cứng, chỉ đọc từ biến môi trường máy chủ hoặc ẩn nút copy trên giao diện công khai.
  ```diff
  --- a/frontend/src/components/AdminDocsTab.jsx
  +++ b/frontend/src/components/AdminDocsTab.jsx
  @@ -84,3 +84,3 @@
  -  onClick={() => copyToClipboard('rnd_VRDeFOy2odVHNB3CFVNkRYrED2NE', 'apikey', 'Render API Key')}
  +  onClick={() => copyToClipboard('********************************', 'apikey', 'Render API Key (Đã ẩn vì bảo mật)')}
  @@ -116,3 +116,3 @@
  -  onClick={() => copyToClipboard('postgresql://postgres.oecgyiaetefmxkrndcvk:manhhung0423@aws-0-ap-south-1.pooler.supabase.com:6543/postgres', 'dburl', 'DATABASE_URL')}
  +  onClick={() => copyToClipboard('postgresql://postgres:[PASSWORD_HIDDEN]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres', 'dburl', 'DATABASE_URL')}
  ```

---

#### 🔴 PHÁT HIỆN SEC-02: Webhook VietQR Thiếu Xác Thực & Public Simulator Bypass Thanh Toán
- **Mức độ**: 🔴 **CRITICAL** (CVSS: 9.1)
- **Tiêu chuẩn**: CWE-306 (Missing Authentication for Critical Function), OWASP Top 10:2021-A07 (Identification and Authentication Failures).
- **Vị trí tệp & dòng mã**:
  - `src/modules/webhook/webhookController.js:13-24` (Hàm `handleBankTransfer`)
  - `src/modules/webhook/webhookController.js:37-65` (Hàm `simulateTransfer`)
  - `src/routes/api.js:90-91`
- **Bằng chứng mã nguồn (Code Snippet)**:
  ```javascript
  // src/modules/webhook/webhookController.js:13-24
  const configuredSecret =
    (process.env.WEBHOOK_SECRET && process.env.WEBHOOK_SECRET.trim()) ||
    (process.env.VIETQR_SECRET_TOKEN && process.env.VIETQR_SECRET_TOKEN.trim()) ||
    null;

  if (configuredSecret && apiKey !== configuredSecret) {
    return res.status(401).json({ success: false, message: 'Webhook Secret Key không hợp lệ' });
  }
  ```
- **Phân tích nguyên nhân & Rủi ro**:
  1. Nếu biến môi trường `WEBHOOK_SECRET` không được đặt trong `.env`, biến `configuredSecret` mang giá trị `null`, khiến lệnh `if (configuredSecret && ...)` bị bỏ qua hoàn toàn. Bất kỳ request nào giả mạo tín hiệu ngân hàng đều được chấp nhận.
  2. Endpoint `POST /api/webhooks/vietqr/simulate` mở công khai cho toàn internet, cho phép bất kỳ ai gửi mã `TP-xxxx` để chuyển trạng thái đơn hàng sang `captured` (đã thanh toán thành công) mà không cần xác thực tài khoản hay quyền quản trị.
- **Giải pháp khắc phục chi tiết**:
  1. Bắt buộc kiểm tra `WEBHOOK_SECRET`. Nếu server chưa cấu hình secret thì từ chối phục vụ (Fail-Safe Default).
  2. Chặn endpoint `/simulate` nếu không ở môi trường `development` hoặc bắt buộc quyền Admin (`authenticate`, `requireAdmin`).
  ```diff
  --- a/src/modules/webhook/webhookController.js
  +++ b/src/modules/webhook/webhookController.js
  @@ -16,4 +16,9 @@
         null;
   
  +    if (!configuredSecret) {
  +      console.error('CRITICAL: WEBHOOK_SECRET chưa được cấu hình trên máy chủ!');
  +      return res.status(500).json({ success: false, message: 'Máy chủ chưa cấu hình khóa bí mật Webhook' });
  +    }
  +
       if (apiKey !== configuredSecret) {
         return res.status(401).json({ success: false, message: 'Webhook Secret Key không hợp lệ' });
       }
  @@ -37,2 +42,7 @@
     async simulateTransfer(req, res, next) {
  +    if (process.env.NODE_ENV === 'production') {
  +      return res.status(403).json({ success: false, message: 'Tính năng giả lập bị vô hiệu hóa trên môi trường Production' });
  +    }
  ```

---

#### 🟠 PHÁT HIỆN SEC-03: Lỗ hổng IDOR và Rò rỉ PII Khách Hàng Qua Tra Cứu Display ID
- **Mức độ**: 🟠 **HIGH** (CVSS: 7.5)
- **Tiêu chuẩn**: CWE-639 (Authorization Bypass Through User-Controlled Key), OWASP Top 10:2021-A01 (Broken Access Control).
- **Vị trí tệp & dòng mã**: `src/modules/order/orderService.js:337-370`
- **Bằng chứng mã nguồn (Code Snippet)**:
  ```javascript
  // src/modules/order/orderService.js:337-347, 360-369
  const cleanInput = String(idOrDisplayId || '').trim().replace(/^#/, '');
  const isNum = /^\d+$/.test(cleanInput);

  if (isNum && (!requestingUser || (requestingUser.role !== 'admin' && !requestingUser.id))) {
    throw { status: 403, message: 'Vui lòng tra cứu bằng mã đơn hàng chuẩn (ví dụ: TP-8801)' };
  }
  ...
  if (isNum && requestingUser && requestingUser.role !== 'admin' && order.user_id !== requestingUser.id) {
    throw { status: 403, message: 'Bạn không có quyền truy cập đơn hàng này' };
  }
  ```
- **Phân tích nguyên nhân & Rủi ro**: Hệ thống chỉ kiểm tra quyền sở hữu khi tham số truyền vào là ID số (`isNum === true`). Khi tra cứu bằng mã hiển thị `TP-xxxx` (`isNum === false`), hệ thống không hề kiểm tra người gọi request có phải chủ sở hữu đơn hàng hay không. Hơn nữa, vì mã `TP-xxxx` chỉ nằm trong dải từ 1000 đến 9999, kẻ xấu có thể viết script vòng lặp vét cạn (enumerate) toàn bộ 9.000 khả năng để tải về toàn bộ danh bạ khách hàng, địa chỉ nhà, số điện thoại và lịch sử mua sắm.
- **Giải pháp khắc phục chi tiết**:
  1. Khi tra cứu công khai theo `display_id` (cho khách chưa đăng nhập tra cứu vận đơn), ẩn toàn bộ thông tin nhạy cảm: che bớt số điện thoại (ví dụ `0987***321`), che địa chỉ và không trả về email.
  2. Nâng độ dài và tính phức tạp ngẫu nhiên của `display_id` (sử dụng chuỗi NanoID hoặc chuỗi số mã hóa ngẫu nhiên 8-10 ký tự).
  ```diff
  --- a/src/modules/order/orderService.js
  +++ b/src/modules/order/orderService.js
  @@ -370,2 +370,12 @@
   
  +    // Nếu không phải Admin và không phải chính chủ đơn hàng, ẩn thông tin PII
  +    const isOwner = requestingUser && (requestingUser.role === 'admin' || order.user_id === requestingUser.id || (order.customer_email && order.customer_email.toLowerCase() === (requestingUser.email || '').toLowerCase()));
  +    if (!isOwner) {
  +      order.customer_phone = order.customer_phone ? order.customer_phone.replace(/(\d{3})\d{4}(\d{3})/, '$1****$2') : '';
  +      order.customer_email = order.customer_email ? order.customer_email.replace(/(.{2})(.*)(@.*)/, '$1***$3') : '';
  +      order.shipping_address = 'Địa chỉ giao hàng bảo mật (Chỉ hiển thị cho người nhận)';
  +    }
  ```

---

#### 🟠 PHÁT HIỆN SEC-04: Hardcode JWT Secret Dự Phòng & Thiếu Cơ Chế Vô Hiệu Hóa Token
- **Mức độ**: 🟠 **HIGH** (CVSS: 7.4)
- **Tiêu chuẩn**: CWE-1188 (Insecure Default Initialization of Resource), OWASP Top 10:2021-A02 (Cryptographic Failures).
- **Vị trí tệp & dòng mã**: `src/middlewares/auth.js:3`, `docker-compose.yml:19`
- **Bằng chứng mã nguồn (Code Snippet)**:
  ```javascript
  // src/middlewares/auth.js:3
  const JWT_SECRET = process.env.JWT_SECRET || 'techpulse_modular_jwt_secret_key_2026';
  ```
- **Phân tích nguyên nhân & Rủi ro**: Nếu biến `JWT_SECRET` bị thiếu trong môi trường production, ứng dụng tự động dùng chuỗi secret mặc định được công khai trong mã nguồn. Bất kỳ ai cũng có thể dùng thư viện `jsonwebtoken` ký một token giả với `{ "role": "admin", "id": 1 }` để đăng nhập với quyền tối cao. Ngoài ra, khi người dùng đổi mật khẩu, token cũ không bị hủy bỏ và vẫn có thể dùng trong 7 ngày.
- **Giải pháp khắc phục chi tiết**:
  1. Bắt buộc kiểm tra `process.env.JWT_SECRET`. Nếu không có, dừng khởi động server ngay lập tức.
  2. Thêm trường `token_version INT DEFAULT 1` vào bảng `users`. Mỗi khi đổi mật khẩu, tăng `token_version = token_version + 1`. Trong middleware `authenticate`, so sánh `token_version` trong payload với database để từ chối các token cũ.

---

#### 🟠 PHÁT HIỆN SEC-05: Vô Hiệu Hóa Xác Thực Chứng Chỉ TLS Database (`rejectUnauthorized: false`)
- **Mức độ**: 🟠 **HIGH** (CVSS: 7.4)
- **Tiêu chuẩn**: CWE-295 (Improper Certificate Validation), OWASP Top 10:2021-A02 (Cryptographic Failures).
- **Vị trí tệp & dòng mã**: `src/config/db.js:30-33`
- **Bằng chứng mã nguồn (Code Snippet)**:
  ```javascript
  ssl: process.env.DATABASE_URL.includes('localhost') || process.env.DATABASE_URL.includes('127.0.0.1')
    ? false
    : { rejectUnauthorized: false },
  ```
- **Phân tích nguyên nhân & Rủi ro**: Thiết lập `rejectUnauthorized: false` vô hiệu hóa việc kiểm tra tính hợp lệ của chứng chỉ SSL từ nhà cung cấp máy chủ PostgreSQL. Khi backend truyền tải dữ liệu tài khoản, mật khẩu băm và thông tin thẻ/đơn hàng qua mạng internet tới Supabase, kẻ tấn công trên cùng mạng hoặc router trung gian có thể thực hiện tấn công Man-in-the-Middle (MITM) để đánh cắp hoặc thay đổi dữ liệu mà không bị phát hiện.
- **Giải pháp khắc phục chi tiết**: Sử dụng chứng chỉ gốc CA của nhà cung cấp hoặc để cấu hình mặc định an toàn của `pg`:
  ```javascript
  ssl: process.env.DATABASE_URL.includes('localhost')
    ? false
    : { rejectUnauthorized: true, ca: process.env.SUPABASE_CA_CERT }
  ```

---

#### 🟠 PHÁT HIỆN SEC-06: Stored XSS trong Client Cũ (`innerHTML`) & Upload File SVG Tùy Tiện
- **Mức độ**: 🟠 **HIGH** (CVSS: 7.2)
- **Tiêu chuẩn**: CWE-79 (Improper Neutralization of Input During Web Page Generation), CWE-434 (Unrestricted Upload of File with Dangerous Type), OWASP Top 10:2021-A03 (Injection).
- **Vị trí tệp & dòng mã**: `public/app.js:375, 494, 640`, `src/modules/product/productController.js:51`
- **Bằng chứng mã nguồn (Code Snippet)**:
  ```javascript
  // public/app.js:375
  tbody.innerHTML = res.data.map(o => `...<td>${o.customer_name}</td><td>${o.shipping_address}</td>...`).join('');
  
  // src/modules/product/productController.js:51
  else if (mimeSub.includes('svg')) ext = 'svg';
  ```
- **Phân tích nguyên nhân & Rủi ro**:
  1. Trong client cũ `public/app.js`, các chuỗi do người dùng nhập (tên khách hàng, địa chỉ nhận hàng, ghi chú) được ghép trực tiếp vào `innerHTML` mà không qua hàm sanitize (như DOMPurify) hoặc escape HTML.
  2. Endpoint tải ảnh chấp nhận file SVG. File SVG là tài liệu XML có khả năng chứa thẻ `<script>alert(document.cookie)</script>`. Khi Admin hoặc khách mở ảnh từ `/uploads/xxx.svg`, mã JavaScript độc hại sẽ thực thi trong ngữ cảnh trang web, cho phép đánh cắp token phiên làm việc.
- **Giải pháp khắc phục chi tiết**:
  1. Loại bỏ hoàn toàn định dạng `.svg` khỏi danh sách file upload ảnh sản phẩm, chỉ cho phép ảnh raster (`.jpg`, `.jpeg`, `.png`, `.webp`).
  2. Escape dữ liệu text bằng `textContent` thay vì gán thô vào `innerHTML`.

---

#### 🟠 PHÁT HIỆN SEC-07: Thư Viện Xử Lý Excel `xlsx` Dính Lỗi Prototype Pollution & ReDoS
- **Mức độ**: 🟠 **HIGH** (CVSS: 7.8)
- **Tiêu chuẩn**: CWE-1321 (Improperly Controlled Modification of Dynamically-Determined Object Attributes), CWE-1333 (Inefficient Regular Expression Complexity), OWASP Top 10:2021-A06 (Vulnerable and Outdated Components).
- **Vị trí tệp & dòng mã**: `package.json:19` (`"xlsx": "^0.18.5"`)
- **Bằng chứng kiểm chứng**: Kết quả chạy `npm audit`:
  ```
  xlsx  *
  Severity: high
  Prototype Pollution in sheetJS - https://github.com/advisories/GHSA-4r6h-8v6p-xvw6
  SheetJS Regular Expression Denial of Service (ReDoS) - https://github.com/advisories/GHSA-5pgg-2g8v-p4x9
  No fix available
  ```
- **Phân tích nguyên nhân & Rủi ro**: Bản `xlsx` trên npm registry đã ngừng cập nhật bản vá bảo mật công khai. Kẻ tấn công có thể tải lên tệp Excel có cấu trúc độc hại để làm sập tiến trình Node.js (Denial of Service) hoặc ghi đè thuộc tính của Object prototype.
- **Giải pháp khắc phục chi tiết**: Thay thế thư viện `xlsx` bằng thư viện mã nguồn mở hiện đại, an toàn và được cập nhật thường xuyên như `exceljs`.
  ```bash
  npm uninstall xlsx
  npm install exceljs
  ```

---

#### 🟡 PHÁT HIỆN SEC-08: Giả Mạo IP trong Rate Limiter (`X-Forwarded-For`) & Kích Thước JSON Body 12MB
- **Mức độ**: 🟡 **MEDIUM** (CVSS: 5.3)
- **Tiêu chuẩn**: CWE-290 (Authentication Bypass by Spoofing), CWE-400 (Uncontrolled Resource Consumption), OWASP Top 10:2021-A05 (Security Misconfiguration).
- **Vị trí tệp & dòng mã**: `src/middlewares/security.js:31-32`, `src/app.js:28`
- **Bằng chứng mã nguồn (Code Snippet)**:
  ```javascript
  // src/middlewares/security.js:31-32
  const forwarded = req.headers['x-forwarded-for'];
  const clientIp = (typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : req.ip) || 'unknown';

  // src/app.js:28
  app.use(express.json({ limit: '12mb' }));
  ```
- **Phân tích nguyên nhân & Rủi ro**: 
  1. Express mặc định không tin cậy proxy (`app.set('trust proxy', ...)` chưa được cấu hình). Do đó header `x-forwarded-for` do client tự gửi lên hoàn toàn không được kiểm chứng. Kẻ tấn công có thể liên tục gửi các IP ngẫu nhiên trong header `X-Forwarded-For: 10.0.0.1`, `X-Forwarded-For: 10.0.0.2` để vượt qua toàn bộ cơ chế rate limiting đối với các endpoint nhạy cảm (đăng nhập brute-force, tạo đơn hàng rác).
  2. Kích thước body parser tối đa lên tới 12MB tạo điều kiện cho các cuộc tấn công DoS làm cạn kiệt bộ nhớ Node.js bằng cách gửi các payload JSON khổng lồ tới các endpoint thông thường.
- **Giải pháp khắc phục chi tiết**:
  1. Bật `app.set('trust proxy', 1)` khi chạy đằng sau reverse proxy chuẩn (như Render hoặc Nginx).
  2. Sử dụng thư viện chuẩn như `express-rate-limit` kết hợp Redis hoặc khống chế header qua proxy đã xác thực.
  3. Giảm kích thước `express.json({ limit: '1mb' })` cho các endpoint chung, chỉ tăng hạn mức cục bộ ở endpoint upload ảnh.

---

#### 🟡 PHÁT HIỆN SEC-09: Tự Động Chèn Tài Khoản Admin Với Mật Khẩu Mặc Định `admin123`
- **Mức độ**: 🟡 **MEDIUM** (CVSS: 6.5)
- **Tiêu chuẩn**: CWE-1188 (Insecure Default Initialization of Resource), OWASP Top 10:2021-A07 (Identification and Authentication Failures).
- **Vị trí tệp & dòng mã**: `src/config/seed.js:231-240`
- **Bằng chứng mã nguồn (Code Snippet)**:
  ```javascript
  // src/config/seed.js:231-240
  const adminCheck = await client.query(`SELECT id FROM users WHERE role = 'admin' LIMIT 1`);
  if (adminCheck.rows.length === 0) {
    const adminPassword = await bcrypt.hash('admin123', 10);
    await client.query(`
      INSERT INTO users (email, password_hash, full_name, phone, role)
      VALUES ('admin@techpulse.vn', $1, 'Quản Trị Viên (Admin)', '0987654321', 'admin')
      ON CONFLICT (email) DO NOTHING;
    `, [adminPassword]);
  }
  ```
- **Phân tích nguyên nhân & Rủi ro**: Khi triển khai hệ thống mới hoặc cơ sở dữ liệu trống, hàm `seedDatabase` tự động tạo tài khoản quản trị `admin@techpulse.vn` với mật khẩu phổ biến `admin123`. Nếu người vận hành quên đổi mật khẩu ngay sau khi triển khai, bất kỳ ai cũng có thể đăng nhập chiếm toàn quyền quản trị gian hàng, thay đổi tài khoản ngân hàng nhận tiền VietQR và sửa đổi giá sản phẩm.
- **Giải pháp khắc phục chi tiết**:
  1. Chỉ tạo tài khoản admin mẫu nếu có cờ `process.env.SEED_DEFAULT_ADMIN === 'true'`.
  2. Trên môi trường production, bắt buộc lấy mật khẩu từ biến môi trường `process.env.INITIAL_ADMIN_PASSWORD` (với độ dài tối thiểu 12 ký tự gồm chữ hoa, thường, số và ký tự đặc biệt) và in cảnh báo yêu cầu đổi mật khẩu trong lần đăng nhập đầu tiên.

---

#### 🔵 PHÁT HIỆN SEC-10: Thiếu Các HTTP Security Headers Thiết Yếu (CSP, HSTS) & Wildcard CORS
- **Mức độ**: 🔵 **LOW** (CVSS: 3.7)
- **Tiêu chuẩn**: CWE-1021 (Improper Restriction of Rendered UI Layers or Frames), OWASP Top 10:2021-A05 (Security Misconfiguration).
- **Vị trí tệp & dòng mã**: `src/middlewares/security.js:6-11`, `src/app.js:25`
- **Bằng chứng mã nguồn (Code Snippet)**:
  ```javascript
  // src/middlewares/security.js:6-11
  function securityHeaders(req, res, next) {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  }

  // src/app.js:25
  app.use(cors()); // Mặc định Access-Control-Allow-Origin: *
  ```
- **Phân tích nguyên nhân & Rủi ro**:
  1. Thiếu header `Content-Security-Policy` (CSP) giúp ngăn chặn tải mã script ngoài ý muốn.
  2. Thiếu `Strict-Transport-Security` (HSTS) để ép buộc trình duyệt luôn sử dụng giao thức HTTPS an toàn.
  3. Cấu hình `cors()` không chỉ định danh sách domain được phép (`origin`), cho phép bất kỳ website thứ ba nào cũng có thể gửi AJAX request đọc dữ liệu API từ trình duyệt của nạn nhân.
- **Giải pháp khắc phục chi tiết**: Cài đặt và sử dụng thư viện `helmet` tiêu chuẩn công nghiệp và cấu hình whitelist CORS:
  ```javascript
  const helmet = require('helmet');
  app.use(helmet({ contentSecurityPolicy: false })); // Tùy chỉnh CSP theo domain ảnh VietQR
  app.use(cors({ origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*' }));
  ```

---

#### 🟠 PHÁT HIỆN PERF-01: Thiếu 100% Index Trên Khóa Ngoại và Cột Lọc Dữ Liệu
- **Mức độ**: 🟠 **HIGH**
- **Tiêu chuẩn**: CWE-400 (Uncontrolled Resource Consumption), Database Optimization Best Practices.
- **Vị trí tệp & dòng mã**: `src/config/db.js:161-420` (Hàm `initDatabase`)
- **Bằng chứng thực tế**: Lệnh tìm kiếm chuỗi `INDEX` trong `src/config/db.js` trả về 0 kết quả.
- **Phân tích nguyên nhân & Rủi ro**: PostgreSQL không tự động đánh index cho các cột khóa ngoại (Foreign Keys). Tất cả các câu truy vấn JOIN giữa bảng `orders` với `order_items`, `products` với `product_variants`, cùng câu lệnh cron quét đơn hàng quá hạn mỗi 60 giây (`WHERE payment_status = 'awaiting_vietqr' AND created_at < NOW() - INTERVAL '30 minutes'`) đều buộc hệ điều hành cơ sở dữ liệu phải quét tuần tự toàn bộ các khối dữ liệu trên đĩa (Seq Scan). Khi dữ liệu đạt quy mô hàng ngàn đơn hàng, CPU database sẽ chạm ngưỡng 100%, gây nghẽn kết nối và làm sập API.
- **Giải pháp khắc phục chi tiết**: Thêm các chỉ mục cần thiết vào schema migration trong `src/config/db.js`:
  ```sql
  -- Tối ưu hóa các phép JOIN khóa ngoại
  CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
  CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON product_variants(product_id);
  CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
  CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
  CREATE INDEX IF NOT EXISTS idx_order_items_variant_id ON order_items(variant_id);
  CREATE INDEX IF NOT EXISTS idx_order_logs_order_id ON order_logs(order_id);
  CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);
  CREATE INDEX IF NOT EXISTS idx_shipment_events_order_id ON shipment_tracking_events(order_id);
  CREATE INDEX IF NOT EXISTS idx_email_logs_order_id ON email_logs(order_id);

  -- Tối ưu hóa bộ lọc và Cron Job
  CREATE INDEX IF NOT EXISTS idx_orders_stale_cron ON orders(payment_status, fulfillment_status, created_at);
  CREATE INDEX IF NOT EXISTS idx_orders_display_id ON orders(display_id);
  CREATE INDEX IF NOT EXISTS idx_product_variants_active_stock ON product_variants(is_active, inventory_quantity);
  ```

---

#### 🟠 PHÁT HIỆN PERF-02: Thiếu Phân Trang Trên API Danh Sách Sản Phẩm và Đơn Hàng
- **Mức độ**: 🟠 **HIGH**
- **Tiêu chuẩn**: CWE-770 (Allocation of Resources Without Limits or Throttling).
- **Vị trí tệp & dòng mã**:
  - `src/modules/product/productService.js:136-217` (`listProducts`)
  - `src/modules/order/orderService.js:259-308` (`listOrders`)
- **Bằng chứng mã nguồn (Code Snippet)**:
  ```javascript
  // src/modules/product/productService.js:215-216
  const res = await pool.query(query, params);
  return res.rows; // Trả về toàn bộ danh mục sản phẩm không giới hạn LIMIT/OFFSET
  ```
- **Phân tích nguyên nhân & Rủi ro**: Hiện tại API trả về toàn bộ sản phẩm và toàn bộ đơn hàng trong hệ thống. Khi số lượng sản phẩm lên đến hàng nghìn hoặc đơn hàng tích lũy qua nhiều tháng, một request tải danh sách đơn hàng có thể trả về một payload JSON nặng hàng chục Megabytes, làm tràn bộ nhớ Node.js process và gây đơ lag trình duyệt người dùng.
- **Giải pháp khắc phục chi tiết**: Bổ sung hai tham số `page` và `limit` vào controller/service:
  ```javascript
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const offset = (pageNum - 1) * pageSize;

  params.push(pageSize, offset);
  query += ` LIMIT $${params.length - 1} OFFSET $${params.length}`;
  ```

---

#### 🟠 PHÁT HIỆN QUAL-01: Hoàn Toàn Thiếu Vắng Bộ Kiểm Thử Tự Động (0% Test Coverage)
- **Mức độ**: 🟠 **HIGH**
- **Tiêu chuẩn**: Software Quality Assurance & Verification Standards.
- **Vị trí tệp & dòng mã**: `package.json:6-10`, `frontend/package.json:6-10`
- **Bằng chứng thực tế**:
  - `npm test` báo lỗi: `npm error Missing script: "test"`.
  - Toàn bộ workspace có **0 tệp tin test** (`*test*`, `*spec*`).
- **Phân tích nguyên nhân & Rủi ro**: Đội ngũ phát triển hiện tại chỉ kiểm thử bằng mắt và dựa vào các endpoint giả lập (`/simulate`). Khi bổ sung tính năng mới hoặc vá lỗi, không có bất kỳ cơ chế nào đảm bảo các tính năng cốt lõi (tính tiền đơn hàng, trừ kho ACID, mã giảm giá, webhook đối soát) không bị gãy vỡ (regression failures).
- **Giải pháp khắc phục chi tiết**:
  1. Cài đặt framework kiểm thử `vitest` và `supertest` cho Backend.
  2. Xây dựng bộ test suite kiểm thử tối thiểu cho 3 luồng sống còn:
     - Luồng xác thực đăng ký / đăng nhập và phân quyền JWT.
     - Luồng tạo đơn hàng, khóa dòng tồn kho và áp mã voucher.
     - Luồng webhook tiếp nhận chuyển khoản và khớp lệnh thanh toán.
  3. Cấu hình script `"test": "vitest run"` vào `package.json`.

---

#### 🟡 PHÁT HIỆN PERF-03: Thực Thi Tuần Tự 6 Truy Vấn Độc Lập Trong Dashboard Service
- **Mức độ**: 🟡 **MEDIUM**
- **Vị trí tệp & dòng mã**: `src/modules/dashboard/dashboardService.js:6-82`
- **Bằng chứng mã nguồn (Code Snippet)**:
  ```javascript
  const revRes = await pool.query(...);
  const prodCountRes = await pool.query(...);
  const categoryStatsRes = await pool.query(...);
  const recentOrdersRes = await pool.query(...);
  const lowStockRes = await pool.query(...);
  const topProductsRes = await pool.query(...);
  ```
- **Phân tích & Khắc phục**: Cả 6 truy vấn này đều đọc dữ liệu độc lập và không phụ thuộc kết quả vào nhau. Thực thi tuần tự khiến người quản trị phải đợi gấp 6 lần độ trễ mạng mạng.
  *Khắc phục*: Thay thế bằng `Promise.all`:
  ```javascript
  const [revRes, prodCountRes, categoryStatsRes, recentOrdersRes, lowStockRes, topProductsRes] = await Promise.all([
    pool.query(revenueQuery),
    pool.query(productCountQuery),
    pool.query(categoryStatsQuery),
    pool.query(recentOrdersQuery),
    pool.query(lowStockQuery),
    pool.query(topProductsQuery)
  ]);
  ```

---

#### 🟡 PHÁT HIỆN PERF-04: Sử Dụng Hàm I/O Đồng Bộ Gây Chặn Node.js Event Loop
- **Mức độ**: 🟡 **MEDIUM**
- **Tiêu chuẩn**: CWE-400 (Uncontrolled Resource Consumption), Node.js Event Loop Concurrency Standards.
- **Vị trí tệp & dòng mã**: `src/app.js:59`, `src/modules/product/productController.js:64-67`
- **Bằng chứng mã nguồn (Code Snippet)**:
  ```javascript
  // src/app.js:59
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    if (fs.existsSync(frontendDist)) {
      return res.sendFile(path.join(frontendDist, 'index.html'));
    }
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
  });

  // src/modules/product/productController.js:64-67
  if (!fs.existsSync(publicUploadsDir)) {
    fs.mkdirSync(publicUploadsDir, { recursive: true });
  }
  fs.writeFileSync(path.join(publicUploadsDir, finalFileName), buffer);
  ```
- **Phân tích nguyên nhân & Rủi ro**: 
  1. Trong route catch-all phục vụ SPA `app.get('*')`, hàm `fs.existsSync` được gọi đồng bộ trên mỗi HTTP GET request không phải API. Thao tác I/O đĩa này chiếm giữ main thread, làm chậm tốc độ phục vụ static files dưới tải cao.
  2. Tại controller upload ảnh, các hàm đồng bộ `fs.mkdirSync` và `fs.writeFileSync` ghi toàn bộ dữ liệu nhị phân của ảnh vào đĩa một cách đồng bộ. Khi có nhiều người dùng cùng lúc tải ảnh sản phẩm lên, toàn bộ luồng xử lý đơn (single-thread) của Node.js sẽ bị nghẽn (blocking), khiến tất cả các request API khác (kể cả tra cứu giỏ hàng hay thanh toán) bị treo cho đến khi ghi đĩa xong.
- **Giải pháp khắc phục chi tiết**:
  1. Kiểm tra sự tồn tại của thư mục `frontendDist` một lần duy nhất lúc khởi động server và lưu cờ boolean vào bộ nhớ cache:
     ```javascript
     const hasFrontendDist = fs.existsSync(frontendDist);
     app.get('*', (req, res, next) => {
       if (req.path.startsWith('/api')) return next();
       if (hasFrontendDist) return res.sendFile(path.join(frontendDist, 'index.html'));
       res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
     });
     ```
  2. Sử dụng `fs.promises` để ghi file bất đồng bộ không chặn Event Loop:
     ```javascript
     await fs.promises.mkdir(publicUploadsDir, { recursive: true });
     await fs.promises.writeFile(path.join(publicUploadsDir, finalFileName), buffer);
     ```

---

#### 🟡 PHÁT HIỆN PERF-05: Global Mutex trong PGlite Làm Nghẽn Toàn Bộ Kết Nối Đồng Thời
- **Mức độ**: 🟡 **MEDIUM**
- **Tiêu chuẩn**: Kiến trúc Hệ thống Phân tán & Concurrency Bottleneck.
- **Vị trí tệp & dòng mã**: `src/config/db.js:13, 100-112, 122-127`
- **Bằng chứng mã nguồn (Code Snippet)**:
  ```javascript
  // src/config/db.js:13, 100-112
  let pgliteMutex = Promise.resolve();

  async function query(text, params) {
    if (activeEngine === 'supabase') {
      return pool.query(text, params);
    }
    // Tuần tự hóa toàn bộ truy vấn qua chuỗi Promise Mutex đơn luồng
    const currentLock = pgliteMutex;
    let releaseLock;
    pgliteMutex = new Promise((resolve) => { releaseLock = resolve; });
    await currentLock;
    try {
      return await pgliteInstance.query(text, params);
    } finally {
      releaseLock();
    }
  }
  ```
- **Phân tích nguyên nhân & Rủi ro**: Engine PostgreSQL nhúng WASM (`@electric-sql/pglite`) không hỗ trợ đa kết nối đồng thời trên cùng một instance. Để tránh lỗi hỏng bộ nhớ WASM, lập trình viên đã cài đặt cơ chế khóa Mutex toàn cục. Khi hệ thống rơi vào chế độ fallback (mất kết nối Supabase), tất cả các truy vấn từ hàng trăm người dùng đồng thời sẽ bị ép xếp hàng thực thi lần lượt (FIFO). Request đến sau phải chờ toàn bộ các request trước chạy xong, gây ra tình trạng Timeout hàng loạt.
- **Giải pháp khắc phục chi tiết**:
  1. Chỉ sử dụng cơ chế PGlite Fallback cho môi trường phát triển ngoại tuyến (Offline Local Dev) hoặc chạy kiểm thử đơn vị nội bộ.
  2. Đối với môi trường Production, không dựa vào PGlite fallback mà thiết lập cơ chế Circuit Breaker với thông báo bảo trì rõ ràng, kết hợp Connection Pooler có tính năng High Availability (như Supabase Primary/Replica hoặc AWS RDS Multi-AZ).

---

#### 🟡 PHÁT HIỆN QUAL-02: Monolithic God Component (`AdminPortal.jsx` > 2.650 dòng)
- **Mức độ**: 🟡 **MEDIUM**
- **Vị trí tệp**: `frontend/src/components/AdminPortal.jsx` (2.657 dòng mã)
- **Phân tích & Khắc phục**: Tệp component quá dài gây khó khăn cho việc đọc hiểu, debug và quản lý state.
  *Khắc phục*: Tách `AdminPortal.jsx` thành 6 component con chuyên biệt:
  - `AdminDashboardTab.jsx`: Biểu đồ và chỉ số KPI.
  - `AdminOrdersTab.jsx`: Danh sách và bộ lọc đơn hàng.
  - `AdminProductsTab.jsx`: Quản lý kho hàng và danh mục.
  - `AdminPromotionsTab.jsx`: Quản lý mã voucher.
  - `AdminSettingsTab.jsx`: Cấu hình cửa hàng và tài khoản ngân hàng.
  - `AdminWebhookTab.jsx`: Giám sát giao dịch và nhật ký webhook.

---

#### 🟡 PHÁT HIỆN QUAL-04: Rủi Ro Đụng Độ Mã Đơn Hàng Ngẫu Nhiên `display_id` (1000 - 9999)
- **Mức độ**: 🟡 **MEDIUM**
- **Vị trí tệp & dòng mã**: `src/modules/order/orderService.js:133`
- **Bằng chứng mã nguồn**:
  ```javascript
  const displayId = `TP-${Math.floor(1000 + Math.random() * 9000)}`;
  ```
- **Phân tích & Khắc phục**: Cột `orders.display_id` có ràng buộc `UNIQUE`. Chỉ có 9.000 số khả dụng (từ 1000 đến 9999). Theo định lý Birthday Paradox, chỉ sau ~120 đơn hàng, xác suất xảy ra xung đột mã đơn trùng nhau vượt quá 50%, dẫn tới lỗi vi phạm khóa duy nhất `duplicate key value violates unique constraint "orders_display_id_key"` và hủy giao dịch của khách.
  *Khắc phục*: Sử dụng chuỗi ngẫu nhiên kết hợp timestamp hoặc hàm băm NanoID:
  ```javascript
  const crypto = require('crypto');
  const randomSuffix = crypto.randomBytes(3).toString('hex').toUpperCase(); // 16.7 triệu khả năng
  const displayId = `TP-${Date.now().toString().slice(-4)}${randomSuffix}`;
  ```

---

#### 🟡 PHÁT HIỆN QUAL-05: Lệnh Build Trong `render.yaml` Không Biên Dịch Frontend React SPA
- **Mức độ**: 🟡 **MEDIUM**
- **Vị trí tệp & dòng mã**: `render.yaml:7` (`buildCommand: npm install`)
- **Phân tích & Khắc phục**: Lệnh `npm install` trên Render sẽ không tự kích hoạt script `npm run build`. Do đó thư mục `frontend/dist` không tồn tại, khiến máy chủ Express rơi về giao diện HTML tĩnh cũ.
  *Khắc phục*: Sửa `render.yaml`:
  ```diff
  --- a/render.yaml
  +++ b/render.yaml
  @@ -7,1 +7,1 @@
  -    buildCommand: npm install
  +    buildCommand: npm run build
  ```

---

#### 🔵 PHÁT HIỆN QUAL-03: Lỗi Thuộc Tính Token Người Dùng Trong Review (`req.user.fullName`)
- **Mức độ**: 🔵 **LOW**
- **Vị trí tệp & dòng mã**: `src/modules/review/reviewController.js:29`
- **Bằng chứng mã nguồn**:
  ```javascript
  const authorName = userName || (req.user ? req.user.fullName : 'Khách hàng TechPulse');
  ```
- **Phân tích & Khắc phục**: Token JWT lưu trường `full_name` chứ không phải `fullName`. Do đó thuộc tính này luôn bị `undefined`.
  *Khắc phục*: Sửa thành `(req.user ? (req.user.fullName || req.user.full_name) : 'Khách hàng TechPulse')`.

---

## 8. KIỂM CHỨNG THỰC TẾ & ĐỐI CHIẾU TÀI NGUYÊN

### 8.1. Kết quả thực thi các lệnh kiểm tra tự động

Tất cả các kiểm chứng thực nghiệm đều được thực thi trực tiếp trên workspace dự án với runtime Node.js v24.19.0 và npm 11.17.0:

```
========================================================================================
BẢNG ĐỐI CHIẾU KẾT QUẢ KIỂM CHỨNG THỰC NGHIỆM TẠI REPOSITORY
========================================================================================
Lệnh thực thi          │ Trạng thái │ Thời gian  │ Kết quả chi tiết & Chỉ số đo lường
───────────────────────┼────────────┼────────────┼──────────────────────────────────────
cmd /c npm run build   │ PASS (0)   │ 6.57 giây  │ - Vite v6.4.5 biên dịch 1611 modules
                       │            │            │ - dist/index.html: 1.60 kB (gzip: 0.92 kB)
                       │            │            │ - dist/assets/index-D3k3moGt.css: 30.72 kB (gzip: 5.94 kB)
                       │            │            │ - dist/assets/index-BpX9HFM9.js: 475.73 kB (gzip: 123.95 kB)
───────────────────────┼────────────┼────────────┼──────────────────────────────────────
cmd /c npm audit       │ FAIL (1)   │ 3.80 giây  │ - 1 lỗ hổng HIGH severity: Thư viện xlsx@0.18.5
                       │            │            │ - Advisory 1: GHSA-4r6h-8v6p-xvw6 (Prototype Pollution)
                       │            │            │ - Advisory 2: GHSA-5pgg-2g8v-p4x9 (ReDoS)
───────────────────────┼────────────┼────────────┼──────────────────────────────────────
Node Syntax Check      │ PASS (0)   │ 1.15 giây  │ - Kiểm tra cú pháp node -c trên 33 tệp .js
(node -c across repo)  │            │            │ - 100% tệp tin hợp lệ, không có lỗi cú pháp
───────────────────────┼────────────┼────────────┼──────────────────────────────────────
Secret Bundle Search   │ CONFIRMED  │ 0.12 giây  │ - code.includes('VRDeFOy2odVHNB3CFVNkRYrED2NE') === true
(dist index.js check)  │ (LEAKED)   │            │ - code.includes('manhhung0423') === true
───────────────────────┼────────────┼────────────┼──────────────────────────────────────
Runtime Healthcheck    │ PASS (200) │ 0.05 giây  │ - GET /api/health trả về HTTP 200 OK
                       │            │            │ - Response: {"status":"ok","uptime":...,"service":"..."}
========================================================================================
```

### 8.2. Hướng dẫn từng bước tái hiện lỗi (Step-by-Step Reproduction Guide)

#### Bước 1: Tái hiện Lỗ hổng Rò rỉ Bí mật trong Bundle Client (SEC-01)
Chạy lệnh sau tại thư mục gốc dự án:
```powershell
node -e "const code = require('fs').readFileSync('frontend/dist/assets/index-BpX9HFM9.js', 'utf8'); console.log('Render Key Exists:', code.includes('VRDeFOy2odVHNB3CFVNkRYrED2NE')); console.log('DB Pass Exists:', code.includes('manhhung0423'));"
```
*Kết quả ghi nhận*: Cả hai dòng đều in ra `true`.

#### Bước 2: Tái hiện Lỗ hổng Webhook Simulator Bypass (SEC-02)
Khởi chạy server (`node server.js`), sau đó dùng curl hoặc PowerShell gửi request:
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/webhooks/vietqr/simulate" -Method Post -ContentType "application/json" -Body '{"display_id": "TP-8802", "amount": 900000}'
```
*Kết quả ghi nhận*: Trả về `{"success": true, "message": "Xử lý khớp lệnh chuyển khoản VietQR thành công!"}` và đơn hàng `TP-8802` lập tức chuyển thành `captured` mà không hề có giao dịch thực tế qua ngân hàng.

#### Bước 3: Tái hiện Lỗ hổng IDOR Thu thập PII Khách Hàng (SEC-03)
Gửi request tra cứu đơn hàng bằng mã hiển thị mà không cần gửi kèm Token Authorization:
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/orders/TP-8802" -Method Get
```
*Kết quả ghi nhận*: Toàn bộ họ tên (`Lê Hoàng Yến`), số điện thoại (`0933221100`), địa chỉ nhà (`120 Hoàng Hoa Thám, Ba Đình, Hà Nội`), mã vận đơn và tên bưu tá đều được trả về nguyên vẹn dưới dạng JSON.

---

## 9. LỘ TRÌNH KHẮC PHỤC ƯU TIÊN (ACTIONABLE REMEDIATION ROADMAP)

Để đưa hệ thống đạt chuẩn vận hành sản xuất an toàn và tin cậy, lộ trình khắc phục kỹ thuật được chia làm 3 giai đoạn:

```
GIAI ĐOẠN 1: KHẨN CẤP (0 - 24H)          GIAI ĐOẠN 2: TỐI ƯU CỐT LÕI (1 - 3 NGÀY)      GIAI ĐOẠN 3: CHUẨN HÓA (3 - 7 NGÀY)
┌─────────────────────────────────┐      ┌────────────────────────────────────┐       ┌─────────────────────────────────┐
│ 1. Đổi mật khẩu Supabase &      │      │ 1. Thêm Index cho 15 bảng database │       │ 1. Viết bộ test suite Vitest    │
│    thu hồi Render API Key       │      │ 2. Thêm Phân trang (Pagination) API│       │    cho Auth, Order & Webhook    │
│ 2. Xóa secrets trong Frontend   │ ───▶ │ 3. Song song hóa Dashboard queries │ ────▶ │ 2. Tách nhỏ AdminPortal.jsx     │
│    bundle, Docs & Markdown      │      │    với Promise.all                 │       │    thành 6 sub-components       │
│ 3. Vô hiệu hóa /simulate ở Prod │      │ 4. Thay thế fs đồng bộ bằng async  │       │ 3. Thiết lập GitHub Actions CI  │
│ 4. Bắt buộc xác thực Webhook    │      │ 5. Sửa buildCommand trong          │       │ 4. Thay thế thư viện xlsx       │
│ 5. Che thông tin PII ở API tra  │      │    render.yaml                     │       │    bằng exceljs                 │
│    cứu đơn hàng công khai       │      │ 6. Sửa lỗi req.user.full_name      │       │ 5. Cấu hình Graceful Shutdown   │
└─────────────────────────────────┘      └────────────────────────────────────┘       └─────────────────────────────────┘
```

### Giai đoạn 1: Khắc phục Khẩn cấp (0 – 24 giờ) — Khóa toàn bộ lỗ hổng An ninh
1. **Thu hồi và thay thế thông tin đăng nhập**:
   - Truy cập trang quản trị Supabase đổi mật khẩu database. Cập nhật biến `DATABASE_URL` trong Dashboard Render (mục Environment).
   - Truy cập Render đổi API Key.
   - Xóa bỏ hoàn toàn Render API Key và mật khẩu database trong `frontend/src/components/AdminDocsTab.jsx`, `HUONG_DAN_TRIEN_KHAI_RENDER.md` và `src/scripts/exportHandoverExcel.js`. Chạy lại `npm run build` để sinh lại bundle sạch.
2. **Khóa chặt Webhook VietQR & Endpoint Simulator**:
   - Chặn ngay endpoint `POST /api/webhooks/vietqr/simulate` trên production (`NODE_ENV === 'production'`).
   - Cấu hình bắt buộc `WEBHOOK_SECRET` trong `webhookController.js`; nếu thiếu secret thì trả về HTTP 500 thay vì bỏ qua xác thực.
3. **Vá lỗ hổng IDOR & Thu thập dữ liệu PII**:
   - Áp dụng bộ lọc che giấu thông tin khách hàng (Masking Phone, Email, Address) trong `orderService.getOrderDetails` khi request không đến từ Admin hoặc chính chủ đơn hàng.

### Giai đoạn 2: Tối ưu Cốt lõi (1 – 3 ngày) — Tăng tốc Hiệu năng & Ổn định Hạ tầng
1. **Bổ sung chỉ mục (Index Migration)**:
   - Thêm các lệnh `CREATE INDEX IF NOT EXISTS` vào hàm `initDatabase` trong `src/config/db.js` cho tất cả các khóa ngoại (`user_id`, `order_id`, `product_id`, `category_id`) và các cột lọc định kỳ (`payment_status`, `fulfillment_status`, `created_at`).
2. **Triển khai phân trang**:
   - Cập nhật `listProducts` và `listOrders` hỗ trợ `page` và `limit` để khống chế kích thước dữ liệu phản hồi.
3. **Tối ưu hóa Dashboard**:
   - Bọc 6 truy vấn độc lập trong `dashboardService.getStats()` bằng `Promise.all` để rút ngắn thời gian tải trang quản trị.
4. **Chuẩn hóa Triển khai**:
   - Sửa dòng 7 trong `render.yaml` từ `buildCommand: npm install` thành `buildCommand: npm run build`.
   - Sửa lỗi tên thuộc tính token trong `reviewController.js:29` từ `req.user.fullName` thành `req.user.full_name`.
   - Cấp quyền thư mục `/app/.pglite-data` cho user `techpulse` trong `Dockerfile`.

### Giai đoạn 3: Chuẩn hóa & Mở rộng (3 – 7 ngày) — Nâng cao Chất lượng Kỹ thuật
1. **Thiết lập Khung Kiểm thử Tự động (Automated Testing)**:
   - Cài đặt `vitest` và `supertest`. Xây dựng các ca kiểm thử tích hợp (Integration Tests) cho luồng checkout, trừ kho tồn và webhook thanh toán.
2. **Tái cấu trúc Mã nguồn Frontend**:
   - Chia tách tệp `AdminPortal.jsx` (2.657 dòng) thành các component con độc lập trong thư mục `frontend/src/components/admin/`.
3. **Loại bỏ Thư viện Lỗ hổng**:
   - Gỡ bỏ `xlsx` và chuyển sang `exceljs` để loại bỏ 2 cảnh báo an ninh High của npm audit.
4. **Thiết lập CI/CD**:
   - Tạo workflow GitHub Actions (`.github/workflows/ci.yml`) tự động chạy `npm run build` và kiểm thử khi có pull request mới.

---

## 10. KẾT LUẬN KIỂM TOÁN (AUDIT CONCLUSION)

Dự án **TechPulse / ATELIER & CO. Modular E-Commerce Engine** là một sản phẩm có thiết kế kiến trúc rất ấn tượng, mang tính mở rộng cao và thể hiện sự đầu tư bài bản về trải nghiệm người dùng:
- Sự phân tách rõ ràng giữa sản phẩm và các biến thể SKU theo triết lý MedusaJS giúp đáp ứng linh hoạt mọi mô hình bán lẻ.
- Cơ chế quản lý đơn hàng bằng máy trạng thái kép kết hợp khóa dòng bi quan `FOR UPDATE` trong giao dịch ACID đảm bảo tính toàn vẹn dữ liệu tài chính và kho vận.
- Khả năng tích hợp VietQR 24/7 và bưu tá giao vận đa kênh tạo ra một chu trình thương mại điện tử hoàn toàn tự động.

Tuy nhiên, trước khi chính thức đưa vào khai thác thương mại với dòng tiền thực tế, **dự án bắt buộc phải giải quyết dứt điểm các phát hiện thuộc mức độ Critical và High trong Giai đoạn 1 và Giai đoạn 2 của Lộ trình Khắc phục**. Việc loại bỏ rò rỉ bí mật, siết chặt bảo mật webhook/IDOR và bổ sung chỉ mục cơ sở dữ liệu sẽ biến TechPulse thành một nền tảng thương mại điện tử vững chắc, an toàn và đạt tiêu chuẩn chất lượng sản xuất cao nhất.
