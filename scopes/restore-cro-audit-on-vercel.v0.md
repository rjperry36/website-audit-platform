# Scope: restore-cro-audit-on-vercel

| | |
|---|---|
| **Version** | v0 |
| **Status** | In progress — Phase 1 (Frame + Plan done; Execute underway) |
| **Owner** | Russell (Product Owner) / Claude as `delivery-lead` + `engineering-agent` |
| **Disciplines** | engineering (primary), ui, ux, infosec (light), data (Phase 2) |
| **Created** | 2026-06-11 |
| **Last updated** | 2026-06-11 |
| **Related scopes** | — |
| **Related decision records** | Phase 2 will require a new ADR (audit-report.json persistence) — see §5 |

---

## 1. Frame

**Problem:**
The CRO / UX-audit surface — the page that reviews `thebrandingjournal.com`, shows desktop + mobile screenshots, and scores the homepage against Cialdini's persuasion principles (plus visual design, experience, and personas) — renders as a **blank page in production**. The user reported it as "broken, missing or gone."

Investigation (2026-06-11) found the feature is **fully intact in code and config** — nothing was deleted. It is starved of data in production:

1. `audit-config.json` (the site list) is **gitignored** → absent on Vercel → `ConfigManager.getSite()` returns null → `GET /api/sites/:id/latest-crawl` returns `404` at its first step.
2. `audit-data/` (reports + screenshots) is **gitignored** (`git ls-files audit-data` → 0 files) → no report exists on Vercel even past step 1. The files only exist on the local dev machine, which is why it appeared to work before (`npm run dev`).
3. The daily cron cannot regenerate them — Vercel's filesystem is read-only (the standing top risk in `PROJECT_BRIEF.md` §8).
4. Screenshots are referenced by **stale absolute paths** baked into the report (`/Users/russellperry/Documents/WEBChecker/...` — the repo now lives under `Sites/`), so images 404 **even locally**.
5. All five `/ux/*` pages do `if (!data) return null` — a 404 renders as a blank screen with no message, so the feature *looks* gone.
6. Discoverability: after the "Thoth" rebrand, `/ux` is only reachable via Channels → UX; there is no obvious "CRO / Audit" nav entry.

**Success criteria (Phase 1):**
1. On the Vercel production deployment, `/ux` and `/ux/cialdini` render the real Branding Journal audit (scores + 4 Cialdini findings + screenshots) — no blank screen.
2. Desktop and mobile screenshots display (served from a committed, Vercel-readable location, not an absolute FS path).
3. When no report is available, the pages show a friendly empty-state, not a blank page.
4. There is a clear, discoverable nav entry to the CRO/UX audit.
5. Local `npm run build` passes; local dev still reads a fresh FS crawl when one exists.

**Constraints:**
- `audit-report.json` is a versioned contract (CLAUDE.md §2). Phase 1 must **not** change its shape — it commits an existing report verbatim (only the `screenshots` field is rewritten to web paths). Any shape change is Phase 2 + an ADR.
- No secrets committed. The committed snapshot is public marketing-site audit data — no PII (infosec: confirmed baseline).
- AI pipeline files (`visual-analyzer.ts`, `cialdini.json`, `personas.json`) are **not touched** in Phase 1, so `_local/ai-agents` checklists are not triggered.

**Initial risks and unknowns:**
- `/ux/accessibility` and `/ux/mobile` are linked from the hub but have **no `page.tsx`** (pre-existing 404s) — out of scope here; noted for a follow-up.

---

## 2. Plan

**Approach (Phase 1 — restore visibility with a committed snapshot, no infra):**
1. Commit one known-good crawl (`site-thebrandingjournal`, 2026-02-17) as a Vercel-readable snapshot:
   - Screenshots → `public/audit-demo/site-thebrandingjournal/{desktop,mobile}.png` (served by Next at `/audit-demo/...`).
   - Report JSON → `data/audit/site-thebrandingjournal.json`, with `screenshots.desktop|mobile` rewritten to the `/audit-demo/...` web paths and a `snapshotDate` marker added.
