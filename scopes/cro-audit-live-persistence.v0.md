# Scope: cro-audit-live-persistence

| | |
|---|---|
| **Version** | v0 |
| **Status** | Draft — Plan done; blocked on one CONFIRM + the Supabase migration |
| **Owner** | Russell (Product Owner) / Claude as `delivery-lead` + `engineering-agent` |
| **Disciplines** | engineering (primary), data, infosec, operations, _local/ai-agents |
| **Created** | 2026-06-12 |
| **Last updated** | 2026-06-12 |
| **Related scopes** | `restore-cro-audit-on-vercel.v0` (Phase 1 — the static snapshot this replaces) |
| **Related decision records** | **DR-0007** (Supabase persistence for crawl outputs) |

---

## 1. Frame

**Problem:**
After Phase 1 the CRO audit renders in production, but from a **frozen** snapshot.
It cannot refresh because (a) the cron writes to Vercel's read-only filesystem
(EROFS), and (b) the crawler the cron runs doesn't invoke the gpt-4o analyzer, so
a scheduled report would have no Cialdini/visual/persona findings (DR-0007 §Context).

**Success criteria:**
1. A scheduled crawl runs end-to-end in production and **persists** a complete
   report (DOM + gpt-4o findings) + screenshots without touching the local FS.
2. The CRO pages render the latest persisted crawl from Supabase; re-running the
   crawl updates what the dashboard shows, with no code deploy.
3. The committed Phase-1 snapshot remains only as a last-resort fallback.
4. The audit-report JSON shape is unchanged (no contract break).

**Constraints:**
- Audit-report shape is a versioned contract — this scope changes storage, not
  shape (DR-0007 §Decision 5).
- gpt-4o now runs per scheduled crawl → `_local/ai-agents` cost-governance applies.
- Screenshots become public-read URLs — infosec sign-off (no PII; marketing pages).
- DDL applied out-of-band via `scripts/audit_reports_migration.sql`.

---

## 2. Plan

**Approach:**
1. **DB/Storage** — apply `scripts/audit_reports_migration.sql` (table
   `audit_reports` + bucket `audit-screenshots`).
2. **Storage layer** — `lib/audit/report-store.ts`: `saveReport()` (upsert row +
   upload screenshots via service-role key) and `getLatestReport(siteId)`.
3. **Consolidate crawler** — fold the gpt-4o `auditVisualDesign` step into the
   production crawl path; write via the storage layer instead of `fs`. Retire the
   FS-only divergence between `production-crawler` and `browser-crawl`.
4. **Read path** — `GET /api/sites/:id/latest-crawl` reads Supabase first, falls
   back to the committed snapshot. Screenshots already render from URLs (Phase 1
   `getScreenshotUrl` passes through http(s)).
5. **Schedule** — runner per the CONFIRM below; set `maxDuration` if Vercel cron.
6. Verify: trigger a crawl → row + screenshots in Supabase → dashboard shows it.

**`CONFIRM:` open questions:**
- **C1 — scheduled runner (DR-0007 Open question):** Vercel Cron + `maxDuration`
  (needs a plan with ≥120s function timeout) **or** GitHub Actions scheduled
  workflow (any plan). Blocks step 5; everything else is identical.
- **C2 — refresh cadence + cost cap:** how often should it re-crawl (daily? weekly?)
  given each run is one gpt-4o vision call. Feeds the cost-governance note.

**Dependency:** the Supabase migration must be applied (Russell, in the SQL editor)
before Verify.

---

## 3. Execute (done)

- DB/Storage: `scripts/audit_reports_migration.sql` applied to Supabase project
  `cyhqwmamlfjnvtqukzng` (table + bucket + RLS).
- `lib/audit/report-store.ts` (saveReport / getLatestReport).
- `production-crawler` consolidated (DOM + gpt-4o, in-memory screenshots,
  Supabase persistence, site resolved from committed config); `visual-analyzer`
  accepts a Buffer; `screenshot-capture` emits downscaled JPEG.
- `latest-crawl` route reads Supabase → snapshot fallback; cron crawls the
  committed sample with `maxDuration=300`; `vercel.json` weekly (`0 0 * * 0`).
- CSP `img-src` extended to `https://*.supabase.co` (else Storage images blocked).

## 4. Verify (done, 2026-06-12)

First live crawl seeded via `npm run production-crawl`:
- `audit_reports` row persisted: site-adm-indicia / 2026-06-12 / overall 75
  (seo 89, aeo 55, geo 80, ux 74); 19 gpt-4o findings incl. 4 Cialdini.
- Screenshots public-readable: desktop 784 KB, mobile 1.9 MB.
- `GET /api/sites/site-adm-indicia/latest-crawl` returns the **Supabase** report
  (supabase.co screenshot URLs, today's date) — not the snapshot.
- `npm run build` exit 0.

## 5. Land

Shipped on `main` (commits through 90ca03f). The dashboard now reads live
Supabase data; re-running the crawler updates it with no deploy.

**Remaining for the *automatic* weekly refresh:** the Vercel project must be on a
plan that honours `maxDuration` ≥120s (Pro). Until then, refresh is manual
(`npm run production-crawl`) — the seeded crawl persists regardless.

**Cost-governance (`_local/ai-agents`):** one gpt-4o vision call per crawl;
weekly cadence ≈ 4–5 calls/month. Acceptable; revisit if cadence increases or
more sites are added.

**Follow-ups:** retire the now-redundant `scripts/browser-crawl.ts` and the
filesystem `StorageManager` read paths; write `DATA_INVENTORY.md`.
