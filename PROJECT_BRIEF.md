# Project Brief — WEBChecker

> The project's one-page truth. Updated only when something at this level genuinely changes.
> Detailed historical analysis lives in `archive/PROJECT_NOTES-2026-05-14.md`.

---

## 1. Project at a glance

| Field | Value |
|-------|-------|
| **Project name** | WEBChecker |
| **Code name (if any)** | SiteAudit Agent (legacy) |
| **Primary URL / location** | Local dev + Vercel deployment (URL not yet pinned in repo) |
| **Status** | Active — narrow production pipeline; broad surface area unfinished |
| **Type of work** | Hybrid — AI-driven web-audit pipeline + brand-intelligence dashboard + planning suite |
| **Start date** | 2026-02-09 (first commit) |
| **Target launch / milestone** | Rolling — the current active scope is "make first scope work end-to-end through the framework" |

---

## 2. Purpose

**Problem this project solves:**
Brand owners and marketing leads have no single place that combines an honest, evidence-based audit of their public web presence (SEO, AEO, GEO, UX, accessibility, security, AI-visible visual design) with the planning surface they use to act on it (briefs, market plans, channel-level objectives). WEBChecker exists to do both — the audit explains *where you are*; the planner explains *what you'll do about it*.

**Audience(s):**
- Primary: Russell (solo operator today). Acts as product owner, engineer, designer, QA.
- Future: brand and marketing leads at small-to-mid agencies and in-house teams. Not yet shipped to them.

**Success criteria (currently active):**
1. The daily Vercel cron runs reliably against the active test target and produces a fresh, complete `audit-report.json` without silent failures.
2. The dashboard surfaces (`/overview`, `/ux/*`, `/search/*`) render real findings from the latest report — no mock data on production paths.
3. The audit JSON shape is documented and versioned; future schema changes are migrations, not breakage.

---

## 3. Stakeholders and roles

| Role | Person | Contact | Notes |
|------|--------|---------|-------|
| Product Owner | Russell Perry | rjperry36@gmail.com | All decisions today |
| Delivery Lead | Russell Perry | — | Wears the lead hat; framework's `delivery-lead` agent supports |
| Engineering Lead | Russell Perry + Claude (`engineering-agent`) | — | |
| Design Lead | Russell Perry | — | UI/UX hat |
| QA Lead | Claude (`qa-agent`) | — | Test harness work owned by this agent |
| InfoSec | Claude (`infosec-agent`) | — | Always-on per framework |
| Operations | Russell Perry | — | Vercel + cron + daily-review launchd job |
| Compliance / Legal | n/a | — | Not in scope today |
| Primary Stakeholder(s) | Russell Perry | — | Solo project today |

Empty roles fall back to `dev-framework/00-lifecycle/raci.md §3` defaults.

---

## 4. Disciplines enabled

| Discipline | Status | Notes |
|------------|--------|-------|
| engineering | **on** | Next.js / TypeScript / Node code |
| ui | **on** | Dashboard, planner, brief creator, admin console |
| ux | **on** | Multiple user flows; WCAG matters |
| qa | **on** | Biggest current gap — no automated tests today |
| uat | **off (deferred)** | No external acceptance step today; enable when stakeholders join |
| infosec | **on (always)** | Headers, Basic Auth, cron secret, Supabase keys, gpt-4o input |
| content | **light** | Audit copy + brief-creator wording; not a content-led project |
| operations | **on** | Vercel cron, daily-review plist, deploy hygiene |
| data | **on** | Mixed storage (Supabase + filesystem) is itself a data-modelling decision |
| _local | **on — `_local/ai-agents`** | Audit pipeline calls `gpt-4o`; prompt design / eval / cost governance lives here |

---

## 5. Tech stack

| Layer | Choice | Notes |
|-------|--------|-------|
| Frontend | Next.js 14 App Router, React 18, TypeScript 5.4, `output: 'standalone'` | |
| Styling | Tailwind CSS 3.4 (custom `primary` + `glass` palettes), Framer Motion, lucide-react | shadcn-style primitives in `components/ui/` |
| Backend | Next.js API routes + server actions (Node runtime) | |
| Data store(s) | Mixed — Supabase Postgres (markets/channels/objectives/briefs/ai_rules) **+** local filesystem `audit-data/` (crawl outputs) | See **ADR-001** |
| Hosting / cloud | Vercel (`vercel.json` declares daily cron `0 0 * * *` → `/api/cron/crawl`) | |
| Auth | Optional HTTP Basic Auth via `middleware.ts` (env-gated); cron auth via `Bearer ${CRON_SECRET}` | |
| Build / CI / CD | Vercel build pipeline; **no test pipeline yet** | Closing this gap is the first scope |
| Observability | Console logs only; no APM | Out of scope today |
| Other key vendors | ScreenshotOne (screenshots — replaced Playwright, see **ADR-002**); OpenAI `gpt-4o` (visual analysis, see **ADR-003**) | |

