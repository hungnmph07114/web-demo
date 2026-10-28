# Handoff Report — Explorer Survey 2: Tooling, Tests & Deployment

## 1. Observation

### 1.1 Test Suites, Test Runners & Frameworks
* **File Inspection (`package.json` at root):**
  * Lines 6-10:
    ```json
    "scripts": {
      "start": "node server.js",
      "dev": "node --watch server.js",
      "build": "npm --prefix frontend install --include=dev && npm --prefix frontend run build"
    }
    ```
  * `package.json` contains no `"test"` script. Running `npm test` results in `npm error Missing script: "test"`.
  * `package.json` has **zero** `devDependencies`.
  * No test runner or assertion library is installed: no Jest, Vitest, Mocha, Jasmine, Supertest, Chai, Cypress, Playwright, or Puppeteer in dependencies (`@electric-sql/pglite`, `bcryptjs`, `cors`, `dotenv`, `express`, `jsonwebtoken`, `nodemailer`, `pg`, `xlsx`).
* **File Inspection (`frontend/package.json`):**
  * Lines 6-10:
    ```json
    "scripts": {
      "dev": "vite",
      "build": "vite build",
      "preview": "vite preview"
    }
    ```
  * Lines 16-19:
    ```json
    "devDependencies": {
      "@vitejs/plugin-react": "^4.3.4",
      "vite": "^6.2.0"
    }
    ```
  * Contains no `"test"` script. No `@testing-library/react`, Vitest, Jest, or Cypress installed.
* **Filesystem Search (`find_by_name` across repo excluding `node_modules` and `.git`):**
  * Pattern `*test*`: **0 files found**.
  * Pattern `*spec*`: **0 files found**.
  * No test directory (`test/`, `tests/`, `__tests__`, `spec/`, `e2e/`) exists anywhere in the repository.
* **Simulator Endpoints & Scripts (Partial ad-hoc verification only):**
  * `src/routes/api.js`:
    * Line 91: `POST /api/webhooks/vietqr/simulate` (simulates inbound bank transfer webhook)
    * Line 113: `POST /api/shipping/:orderId/simulate-step` (simulates shipping carrier step updates)
    * Line 119: `POST /api/notifications/test` (triggers Nodemailer test email)
    * Line 76: `POST /api/orders/expire-stale` (triggers order expiration check)
  * `src/scripts/cleanMockData.js`: database teardown script that executes `DELETE` statements on tables.
  * `src/scripts/exportHandoverExcel.js`: generates `HO_SO_BAN_GIAO_HE_THONG_ATELIER.xlsx`.

### 1.2 Build Tools, Package Managers, Linters & Formatters
* **Package Managers:**
  * Root contains `package.json` and `package-lock.json` (npm lockfileVersion 3).
  * Root also contains `bun.lock` (lockfileVersion 2, 223 lines). Dual lockfile presence indicates mixed package manager usage history.
  * Node version on host: `v24.19.0`, npm version: `11.17.0`.
* **Build Systems & Execution Verification:**
  * Root build script: `npm run build` runs `npm --prefix frontend install --include=dev && npm --prefix frontend run build`.
  * Verified command run: `cmd /c npm run build` completed with exit code 0 in 9.82 seconds:
    * `dist/index.html` (1.60 kB)
    * `dist/assets/index-D3k3moGt.css` (30.72 kB)
    * `dist/assets/index-BpX9HFM9.js` (475.73 kB)
  * Backend requires no transpilation/build: executes directly with Node.js (`node server.js`).
* **Linters & Code Formatters:**
  * No ESLint configuration (`.eslintrc*`, `eslint.config.*`) in root or `frontend/`.
  * No Prettier configuration (`.prettierrc*`, `prettier.config.*`).
  * No `tsconfig.json`, `jsconfig.json`, or `.editorconfig`.
  * No lint scripts in `package.json` or `frontend/package.json`.
  * Syntax verification performed: `node -c` executed across all `.js` files in `src/` and root; exited with code 0 (no syntax errors found).

### 1.3 Deployment Setups: Docker, Cloud, CI/CD & Configurations
* **Docker Setup:**
  * `Dockerfile` (50 lines):
    * Stage 1 (`frontend-builder`): `node:20-alpine`, executes `npm ci` and `npm run build` in `/app/frontend`.
    * Stage 2 (`runner`): `node:20-alpine`, creates non-root user `techpulse:techpulse` (uid 1001, gid 1001).
    * Copies production dependencies: `npm ci --omit=dev && npm cache clean --force`.
    * Copies `/app/frontend/dist` with `--chown=techpulse:techpulse`.
    * User set to `USER techpulse`.
    * Healthcheck: `HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 CMD wget --quiet --tries=1 --spider http://localhost:3000/api/health || exit 1`.
    * Port: `EXPOSE 3000`. CMD: `["node", "server.js"]`.
    * Observation on PGlite permissions: When running as user `techpulse`, if external database is absent and system falls back to `@electric-sql/pglite`, the data folder `/app/.pglite-data` cannot be created or written because `/app` is owned by `root`.
  * `docker-compose.yml` (54 lines):
    * `app` service: builds `Dockerfile`, maps port `${PORT:-3000}:3000`, depends on `db` (condition: `service_healthy`).
    * `db` service: image `postgres:16-alpine`, port `5432:5432`, healthcheck `pg_isready -U ${POSTGRES_USER:-postgres}`, persistent volume `postgres_data`.
  * `.dockerignore`: excludes `node_modules`, `frontend/node_modules`, `frontend/dist`, `.git`, `.gitignore`, `.env`, `.env.local`, `*.log`, `.system_generated`, `brain`.
