# LexSovereign

Advocate-first safety and workflow OS.

Tech stack: Next.js (App Router) + TypeScript + Tailwind + Prisma + Postgres + NextAuth.

## Quick Start

1. Copy `.env.example` to `.env.local` and set:
   - `DATABASE_URL`
   - `NEXTAUTH_SECRET`
2. Install dependencies:
   - `npm install`
3. Generate Prisma client:
   - `npm run prisma:generate`
4. Run migrations in development:
   - `npm run prisma:migrate`
5. Start the app:
   - `npm run dev`

## Scripts

- `npm run dev` - Start Next.js dev server
- `npm run build` - Build production bundle
- `npm run lint` - Run ESLint
- `npm run check:links` - Validate internal app links against existing routes
- `npm run check:frontend` - Run front-end baseline checks (`lint` + `check:links`)
- `npm run check:backend` - Run lightweight backend smoke checks against a running local server
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run Prisma dev migrations
- `npm run prisma:studio` - Open Prisma Studio
- `npm run seed` - Run seed script

## Front-End QA Checklist

Run this before merging front-end changes:

1. `npm run check:frontend` passes.
2. Auth flows are verified:
   - Sign in error handling is visible.
   - Sign up validation and API error messaging are visible.
3. Intake flow is verified:
   - Anonymous and non-client users see guard states.
   - Client users can submit and continue.
4. Dashboard and navigation are verified:
   - Header adapts for signed-out and signed-in users.
   - Sign out works and redirects correctly.
5. No dead-end routes:
   - Dashboard cards and primary CTAs resolve to existing pages.

## Folder Overview

- `app/` - App Router pages, layouts, and API routes
- `src/lib/` - Shared libraries (`auth`, `prisma`, RBAC helpers)
- `src/services/` - Domain services (`matter`, `evidence`, `ai`, etc.)
- `prisma/` - Prisma schema and migrations
- `scripts/` - Project utility scripts

## RBAC Roles

`CLIENT`, `ADVOCATE`, `FIRM_MEMBER`, `FIRM_ADMIN`, `REVIEWER`, `ADMIN`, `COMPLIANCE_ADMIN`, `SUPER_ADMIN`.

## API Contract (Backend B4/B5 baseline)

- List endpoints return a paginated envelope:
  - `{ ok: true, data: { items: [...], page: { limit, offset, total, hasMore } } }`
- Error envelope:
  - `{ ok: false, error: string, code: string, details: object | null }`
- Core secured routes:
  - `GET/POST /api/matters`
  - `GET/PATCH/DELETE /api/matters/:id` (`DELETE` archives via `status=ARCHIVED`)
  - `GET/POST /api/evidence`
  - `GET/PATCH/DELETE /api/evidence/:id`
  - `GET/POST /api/drafts`
  - `GET/PATCH/DELETE /api/drafts/:id`
  - `GET/POST /api/intake`
  - `GET/POST /api/sos`
  - `GET/PATCH /api/sos/:id`