Stack-specific decisions live as ADRs under `decisions/`.

---

## 6. Non-negotiables

- No secrets in the repo or in logs — Supabase service role key, OpenAI key, ScreenshotOne key, `CRON_SECRET` are env-only.
- Cron endpoints must check `Bearer ${CRON_SECRET}` before running any external-facing work.
- The audit JSON shape is treated as a versioned contract — any change to the report shape requires an ADR and a migration plan (active scope under **ADR queue**).
- No PII collected, stored, or sent to third parties without an explicit decision record and a privacy review (`infosec-agent` review required).
- All scoring, comparative, or monetary values stored as numbers, not strings.
- `.agent/` is operational (it owns a live launchd plist) — treat it as production code, not docs. Do not move or delete files there without a change request.

---

## 7. Companion documents

| Companion | Status | Purpose |
|-----------|--------|---------|
| `PROJECT_BRIEF.md` (this file) | active | One-page project truth |
| `CLAUDE.md` | active | Agent orchestrator; the framework's entry point |
| `dev-framework/` | active | Vendored process library |
| `decisions/` | active | ADR-style decision records |
| `scopes/` | active when work is in flight | One scope file per piece of work |
| `archive/` | reference | Original `PROJECT_NOTES.md`, `SYSTEM_PROMPT.md`, original `README.md`, original `docs/*` |
| `README.md` | active (short) | Quick-start only; process lives in `CLAUDE.md` |
| `RUNBOOK_INDEX.md` | not yet created | Will list active runbooks when ops content is migrated out of `.agent/` |
| `DATA_INVENTORY.md` | not yet created | Will document the mixed-storage data model |
| `SECURITY.md` | not yet created | Disclosure policy + dependency policy |
| `ON_CALL.md` | n/a | Solo project today |
| `SLO.md` | n/a | Solo project today |

---

## 8. Risks and assumptions

**Top risks:**

| Risk | Impact | Likelihood | Mitigation | Owner |
|------|--------|------------|------------|-------|
| Vercel cron writes to filesystem (`audit-config.json` + `audit-data/`) — EROFS on read-only FS | High — silent cron failure | High — already known | Migrate persistence off filesystem (Supabase storage or object store) — pending scope | engineering-agent |
| Two parallel crawlers with diverging output shapes — dashboard reads what the production crawler doesn't write | High — broken dashboard pages | Realised today | Consolidate to one pipeline (scope to be raised) | engineering-agent |
| `gpt-4o` calls have no cost monitoring, no eval harness, no prompt versioning | Medium — silent regressions, cost surprise | Medium | `_local/ai-agents` discipline established; first ai-pipeline change must add eval + cost monitoring | infosec-agent + (future) ai-agents-agent |
| No automated tests anywhere | Medium — refactor risk, regression risk | Realised today | Active first scope: Vitest harness + first audit-pipeline test | qa-agent |
| Supabase access via `NEXT_PUBLIC_SUPABASE_ANON_KEY` only; RLS policy state not documented in repo | Medium — accidental data exposure | Unknown | InfoSec review of RLS to be raised as a scope | infosec-agent |

**Assumptions:**
- Vercel cron + ScreenshotOne + OpenAI API stay broadly stable through the planning horizon.
- The active test target (`thebrandingjournal.com`) is fair game to crawl daily.
- Solo-operator cadence — no external SLAs to meet.

---

## 9. Out of scope (today)

- Multi-tenant / multi-user features (no auth beyond Basic Auth gate).
- Real-time collaboration or concurrent editing of briefs / plans.
- Mobile native apps.
- The `/ecrm`, `/social`, `/ecommerce`, `/pos` channel surfaces beyond their current placeholder pages.
- Anything in `SYSTEM_PROMPT.md` that isn't already implemented (Lighthouse CWV, brand-compliance reference-image overlays, `/setup` `/crawl` `/dashboard` CLI commands) — treated as design history, not spec.

---

## 10. Cadence

- **Working cadence:** Ad-hoc, scope-by-scope. No fixed sprint length.
- **Release cadence:** Continuous (Vercel auto-deploy on push to main, when used).
- **Review meetings:** None today (solo). Review gate is the framework's Phase 6 (Land) retrospective per scope.

---

## 11. Framework version

- **Framework version in use:** 1.0
- **Adopted on:** 2026-05-21
- **Last updated:** 2026-05-21
- **Open framework discussions:** First-scope retrospective at end of Stage 7 may surface needed framework refinements. Capture as ADRs against the framework, not silent edits.

---

## 12. Change log of this brief

| Date | Change | Author |
|------|--------|--------|
| 2026-05-21 | Initial draft on framework adoption | Russell + Claude |