* **Render.com Deployment (`render.yaml`):**
  * Lines 1-12:
    ```yaml
    services:
      - type: web
        name: render-supabase-demo
        runtime: node
        plan: free
        region: singapore
        buildCommand: npm install
        startCommand: npm start
        envVars:
          - key: DATABASE_URL
            sync: false
    ```
  * **Critical Build Defect in `render.yaml`**: `buildCommand` is set to `npm install`. Because root `package.json` does not define a `postinstall` script, executing `npm install` on Render will **not** build the frontend SPA into `frontend/dist`.
  * In contrast, `DEPLOYMENT.md` line 67 specifies: `npm install && cd frontend && npm install && npm run build && cd ..` or `npm run build`.
* **CI/CD Pipelines:**
  * No GitHub Actions directory (`.github/workflows`) or any CI configuration (`.gitlab-ci.yml`, `azure-pipelines.yml`, `Jenkinsfile`) exists.
  * No automated testing, linting, or container scanning is executed upon push or pull request.
* **Environment Variables & Secrets Exposure:**
  * `.env.example`: defines keys `DATABASE_URL`, `JWT_SECRET`, `VIETQR_SECRET_TOKEN`, `WEBHOOK_SECRET`, `VIETQR_BANK_ID`, `VIETQR_ACCOUNT_NO`, `VIETQR_ACCOUNT_NAME`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`.
  * `.env` file present at root:
    * Contains live connection string: `DATABASE_URL=postgresql://postgres.oecgyiaetefmxkrndcvk:manhhung0423@aws-0-ap-south-1.pooler.supabase.com:6543/postgres`
    * Contains secret: `JWT_SECRET=techpulse_modular_jwt_secret_key_2026`.
    * `.env` is listed in `.gitignore`.
  * **Critical Secret Exposure in Committed Markdown (`HUONG_DAN_TRIEN_KHAI_RENDER.md`):**
    * Line 11: Render API Key `rnd_VRDeFOy2odVHNB3CFVNkRYrED2NE`.
    * Line 15: Supabase Database password `manhhung0423`.
    * Line 16: Complete database connection string with plaintext credentials.
    * Line 55: Second instance of Supabase connection string with password.
    * This markdown file is tracked and committed in git (`git log -n 5` shows commit `235caf1 docs: finalize HUONG_DAN_TRIEN_KHAI_RENDER.md...`).
  * `src/scripts/exportHandoverExcel.js` lines 31, 60 also hardcodes credentials into exported artifacts.
* **Runtime Behavior & Healthcheck Verification:**
  * Healthcheck endpoint `GET /api/health` verified running locally: returns `200 OK` with JSON `{"status":"ok","uptime":...,"service":"TechPulse Modular E-Commerce Engine"}`.
  * Static file serving verified running locally: returns `200 OK` with `text/html`.
  * Database connection verified: connects to remote Supabase pooler via `src/config/db.js`.
  * Dynamic fallback: if remote PostgreSQL connection fails, falls back to embedded PGlite WASM engine.
  * Background cron: `setInterval` runs every 60 seconds calling `orderService.expireStaleVietQROrders(30)`.

---

## 2. Logic Chain

1. **Test Coverage Logic:**
   - From direct inspection of `package.json`, `frontend/package.json`, and filesystem search across all directories, zero test files, zero test runners, and zero test dependencies exist.
   - Therefore, the project has **0% automated test coverage** across all layers (backend unit/integration, frontend component, E2E).
   - Any assertion that the system is fully verified by existing automated tests is ungrounded. Quality validation currently relies exclusively on manual checks, ad-hoc simulator endpoints (`/api/webhooks/vietqr/simulate`, `/api/shipping/:orderId/simulate-step`), and manual UI testing.

2. **Code Quality & Linter Logic:**
   - From the absence of `.eslintrc*`, `.prettierrc*`, `tsconfig.json`, or any linting script, there is no automated style, typing, or lint rule enforcement.
   - Developers and CI pipelines have no automated gate to detect dead code, syntax regressions, anti-patterns, or type errors prior to runtime.

