# 🏛️ KIẾN TRÚC HỆ THỐNG DỰ ÁN MATHKIDS

Tài liệu này hướng dẫn chi tiết về cấu trúc thư mục, luồng dữ liệu và cách mở rộng quy mô dự án **MathKids - Nền tảng học tập rèn luyện tư duy toán cấp 1**.

---

## 📁 1. Cấu Trúc Thư Mục Chuẩn Doanh Nghiệp (Scalable Modular Architecture)

```text
hoctap/
├── .env                                  # Biến môi trường bí mật (DATABASE_URL, PORT) - KHÔNG commit lên Git
├── .gitignore                            # Khai báo loại trừ node_modules, .env, *.log
├── package.json                          # Khai báo dependencies và scripts (start, dev)
├── render.yaml                           # Cấu hình Blueprint tự động triển khai Render.com
├── HUONG_DAN_TRIEN_KHAI_RENDER.md        # Cẩm nang triển khai cloud từ A-Z
├── ARCHITECTURE.md                       # Sơ đồ và quy chuẩn kiến trúc mở rộng dự án
│
├── server.js                             # 🚀 Điểm khởi chạy (Entrypoint) siêu gọn gàng
│
├── src/                                  # 🧠 TẦNG BACKEND (Node.js Express + MVC Pattern)
│   ├── app.js                            # Cấu hình middleware Express, static files & error handler
│   ├── config/
│   │   └── db.js                         # Kết nối PostgreSQL (Supabase Pool), tự động khởi tạo bảng
│   ├── controllers/                      # Tầng điều khiển (Request & Response logic)
│   │   ├── mathController.js             # Xử lý Bảng xếp hạng, lưu điểm, thống kê toán học
│   │   ├── notesController.js            # Xử lý CRUD ghi chú học tập
│   │   └── statusController.js           # Kiểm tra trạng thái máy chủ, latency DB
│   ├── routes/                           # Tầng định tuyến API tách biệt
│   │   ├── index.js                      # Router tổng hợp (/api)
│   │   ├── mathRoutes.js                 # Các endpoint /api/math/*
│   │   ├── notesRoutes.js                # Các endpoint /api/notes/*
│   │   └── statusRoutes.js               # Endpoint /api/status
│   └── middlewares/
│       └── errorHandler.js               # Bắt lỗi 404 cho API và Global 500 error handler
│
└── public/                               # 🎨 TẦNG FRONTEND (Giao diện Client & Tương tác)
    ├── index.html                        # Giao diện chính HTML5 chuẩn ngữ nghĩa & trợ năng
    ├── style.css                         # Hệ thống giao diện: màu sắc, nút 3D, cân thăng bằng, lật thẻ
    ├── app.js                            # Nhạc trưởng (Orchestrator): điều phối trạng thái và sự kiện
    └── js/                               # Thư viện mô-đun hóa Frontend
        ├── core/                         # Các công cụ cốt lõi tái sử dụng
        │   ├── audio.js                  # Bộ tổng hợp âm thanh Web Audio API (0 dependencies)
        │   ├── confetti.js               # Hiệu ứng pháo hoa giấy Canvas rực rỡ
        │   └── utils.js                  # Mã hóa XSS (escapeHtml), format thời gian, xáo trộn mảng
        ├── data/                         # Ngân hàng câu hỏi & cấu hình trò chơi
        │   ├── questions.js              # Ngân hàng bài toán tư duy theo khối Lớp 1 - 5
        │   ├── balanceStages.js          # Các màn chơi Cân thăng bằng ma thuật
        │   └── badges.js                 # Danh mục 8 huy hiệu danh giá
        └── services/                     # Tầng giao tiếp mạng
            └── apiService.js             # HTTP Client kết nối các API backend
```

---

## 🔄 2. Hướng Dẫn Mở Rộng Tính Năng

### ➕ Cách 1: Thêm câu hỏi tư duy mới cho Khối Lớp
Mở tệp [public/js/data/questions.js](file:///c:/Users/84123/OneDrive/Desktop/hoctap/public/js/data/questions.js), tìm khối lớp muốn thêm (`1`, `2`, `3`, `4`, hoặc `5`) và chèn cấu trúc:
```javascript
{
  id: 'g3_6',
  topic: 'Quy luật ma trận',
  diff: 'Vừa',
  question: 'Đề bài câu hỏi...',
  visual: {
    type: 'sequence', // hoặc 'equation', 'shapes'
    items: ['1', '4', '9', '16', '?']
  },
  options: ['20', '25', '30', '36'],
  correct: '25',
  hint: 'Gợi ý từ Bé PiPi...',
  explanation: 'Giải thích từng bước chi tiết...'
}
```

### ➕ Cách 2: Thêm màn chơi Cân Thăng Bằng mới
Mở tệp [public/js/data/balanceStages.js](file:///c:/Users/84123/OneDrive/Desktop/hoctap/public/js/data/balanceStages.js), thêm màn mới vào mảng `BALANCE_STAGES`:
```javascript
{
  level: 7,
  leftItems: [
    { type: 'fruit', symbol: '🍓', name: 'Dâu' },
    { type: 'weight', label: '6kg', val: 6 }
  ],
  rightItems: [
    { type: 'weight', label: '14kg', val: 14 }
  ],
  unknownItem: '1 Quả Dâu 🍓',
  correctWeight: 8,
  options: [6, 7, 8, 9],
  explanation: '🍓 + 6kg = 14kg  =>  🍓 = 14 - 6 = 8kg.'
}
```

### ➕ Cách 3: Thêm API Backend mới
1. Viết hàm xử lý trong `src/controllers/tenController.js`.
2. Khai báo route trong `src/routes/tenRoutes.js`.
3. Nhúng vào `src/routes/index.js`.
*(Mã nguồn hoàn toàn tách biệt, không cần sửa đổi server.js)*.

---

## ⚡ 3. Các Lệnh Điều Hành

- Chạy local trong môi trường phát triển:
  ```bash
  npm run dev
  ```
- Chạy production trên server / Render:
  ```bash
  npm start
  ```
- Kiểm tra trạng thái Git và đẩy lên đám mây:
  ```bash
  git add .
  git commit -m "feat: restructure project into scalable modular architecture"
  git push origin main
  ```
