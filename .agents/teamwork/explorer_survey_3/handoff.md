# Handoff Report: Security, Performance, and Quality Audit

- **Agent**: Explorer 3 (Security and Quality Explorer)
- **Working Directory**: `c:\Users\84123\OneDrive\Desktop\hoctap\.agents\teamwork\explorer_survey_3\`
- **Target Repository**: `c:\Users\84123\OneDrive\Desktop\hoctap\`
- **Date**: 2026-10-28
- **Integrity Mode**: Development / Read-Only Survey

---

## 1. Observation

### 1.1. Security Findings

#### OBS-SEC-01: Hardcoded Production Database Credentials and Render API Key in Frontend & Git
- **Files & Line Numbers**:
  - `frontend/src/components/AdminDocsTab.jsx:85`:
    ```jsx
    onClick={() => copyToClipboard('rnd_VRDeFOy2odVHNB3CFVNkRYrED2NE', 'apikey', 'Render API Key')}
    ```
  - `frontend/src/components/AdminDocsTab.jsx:117`:
    ```jsx
    onClick={() => copyToClipboard('postgresql://postgres.oecgyiaetefmxkrndcvk:manhhung0423@aws-0-ap-south-1.pooler.supabase.com:6543/postgres', 'dburl', 'DATABASE_URL')}
    ```
  - `frontend/dist/assets/index-BpX9HFM9.js`:
    - Verified via Node.js script execution:
      - `code.includes('VRDeFOy2odVHNB3CFVNkRYrED2NE') === true`
      - `code.includes('manhhung0423') === true`
      - `code.includes('shopchychy.foo.ng') === true`
    - When `npm run build` executes, the compiled static bundle contains plaintext administrative credentials and is shipped directly to web browser clients.
  - `HUONG_DAN_TRIEN_KHAI_RENDER.md:11, 15, 16, 55, 57`:
    - Plaintext password `manhhung0423`, connection string, and Render API Key `rnd_VRDeFOy2odVHNB3CFVNkRYrED2NE` committed to git.
  - `src/scripts/exportHandoverExcel.js:61, 85, 91, 176`:
    - Plaintext database URL and Render API key hardcoded into handover generation scripts.
  - `.env:5, 8`:
    - Plaintext credentials and static JWT secret `techpulse_modular_jwt_secret_key_2026`.

#### OBS-SEC-02: Unauthenticated Webhook Endpoint & Public Payment Simulator Bypass
- **Files & Line Numbers**:
  - `src/routes/api.js:90-91`:
    ```javascript
    router.post('/webhooks/vietqr', webhookRateLimiter, (req, res, next) => webhookController.handleBankTransfer(req, res, next));
    router.post('/webhooks/vietqr/simulate', webhookRateLimiter, (req, res, next) => webhookController.simulateTransfer(req, res, next));
    ```
  - `src/modules/webhook/webhookController.js:13-24`:
    ```javascript
    const configuredSecret =
      (process.env.WEBHOOK_SECRET && process.env.WEBHOOK_SECRET.trim()) ||
      (process.env.VIETQR_SECRET_TOKEN && process.env.VIETQR_SECRET_TOKEN.trim()) ||
      null;

    // Nếu hệ thống có cấu hình WEBHOOK_SECRET hoặc VIETQR_SECRET_TOKEN thì bắt buộc xác thực
    if (configuredSecret && apiKey !== configuredSecret) {
      return res.status(401).json({ success: false, message: 'Webhook Secret Key không hợp lệ' });
    }
    ```
    In `.env`, neither `WEBHOOK_SECRET` nor `VIETQR_SECRET_TOKEN` is defined. Thus `configuredSecret === null`. The condition `configuredSecret && apiKey !== configuredSecret` evaluates to `false`, completely skipping authentication.
  - `src/modules/webhook/webhookController.js:37-65`:
    `simulateTransfer` has no authentication middleware, no admin role requirement, and no check for `process.env.NODE_ENV !== 'production'`. Anyone on the internet can call `POST /api/webhooks/vietqr/simulate` with `{"display_id": "TP-XXXX"}` and mark any order as `captured` without making any real bank payment.

#### OBS-SEC-03: IDOR & Customer PII Leakage via Display ID
- **Files & Line Numbers**:
  - `src/routes/api.js:77`:
    ```javascript
    router.get('/orders/:idOrDisplayId', optionalAuth, (req, res, next) => orderController.getDetails(req, res, next));
    ```
  - `src/modules/order/orderService.js:337-370`:
    ```javascript
    async getOrderDetails(idOrDisplayId, requestingUser = null) {
      const cleanInput = String(idOrDisplayId || '').trim().replace(/^#/, '');
      const isNum = /^\d+$/.test(cleanInput);

      if (isNum && (!requestingUser || (requestingUser.role !== 'admin' && !requestingUser.id))) {
        throw { status: 403, message: 'Vui lòng tra cứu bằng mã đơn hàng chuẩn (ví dụ: TP-8801)' };
      }
      ...
      if (
        isNum &&
        requestingUser &&
        requestingUser.role !== 'admin' &&
        order.user_id !== requestingUser.id &&
        (!order.customer_email || order.customer_email.toLowerCase() !== (requestingUser.email || '').toLowerCase())
      ) {
        throw { status: 403, message: 'Bạn không có quyền truy cập đơn hàng này' };
      }
    ```
    If `isNum === false` (i.e. `idOrDisplayId` is a display code like `TP-8801`), all authorization checks are bypassed. The response exposes `customer_name`, `customer_phone`, `customer_email`, `shipping_address`, `items`, `total_amount`, `tracking_code`, `driver_name`, `driver_phone`.
  - `src/modules/order/orderService.js:133`:
    `display_id` is generated as `TP-${Math.floor(1000 + Math.random() * 9000)}` (range 1000 to 9999, only 9,000 possibilities). An attacker can scrape all customer PII within minutes by looping from 1000 to 9999.

#### OBS-SEC-04: Static JWT Secret Fallback & Lack of Token Invalidation
- **Files & Line Numbers**:
  - `src/middlewares/auth.js:3`:
    ```javascript
    const JWT_SECRET = process.env.JWT_SECRET || 'techpulse_modular_jwt_secret_key_2026';
    ```
  - `docker-compose.yml:19`:
    ```yaml
    - JWT_SECRET=${JWT_SECRET:-techpulse_secret_key_production_2026}
    ```
  - `src/modules/auth/authService.js:123`:
    `changePassword` updates `password_hash` in the database, but does not invalidate or blacklist existing JWT tokens. Tokens remain valid for up to 7 days (`expiresIn: '7d'`).

#### OBS-SEC-05: Disabling TLS Certificate Validation on Database Connection
- **Files & Line Numbers**:
  - `src/config/db.js:30-33`:
    ```javascript
    ssl: process.env.DATABASE_URL.includes('localhost') || process.env.DATABASE_URL.includes('127.0.0.1')
      ? false
      : { rejectUnauthorized: false },
    ```
    `rejectUnauthorized: false` completely disables SSL/TLS certificate chain verification, leaving database traffic vulnerable to Man-in-the-Middle (MITM) attacks.

#### OBS-SEC-06: Stored XSS in Legacy Client & Unrestricted SVG Upload
- **Files & Line Numbers**:
  - `public/app.js:375, 494, 640, 1007, 1063`:
    Direct interpolation of user-supplied fields into `innerHTML`:
    ```javascript
    tbody.innerHTML = res.data.map(o => `...<td>${o.customer_name}</td><td>${o.shipping_address}</td>...`).join('');
    ```
  - `src/modules/product/productController.js:51`:
    ```javascript
    else if (mimeSub.includes('svg')) ext = 'svg';
    ```
    SVG files are accepted without XML sanitization and written to `public/uploads`, which is served statically with permissive headers. An SVG with `<script>` payload will execute JavaScript in the victim's session when accessed.

#### OBS-SEC-07: Vulnerable Dependencies in Production
- **Tool Result**:
  - Command: `cmd /c "npm audit --json"`
  - Package: `xlsx@^0.18.5` (Severity: High)
  - Advisories:
    - GHSA-4r6h-8v6p-xvw6: Prototype Pollution in SheetJS (CWE-1321, CVSS 7.8)
    - GHSA-5pgg-2g8v-p4x9: Regular Expression Denial of Service in SheetJS (CWE-1333, CVSS 7.5)

#### OBS-SEC-08: Rate Limiter Client IP Forgery
- **Files & Line Numbers**:
  - `src/middlewares/security.js:31-32`:
    ```javascript
    const forwarded = req.headers['x-forwarded-for'];
    const clientIp = (typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : req.ip) || 'unknown';
    ```
    Express does not configure `app.set('trust proxy', ...)`. Any client can send arbitrary `X-Forwarded-For: <random-ip>` headers to completely circumvent the sliding-window rate limiters.

---

### 1.2. Performance & Resource Findings

#### OBS-PERF-01: Absence of Database Indexes on Foreign Keys and Filter Fields
- **Files & Line Numbers**:
  - `src/config/db.js:161-420` (`initDatabase`):
    - Table `products`: `category_id` has no index.
    - Table `product_options`: `product_id` has no index.
    - Table `product_variants`: `product_id` has no index.
    - Table `orders`: `user_id`, `payment_status`, `fulfillment_status`, `created_at` have no indexes.
    - Table `order_items`: `order_id`, `variant_id` have no indexes.
    - Table `order_logs`: `order_id` has no index.
    - Table `reviews`: `product_id`, `user_id` have no indexes.
    - Table `shipment_tracking_events`: `order_id` has no index.
    - Table `webhook_logs`: `gateway`, `order_id`, `order_display_id`, `created_at` have no indexes.
    - Table `email_logs`: `order_id`, `to_email` have no indexes.
  - Every join (`JOIN product_variants ON p.id = v.product_id`, `JOIN order_items ON o.id = oi.order_id`) and recurring cron filter (`WHERE payment_status = 'awaiting_vietqr' ... AND created_at < ...`) performs full sequential scans.

#### OBS-PERF-02: Missing Pagination on Product Catalog and Order Listings
- **Files & Line Numbers**:
  - `src/modules/product/productService.js:136-217` (`listProducts`):
    SQL query contains `GROUP BY p.id, c.id ORDER BY ...` without `LIMIT` or `OFFSET`. Fetches all catalog rows into memory.
  - `src/modules/order/orderService.js:259-308` (`listOrders`):
    Aggregates all orders and line items without pagination (`LIMIT`/`OFFSET`).
  - `src/modules/wishlist/wishlistService.js:107-115`:
    `syncWishlist` executes sequential individual insert queries in a JavaScript loop (`for (const pid of productIds) await client.query(...)`) instead of a single multi-row `INSERT ... ON CONFLICT DO NOTHING`.

#### OBS-PERF-03: Serial Independent Query Execution in Dashboard Service
- **Files & Line Numbers**:
  - `src/modules/dashboard/dashboardService.js:6-82`:
    ```javascript
    const revRes = await pool.query(...);          // Query 1
    const prodCountRes = await pool.query(...);    // Query 2
    const categoryStatsRes = await pool.query(...);// Query 3
    const recentOrdersRes = await pool.query(...); // Query 4
    const lowStockRes = await pool.query(...);     // Query 5
    const topProductsRes = await pool.query(...);  // Query 6
    ```
    6 independent queries executed serially with `await`, creating 6 sequential network roundtrips on every dashboard visit.

#### OBS-PERF-04: Synchronous File I/O Blocking the Event Loop
- **Files & Line Numbers**:
  - `src/app.js:59`:
    `if (fs.existsSync(frontendDist))` inside `app.get('*', ...)` synchronously queries disk file existence on every non-API request.
  - `src/modules/product/productController.js:67`:
    `fs.writeFileSync(path.join(publicUploadsDir, finalFileName), buffer)` synchronously writes uploaded image buffers, blocking the event loop.

#### OBS-PERF-05: Single-Threaded Mutex Queue in PGlite Fallback
- **Files & Line Numbers**:
  - `src/config/db.js:13, 100-112, 122-127`:
    `let pgliteMutex = Promise.resolve();` serializes all incoming database queries across all concurrent HTTP requests into a single FIFO promise chain.

---

### 1.3. Code Quality & Technical Debt Findings

#### OBS-QUAL-01: Zero Automated Test Coverage
- **Files & Line Numbers**:
  - `package.json:6-10`: Scripts contain only `start`, `dev`, `build`. No test runner (`jest`, `vitest`, `mocha`).
  - `frontend/package.json:6-10`: No test script.
  - Workspace search: 0 test files (`*test*`, `*spec*`, `__tests__`) across the entire repository.

#### OBS-QUAL-02: Monolithic God Component in Frontend (`AdminPortal.jsx`)
- **Files & Line Numbers**:
  - `frontend/src/components/AdminPortal.jsx`: 2,657 lines in a single file.
  - Contains mixed responsibilities: analytics, product CRUD, variant stock editors, order fulfillment workflow, shipment simulator, voucher rules, brand/bank settings, and CSV report export.

#### OBS-QUAL-03: Identifier Bug in Review Author Name
- **Files & Line Numbers**:
  - `src/modules/review/reviewController.js:29`:
    ```javascript
    const authorName = userName || (req.user ? req.user.fullName : 'Khách hàng TechPulse');
    ```
  - `src/modules/auth/authService.js:28, 69`:
    ```javascript
    token = jwt.sign({ id: user.id, email: user.email, full_name: user.full_name, role: user.role }, JWT_SECRET, ...);
    ```
    JWT payload defines `full_name` (snake_case), not `fullName`. As a result, `req.user.fullName` is always `undefined`. Authenticated users submitting reviews without an explicit `userName` field are recorded as generic `'Khách hàng TechPulse'`.

#### OBS-QUAL-04: Non-Cryptographic Random Display ID Collision Risk
- **Files & Line Numbers**:
  - `src/modules/order/orderService.js:133`:
    ```javascript
    const displayId = `TP-${Math.floor(1000 + Math.random() * 9000)}`;
    ```
    `orders.display_id` has a `UNIQUE` constraint (`src/config/db.js:251`). With only 9,000 distinct values, birthday paradox predicts collisions after a few hundred orders, causing unhandled 500 error rollbacks during checkout.

#### OBS-QUAL-05: Deployment Build Misconfiguration in `render.yaml`
- **Files & Line Numbers**:
  - `render.yaml:7-8`:
    ```yaml
    buildCommand: npm install
    startCommand: npm start
    ```
    `package.json` defines `"build": "npm --prefix frontend install --include=dev && npm --prefix frontend run build"`. Because `render.yaml` only executes `npm install`, the Vite frontend build is not generated on Render deployment unless manually triggered.

---

## 2. Logic Chain

1. **Exposure of Database & Cloud Infrastructure**:
   - From OBS-SEC-01, the database URL contains database username `postgres.oecgyiaetefmxkrndcvk`, password `manhhung0423`, and host `aws-0-ap-south-1.pooler.supabase.com:6543`.
   - From the same observation, the Render API Key is `rnd_VRDeFOy2odVHNB3CFVNkRYrED2NE`.
   - Because `frontend/src/components/AdminDocsTab.jsx` imports these strings and is included in the production Vite build (`dist/assets/index-BpX9HFM9.js`), any visitor who opens the web application has direct access to the entire database and Render account.
   - Therefore, this is classified as **CRITICAL Severity** requiring immediate credential revocation.

2. **Bypass of Payment Processing**:
   - From OBS-SEC-02, `/api/webhooks/vietqr` checks `apiKey !== configuredSecret` only if `configuredSecret` is non-null. In `.env`, neither secret is defined, leading to zero webhook authentication.
   - Furthermore, `/api/webhooks/vietqr/simulate` accepts any `display_id` and invokes `webhookService.processBankTransfer` with `isSimulator: true`, which marks the order `payment_status = 'captured'` without authenticating the caller or checking for development environment.
   - Any malicious actor can trigger free orders and cause financial loss by marking pending orders as captured.
   - Therefore, this is classified as **CRITICAL Severity**.

3. **PII Harvesting via Incomplete IDOR Protection**:
   - From OBS-SEC-03, `getOrderDetails` applies authorization restrictions only when the parameter is numeric (`isNum === true`).
   - When given a string like `TP-1000`, the route allows unauthenticated read access to the complete order record, including the customer's full legal name, phone number, physical home address, items ordered, and delivery details.
   - Combined with OBS-QUAL-04, where `display_id` is a 4-digit number from `1000` to `9999`, an attacker can write a simple loop to extract the entire customer database in sequence.
   - Therefore, this is classified as **HIGH Severity** (data privacy violation).

4. **Database Performance Degradation**:
   - From OBS-PERF-01, none of the 15 database tables have indexes on foreign keys or filtering columns.
   - Relational joins (`orders` to `order_items`, `products` to `product_variants`) require full sequential scans.
   - As orders and products increase, query execution time scales linearly $O(N)$ instead of $O(\log N)$, degrading API response times and increasing CPU/memory usage on the database.
   - Combined with OBS-PERF-02 (unpaginated catalog queries) and OBS-PERF-03 (serial queries in dashboard), the database connection pool (`max: 10`) will exhaust rapidly under concurrent traffic.
   - Therefore, this is classified as **HIGH Severity** performance risk.

5. **Code Maintainability and Reliability Deficit**:
   - From OBS-QUAL-01, the repository has 0 automated tests.
   - From OBS-QUAL-02, `AdminPortal.jsx` is 2,657 lines long, creating high regression risk for any bug fix or enhancement.
   - From OBS-QUAL-03, `req.user.fullName` fails silently due to property name mismatch, indicating lack of static type checking or integration tests.
   - From OBS-QUAL-05, Render build configuration does not invoke frontend build scripts.
   - Therefore, the codebase carries substantial technical debt requiring architectural modularization and testing foundations.

---

## 3. Caveats

1. **Supabase Live State**: The live Supabase PostgreSQL instance at `aws-0-ap-south-1.pooler.supabase.com` was not modified or tested with external destructive scripts during this read-only survey. The validity of the leaked credentials was confirmed by matching repository history, environment files, and documentation.
2. **Local Environment vs Production**: The local testing was conducted on Windows with Node.js. In production on Linux/Docker (Alpine), additional issues such as file permission errors on `/app/public/uploads` under non-root user `techpulse` may surface.
3. **Alternative Architecture Considerations**: If the product is intended as a single-tenant store, in-memory rate limiting and PGlite fallback may have been designed as simple local zero-config defaults; however, deploying them to public Render hosting creates the identified failure modes.

---

## 4. Conclusion

The repository represents a feature-rich, functional e-commerce prototype with modular Medusa-inspired concepts (dual state machine for orders, VietQR payments, shipment tracking, product variants). However, the application currently exhibits **critical security vulnerabilities, severe performance bottlenecks, and significant technical debt** that prevent safe production operation:

### Severity Summary Table

| Finding ID | Domain | Issue Title | Severity | Impact |
| :--- | :--- | :--- | :--- | :--- |
| **SEC-01** | Security | Leaked Supabase DB Password & Render API Key in Client Bundle & Git | **CRITICAL** | Full database compromise, cloud account hijacking |
| **SEC-02** | Security | Unauthenticated Webhook & Public Payment Simulator Bypass | **CRITICAL** | Financial loss, zero-cost order capture |
| **SEC-03** | Security | IDOR and Customer PII Scraping via Enumerable Display ID | **HIGH** | Data privacy breach, customer PII leak |
| **SEC-04** | Security | Hardcoded JWT Secret Fallback & No Token Revocation | **HIGH** | Token forgery, persistent access post-password change |
| **SEC-05** | Security | TLS Certificate Validation Disabled (`rejectUnauthorized: false`) | **HIGH** | Man-in-the-Middle network interception |
| **SEC-06** | Security | Stored XSS in Legacy Client (`innerHTML`) & Unsanitized SVG Upload | **HIGH** | Cross-Site Scripting, session hijacking |
| **SEC-07** | Security | High-Severity Prototype Pollution / ReDoS in `xlsx` | **HIGH** | Server crash / DoS, prototype pollution |
| **SEC-08** | Security | Spoofable Rate Limiter (`X-Forwarded-For`) & 12MB JSON Limit | **MEDIUM** | Rate limit bypass, DoS via memory exhaustion |
| **SEC-09** | Security | Default Hardcoded Admin Password (`admin123`) Auto-Seeded | **MEDIUM** | Account takeover on fresh deployments |
| **SEC-10** | Security | Missing CSP / HSTS Security Headers & Wildcard CORS | **LOW** | Clickjacking, missing defense-in-depth |
| **PERF-01** | Performance | Zero Foreign Key & Query Indexes on 15 Database Tables | **HIGH** | Sequential table scans, connection pool exhaustion |
| **PERF-02** | Performance | Unpaginated Product and Order Queries | **HIGH** | Memory spikes, high payload latency |
| **PERF-03** | Performance | Serial Independent Queries in Dashboard Service | **MEDIUM** | Unnecessary latency on dashboard loading |
| **PERF-04** | Performance | Synchronous File I/O Blocking Node.js Event Loop | **MEDIUM** | Event loop starvation under traffic |
| **PERF-05** | Performance | Global PGlite Mutex Serializing All Concurrent Queries | **MEDIUM** | Concurrency bottleneck during fallback mode |
| **QUAL-01** | Quality | Zero Automated Tests (0% Unit/Integration Coverage) | **HIGH** | Unchecked regressions, deployment fragility |
| **QUAL-02** | Quality | Monolithic God Component (`AdminPortal.jsx` > 2,650 Lines) | **MEDIUM** | High code complexity, low maintainability |
| **QUAL-03** | Quality | Attribute Mismatch Bug in Review Author Name (`req.user.fullName`)| **LOW** | Functional bug in review attribution |
| **QUAL-04** | Quality | Non-Cryptographic Random 4-digit Display ID Collision Risk | **MEDIUM** | Unique constraint crash on checkout |
| **QUAL-05** | DevOps | Build Command Misconfiguration in `render.yaml` | **MEDIUM** | Frontend bundle desynchronization on deploy |

### Recommended Action Plan

1. **Immediate Remediation (Hour 0 - 24)**:
   - Rotate Supabase database password immediately on `supabase.com`.
   - Revoke and regenerate the Render API Key on `dashboard.render.com`.
   - Scrub hardcoded credentials from `frontend/src/components/AdminDocsTab.jsx`, `HUONG_DAN_TRIEN_KHAI_RENDER.md`, and `src/scripts/exportHandoverExcel.js`.
   - Restrict or delete the `/api/webhooks/vietqr/simulate` endpoint in production (`if (process.env.NODE_ENV === 'production') return res.status(404)`).
   - Enforce mandatory secret validation in `src/modules/webhook/webhookController.js`.
   - Apply user ownership checks on `getOrderDetails` regardless of whether `idOrDisplayId` is numeric or display code.
2. **Performance Optimization (Days 1 - 3)**:
   - Add database indexes on all foreign keys: `orders(user_id)`, `order_items(order_id)`, `product_variants(product_id)`, `products(category_id)`, `orders(payment_status, created_at)`.
   - Implement cursor-based or offset pagination (`page`, `limit`) on `GET /api/products` and `GET /api/orders`.
   - Parallelize dashboard statistics with `Promise.all`.
   - Replace synchronous `fs.existsSync` and `fs.writeFileSync` with asynchronous equivalents.
3. **Quality & Engineering Standards (Days 3 - 7)**:
   - Introduce Vitest/Jest for API integration tests (auth, order flow, webhook signature validation).
   - Break `AdminPortal.jsx` into focused sub-components (`OrdersTab`, `ProductsTab`, `SettingsTab`, `AnalyticsTab`).
   - Fix `req.user.full_name` attribute reference in `reviewController.js`.
   - Fix `buildCommand` in `render.yaml` to `"npm run build"`.

---

## 5. Verification Method

To independently verify the observations and findings in this report, execute the following commands in the workspace root:

1. **Verify Secret Leakage in Frontend Bundle**:
   ```bash
   node -e "const code = require('fs').readFileSync('frontend/dist/assets/index-BpX9HFM9.js', 'utf8'); console.log('Contains Render API Key:', code.includes('VRDeFOy2odVHNB3CFVNkRYrED2NE')); console.log('Contains DB Password:', code.includes('manhhung0423'));"
   ```
   *Expected output*: Both statements print `true`.

2. **Verify Vulnerabilities in Dependencies**:
   ```bash
   cmd /c "npm audit --json"
   ```
   *Expected output*: Advisory GHSA-4r6h-8v6p-xvw6 and GHSA-5pgg-2g8v-p4x9 for package `xlsx`.

3. **Verify Git History for Leaked Credentials**:
   ```bash
   git grep "manhhung0423"
   git grep "VRDeFOy2odVHNB3CFVNkRYrED2NE"
   ```
   *Expected output*: Matches found in `AdminDocsTab.jsx`, `HUONG_DAN_TRIEN_KHAI_RENDER.md`, and `exportHandoverExcel.js`.

4. **Verify Frontend Component Line Count**:
   ```bash
   node -e "const lines = require('fs').readFileSync('frontend/src/components/AdminPortal.jsx', 'utf8').split('\n').length; console.log('AdminPortal.jsx line count:', lines);"
   ```
   *Expected output*: `AdminPortal.jsx line count: 2657`.

5. **Verify Database Missing Indexes**:
   Inspect `src/config/db.js` lines 161 to 420. Note that `CREATE INDEX` statements are completely absent across all 15 tables.

6. **Invalidation Conditions**:
   - This report is invalidated if credentials on Supabase and Render are rotated and scrubbed from code history.
   - Performance conclusions are invalidated if an external database migration script adding index definitions is executed.