3. **Deployment Configuration Discrepancy Logic:**
   - `render.yaml` sets `buildCommand: npm install`.
   - In npm, `npm install` only installs root dependencies unless a lifecycle hook (`postinstall` or `prepare`) is explicitly declared.
   - Root `package.json` declares `"build": "npm --prefix frontend install --include=dev && npm --prefix frontend run build"`, but does not declare `"postinstall": "npm run build"`.
   - Therefore, if Render builds using `render.yaml`, `frontend/dist` will not be compiled during deployment, forcing the server to fall back to the legacy `public/` directory (which contains older, non-React vanilla assets).
   - This directly contradicts `DEPLOYMENT.md` which advises running the frontend build command.

4. **Security Vulnerability Logic:**
   - `HUONG_DAN_TRIEN_KHAI_RENDER.md` and `src/scripts/exportHandoverExcel.js` contain raw production credentials (Render API key, Supabase DB password).
   - Because `HUONG_DAN_TRIEN_KHAI_RENDER.md` is committed to the Git repository, these credentials are leaked in version control history.
   - Anyone with read access to the git repository has direct administrative access to the Render account and the Supabase database.

5. **Container Permission Logic:**
   - `Dockerfile` runs as `USER techpulse` (non-root).
   - The directory `/app` is created as root; only `/app/frontend/dist` is transferred with `--chown=techpulse:techpulse`.
   - If the container is deployed in an environment where `DATABASE_URL` is unavailable or invalid, `src/config/db.js` attempts to initialize `new PGlite(path.join(__dirname, '..', '..', '.pglite-data'))`.
   - Because the non-root user cannot write to `/app/.pglite-data`, PGlite disk initialization will throw `EACCES` and force fallback to pure in-memory mode, resulting in complete data loss upon container restart.

---

## 3. Caveats

1. **No Live External Docker Engine:**
   - The Windows host environment does not have the `docker` CLI installed on PATH; container builds were analyzed statically from `Dockerfile` and `docker-compose.yml`.
2. **Third-Party External Services:**
   - VietQR image generation (`img.vietqr.io`), SMTP email delivery (Nodemailer), and external bank webhook sources rely on third-party network connectivity and external configurations that were tested via simulated endpoints rather than live financial transactions.
3. **Database Data State:**
   - The current database connected via `DATABASE_URL` is a remote Supabase instance. Seeding was evaluated with `AUTO_SEED !== 'true'`.

---

## 4. Conclusion

The repository exhibits a high-functioning application runtime and clean modular backend structure, but suffers from **three severe operational and security deficits**:

1. **Complete Testing & Linter Vacuum (Severity: High):**
   - Zero automated test suites (unit, integration, E2E), zero test runners (Jest/Vitest), and zero static analysis tools (ESLint/Prettier).
   - All quality assurance is currently manual or simulated via ad-hoc endpoints.

2. **Secrets Exposure in Tracked Repository Files (Severity: Critical):**
   - Plaintext production credentials (Render API Key `rnd_VRDe...`, Supabase password `manhhung0423`, and connection strings) are committed in `HUONG_DAN_TRIEN_KHAI_RENDER.md` and embedded in `src/scripts/exportHandoverExcel.js`.

3. **Deployment Specification Inconsistency (Severity: Medium):**
   - `render.yaml` specifies `buildCommand: npm install`, which fails to build `frontend/dist`. `DEPLOYMENT.md` specifies the multi-step frontend build, while `package.json` lacks a `postinstall` hook.
   - `Dockerfile` non-root user permission risk regarding PGlite disk directory creation.

---

## 5. Verification Method

To independently reproduce and verify these findings, execute the following commands in the workspace root:

1. **Verify Absence of Test Scripts & Test Files:**
   ```bash
   # Check npm scripts
   node -e "console.log(require('./package.json').scripts);"
   node -e "console.log(require('./frontend/package.json').scripts);"
   
   # Attempt to run npm test
   npm test
   # Expected output: Missing script: "test"
   ```

2. **Verify Frontend Build Capability:**
   ```bash
   cmd /c npm run build
   # Expected output: Vite builds frontend/dist (index.html, CSS, JS) in < 15 seconds.
   ```

3. **Verify Node.js Syntax Integrity:**
   ```powershell
   Get-ChildItem -Path . -Recurse -Filter *.js -Exclude node_modules | Where-Object { $_.FullName -notmatch "node_modules|\.git" } | ForEach-Object { node -c $_.FullName }
   # Expected output: Clean exit (code 0), no syntax errors.
   ```

4. **Verify Healthcheck and HTTP Runtime:**
   ```bash
   node -e "const http = require('http'); const server = require('./server'); setTimeout(() => { http.get('http://localhost:3000/api/health', (res) => { let d = ''; res.on('data', c => d += c); res.on('end', () => { console.log('STATUS:', res.statusCode, d); process.exit(0); }); }); }, 3000);"
   # Expected output: STATUS: 200 {"status":"ok",...}
   ```

5. **Verify Hardcoded Secrets in Markdown:**
   ```bash
   # Search for Render API key and Supabase password in markdown files
   git grep "rnd_VRDe"
   git grep "manhhung0423"
   # Confirms presence of plaintext credentials in tracked files.
   ```
