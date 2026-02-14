# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

"착붙" (Chakbut) is a Korean-language infertility treatment (IVF) cycle tracker with a React frontend (from Figma Make) and an Express backend with PostgreSQL.

## Commands

```bash
# Backend (server/)
cd server && npm install
npm run dev          # tsx watch (auto-reload)
npm run migrate      # Run DB migrations

# Frontend (Infertility Treatment Tracker/)
cd "Infertility Treatment Tracker" && npm install
npm run dev          # Vite dev server (port 5173)
npm run build        # Production build
```

Both servers must run simultaneously for the app to work (backend: 3001, frontend: 5173).

There are no test or lint scripts configured.

## Tech Stack

**Frontend:**
- React 18 + TypeScript, Vite 6
- Tailwind CSS v4 (via `@tailwindcss/vite`)
- shadcn/ui (Radix UI + Tailwind)
- react-router v7, motion (animations)

**Backend:**
- Node.js + Express + TypeScript
- PostgreSQL 17 (normalized tables, raw SQL via `pg`)
- JWT auth (bcrypt + jsonwebtoken)
- Dev runner: `tsx watch`

## Architecture

### Frontend (`Infertility Treatment Tracker/src/app/`)

**Routing** (`routes.tsx`):
- `/login` → `Login` — auth page
- `/` → `CycleList` — protected, list of all cycles
- `/current` → `CurrentCycle` — protected, redirects to latest cycle
- `/cycle/:id` → `CycleDetail` — protected, main data entry page

**Data Flow:**
- `api.ts` — fetch-based API client, replaces old localStorage storage
- `contexts/AuthContext.tsx` — manages JWT token + user state
- `CycleDetail` calls per-section API endpoints (e.g. `api.upsertRetrieval()`) and updates local state with returned cycle
- `InjectionSection` has a `cycleId` prop and calls injection APIs directly
- Other section components receive data + `onUpdate` callback (API calls happen in parent)

**IVF Cycle Model** (`types.ts`):
Sequential stages: 과배란(Injection) → 채취(Retrieval) → 수정(Fertilization) → 배양(Culture) → 이식(Transfer)/동결(Freeze)/PGT

Sections in `CycleDetail` are conditionally rendered based on what data exists (progressive disclosure).

**Component Organization:**
- `pages/` — route-level page components
- `components/` — feature components (one per IVF stage)
- `components/ui/` — shadcn/ui primitives (auto-generated, avoid manual edits)

### Backend (`server/src/`)

**DB Schema** — 9 tables, all with UUID PKs and `ON DELETE CASCADE`:
- `users` — auth
- `cycles` — main entity, belongs to user
- `injections` — 1:N with cycles
- `retrievals`, `fertilizations`, `cultures`, `transfers`, `freezes`, `pgts` — 1:1 with cycles (UNIQUE on cycle_id)

**API routes:**
- `routes/auth.ts` — POST signup/login, GET /me
- `routes/cycles.ts` — CRUD for cycles
- `routes/injections.ts` — CRUD for injections (POST/PATCH/DELETE)
- `routes/subrecords.ts` — PUT (upsert) for all 1:1 records, returns full cycle

**Services:**
- `cycle.service.ts` — `getCycleById()` and `getAllCycles()` assemble full Cycle objects from 8 parallel queries
- `validation.ts` — business rules (fertilization count check, transfer limit, PGT day>=5 requirement, culture plan cascade delete)
- `auth.service.ts` — bcrypt + JWT

**Key pattern:** All 1:1 sub-record endpoints use `INSERT ... ON CONFLICT (cycle_id) DO UPDATE` (upsert). Culture endpoint runs `cascadeCulturePlans()` to delete transfer/freeze/pgt records when plans are removed.

### Styling
- Path alias: `@` → `src/`
- Theme: pink/purple palette in `src/styles/theme.css`
- Tailwind v4 source scanning in `src/styles/tailwind.css`

## Key Conventions

- UI text is in **Korean**
- Mobile-first SPA design
- JWT stored in `localStorage` as `auth_token`
- Backend returns camelCase JSON (mapped from snake_case DB columns in cycle.service.ts)
- `cultures.next_plans` is a PostgreSQL `TEXT[]` array
