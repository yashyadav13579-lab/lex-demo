# Decisions Log\n- Adopted single-repo Next.js App Router architecture with server-first design for speed; defer microservices until scale needs.\n- Using NextAuth with database sessions for RBAC integration; credentials provider only for now (magic-link ready later).\n- Deterministic rotation in discovery (id sort) to avoid implicit ranking; no scoring fields stored.\n- Evidence hashing performed server-side via SHA-256; originals vs working copies modeled explicitly.\n- AI layer abstracted via `services/ai.ts` with placeholder callModel to swap provider later; exports gated by draft status.\n*** End Patch​

- Phase 1: Chose Next-compatible TypeScript defaults (`moduleResolution: bundler`, Next plugin, and removed explicit `types`) to prevent global type overrides while preserving strict mode.
- Phase 1: Updated `@/*` alias to map to `src/*` because app imports use `@/lib/*` and source lives under `src/`.
- Phase 1: Removed deprecated `experimental.serverActions` from Next config to keep build output valid on Next 14.2+.
- Phase 2: Added a placeholder for `/intake/[id]/summary` because it is reachable from the existing intake flow (`router.push`) and would otherwise 404.
- Phase 3: Standardized auth form validation on `react-hook-form` + `zod` for consistent field errors, submit state, and maintainable client-side role/password rules.
- Phase 4: Centralized app-shell navigation into a session-aware header with minimal role buckets (client, advocate/firm, admin/compliance) and hydrated `SessionProvider` via server session to reduce client-side session fetch churn.
- Phase 5: Kept intake protection as client-side guard messaging (instead of automatic redirects) so users get explicit auth/role explanations and clear next actions before form interaction.
- Phase 6: Added route-level `loading.tsx` states for dashboard, matters, and intake with restrained skeleton UI to improve perceived stability during async transitions.
- Phase 6: Implemented Inter via `next/font/google` in root layout and removed CSS font declaration to avoid duplicate font-source drift and reduce layout shift risk.
- Phase 7: Removed clearly unused UI dependencies (`clsx`, `date-fns`, `lucide-react`) and added a lightweight internal link checker script plus `check:frontend` baseline command to reduce route-regression risk.
- D1: Demo auth foundation is isolated under `src/lib/demo-auth/*` and gated by `NEXT_PUBLIC_DEMO_AUTH_ENABLED`; real NextAuth/Prisma paths remain untouched.
- D2: Added demo persona-based sign-in on the existing sign-in page (gated by demo mode flag) and wired shell sign-out to clear demo session when active, while keeping real credential flow intact.
- D3: In demo mode, shell and protected pages (`dashboard`, `matters`, `intake`) now use demo-session-first rendering paths that avoid Prisma/NextAuth calls in the critical path; real server paths are retained behind non-demo branches.
- D4: Added a compact demo-only persona switcher in the header nav for instant role/user swapping via local demo session replacement, keeping it non-intrusive and backend-free.
- D5: Added typed, role-aware demo data utilities for dashboard cards/summaries, matters, message previews, and SOS history; wired demo-mode page variants to render meaningful review data without backend dependency.
- D6: In demo mode, providers now skip NextAuth SessionProvider to prevent failing session API calls; auth sign-in/sign-up actions are redirected to explicit demo-safe paths with clear non-persistent messaging.
