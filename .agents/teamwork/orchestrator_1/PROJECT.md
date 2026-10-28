# Project: Comprehensive Repository Review & Audit

## Architecture
- **Target System**: TechPulse / ATELIER & CO. Modular E-Commerce Engine (`render-supabase-demo`)
- **Architecture Type**: Fullstack Monorepo (Node.js/Express backend + React 19/Vite SPA frontend + Supabase PostgreSQL with PGlite fallback).
- **Core Pillars for Audit**:
  1. System Architecture (Kiến trúc hệ thống)
  2. Information Security (An toàn bảo mật)
  3. Performance & Scalability (Hiệu năng & Khả năng mở rộng)
  4. Code Quality & Maintainability (Chất lượng mã nguồn & Nợ kỹ thuật)
  5. Deployment & DevOps (Cấu hình triển khai & Hạ tầng)

## Feature Inventory
| # | Feature / Area | Description | Milestone | Source |
|---|----------------|-------------|-----------|--------|
| 1 | Architecture Assessment | Analysis of MedusaJS-inspired design, dual state machine, data flows, 10 backend modules, 20 frontend components, 15 DB tables | M1 | Explorer 1 |
| 2 | Security Audit (Secrets & Auth) | Leaked credentials in code/git, missing webhook auth, IDOR on orders, JWT secret fallback, TLS validation bypass, XSS, vulnerable xlsx | M1 | Explorer 3 |
| 3 | Performance Audit (DB & I/O) | Zero indexes on FKs/queries, unpaginated catalog/orders, serial queries in dashboard, synchronous file I/O, PGlite mutex queue | M1 | Explorer 3 |
| 4 | Code Quality & Tech Debt | Monolithic AdminPortal.jsx, review author property bug, display_id collision risk, mixed package managers (bun/npm) | M1 | Explorer 1 & 3 |
| 5 | Tooling, Tests & DevOps | Zero test suites, missing linter/formatter, render.yaml buildCommand mismatch, Dockerfile non-root PGlite permissions | M1 | Explorer 2 |
| 6 | Execution & Verification | Execution of npm run build, node -c syntax check, npm audit, healthcheck verification, secret scanning evidence | M1 | Explorers 1, 2, 3 |
| 7 | Comprehensive AUDIT_REPORT.md | Complete synthesis of findings into root AUDIT_REPORT.md with severity ratings, root causes, exact file locations, and remediations | M1 | Synthesized |

## Milestones
| # | Name | Scope | Dependencies | Status | Key Outputs |
|---|------|-------|-------------|--------|-------------|
| M1 | Full Audit Report Generation | Implement AUDIT_REPORT.md at project root, execute verification scripts, and validate evidence | Survey Complete | DONE | `AUDIT_REPORT.md` (1,025 lines, 88.4 KB, 20 findings) |
| M2 | Review, Verification & Forensic Audit | 2 Reviewers, 2 Challengers, and 1 Forensic Auditor gate check | M1 | DONE | All 4 reviewers/challengers APPROVED, Forensic Auditor CLEAN |

## Code Layout & Write Boundaries
- Worker exclusively owns: `c:\Users\84123\OneDrive\Desktop\hoctap\AUDIT_REPORT.md`
- Subagent metadata directories:
  - `c:\Users\84123\OneDrive\Desktop\hoctap\.agents\teamwork\worker_audit_1\`
  - `c:\Users\84123\OneDrive\Desktop\hoctap\.agents\teamwork\reviewer_audit_1\`
  - `c:\Users\84123\OneDrive\Desktop\hoctap\.agents\teamwork\reviewer_audit_2\`
  - `c:\Users\84123\OneDrive\Desktop\hoctap\.agents\teamwork\challenger_audit_1\`
  - `c:\Users\84123\OneDrive\Desktop\hoctap\.agents\teamwork\challenger_audit_2\`
  - `c:\Users\84123\OneDrive\Desktop\hoctap\.agents\teamwork\auditor_1\`