2. `GET /api/sites/:id/latest-crawl` — add a fallback: keep the existing filesystem path for local dev; if the site/config/crawls are absent (the Vercel case), read and return the committed snapshot from `data/audit/:id.json`. Contract shape unchanged.
3. `getScreenshotUrl()` in the UX hub — pass through web paths (`/audit-demo/...`, `http…`) directly instead of wrapping them in `/api/screenshots?path=`.
4. Replace `if (!data) return null` across the five `/ux/*` pages with a shared empty-state component.
5. Add a discoverable **"CRO Audit"** entry to the top nav pointing at `/ux` (and its sub-pages).
6. Verify with `npm run build`.

**Alternatives considered:**
- **Serve the snapshot from `audit-data/` un-ignored** — rejected: keeps the brittle absolute-path + FS model and pollutes the gitignore intent.
- **Go straight to Supabase persistence (Phase 2) only** — rejected for now: bigger lift, needs an ADR; the user wants it visible again quickly. Captured as Phase 2 below.

**Disciplines drawn on:**
- engineering — `error-handling` (graceful fallback + empty-state), `api-design` (preserve the latest-crawl contract).
- ui/ux — empty-state pattern, nav discoverability.
- infosec — confirm no secrets / no PII in the committed snapshot.

**Cost / time / risk estimate:** Low. ~6 file touches + 3 committed assets; no schema or AI-pipeline change.

**`CONFIRM:` open questions:** none — approach approved by Product Owner (2026-06-11).

---

## 4. Verify (Phase 1)

Local prod-server test with `audit-config.json` moved aside (simulating Vercel's
missing config + read-only FS):
- `GET /api/sites/site-thebrandingjournal/latest-crawl` → **200**, returns the
  committed snapshot: 4 Cialdini findings, `scores.ux = 81`, `screenshots`
  pointing at `/audit-demo/...`, `snapshotDate: 2026-02-17`.
- `GET /audit-demo/site-thebrandingjournal/desktop.png` → **200**, 430 KB.
- `npm run build` → exit 0, all five `/ux/*` routes compile.

Done (Phase 1): committed snapshot + public screenshots; API snapshot fallback
(guards the read-only-FS config write that previously 500'd); `getScreenshotUrl`
web-path pass-through; shared `AuditEmptyState` across the five `/ux` pages;
"CRO Audit" nav dropdown.

Out of scope / follow-ups noted: `/ux/accessibility` and `/ux/mobile` have no
`page.tsx` (pre-existing 404s from the hub).

---

## 4b. Sample site changed to ADM Indicia (2026-06-11)

Replaced the sample site from The Branding Journal with **ADM Indicia**
(`https://adm-indicia.com/our-work/`). The new snapshot is a **fresh, real**
crawl: ScreenshotOne captures + live gpt-4o scoring.
- Scores: overall 75, seo 89, aeo 55, geo 80, ux 75.
- Cialdini 4, visualDesign 6, userExperience 5, personas 4 — all real model output.
- `TEST_SITE_CONFIG` → `site-adm-indicia`; old Branding Journal snapshot + public
  screenshots removed. Screenshots downscaled + JPEG-encoded (desktop 1.3 MB,
  mobile 3.1 MB) — raw full-page PNGs were 7 MB / 17 MB.

**Important discovery (feeds Phase 2):** the live `production-crawler.ts` — the
one the Vercel **cron** uses — does **not** run the gpt-4o visual analyzer; it
only does DOM SEO/AEO/GEO/accessibility/mobile, so its `findings.ux` has no
Cialdini/visual/persona data. Only `scripts/browser-crawl.ts` invokes
`auditVisualDesign`. This is the "two parallel crawlers" risk from
PROJECT_BRIEF.md §8, realised. Phase 2 must consolidate so the scheduled crawl
includes the AI analysis — otherwise daily refresh would silently drop the CRO
findings. (This crawl was produced with `browser-crawl`.)

---

## 5. Phase 2 (separate scope, deferred)

Durable persistence so the audit refreshes daily:
- Reports → Supabase Postgres; screenshots → a Supabase Storage bucket (ScreenshotOne returns image data we can upload instead of writing to disk).
- Cron writes there; the dashboard reads there. Fixes the read-only-FS, absolute-path, and daily-refresh problems permanently.
- Requires a decision record (audit-report.json persistence contract) + infosec + data discipline review before Phase 5.
