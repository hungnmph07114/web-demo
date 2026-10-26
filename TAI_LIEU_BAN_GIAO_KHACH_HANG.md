# BIÊN BẢN BÀN GIAO & HƯỚNG DẪN VẬN HÀNH HỆ THỐNG
## NỀN TẢNG THƯƠNG MẠI ĐIỆN TỬ ATELIER & CO. (MODULAR E-COMMERCE ENGINE)

> **Kính gửi:** Quý Khách hàng / Chủ sở hữu Cửa hàng  
> **Dự án:** Hệ thống Website Bán hàng Trực tuyến & Quản trị Toàn diện **ATELIER & CO.**  
> **Phiên bản:** v1.0.0 (Production Release)  
> **Ngày bàn giao:** 26/10/2026  

---

## PHẦN 1: THÔNG TIN TRUY CẬP VÀ BÀN GIAO TÀI KHOẢN

### 1.1. Địa chỉ truy cập hệ thống
* **Trang bán hàng trực tuyến (Cửa hàng chính thức):**  
  👉 **[https://shopchychy.foo.ng](https://shopchychy.foo.ng)** *(Tên miền riêng có chứng chỉ bảo mật SSL/HTTPS)*  
* **Đường dẫn dự phòng (Render Subdomain):**  
  👉 [https://web-demo-app.onrender.com](https://web-demo-app.onrender.com)  
* **Endpoint kiểm tra sức khỏe hệ thống (Health Check):**  
  👉 `https://shopchychy.foo.ng/api/health`

---

### 1.2. Tài khoản Quản trị viên (Admin Portal)
Trang quản trị được tích hợp trực tiếp trên website. Quý khách bấm vào biểu tượng **Khóa (Admin)** hoặc nút **Quản trị** trên thanh điều hướng để mở bảng điều khiển.

| Hạng mục | Thông tin bàn giao | Ghi chú |
| :--- | :--- | :--- |
| **Email đăng nhập Admin** | `admin@techpulse.vn` | *(Khuyến nghị đổi sang email của Quý khách theo Phần 3)* |
| **Mật khẩu khởi tạo** | `admin123` | *(Vui lòng đổi mật khẩu sau khi nhận bàn giao)* |
| **Quyền hạn** | Toàn quyền (Super Admin) | Quản lý sản phẩm, tồn kho, đơn hàng, xuất Excel doanh thu, cài đặt giao vận |

---

### 1.3. Cơ sở dữ liệu & Mã nguồn
| Dịch vụ | Thông tin chi tiết |
| :--- | :--- |
| **Cơ sở dữ liệu (PostgreSQL)** | Nền tảng Supabase Cloud (Singapore/Mumbai - Ap-south-1)<br>Trang quản trị: [supabase.com/dashboard/project/oecgyiaetefmxkrndcvk](https://supabase.com/dashboard/project/oecgyiaetefmxkrndcvk)<br>Mật khẩu DB: `manhhung0423` |
| **Kho lưu trữ mã nguồn (Git)** | GitHub: [https://github.com/hungnmph07114/web-demo](https://github.com/hungnmph07114/web-demo) (Nhánh `main`) |
| **Máy chủ Web (Cloud Hosting)** | Render Web Service: `srv-dbe83css728c73bbh7g0` (Singapore Region) |

---

## PHẦN 2: CẨM NANG HƯỚNG DẪN VẬN HÀNH DÀNH CHO CHỦ SHOP

Hệ thống được thiết kế theo tư duy Module hóa hiện đại (Medusa-style architecture), giao diện trực quan hỗ trợ cả giao diện Sáng (Light) và Tối (Dark).

### 2.1. Quản lý Sản phẩm, Hình ảnh & Kho hàng
Vào tab **🏷️ Sản phẩm & Biến thể**:
1. **Thêm sản phẩm mới:**
   - Nhấn **+ Thêm sản phẩm mới**.
   - Nhập Tên sản phẩm, Danh mục (Công nghệ, Thời trang, Gia dụng, v.v.), Mô tả chi tiết.
   - **Tải ảnh đại diện:** Hỗ trợ nhập trực tiếp đường link ảnh trực tuyến (Unsplash, Cloudinary...) hoặc ảnh thiết kế có sẵn.
   - Thiết lập giá bán và số lượng tồn kho ban đầu.
2. **Cấu hình Biến thể (Màu sắc, Size, Dung lượng):**
   - Với mỗi sản phẩm, nhấn **Quản lý biến thể (Variants)** để tạo các phiên bản khác nhau (VD: Màu Đen / Trắng / Titan, Size S / M / L).
   - Mỗi biến thể có thể có mã SKU, mức giá và số lượng tồn kho riêng biệt.
3. **Cập nhật & Chỉnh sửa:**
   - Nhấn vào biểu tượng cây bút để sửa thông tin sản phẩm hoặc cập nhật số lượng tồn kho khi nhập hàng mới.

---

### 2.2. Quy trình Xử lý Đơn hàng & Thu tiền VietQR
Vào tab **📦 Quản lý Đơn hàng**:
1. **Cơ chế thanh toán VietQR 24/7:**
   - Khi khách hàng đặt đơn và chọn phương thức Chuyển khoản, hệ thống tự động sinh mã VietQR chuẩn NAPAS kèm nội dung chuyển khoản độc nhất (VD: `TP-8899 0988123456`).
   - Khi khách quét mã chuyển tiền thành công, trạng thái thanh toán tự động chuyển sang **Đã thanh toán (Captured)**.
   - Nếu khách chuyển trực tiếp tại quầy hoặc gửi biên lai, Quản trị viên có thể bấm **Xác nhận thanh toán thủ công**.
2. **Quy trình Giao hàng (Fulfillment):**
   - Đơn mới khởi tạo có trạng thái: **Chờ xử lý (Processing)**.
   - Sau khi kho đóng hàng xong: Chuyển sang **Đang đóng gói (Packing)**.
   - Bàn giao bưu tá: Chuyển sang **Đang giao hàng (Shipped)**.
   - Khách nhận hàng thành công: Chuyển sang **Đã giao hàng (Delivered)**.
3. **Gán đơn vị vận chuyển & Bưu tá:**
   - Nhấn vào mã đơn hàng để mở bảng chi tiết.
   - Chọn đối tác vận chuyển: **Giao Hàng Nhanh (GHN)**, **Giao Hàng Tiết Kiệm (GHTK)**, **Viettel Post** hoặc **Hỏa tốc 2 Giờ**.
   - Nhập mã vận đơn bưu cục và SĐT bưu tá phụ trách. Khách hàng có thể tra cứu hành trình trực tiếp theo thời gian thực.
4. **Xuất báo cáo Doanh thu ra file Excel / CSV:**
   - Nhấn nút **Xuất Excel (UTF-8)** ở góc trên thanh công cụ.
   - Hệ thống tự động xuất file bảng tính đầy đủ: Mã đơn, Ngày đặt, Khách hàng, SĐT, Địa chỉ, Danh sách món hàng, Doanh thu và Trạng thái thanh toán (hỗ trợ mở tốt trên Microsoft Excel và Google Sheets, không bị lỗi font Tiếng Việt).

---

### 2.3. Tạo & Quản lý Mã giảm giá (Vouchers / Khuyến mãi)
Vào tab **🎟️ Mã Khuyến Mãi**:
1. Nhấn **+ Tạo Voucher mới**.
2. Thiết lập chính sách:
   - **Mã Code:** VD: `CHAOHAY2026`, `FREESHIP50K`, `VIP10`.
   - **Loại giảm:** Giảm theo tỷ lệ phần trăm (VD: 10%, 20%) hoặc số tiền cố định (VD: 50.000đ, 100.000đ).
   - **Điều kiện:** Giá trị đơn hàng tối thiểu (VD: đơn từ 500.000đ mới được áp dụng), Mức giảm tối đa.
   - **Giới hạn số lượt dùng:** Giới hạn 50 hoặc 100 lượt đầu tiên.
3. Nhấn nút bật/tắt (Toggle) bất kỳ lúc nào để kích hoạt hoặc tạm dừng chương trình khuyến mãi.

---

### 2.4. Quản lý Đánh giá & Bình luận (1 - 5★)
- Khách hàng có thể đánh giá sao và viết cảm nhận sau khi trải nghiệm sản phẩm.
- Đơn hàng đã mua thực tế sẽ được gắn huy hiệu xanh **✅ Đã mua hàng (Verified Purchase)** để tăng độ tin cậy và uy tín cho gian hàng.
- Quản trị viên có thể kiểm duyệt và xóa các bình luận spam hoặc tiêu cực không phù hợp.

---

### 2.5. Nhật ký Email giao dịch tự động
Vào tab **📧 Email & Thông báo**:
- Hệ thống ghi lại toàn bộ lịch sử các bức thư tự động được gửi tới khách hàng:
  + 📩 **Email Xác nhận đơn hàng:** Kèm chi tiết giỏ hàng và mã VietQR thanh toán.
  + 🎉 **Email Xác nhận thanh toán thành công:** Khi hệ thống ngân hàng khớp tiền.
  + 🚚 **Email Bưu tá đang giao hàng:** Kèm tên bưu tá và số điện thoại liên hệ nhận hàng.
- Có công cụ **Gửi thử nghiệm** trực tiếp trên giao diện để kiểm tra chất lượng hiển thị email.

---

## PHẦN 3: CHECKLIST CẦN THIẾT LẬP TRƯỚC KHI BÁN HÀNG THỰC TẾ

Để hệ thống chuyển từ trạng thái Demo sang hoạt động thương mại chính thức, Quý khách cần cập nhật 4 thông số sau trong mục **Environment Variables** trên Render Dashboard:

### 3.1. Cập nhật Số tài khoản Ngân hàng của Chủ shop
Thay thế thông tin ngân hàng nhận tiền chuyển khoản:
```env
VIETQR_BANK_ID=MB              # Mã ngân hàng (VD: MB, VCB, TCB, ACB, VPB, TPB, OCB, CTG...)
VIETQR_ACCOUNT_NO=0987654321    # Số tài khoản chính chủ của Quý khách
VIETQR_ACCOUNT_NAME=NGUYEN VAN A # Tên in hoa không dấu của Quý khách
```

### 3.2. Cài đặt Cổng tự động nhận biến động số dư (Khuyến nghị: SePay.vn)
1. Đăng ký tài khoản miễn phí tại **[https://sepay.vn](https://sepay.vn)** hoặc **[https://casso.vn](https://casso.vn)**.
2. Kết nối tài khoản ngân hàng của Quý khách.
3. Trong mục **Webhook**, thêm URL sau:
   ```
   https://shopchychy.foo.ng/api/webhooks/vietqr
   ```
   *Hiệu quả: Bất kỳ khi nào khách hàng quét QR chuyển tiền, số dư thay đổi, hệ thống sẽ tự động gạch nợ đơn hàng sau 2 giây mà Quý khách không cần phải canh điện thoại bấm tay.*

### 3.3. Cài đặt Email gửi thư thật (Google App Password)
Để gửi email thực tế tới hộp thư của người mua:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=email_cua_quy_khach@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx   # Mật khẩu ứng dụng 16 ký tự tạo trong tài khoản Google Security
SMTP_FROM="ATELIER & CO." <email_cua_quy_khach@gmail.com>
```

### 3.4. Cài đặt Giữ máy chủ thức 24/7 (Keep-Alive)
Cài đặt UptimeRobot theo cẩm nang để máy chủ Render luôn hoạt động 100% thời gian:
- URL giám sát: `https://shopchychy.foo.ng/api/health`
- Tần suất ping: Mỗi 5 phút.

---

## PHẦN 4: HỖ TRỢ KỸ THUẬT & BẢO HÀNH

- **Thời hạn hỗ trợ kỹ thuật ban đầu:** Hỗ trợ khắc phục lỗi phần mềm, hướng dẫn vận hành và tinh chỉnh tham số cấu hình.
- **Sao lưu dữ liệu (Backup):** Dữ liệu sản phẩm, khách hàng và đơn hàng được lưu trữ an toàn trên nền tảng Supabase Cloud với cơ chế Snapshot tự động hàng ngày.

---

> **ĐẠI DIỆN ĐƠN VỊ PHÁT TRIỂN & BÀN GIAO**  
> *(Ký và xác nhận hoàn tất bàn giao hệ thống)*
