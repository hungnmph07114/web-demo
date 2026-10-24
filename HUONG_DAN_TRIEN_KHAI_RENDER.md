# CẨM NANG HƯỚNG DẪN TRIỂN KHAI ỨNG DỤNG LÊN RENDER.COM TỪ A - Z

Tài liệu này được biên soạn dành riêng cho bạn để lưu trữ trong thư mục làm việc, làm tài liệu tham khảo chi tiết khi bắt tay vào xây dựng và đưa ứng dụng web lên Internet miễn phí với **Render.com**.

> [!IMPORTANT]
> ### 📌 HỒ SƠ TÀI KHOẢN & THÔNG SỐ CỦA BẠN (LƯU TRỮ ĐỂ TRA CỨU)
> | Dịch vụ | Mục | Thông tin chi tiết |
> | :--- | :--- | :--- |
> | **Render.com** (Server Web) | Email tài khoản | `itisloves2@gmail.com` (Workspace: *My Workspace*) |
> | | Trang quản trị | [dashboard.render.com](https://dashboard.render.com) |
> | | API Key | `rnd_VRDeFOy2odVHNB3CFVNkRYrED2NE` |
> | | **Trang Web Trực Tuyến (Live)** | **[https://shopchychy.foo.ng](https://shopchychy.foo.ng)** (Tên miền riêng)<br>*(Hoặc: [https://web-demo-app.onrender.com](https://web-demo-app.onrender.com))* |
> | | Kho lưu trữ GitHub | [https://github.com/hungnmph07114/web-demo](https://github.com/hungnmph07114/web-demo) |
> | **Supabase** (PostgreSQL) | Trang quản trị | [supabase.com/dashboard/project/oecgyiaetefmxkrndcvk](https://supabase.com/dashboard/project/oecgyiaetefmxkrndcvk) |
> | | Mật khẩu Database | `manhhung0423` |
> | | **Chuỗi kết nối (DATABASE_URL)** | `postgresql://postgres.oecgyiaetefmxkrndcvk:manhhung0423@aws-0-ap-south-1.pooler.supabase.com:6543/postgres` |
> | | **API Keys (Supabase SDK)** | Trang lấy key: [API Keys Settings](https://supabase.com/dashboard/project/oecgyiaetefmxkrndcvk/settings/api-keys)<br>- `Publishable key`: Dùng cho Frontend/Client<br>- `Secret key`: Quyền Admin, chỉ dùng cho Backend trên Render |
> | **Thư mục lưu trữ tài liệu** | Vị trí trên máy | `C:\Users\84123\OneDrive\Desktop\hoctap\HUONG_DAN_TRIEN_KHAI_RENDER.md` (Đã đồng bộ OneDrive) |

---

## MỤC LỤC
1. [Hiểu về Render & Đặc điểm gói Miễn Phí (Free Tier)](#1-hieu-ve-render--dac-diem-goi-mien-phi-free-tier)
2. [Các quy tắc "sống còn" khi viết code để deploy lên Render](#2-cac-quy-tac-song-con-khi-viet-code-de-deploy-len-render)
3. [Cấu hình mẫu cho từng ngôn ngữ & framework phổ biến](#3-cau-hinh-mau-cho-tung-ngon-ngu--framework-pho-bien)
   - [Node.js (Express, NestJS)](#31-nodejs-express-nestjs)
   - [Python (FastAPI, Flask, Django)](#32-python-fastapi-flask-django)
   - [Frontend tĩnh (React, Vue, Vite, HTML/JS)](#33-frontend-tinh-react-vue-vite-htmljs)
   - [Đa nền tảng qua Docker (Java, PHP, Go, .NET...)](#34-da-nen-tang-qua-docker-java-php-go-net)
4. [Hướng dẫn triển khai chi tiết qua Dashboard (Cách trực quan)](#4-huong-dan-trien-khai-chi-tiet-qua-dashboard-cach-truc-quan)
5. [Tự động hoá bằng Blueprint (`render.yaml`)](#5-tu-dong-hoa-bang-blueprint-renderyaml)
6. [Quản lý và triển khai qua Render API (Sử dụng API Key)](#6-quan-ly-va-trien-khai-qua-render-api-su-dung-api-key)
7. [Các lỗi thường gặp và cách khắc phục](#7-cac-loi-thuong-gap-va-cach-khac-phuc)
8. [Mẹo giữ Server không bị ngủ đông (Keep-Alive)](#8-meo-giu-server-khong-bi-ngu-dong-keep-alive)

---

## 1. Hiểu về Render & Đặc điểm gói Miễn Phí (Free Tier)

Render cung cấp các dịch vụ miễn phí rất mạnh mẽ cho lập trình viên cá nhân:

| Loại dịch vụ | Gói Free hỗ trợ | Lưu ý quan trọng |
| :--- | :--- | :--- |
| **Web Service (Backend)** | 512 MB RAM, 0.1 CPU, 750 giờ/tháng | **Tự động ngủ đông (Spin down)** sau 15 phút không có lượt truy cập. Khi có request mới, mất khoảng 30–50 giây để khởi động lại. |
| **Static Site (Frontend)** | Băng thông 100 GB/tháng, CDN toàn cầu | **Hoạt động 24/7, không bao giờ ngủ đông**, tốc độ tải trang cực nhanh. |
| **PostgreSQL Database** | Miễn phí trọn đời qua **Supabase** (500 MB) | Render miễn phí có hạn, nên **kết hợp dùng Supabase (PostgreSQL miễn phí trọn đời)**. Kết nối cực kỳ đơn giản chỉ qua một biến môi trường `DATABASE_URL`. |
| **Redis** | Miễn phí 25 MB RAM | Dùng làm bộ nhớ đệm cache hoặc session store. |

> [!TIP]
> **Database PostgreSQL của bạn đã sẵn sàng sử dụng:**
> * **Project URL:** `https://oecgyiaetefmxkrndcvk.supabase.co`
> * **Khu vực (Region):** `South Asia (Mumbai - ap-south-1)`
> * **Chuỗi kết nối hoàn chỉnh (dùng cho biến `DATABASE_URL` trên Render hoặc file `.env`):**
>   ```text
>   postgresql://postgres.oecgyiaetefmxkrndcvk:manhhung0423@aws-0-ap-south-1.pooler.supabase.com:6543/postgres
>   ```
>   *(Hoặc Direct connection: `postgresql://postgres:manhhung0423@db.oecgyiaetefmxkrndcvk.supabase.co:5432/postgres`)*

---

## 2. Các quy tắc "sống còn" khi viết code để deploy lên Render

Để ứng dụng không bị lỗi ngay khi vừa deploy, bạn **bắt buộc** phải tuân thủ 3 nguyên tắc sau:

### 2.1. Không hardcode cổng (Port)
Render sẽ cấp một cổng ngẫu nhiên thông qua biến môi trường `PORT`. Server của bạn phải lắng nghe cổng này:
* **Node.js:** `const PORT = process.env.PORT || 3000;`
* **Python:** Đọc qua `os.environ.get("PORT", 8000)`

### 2.2. Luôn bind vào địa chỉ `0.0.0.0` (Không dùng `localhost` hoặc `127.0.0.1`)
Nếu server backend chỉ lắng nghe trên `localhost` (`127.0.0.1`), Render sẽ không thể forward lượt truy cập từ bên ngoài internet vào trong container, dẫn đến lỗi timeout.
* Luôn cho server bind vào IP: `0.0.0.0`.

### 2.3. Không bao giờ đưa file `.env` lên GitHub
Tạo file `.gitignore` và thêm `.env` vào:
```gitignore
node_modules/
__pycache__/
venv/
.env
```
Mọi thông tin nhạy cảm (mật khẩu database, khóa bí mật JWT, API key) sẽ được điền vào mục **Environment Variables** trên trang quản trị của Render.

---

## 3. Cấu hình mẫu cho từng ngôn ngữ & framework phổ biến

Khi tạo một **Web Service**, Render sẽ hỏi 2 câu lệnh quan trọng:
* **Build Command:** Lệnh để cài đặt thư viện và biên dịch mã nguồn.
* **Start Command:** Lệnh để khởi chạy máy chủ.

### 3.1. Node.js (Express, NestJS)
* **File `package.json`** cần khai báo mục `scripts`:
  ```json
  "scripts": {
    "start": "node index.js"
  }
  ```
* **Mẫu code lắng nghe cổng (`index.js`):**
  ```javascript
  const express = require('express');
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.get('/', (req, res) => res.send('Server đang chạy tốt trên Render!'));

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
  });
  ```
* **Render Settings:**
  * **Build Command:** `npm install`
  * **Start Command:** `npm start`

---

### 3.2. Python (FastAPI, Flask, Django)
* Tạo file `requirements.txt` lưu danh sách thư viện (ví dụ: `fastapi`, `uvicorn`).
* **Mẫu khởi chạy FastAPI (`main.py`):**
  ```python
  from fastapi import FastAPI
  app = FastAPI()

  @app.get("/")
  def read_root():
      return {"message": "Xin chào từ FastAPI trên Render!"}
  ```
* **Render Settings:**
  * **Build Command:** `pip install -r requirements.txt`
  * **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
  *(Nếu dùng Django/Gunicorn: `gunicorn myproject.wsgi:application --bind 0.0.0.0:$PORT`)*

---

### 3.3. Frontend tĩnh (React, Vue, Vite, HTML/JS)
Với frontend, bạn chọn loại dịch vụ là **Static Site** (không tốn giờ chạy backend, miễn phí 100%):
* **Build Command:** `npm run build`
* **Publish Directory:** `dist` (đối với Vite/Vue/React hiện đại) hoặc `build` (đối với Create React App)
* **Rewrite Rules (cho React Router/Vue Router):**
  * Vào tab **Redirects/Rewrites**, thêm rule:
    * **Source:** `/*`
    * **Destination:** `/index.html`
    * **Action:** `Rewrite` (để khi người dùng F5 không bị lỗi 404).

---

### 3.4. Đa nền tảng qua Docker (Java, PHP, Go, .NET...)
Chỉ cần để một file `Dockerfile` ở thư mục gốc của dự án, Render sẽ tự nhận diện và build:
```dockerfile
# Ví dụ Dockerfile cho Go / Java / PHP / Python
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3000
CMD ["node", "index.js"]
```

---

## 4. Hướng dẫn triển khai chi tiết qua Dashboard (Cách trực quan)

### Bước 1: Đẩy mã nguồn lên GitHub
1. Tạo một repository mới trên [github.com](https://github.com).
2. Đẩy toàn bộ code dự án của bạn lên:
   ```bash
   git init
   git add .
   git commit -m "Khoi tao du an web"
   git branch -M main
   git remote add origin https://github.com/<tai-khoan>/<ten-repo>.git
   git push -u origin main
   ```

### Bước 2: Tạo dịch vụ trên Render
1. Đăng nhập vào [dashboard.render.com](https://dashboard.render.com).
2. Nhấn nút **New +** ở góc trên cùng bên phải.
3. Chọn loại dịch vụ:
   * **Web Service:** Cho Backend API (Node, Python, Go...).
   * **Static Site:** Cho Frontend (React, Vue, HTML/CSS).
   * **PostgreSQL:** Nếu cần Database.
4. Chọn **Build and deploy from a Git repository**, kết nối với tài khoản GitHub và chọn repo của bạn.

### Bước 3: Điền cấu hình cơ bản
* **Name:** Tên dự án (sẽ tạo ra link dạng `https://ten-du-an.onrender.com`).
* **Region:** Chọn `Singapore` (để có tốc độ kết nối về Việt Nam nhanh nhất).
* **Branch:** `main`
* **Build Command:** Điền lệnh build tương ứng (xem lại mục 3).
* **Start Command:** Điền lệnh chạy server.
* **Instance Type:** Chọn **Free**.

### Bước 4: Cấu hình biến môi trường
1. Kéo xuống mục **Environment Variables**.
2. Nhập các cặp `Key` - `Value` (Ví dụ: `NODE_ENV = production`, `DATABASE_URL = ...`).
3. Bấm **Create Web Service**. Render sẽ bắt đầu build và hiển thị log trực tiếp. Khi hoàn thành, bạn sẽ nhận được đường dẫn URL công khai có HTTPS!

---

## 5. Tự động hoá bằng Blueprint (`render.yaml`)

Thay vì phải bấm tay từng bước trên giao diện web, bạn có thể tạo một file tên là `render.yaml` ngay trong repo. Render sẽ tự động đọc file này và thiết lập tất cả các dịch vụ:

```yaml
services:
  # 1. Dịch vụ Backend Web Service
  - type: web
    name: my-backend-api
    env: node
    plan: free
    region: singapore
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        fromDatabase:
          name: my-postgres-db
          property: connectionString

databases:
  # 2. Dịch vụ Database PostgreSQL
  - name: my-postgres-db
    plan: free
    region: singapore
    databaseName: myappdb
    user: myappuser
```

Khi đẩy file này lên GitHub, trên Render bạn chỉ cần vào **Blueprints > New Blueprint Instance**, Render sẽ tự cấu hình mọi thứ đúng như file mô tả.

---

## 6. Quản lý và triển khai qua Render API (Sử dụng API Key)

Bạn đã có sẵn API Key. Bạn có thể dùng API Key này để tự động hóa hoặc tích hợp vào các script CI/CD (GitHub Actions).

### 6.1. Header xác thực bắt buộc
Trong mọi request gửi tới Render API, bạn thêm Header:
```http
Authorization: Bearer <RENDER_API_KEY>
Content-Type: application/json
```

### 6.2. Kích hoạt Deploy lại (Deploy Trigger) bằng lệnh cURL
Khi cần kích hoạt deploy lại dịch vụ từ dòng lệnh:
```bash
curl -X POST https://api.render.com/v1/services/<SERVICE_ID>/deploys \
  -H "Authorization: Bearer <RENDER_API_KEY>" \
  -H "Accept: application/json"
```

### 6.3. Lấy danh sách dịch vụ đang chạy
```bash
curl -s -H "Authorization: Bearer <RENDER_API_KEY>" https://api.render.com/v1/services
```

---

## 7. Các lỗi thường gặp và cách khắc phục

| Hiện tượng | Nguyên nhân | Cách khắc phục |
| :--- | :--- | :--- |
| **`Timed out waiting for port`** | Code backend đang lắng nghe trên cổng tĩnh (ví dụ cứng `3000`) hoặc bind vào `localhost`. | Đổi code thành đọc cổng từ `process.env.PORT` hoặc `$PORT` và bind vào IP `0.0.0.0`. |
| **`Exited with status 1 / 127`** | Thiếu file phụ thuộc, sai Start Command hoặc gõ nhầm tên file entrypoint. | Kiểm tra kỹ tab **Logs** trên Render để xem dòng báo lỗi cụ thể của runtime. |
| **Lỗi 404 khi F5 trang React/Vue** | Web SPA cần chuyển hướng tất cả URL về `index.html`. | Vào tab **Redirects/Rewrites** của Static Site, tạo rewrite `/* -> /index.html`. |
| **Không kết nối được Database** | URL Database bị sai hoặc chưa cấp quyền SSL. | Render Database yêu cầu kết nối an toàn (SSL). Thêm tham số `?ssl=true` hoặc bật `rejectUnauthorized: false` trong cấu hình ORM/Driver. |

---

## 8. Mẹo giữ Server không bị ngủ đông (Keep-Alive)

Vì gói miễn phí sẽ tự động ngủ đông sau 15 phút không có ai vào, bạn có thể áp dụng mẹo sau để server luôn thức sẵn sàng phục vụ:

1. Đăng ký một tài khoản miễn phí tại **[UptimeRobot](https://uptimerobot.com/)** hoặc **[Cron-job.org](https://cron-job.org/)**.
2. Tạo một Monitor mới dạng **HTTP(s)**:
   * **URL:** `https://ten-ung-dung-cua-ban.onrender.com/health` (hoặc link trang chủ của bạn).
   * **Tần suất (Interval):** Thiết lập gửi request mỗi **10 - 14 phút/lần**.
3. *Kết quả:* Nhờ có request định kỳ từ UptimeRobot, Render sẽ nhận định rằng ứng dụng đang có người dùng và không kích hoạt chế độ ngủ đông!
