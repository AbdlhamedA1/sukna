# SUKNA (سُكنا) — Student & Residential Housing Marketplace

> **Graduation Project / Startup MVP**
> **Initial Scope:** Qena, Sohag, Minya (Upper Egypt)
> **Current Phase:** Phase 1 — Workspace & Tooling Foundation

Monorepo for the SUKNA platform: a verified student housing discovery marketplace for Upper Egypt.
All product, architecture, database, API, security, and UI/UX specifications live in [`docs/`](./docs).

## Repository Layout

```
sukna/
├── apps/
│   ├── website/    # Public Next.js (App Router) portal — SSR/SSG, SEO, public auth pages (port 3000)
│   ├── dashboard/  # React + Vite SPA — Admin Back-Office & User Portal (RTK Query + Ant Design, port 5173)
│   └── server/     # Express + MongoDB/Mongoose REST API — single source of truth (port 5000)
├── docs/           # Complete system specifications (read these first)
└── package.json    # npm workspaces root
```

## Tech Stack

| Workspace   | Stack                                                                                         |
| ----------- | --------------------------------------------------------------------------------------------- |
| `website`   | Next.js (App Router), React, TypeScript, Tailwind CSS, Inter font (Cairo reserved for RTL)    |
| `dashboard` | React, Vite, TypeScript, Redux Toolkit + RTK Query (axios prohibited, ADR-014), Ant Design v5 |
| `server`    | Node.js, Express, TypeScript, MongoDB + Mongoose, JWT (HttpOnly cookies), bcrypt, Zod         |

## Getting Started

```bash
npm install                      # install all workspaces

# Terminal 1 — API
cp apps/server/.env.example apps/server/.env   # then fill in MONGODB_URI and secrets
npm run dev:server               # http://localhost:5000/api/v1/health

# Terminal 2 — Dashboard
npm run dev:dashboard            # http://localhost:5173

# Terminal 3 — Website
npm run dev:website              # http://localhost:3000
```

## Quality Gates

```bash
npm run build          # build all three workspaces
npm run lint           # ESLint (flat config) across the repo
npm run format:check   # Prettier check
```

## Conventions

- All network calls in the dashboard go through `src/services/apiSlice.ts` (RTK Query).
- API responses use the uniform envelope documented in `docs/API_DOCUMENTATION.md`.
- Brand tokens (Deep Forest Green `#123B35`, Warm Orange `#E88A35`, Warm Off-White `#F7F5F0`)
  are wired into both Tailwind configs and the Ant Design theme.
- English LTR is the primary interface language; logical CSS properties and the preloaded
  Cairo font keep Arabic RTL a drop-in future step.
