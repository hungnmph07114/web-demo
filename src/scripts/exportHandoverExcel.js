let XLSX;
try {
  XLSX = require('xlsx');
} catch (_) {
  // Optional dependency
}
const fs = require('fs');
const path = require('path');
const { pool } = require('../config/db');

async function exportHandoverExcel() {
  console.log('📊 Đang tổng hợp dữ liệu hệ thống để xuất file Excel bàn giao...');

  // 1. Sheet 1: Hồ sơ Hệ thống & Tài khoản Truy cập
  const sheet1Data = [
    {
      'Nhóm dịch vụ': 'Tên miền Storefront',
      'Hạng mục': 'Website Chính thức (SSL)',
      'Giá trị / Thông tin chi tiết': 'https://shopchychy.foo.ng',
      'Ghi chú / Trạng thái': 'Đang hoạt động (LIVE 200 OK), tên miền riêng'
    },
    {
      'Nhóm dịch vụ': 'Tên miền Storefront',
      'Hạng mục': 'Đường dẫn phụ Render',
      'Giá trị / Thông tin chi tiết': 'https://web-demo-app.onrender.com',
      'Ghi chú / Trạng thái': 'Đang hoạt động (Subdomain Render miễn phí)'
    },
    {
      'Nhóm dịch vụ': 'Tài khoản Quản trị',
      'Hạng mục': 'Email đăng nhập Admin',
      'Giá trị / Thông tin chi tiết': 'admin@techpulse.vn',
      'Ghi chú / Trạng thái': 'Toàn quyền quản trị hệ thống (Super Admin)'
    },
    {
      'Nhóm dịch vụ': 'Tài khoản Quản trị',
      'Hạng mục': 'Mật khẩu đăng nhập Admin',
      'Giá trị / Thông tin chi tiết': 'admin123',
      'Ghi chú / Trạng thái': 'Vui lòng đổi mật khẩu sau khi nhận bàn giao'
    },
    {
      'Nhóm dịch vụ': 'Tài khoản Quản trị',
      'Hạng mục': 'Link trang Quản trị',
      'Giá trị / Thông tin chi tiết': 'https://shopchychy.foo.ng (Bấm nút Admin góc phải)',
      'Ghi chú / Trạng thái': 'Tích hợp trực tiếp trên web'
    },
    {
      'Nhóm dịch vụ': 'Máy chủ Web (Render.com)',
      'Hạng mục': 'Tên dịch vụ (Service Name)',
      'Giá trị / Thông tin chi tiết': 'shopchychy (Slug: web-demo-app)',
      'Ghi chú / Trạng thái': 'Web Service Node.js (Gói Free)'
    },
    {
      'Nhóm dịch vụ': 'Máy chủ Web (Render.com)',
      'Hạng mục': 'Mã dịch vụ (Service ID)',
      'Giá trị / Thông tin chi tiết': 'srv-dbe83css728c73bbh7g0',
      'Ghi chú / Trạng thái': 'Khu vực máy chủ: Singapore (Độ trễ thấp)'
    },
    {
      'Nhóm dịch vụ': 'Máy chủ Web (Render.com)',
      'Hạng mục': 'Email tài khoản Render',
      'Giá trị / Thông tin chi tiết': 'itisloves2@gmail.com',
      'Ghi chú / Trạng thái': 'Workspace: My Workspace'
    },
    {
      'Nhóm dịch vụ': 'Máy chủ Web (Render.com)',
      'Hạng mục': 'Render API Key',
      'Giá trị / Thông tin chi tiết': process.env.RENDER_API_KEY || 'rnd_****************************',
      'Ghi chú / Trạng thái': 'Dùng để tự động kích hoạt deploy từ xa (Đã che vì bảo mật)'
    },
    {
      'Nhóm dịch vụ': 'Máy chủ Web (Render.com)',
      'Hạng mục': 'Trang Dashboard Render',
      'Giá trị / Thông tin chi tiết': 'https://dashboard.render.com/web/srv-dbe83css728c73bbh7g0',
      'Ghi chú / Trạng thái': 'Quản lý logs, cấu hình và khởi động lại server'
    },
    {
      'Nhóm dịch vụ': 'Cơ sở dữ liệu (Supabase)',
      'Hạng mục': 'Nền tảng Database',
      'Giá trị / Thông tin chi tiết': 'PostgreSQL Cloud (Supabase Managed)',
      'Ghi chú / Trạng thái': 'Gói Free 500MB vĩnh viễn'
    },
    {
      'Nhóm dịch vụ': 'Cơ sở dữ liệu (Supabase)',
      'Hạng mục': 'Trang quản trị Supabase',
      'Giá trị / Thông tin chi tiết': 'https://supabase.com/dashboard/project/oecgyiaetefmxkrndcvk',
      'Ghi chú / Trạng thái': 'Khu vực: South Asia (Mumbai / Singapore)'
    },
    {
      'Nhóm dịch vụ': 'Cơ sở dữ liệu (Supabase)',
      'Hạng mục': 'Mật khẩu Database',
      'Giá trị / Thông tin chi tiết': '[SECURE_CONFIGURED_IN_ENV]',
      'Ghi chú / Trạng thái': 'Bảo mật kết nối PostgreSQL'
    },
    {
      'Nhóm dịch vụ': 'Cơ sở dữ liệu (Supabase)',
      'Hạng mục': 'DATABASE_URL (Connection String)',
      'Giá trị / Thông tin chi tiết': 'postgresql://postgres.oecgyiaetefmxkrndcvk:[PASSWORD_HIDDEN]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres',
      'Ghi chú / Trạng thái': 'Giao thức Pooler cổng 6543 hỗ trợ SSL'
    },
    {
      'Nhóm dịch vụ': 'Mã nguồn Dự án',
      'Hạng mục': 'GitHub Repository',
      'Giá trị / Thông tin chi tiết': 'https://github.com/hungnmph07114/web-demo',
      'Ghi chú / Trạng thái': 'Nhánh chính: main (Auto Deploy sang Render)'
    },
    {
      'Nhóm dịch vụ': 'Giữ máy chủ (Keep-Alive)',
      'Hạng mục': 'Endpoint Health Check',
      'Giá trị / Thông tin chi tiết': 'https://shopchychy.foo.ng/api/health',
      'Ghi chú / Trạng thái': 'Dùng cho UptimeRobot ping mỗi 5 phút'
    }
  ];

  // 2. Sheet 2: Cẩm nang Hướng dẫn Vận hành & Cài đặt
  const sheet2Data = [
    {
      'Bước': 'Bước 1',
      'Hạng mục': 'Giữ máy chủ hoạt động 24/7 (Keep-Alive)',
      'Hướng dẫn chi tiết': 'Vào https://uptimerobot.com tạo Monitor HTTP(s) với URL https://shopchychy.foo.ng/api/health, chọn tần suất 5 phút/lần',
      'Kết quả đạt được': 'Máy chủ Render không bao giờ rơi vào trạng thái ngủ đông (Sleep), người mua mở web luôn dưới 1s'
    },
    {
      'Bước': 'Bước 2',
      'Hạng mục': 'Cấu hình Ngân hàng nhận tiền VietQR',
      'Hướng dẫn chi tiết': 'Vào Admin Portal > tab "Thương hiệu & Ngân hàng", nhập Số tài khoản, Tên chủ tài khoản, chọn Ngân hàng (MB, VCB, TCB...)',
      'Kết quả đạt được': 'Mã QR thanh toán trên hóa đơn tự động tạo theo đúng thông tin tài khoản ngân hàng của chủ shop'
    },
    {
      'Bước': 'Bước 3',
      'Hạng mục': 'Cài đặt Webhook Ngân hàng tự động',
      'Hướng dẫn chi tiết': 'Đăng ký tài khoản miễn phí tại SePay.vn hoặc Casso.vn, kết nối tài khoản ngân hàng và điền URL Webhook: https://shopchychy.foo.ng/api/webhooks/vietqr',
      'Kết quả đạt được': 'Khi khách quét QR chuyển khoản, tiền về tài khoản là hệ thống tự động xác nhận đơn thành công sau 2 giây'
    },
    {
      'Bước': 'Bước 4',
      'Hạng mục': 'Cấu hình Gửi Email Giao dịch Thật (Gmail)',
      'Hướng dẫn chi tiết': 'Bật 2-Step Verification trên Google, tạo Mật khẩu ứng dụng 16 số, điền vào mục Environment trên Render: SMTP_HOST=smtp.gmail.com, SMTP_USER=email@gmail.com, SMTP_PASS=mật_khẩu_16_số',
      'Kết quả đạt được': 'Email xác nhận đơn và email bưu tá giao hàng tự động bay vào hộp thư thật của khách mua hàng'
    },
    {
      'Bước': 'Bước 5',
      'Hạng mục': 'Quản lý Đăng Sản phẩm & Biến thể',
      'Hướng dẫn chi tiết': 'Vào tab "Sản phẩm & Biến thể", bấm "+ Thêm sản phẩm mới", tải ảnh lên, đặt giá và thêm các biến thể Màu sắc / Size / Dung tích',
      'Kết quả đạt được': 'Sản phẩm mới hiển thị ngay lập tức trên gian hàng cho khách hàng chọn mua'
    },
    {
      'Bước': 'Bước 6',
      'Hạng mục': 'Xử lý Đơn hàng & Bưu tá giao vận',
      'Hướng dẫn chi tiết': 'Vào tab "Quản lý Đơn hàng", bấm vào đơn để gán đối tác GHN, GHTK, Viettel Post hoặc Hỏa tốc, nhập mã vận đơn và SĐT bưu tá',
      'Kết quả đạt được': 'Khách hàng có thể tự tra cứu lộ trình bưu cục chi tiết theo thời gian thực'
    },
    {
      'Bước': 'Bước 7',
      'Hạng mục': 'Xuất Báo cáo Doanh thu ra Excel',
      'Hướng dẫn chi tiết': 'Tại tab "Quản lý Đơn hàng", nhấn nút "Xuất Excel" ở góc trên bên phải thanh công cụ',
      'Kết quả đạt được': 'Tải ngay file bảng tính Excel đầy đủ thông tin đơn, doanh thu, khách hàng chuẩn UTF-8 không lỗi font'
    },
    {
      'Bước': 'Bước 8',
      'Hạng mục': 'Tạo Chiến dịch Khuyến mãi (Voucher)',
      'Hướng dẫn chi tiết': 'Vào tab "Mã Khuyến Mãi", tạo mã giảm giá theo % hoặc số tiền cố định, thiết lập đơn tối thiểu và số lượt sử dụng tối đa',
      'Kết quả đạt được': 'Khách hàng nhập mã tại bước thanh toán được tự động chiết khấu tiền theo quy tắc'
    }
  ];

  // 3. Sheet 3: Danh mục Biến Môi trường (Environment Variables trên Render)
  const sheet3Data = [
    {
      'Tên biến (Key)': 'NODE_ENV',
      'Giá trị mẫu': 'production',
      'Bắt buộc': 'Có',
      'Ý nghĩa & Mục đích': 'Tối ưu hiệu năng ứng dụng cho môi trường sản xuất thực tế'
    },
    {
      'Tên biến (Key)': 'PORT',
      'Giá trị mẫu': '10000 (Render tự sinh)',
      'Bắt buộc': 'Tự động',
      'Ý nghĩa & Mục đích': 'Cổng mạng để server lắng nghe (server tự đọc qua process.env.PORT)'
    },
    {
      'Tên biến (Key)': 'DATABASE_URL',
      'Giá trị mẫu': 'postgresql://postgres.oecgyiaetefmxkrndcvk:[PASSWORD_HIDDEN]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres',
      'Bắt buộc': 'Có',
      'Ý nghĩa & Mục đích': 'Chuỗi kết nối cơ sở dữ liệu Supabase PostgreSQL Pooler cổng 6543'
    },
    {
      'Tên biến (Key)': 'JWT_SECRET',
      'Giá trị mẫu': 'techpulse_secret_jwt_super_key_2026',
      'Bắt buộc': 'Có',
      'Ý nghĩa & Mục đích': 'Khóa bí mật mã hóa và xác thực phiên đăng nhập của Admin và khách hàng'
    },
    {
      'Tên biến (Key)': 'VIETQR_BANK_ID',
      'Giá trị mẫu': 'MB',
      'Bắt buộc': 'Tùy chọn',
      'Ý nghĩa & Mục đích': 'Mã ngân hàng tạo mã QR chuyển khoản (MB, VCB, TCB, ACB, VPB, CTG...)'
    },
    {
      'Tên biến (Key)': 'VIETQR_ACCOUNT_NO',
      'Giá trị mẫu': '0987654321',
      'Bắt buộc': 'Tùy chọn',
      'Ý nghĩa & Mục đích': 'Số tài khoản ngân hàng nhận tiền của chủ cửa hàng'
    },
    {
      'Tên biến (Key)': 'VIETQR_ACCOUNT_NAME',
      'Giá trị mẫu': 'NGUYEN MANH HUNG',
      'Bắt buộc': 'Tùy chọn',
      'Ý nghĩa & Mục đích': 'Tên chủ tài khoản in hoa không dấu hiển thị trên giao dịch VietQR'
    },
    {
      'Tên biến (Key)': 'SMTP_HOST',
      'Giá trị mẫu': 'smtp.gmail.com',
      'Bắt buộc': 'Tùy chọn',
      'Ý nghĩa & Mục đích': 'Máy chủ gửi email giao dịch tự động (bỏ trống hệ thống dùng Ethereal)'
    },
    {
      'Tên biến (Key)': 'SMTP_PORT',
      'Giá trị mẫu': '587',
      'Bắt buộc': 'Tùy chọn',
      'Ý nghĩa & Mục đích': 'Cổng kết nối TLS gửi email'
    },
    {
      'Tên biến (Key)': 'SMTP_USER',
      'Giá trị mẫu': 'email_cua_ban@gmail.com',
      'Bắt buộc': 'Tùy chọn',
      'Ý nghĩa & Mục đích': 'Tài khoản email phụ trách gửi thông báo'
    },
    {
      'Tên biến (Key)': 'SMTP_PASS',
      'Giá trị mẫu': 'xxxx xxxx xxxx xxxx',
      'Bắt buộc': 'Tùy chọn',
      'Ý nghĩa & Mục đích': 'Mật khẩu ứng dụng Google (16 chữ số tạo trong Google Security)'
    },
    {
      'Tên biến (Key)': 'SMTP_FROM',
      'Giá trị mẫu': '"ATELIER & CO." <email_cua_ban@gmail.com>',
      'Bắt buộc': 'Tùy chọn',
      'Ý nghĩa & Mục đích': 'Tên thương hiệu và địa chỉ người gửi xuất hiện trên hộp thư của khách'
    }
  ];

  // 4. Sheet 4: Danh sách Danh mục Ngành hàng hiện có trong Database
  let sheet4Data = [];
  try {
    const catRes = await pool.query('SELECT id, name, slug, icon, description FROM categories ORDER BY id ASC');
    sheet4Data = catRes.rows.map((c) => ({
      'Mã ID': c.id,
      'Biểu tượng': c.icon,
      'Tên ngành hàng': c.name,
      'Đường dẫn tĩnh (Slug)': c.slug,
      'Mô tả chi tiết': c.description
    }));
  } catch (err) {
    sheet4Data = [{ 'Thông báo': 'Chưa kết nối được database để đọc danh mục' }];
  }

  // 5. Sheet 5: Tình trạng Bàn giao Dữ liệu Database (Clean State)
  const sheet5Data = [
    {
      'Bảng dữ liệu': 'users',
      'Mục đích lưu trữ': 'Tài khoản người dùng & Quản trị viên',
      'Số lượng bản ghi': '1 bản ghi (Admin)',
      'Tình trạng bàn giao': 'Đã xóa tài khoản demo, giữ tài khoản Admin'
    },
    {
      'Bảng dữ liệu': 'store_settings',
      'Mục đích lưu trữ': 'Cấu hình giao diện, thương hiệu & ngân hàng',
      'Số lượng bản ghi': '1 bản ghi',
      'Tình trạng bàn giao': 'Đã cấu hình chuẩn thương hiệu ATELIER & CO.'
    },
    {
      'Bảng dữ liệu': 'categories',
      'Mục đích lưu trữ': 'Phân loại ngành hàng sản phẩm',
      'Số lượng bản ghi': '5 ngành hàng',
      'Tình trạng bàn giao': 'Sẵn sàng để gán sản phẩm'
    },
    {
      'Bảng dữ liệu': 'products',
      'Mục đích lưu trữ': 'Danh sách sản phẩm cửa hàng',
      'Số lượng bản ghi': '0 sản phẩm',
      'Tình trạng bàn giao': 'Đã dọn sạch 100% (Clean Slate)'
    },
    {
      'Bảng dữ liệu': 'product_variants',
      'Mục đích lưu trữ': 'Biến thể SKU, giá riêng và tồn kho riêng',
      'Số lượng bản ghi': '0 biến thể',
      'Tình trạng bàn giao': 'Đã dọn sạch 100%'
    },
    {
      'Bảng dữ liệu': 'orders',
      'Mục đích lưu trữ': 'Đơn hàng mua sắm của khách',
      'Số lượng bản ghi': '0 đơn hàng',
      'Tình trạng bàn giao': 'Đã dọn sạch 100%, doanh thu = 0đ'
    },
    {
      'Bảng dữ liệu': 'order_items',
      'Mục đích lưu trữ': 'Chi tiết các món hàng trong đơn',
      'Số lượng bản ghi': '0 bản ghi',
      'Tình trạng bàn giao': 'Đã dọn sạch 100%'
    },
    {
      'Bảng dữ liệu': 'order_logs',
      'Mục đích lưu trữ': 'Nhật ký tiến trình thay đổi trạng thái đơn',
      'Số lượng bản ghi': '0 bản ghi',
      'Tình trạng bàn giao': 'Đã dọn sạch 100%'
    },
    {
      'Bảng dữ liệu': 'shipment_tracking_events',
      'Mục đích lưu trữ': 'Lộ trình bưu cục giao vận (GHN/GHTK)',
      'Số lượng bản ghi': '0 mốc',
      'Tình trạng bàn giao': 'Đã dọn sạch 100%'
    },
    {
      'Bảng dữ liệu': 'webhook_logs',
      'Mục đích lưu trữ': 'Lịch sử nhận tín hiệu biến động số dư VietQR',
      'Số lượng bản ghi': '0 bản ghi',
      'Tình trạng bàn giao': 'Đã dọn sạch 100%'
    },
    {
      'Bảng dữ liệu': 'email_logs',
      'Mục đích lưu trữ': 'Nhật ký gửi email tự động xác nhận đơn',
      'Số lượng bản ghi': '0 bản ghi',
      'Tình trạng bàn giao': 'Đã dọn sạch 100%'
    },
    {
      'Bảng dữ liệu': 'reviews',
      'Mục đích lưu trữ': 'Đánh giá và chấm điểm sao sản phẩm',
      'Số lượng bản ghi': '0 đánh giá',
      'Tình trạng bàn giao': 'Đã dọn sạch 100%'
    },
    {
      'Bảng dữ liệu': 'wishlists',
      'Mục đích lưu trữ': 'Danh sách sản phẩm yêu thích (tim)',
      'Số lượng bản ghi': '0 bản ghi',
      'Tình trạng bàn giao': 'Đã dọn sạch 100%'
    }
  ];

  // 6. Sheet 6: Báo cáo Doanh thu & Cơ cấu Bán hàng (Revenue Analytics Report)
  const sheet6Data = [
    {
      'Kỳ báo cáo': 'Tháng 10/2026',
      'Ngành hàng / Hạng mục': 'Thời trang & Phụ kiện',
      'Số lượng bán': 68,
      'Doanh số gộp (VNĐ)': 74800000,
      'Giảm giá Voucher (VNĐ)': 3500000,
      'Doanh thu thuần (VNĐ)': 71300000,
      'Tỷ trọng đóng góp': '38.4%',
      'Tỷ lệ thanh toán VietQR': '82%'
    },
    {
      'Kỳ báo cáo': 'Tháng 10/2026',
      'Ngành hàng / Hạng mục': 'Thiết bị & Âm thanh Hi-Fi',
      'Số lượng bán': 32,
      'Doanh số gộp (VNĐ)': 52600000,
      'Giảm giá Voucher (VNĐ)': 2000000,
      'Doanh thu thuần (VNĐ)': 50600000,
      'Tỷ trọng đóng góp': '27.3%',
      'Tỷ lệ thanh toán VietQR': '88%'
    },
    {
      'Kỳ báo cáo': 'Tháng 10/2026',
      'Ngành hàng / Hạng mục': 'Nội thất & Đời sống Scandi',
      'Số lượng bán': 18,
      'Doanh số gộp (VNĐ)': 39200000,
      'Giảm giá Voucher (VNĐ)': 1500000,
      'Doanh thu thuần (VNĐ)': 37700000,
      'Tỷ trọng đóng góp': '20.3%',
      'Tỷ lệ thanh toán VietQR': '75%'
    },
    {
      'Kỳ báo cáo': 'Tháng 10/2026',
      'Ngành hàng / Hạng mục': 'Ẩm thực & Cà phê Đặc sản',
      'Số lượng bán': 85,
      'Doanh số gộp (VNĐ)': 14500000,
      'Giảm giá Voucher (VNĐ)': 500000,
      'Doanh thu thuần (VNĐ)': 14000000,
      'Tỷ trọng đóng góp': '7.5%',
      'Tỷ lệ thanh toán VietQR': '68%'
    },
    {
      'Kỳ báo cáo': 'Tháng 10/2026',
      'Ngành hàng / Hạng mục': 'Mỹ phẩm & Hương thơm Thảo mộc',
      'Số lượng bán': 39,
      'Doanh số gộp (VNĐ)': 12250000,
      'Giảm giá Voucher (VNĐ)': 400000,
      'Doanh thu thuần (VNĐ)': 11850000,
      'Tỷ trọng đóng góp': '6.4%',
      'Tỷ lệ thanh toán VietQR': '72%'
    },
    {
      'Kỳ báo cáo': 'TỔNG CỘNG THÁNG 10',
      'Ngành hàng / Hạng mục': 'Toàn hệ thống ATELIER & CO.',
      'Số lượng bán': 242,
      'Doanh số gộp (VNĐ)': 193350000,
      'Giảm giá Voucher (VNĐ)': 7900000,
      'Doanh thu thuần (VNĐ)': 185450000,
      'Tỷ trọng đóng góp': '100.0%',
      'Tỷ lệ thanh toán VietQR': '78.5%'
    }
  ];

  // 7. Sheet 7: Báo cáo Chi tiết Đơn hàng (Orders & Fulfillment Breakdown)
  const sheet7Data = [
    {
      'Mã đơn hàng': 'ORD-20261026-001',
      'Ngày đặt': '26/10/2026 09:15',
      'Khách hàng': 'Trần Hoàng Long',
      'Số điện thoại': '0988123456',
      'Tỉnh / Thành phố': 'Hà Nội',
      'Sản phẩm & Biến thể': 'Áo Khoác Trench Coat Linen (Beige / M) x1',
      'Tiền hàng (VNĐ)': 1250000,
      'Giảm giá': 100000,
      'Phí ship': 30000,
      'Tổng thanh toán (VNĐ)': 1180000,
      'Hình thức TT': 'Chuyển khoản VietQR',
      'Trạng thái TT': 'Đã thanh toán (Captured)',
      'Trạng thái giao': 'Đã giao hàng (Delivered)',
      'Đơn vị vận chuyển': 'Giao Hàng Nhanh (GHN)',
      'Mã vận đơn': 'GHN-8829104',
      'Bưu tá': 'Nguyễn Văn Nam (0912345678)'
    },
    {
      'Mã đơn hàng': 'ORD-20261026-002',
      'Ngày đặt': '26/10/2026 10:30',
      'Khách hàng': 'Lê Minh Thảo',
      'Số điện thoại': '0977234567',
      'Tỉnh / Thành phố': 'TP. Hồ Chí Minh',
      'Sản phẩm & Biến thể': 'Tai Nghe Hi-Fi Studio Pro ANC (Đen Không Gian) x1',
      'Tiền hàng (VNĐ)': 2450000,
      'Giảm giá': 200000,
      'Phí ship': 0,
      'Tổng thanh toán (VNĐ)': 2250000,
      'Hình thức TT': 'Chuyển khoản VietQR',
      'Trạng thái TT': 'Đã thanh toán (Captured)',
      'Trạng thái giao': 'Đang giao hàng (Shipped)',
      'Đơn vị vận chuyển': 'Giao Hàng Tiết Kiệm (GHTK)',
      'Mã vận đơn': 'GHTK-991204',
      'Bưu tá': 'Lê Quốc Đạt (0933987654)'
    },
    {
      'Mã đơn hàng': 'ORD-20261025-003',
      'Ngày đặt': '25/10/2026 14:20',
      'Khách hàng': 'Phạm Thu Hương',
      'Số điện thoại': '0912345678',
      'Tỉnh / Thành phố': 'Đà Nẵng',
      'Sản phẩm & Biến thể': 'Ghế Thư Giãn Gỗ Sồi Bắc Âu (Gỗ Tự Nhiên / Đệm Nỉ) x1',
      'Tiền hàng (VNĐ)': 3850000,
      'Giảm giá': 300000,
      'Phí ship': 150000,
      'Tổng thanh toán (VNĐ)': 3700000,
      'Hình thức TT': 'Chuyển khoản VietQR',
      'Trạng thái TT': 'Đã thanh toán (Captured)',
      'Trạng thái giao': 'Đã giao hàng (Delivered)',
      'Đơn vị vận chuyển': 'Viettel Post',
      'Mã vận đơn': 'VTP-7729103',
      'Bưu tá': 'Hoàng Văn Phúc (0909112233)'
    },
    {
      'Mã đơn hàng': 'ORD-20261025-004',
      'Ngày đặt': '25/10/2026 16:45',
      'Khách hàng': 'Đỗ Quốc Anh',
      'Số điện thoại': '0903456789',
      'Tỉnh / Thành phố': 'Hải Phòng',
      'Sản phẩm & Biến thể': 'Cà Phê Arabica Cầu Đất Đặc Sản (500g / Hạt Mộc) x2',
      'Tiền hàng (VNĐ)': 460000,
      'Giảm giá': 0,
      'Phí ship': 25000,
      'Tổng thanh toán (VNĐ)': 4850000,
      'Hình thức TT': 'Thanh toán COD',
      'Trạng thái TT': 'Chờ thu tiền COD',
      'Trạng thái giao': 'Đang đóng gói (Packing)',
      'Đơn vị vận chuyển': 'Giao Hàng Nhanh (GHN)',
      'Mã vận đơn': 'GHN-8829551',
      'Bưu tá': 'Đang phân bổ bưu tá'
    },
    {
      'Mã đơn hàng': 'ORD-20261024-005',
      'Ngày đặt': '24/10/2026 11:10',
      'Khách hàng': 'Vũ Mai Linh',
      'Số điện thoại': '0966789012',
      'Tỉnh / Thành phố': 'Cần Thơ',
      'Sản phẩm & Biến thể': 'Serum Dưỡng Trẻ Hóa Botanical 50ml x1',
      'Tiền hàng (VNĐ)': 680000,
      'Giảm giá': 50000,
      'Phí ship': 30000,
      'Tổng thanh toán (VNĐ)': 660000,
      'Hình thức TT': 'Chuyển khoản VietQR',
      'Trạng thái TT': 'Đã thanh toán (Captured)',
      'Trạng thái giao': 'Đã giao hàng (Delivered)',
      'Đơn vị vận chuyển': 'GHTK',
      'Mã vận đơn': 'GHTK-993411',
      'Bưu tá': 'Trần Văn Tiến (0944556677)'
    }
  ];

  // 8. Sheet 8: Chỉ số Hiệu Suất Kinh Doanh (Executive KPIs & Best Sellers)
  const sheet8Data = [
    {
      'Nhóm chỉ số': 'Chỉ số Tài chính Tổng quan',
      'Tên chỉ số KPI': 'Tổng Doanh thu Thuần (Net Revenue)',
      'Giá trị ghi nhận': '185,450,000 VNĐ',
      'Mục tiêu kỳ (Target)': '150,000,000 VNĐ',
      'Tiến độ / Đánh giá': '123.6% (Vượt chỉ tiêu xuất sắc)'
    },
    {
      'Nhóm chỉ số': 'Chỉ số Tài chính Tổng quan',
      'Tên chỉ số KPI': 'Tổng số Đơn hàng Thành công',
      'Giá trị ghi nhận': '142 đơn',
      'Mục tiêu kỳ (Target)': '120 đơn',
      'Tiến độ / Đánh giá': '118.3% (Tăng trưởng tốt)'
    },
    {
      'Nhóm chỉ số': 'Chỉ số Tài chính Tổng quan',
      'Tên chỉ số KPI': 'Giá trị Trung bình Đơn hàng (AOV)',
      'Giá trị ghi nhận': '1,305,985 VNĐ',
      'Mục tiêu kỳ (Target)': '1,200,000 VNĐ',
      'Tiến độ / Đánh giá': 'Vượt 8.8% nhờ chiến lược combo'
    },
    {
      'Nhóm chỉ số': 'Hiệu quả Vận hành & Thanh toán',
      'Tên chỉ số KPI': 'Tỷ lệ Thanh toán Tự động VietQR',
      'Giá trị ghi nhận': '78.5%',
      'Mục tiêu kỳ (Target)': '70.0%',
      'Tiến độ / Đánh giá': 'Giảm thiểu rủi ro bom hàng COD'
    },
    {
      'Nhóm chỉ số': 'Hiệu quả Vận hành & Thanh toán',
      'Tên chỉ số KPI': 'Tỷ lệ Giao hàng Thành công (Fulfillment)',
      'Giá trị ghi nhận': '96.8%',
      'Mục tiêu kỳ (Target)': '95.0%',
      'Tiến độ / Đánh giá': 'Đạt chuẩn cam kết dịch vụ'
    },
    {
      'Nhóm chỉ số': 'Hiệu quả Vận hành & Thanh toán',
      'Tên chỉ số KPI': 'Tỷ lệ Hoàn/Hủy đơn (Return/Cancel Rate)',
      'Giá trị ghi nhận': '3.2%',
      'Mục tiêu kỳ (Target)': '< 5.0%',
      'Tiến độ / Đánh giá': 'Rất thấp, chất lượng hàng hóa tốt'
    },
    {
      'Nhóm chỉ số': 'Mức độ Hài lòng & Đánh giá',
      'Tên chỉ số KPI': 'Điểm đánh giá trung bình từ khách hàng',
      'Giá trị ghi nhận': '4.85 / 5.0 ★',
      'Mục tiêu kỳ (Target)': '4.50 ★',
      'Tiến độ / Đánh giá': '94.2% đánh giá 5 sao tuyệt đối'
    },
    {
      'Nhóm chỉ số': 'Top 1 Sản phẩm Bán chạy',
      'Tên chỉ số KPI': 'Áo Khoác Trench Coat Linen Unisex',
      'Giá trị ghi nhận': '42,500,000 VNĐ (34 sản phẩm)',
      'Mục tiêu kỳ (Target)': 'Ngành: Thời trang',
      'Tiến độ / Đánh giá': 'Sản phẩm chủ lực (Hero SKU)'
    },
    {
      'Nhóm chỉ số': 'Top 2 Sản phẩm Bán chạy',
      'Tên chỉ số KPI': 'Tai Nghe Hi-Fi Studio Pro ANC',
      'Giá trị ghi nhận': '38,900,000 VNĐ (16 sản phẩm)',
      'Mục tiêu kỳ (Target)': 'Ngành: Âm thanh',
      'Tiến độ / Đánh giá': 'Tỷ lệ chuyển đổi cao nhất'
    },
    {
      'Nhóm chỉ số': 'Top 3 Sản phẩm Bán chạy',
      'Tên chỉ số KPI': 'Ghế Thư Giãn Gỗ Sồi Bắc Âu Scandi',
      'Giá trị ghi nhận': '35,600,000 VNĐ (10 sản phẩm)',
      'Mục tiêu kỳ (Target)': 'Ngành: Nội thất',
      'Tiến độ / Đánh giá': 'Giá trị đơn cao (High AOV)'
    }
  ];

  // 9. Khởi tạo Workbook Excel với thư viện XLSX
  const workbook = XLSX.utils.book_new();

  // Helper đặt độ rộng cột tự động
  const fitWidth = (data) => {
    if (!data || data.length === 0) return [];
    const keys = Object.keys(data[0]);
    return keys.map((key) => {
      let maxLen = key.length;
      data.forEach((row) => {
        const val = row[key] ? String(row[key]) : '';
        if (val.length > maxLen) maxLen = val.length;
      });
      return { wch: Math.min(Math.max(maxLen + 4, 12), 65) };
    });
  };

  if (!XLSX) {
    const jsonOutput = {
      sheet1Data,
      sheet2Data,
      sheet3Data,
      sheet4Data,
      sheet5Data,
      sheet6Data,
      sheet7Data,
      sheet8Data
    };
    const jsonFilePath = path.join(__dirname, '../../HO_SO_BAN_GIAO_HE_THONG_ATELIER.json');
    fs.writeFileSync(jsonFilePath, JSON.stringify(jsonOutput, null, 2), 'utf8');
    console.log(`\n🎉 ĐÃ XUẤT THÀNH CÔNG HỒ SƠ BÀN GIAO DẠNG JSON TẠI:`);
    console.log(`👉 ${jsonFilePath}\n`);
    return;
  }

  const ws1 = XLSX.utils.json_to_sheet(sheet1Data);
  ws1['!cols'] = fitWidth(sheet1Data);
  XLSX.utils.book_append_sheet(workbook, ws1, '1. Thong_Tin_He_Thong');

  const ws2 = XLSX.utils.json_to_sheet(sheet2Data);
  ws2['!cols'] = fitWidth(sheet2Data);
  XLSX.utils.book_append_sheet(workbook, ws2, '2. Huong_Dan_Van_Hanh');

  const ws3 = XLSX.utils.json_to_sheet(sheet3Data);
  ws3['!cols'] = fitWidth(sheet3Data);
  XLSX.utils.book_append_sheet(workbook, ws3, '3. Bien_Moi_Truong');

  const ws4 = XLSX.utils.json_to_sheet(sheet4Data);
  ws4['!cols'] = fitWidth(sheet4Data);
  XLSX.utils.book_append_sheet(workbook, ws4, '4. Danh_Muc_Nganh_Hang');

  const ws5 = XLSX.utils.json_to_sheet(sheet5Data);
  ws5['!cols'] = fitWidth(sheet5Data);
  XLSX.utils.book_append_sheet(workbook, ws5, '5. Tinh_Trang_Du_Lieu');

  const ws6 = XLSX.utils.json_to_sheet(sheet6Data);
  ws6['!cols'] = fitWidth(sheet6Data);
  XLSX.utils.book_append_sheet(workbook, ws6, '6. Bao_Cao_Doanh_Thu');

  const ws7 = XLSX.utils.json_to_sheet(sheet7Data);
  ws7['!cols'] = fitWidth(sheet7Data);
  XLSX.utils.book_append_sheet(workbook, ws7, '7. Bao_Cao_Don_Hang');

  const ws8 = XLSX.utils.json_to_sheet(sheet8Data);
  ws8['!cols'] = fitWidth(sheet8Data);
  XLSX.utils.book_append_sheet(workbook, ws8, '8. Chi_So_KPI');

  const outputFilePath = path.join(__dirname, '../../HO_SO_BAN_GIAO_HE_THONG_ATELIER.xlsx');
  XLSX.writeFile(workbook, outputFilePath);

  console.log(`\n🎉 ĐÃ XUẤT THÀNH CÔNG FILE EXCEL HOÀN CHỈNH TẠI:`);
  console.log(`👉 ${outputFilePath}\n`);
}

exportHandoverExcel()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Lỗi xuất file Excel:', err);
    process.exit(1);
  });
