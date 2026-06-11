# DR-0006 — Optional HTTP Basic Auth gate via Next.js middleware

| | |
|---|---|
| **Date** | 2026-05-21 (decision originally made early 2026; backfilled on framework adoption) |
| **Status** | Accepted (interim — see Follow-up) |
| **Participants** | Russell |
| **Affects** | infosec, operations, ux disciplines; `middleware.ts`; deployment access posture |
| **Supersedes** | — |

---

## Context

The app is not yet ready for public access — the dashboard has placeholder pages, mock findings on some surfaces, and unsigned data. Putting the deployment behind some form of access gate is non-negotiable for any deployed preview. Heavy auth (NextAuth, Supabase Auth, Clerk) was overkill for a solo project with a single operator, and would have added schema and UI surface for no current value.

Cron access needs a separate mechanism — Basic Auth can't be presented by Vercel's cron caller — so a Bearer-token check on `/api/cron/*` was introduced alongside.

---

## Decision

- **`middleware.ts`** enforces optional HTTP Basic Auth on all human-facing routes. Username + password come from env vars; if the vars are absent the gate is open (intended for local dev only).
- **`/api/cron/*`** routes check an `Authorization: Bearer ${CRON_SECRET}` header. `CRON_SECRET` is set on Vercel and matched against the value Vercel's cron caller sends.
- Strong security headers (HSTS, CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy) ship from `next.config.js` regardless of auth state.

---

## Alternatives considered

- **NextAuth / Auth.js with email magic link** — rejected as overkill for a solo project today.
- **Supabase Auth** — rejected today; would couple dashboard auth to Supabase tenant state for no current benefit.
- **Vercel deployment protection (preview deployments only)** — considered. Useful for preview URLs but doesn't gate the production deployment. Could be added in addition.
- **No gate at all** — rejected; the app is not ready to be public.

---

## Consequences

**Positive:**
- Zero schema, zero UI, zero ongoing maintenance for the human-facing gate.
- Cron path is cleanly secured with a Bearer secret.
- Security headers are in place regardless.

**Negative / risks:**
- Basic Auth has no password reset, no rate limiting, no audit trail, no MFA. Acceptable for solo today; not acceptable for any multi-user state.
- If `BASIC_AUTH_USER` / `BASIC_AUTH_PASS` env vars are accidentally unset in production, the app is open with no warning. **The `infosec-agent` runbook must include a post-deploy check for this.**
- `CRON_SECRET` rotation is manual — there is no key management story.

**Reversibility:**
- Two-way for the human gate. Migrating to a real auth provider is a future scope. The middleware would become a thin redirect to that provider.
- One-way-ish for the cron gate — `Bearer ${CRON_SECRET}` is the contract Vercel cron honours; replacing it requires a coordinated change.

---

## Follow-up

- `infosec-agent` to write a post-deploy verification runbook that asserts: (a) human routes return 401 without credentials, (b) `/api/cron/crawl` returns 401 without the Bearer header, (c) security headers are present on `/`.
- When user accounts are needed, raise a new ADR for the chosen auth provider.
