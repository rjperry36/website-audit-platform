# DR-0007 — Persist crawl outputs to Supabase; consolidate to one AI-enabled crawler

| | |
|---|---|
| **Date** | 2026-06-12 |
| **Status** | Accepted — runner = **Vercel Cron + `maxDuration` 300s** (Option A; requires Vercel Pro); cadence = **weekly** |
| **Participants** | Russell, Claude (engineering-agent, infosec-agent, data) |
| **Affects** | engineering, data, operations, infosec disciplines; the crawl pipeline; the audit-report contract; the dashboard read path |
| **Supersedes** | The filesystem half of **DR-0001** (crawl outputs only; the Postgres planning store is unchanged) |

---

## Context

The CRO/UX audit surface renders from `audit-report.json` + screenshots. Today
those live on the local filesystem (`audit-data/`), which is gitignored and
**absent on Vercel's read-only filesystem**. Phase 1 (scope
`restore-cro-audit-on-vercel`) worked around this by committing a single static
snapshot so the page renders in production — but it cannot refresh.

Two compounding problems block a live, scheduled audit:
1. **Persistence** — the cron writes `audit-data/...` and `audit-config.json`,
   both of which throw `EROFS` on Vercel (the largest standing risk, DR-0001).
2. **Pipeline split** — the crawler the cron runs (`lib/crawl/production-crawler.ts`)
   does **not** call the gpt-4o visual analyzer at all; only
   `scripts/browser-crawl.ts` does. So even if persistence worked, the scheduled
   report would contain no Cialdini/visual/persona findings. This is the
   "two parallel crawlers" risk from PROJECT_BRIEF.md §8, now confirmed.

---

## Decision

1. **Reports → Supabase Postgres.** A new `audit_reports` table stores one row
   per crawl: `site_id`, `crawl_date`, `scores` (jsonb), `report` (jsonb, the
   full versioned report), `created_at`. "Latest crawl" = newest row for a
   `site_id`.
2. **Screenshots → Supabase Storage.** A public-read bucket `audit-screenshots`
   holds `…/<siteId>/<crawl-date>/{desktop,mobile}.jpg`. The report's
   `screenshots` field stores the public Storage URLs.
3. **Consolidate crawlers.** One crawl path runs DOM analysis **and** the gpt-4o
   visual analysis (merging `browser-crawl`'s AI step into the production
   crawler), then writes to Supabase (network calls — which work from Vercel)
   instead of the local filesystem.
4. **Dashboard reads Supabase**, with the committed Phase-1 snapshot kept only
   as a last-resort fallback (local dev / cold start).
5. **The audit-report JSON shape is unchanged** — same keys, same versioned
   contract. We change *where* it is stored, not its shape. (If a future change
   adds a `schema_version` field, that is a separate ADR.)

---

## Open question (CONFIRM before Execute)

**Where does the scheduled crawl run?** A single-homepage crawl takes ~60–90s
(ScreenshotOne desktop+mobile ≈ 45s + gpt-4o vision ≈ 19s). Options:

- **A. Vercel Cron + `maxDuration` 300s** — simplest; writes to Supabase over
  the network so EROFS no longer applies. **Requires a Vercel plan whose
  function timeout can be raised to ≥120s** (Hobby caps at 10s → will not fit).
- **B. GitHub Actions scheduled workflow** — runs the crawl on a writable runner
  with no timeout pressure, writes to Supabase via the service-role key. Works
  on any Vercel plan; moves the schedule out of Vercel.

Recommendation: **A if on Vercel Pro, otherwise B.** This is the only decision
that changes the implementation shape; everything else (table, bucket, crawler
consolidation, read path) is identical either way.

---

## Alternatives considered

- **Keep committing static snapshots per refresh** — rejected: manual, not
  "live," and balloons the git repo with multi-MB screenshots.
- **Reports as JSON files in Storage (not Postgres)** — rejected: Postgres jsonb
  gives cheap "latest per site" queries and trend history for free.
- **External object store (S3/R2)** — viable but adds a vendor; Supabase Storage
  is already provisioned and satisfies the need.

---

## Consequences

**Positive:** the cron actually persists; the audit can refresh on schedule with
full AI findings; one crawler to maintain; trend history becomes queryable;
closes the EROFS risk for crawl outputs.

**Negative / risks:** gpt-4o now runs on every scheduled crawl → recurring cost
(must satisfy the `_local/ai-agents` cost-governance checklist). Screenshots
become public-read URLs (no PII — marketing pages only; infosec sign-off
required). DDL must be applied to Supabase out-of-band (SQL editor / migration),
since DDL is not available through the REST key.

**Reversibility:** high. The reader is centralised; reverting to the committed
snapshot is a config flip.

---

## Follow-up

- Apply `scripts/audit_reports_migration.sql` to Supabase.
- `_local/ai-agents` cost-governance: add a per-crawl cost note + a cap on crawl
  frequency.
- `DATA_INVENTORY.md` should finally be written, now that both stores hold
  first-class data.
