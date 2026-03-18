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
- `npm run check:backend:integration` - Run auth/RBAC/ownership integration matrix against a running local server
- `npm run check:deployment` - Validate deployed environment wiring and protected internal endpoints
- `npm run check:ci` - Run static CI quality gate (`lint` + `tsc --noEmit` + `build`)
- `npm run cleanup:idempotency` - Delete expired idempotency records based on `IDEMPOTENCY_TTL_HOURS`
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

## Contract Freeze

- Contract version: `v1` (frozen in B6)
- Backward compatibility rule:
  - Do not change response envelope keys (`ok`, `data`, `error`, `code`, `details`, `page`) without versioning.
  - New fields are additive only.
  - Mutation route permission changes must include an integration-matrix update.

## B7 Security/Observability Additions

- Idempotency:
  - Mutation routes now accept optional `Idempotency-Key` header.
  - Replayed requests return the original response with `x-idempotent-replay: true`.
- Request tracing:
  - Mutation routes emit `x-request-id` response header (reused from inbound `x-request-id` when provided).
  - Structured API logs include request id, route, method, status, and duration.
- Safe rate limiting (in-process):
  - Applied to sign-up and mutation routes to reduce brute force / burst abuse.
  - Returns `429` when bucket limits are exceeded.
  - Note: current limiter is process-local; use shared Redis or gateway rate limiting for multi-instance production clusters.

## B8 Production Hardening

- Shared rate limiting:
  - If `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are set, rate limits are enforced in Redis (shared across instances).
  - If not set, the app falls back to local in-memory rate limits for development continuity.
- Idempotency data lifecycle:
  - `ApiIdempotencyKey` has a DB migration under `prisma/migrations/20260319020000_b8_idempotency_key`.
  - Cleanup endpoint: `GET /api/internal/cleanup-idempotency` (requires `Authorization: Bearer <CRON_SECRET>`).
  - Vercel cron is configured in `vercel.json` to run daily at `03:00 UTC`.
- Error sink:
  - `x-request-id` is propagated and used in structured logs.
  - Errors (`5xx`) can be forwarded to OTel via `OTEL_LOGS_ENDPOINT` (and optional `OTEL_LOGS_AUTH_HEADER`) or to Sentry via `SENTRY_DSN`.

## B9 Deployment Hardening Runbook

1) Vercel envs (set for Preview and Production):
- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL` (use deployment domain)
- `NEXT_PUBLIC_DEMO_AUTH_ENABLED` (`false` for real backend mode)
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`
- `CRON_SECRET`
- Optional sinks:
  - `OTEL_LOGS_ENDPOINT`
  - `OTEL_LOGS_AUTH_HEADER`
  - `SENTRY_DSN`

2) Deploy and validate:
- Run backend checks against deployment:
  - `BASE_URL=https://<deployment-domain> CRON_SECRET=<cron-secret> npm run check:deployment`
- Internal protected verification endpoints:
  - `GET /api/internal/deployment-status` (Bearer `CRON_SECRET`)
  - `GET /api/internal/cleanup-idempotency` (Bearer `CRON_SECRET`)

3) Expected outcome:
- `/api/auth/session` returns `200`
- internal endpoints reject unauthenticated requests (`401`)
- internal endpoints succeed with valid bearer secret (`200`)
- idempotency replay on sign-up returns `x-idempotent-replay: true`
