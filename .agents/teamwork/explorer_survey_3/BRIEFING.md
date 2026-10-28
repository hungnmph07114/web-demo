# BRIEFING — 2026-10-28T07:58:30Z

## Mission
Survey workspace for security attack surface, performance hotspots, and code quality/tech debt.

## 🔒 My Identity
- Archetype: explorer
- Roles: Security and Quality Explorer
- Working directory: c:\Users\84123\OneDrive\Desktop\hoctap\.agents\teamwork\explorer_survey_3\
- Original parent: 6d84dfec-9372-46ac-9d04-309286a9cb98
- Milestone: codebase-survey

## 🔒 Key Constraints
- Read-only investigation — do NOT implement
- Do NOT write or modify any application source code files
- Only write within c:\Users\84123\OneDrive\Desktop\hoctap\.agents\teamwork\explorer_survey_3\

## Current Parent
- Conversation ID: 6d84dfec-9372-46ac-9d04-309286a9cb98
- Updated: 2026-10-28T07:57:44Z

## Investigation State
- **Explored paths**:
  - Root config & deployments: `server.js`, `package.json`, `.env`, `.env.example`, `.gitignore`, `Dockerfile`, `docker-compose.yml`, `render.yaml`, `HUONG_DAN_TRIEN_KHAI_RENDER.md`
  - Core backend: `src/app.js`, `src/config/db.js`, `src/config/seed.js`, `src/middlewares/*`, `src/routes/api.js`, `src/modules/*` (auth, order, webhook, product, review, wishlist, shipping, notification, dashboard), `src/scripts/*`
  - Frontend: `frontend/package.json`, `frontend/vite.config.js`, `frontend/src/services/api.js`, `frontend/src/App.jsx`, `frontend/src/components/*` (`AdminPortal.jsx`, `AdminDocsTab.jsx`, etc.), `frontend/dist/` bundle verification
- **Key findings**:
  1. Critical secret leak: Supabase PostgreSQL credentials (`manhhung0423`) and Render API Key (`rnd_VRDeFOy2odVHNB3CFVNkRYrED2NE`) hardcoded in `AdminDocsTab.jsx` and compiled into production frontend bundle `frontend/dist/assets/index-BpX9HFM9.js` as well as markdown docs.
  2. Critical payment bypass: `/api/webhooks/vietqr/simulate` is public with no auth or production guard; `/api/webhooks/vietqr` skips auth when tokens are unset.
  3. Critical IDOR / PII leakage: `/api/orders/:idOrDisplayId` leaks all customer details (name, phone, address) when queried via non-numeric `display_id` (only 9,000 combinations).
  4. Security misconfigurations: hardcoded JWT secret fallback, SSL `rejectUnauthorized: false`, unescaped DOM `innerHTML` in `public/app.js`, vulnerable `xlsx` SheetJS library.
  5. Performance bottlenecks: Complete absence of foreign key & query indexes on PostgreSQL tables, unpaginated product/order queries, sequential DB query execution in dashboard metrics, synchronous file I/O (`fs.existsSync`, `fs.writeFileSync`).
  6. Code quality: 0% automated test coverage, 2,657-line God component in `AdminPortal.jsx`, `req.user.fullName` bug in reviews, collision risk in 4-digit order `display_id`.
- **Unexplored areas**: None, full codebase inspected across all requested dimensions.

## Key Decisions Made
- Structured findings with rigorous evidence chains (exact line numbers, quoted code, verified reproduction) across 5 standard Handoff components.

## Artifact Index
- `c:\Users\84123\OneDrive\Desktop\hoctap\.agents\teamwork\explorer_survey_3\handoff.md` — Final comprehensive handoff report
- `c:\Users\84123\OneDrive\Desktop\hoctap\.agents\teamwork\explorer_survey_3\progress.md` — Liveness & progress tracker
- `c:\Users\84123\OneDrive\Desktop\hoctap\.agents\teamwork\explorer_survey_3\DISPATCH.md` — Inbound message log
