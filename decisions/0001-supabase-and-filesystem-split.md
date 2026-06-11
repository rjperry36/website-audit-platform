# DR-0001 — Supabase Postgres for planning, local filesystem for crawl outputs

| | |
|---|---|
| **Date** | 2026-05-21 (decision originally made circa 2026-02; backfilled into a record on framework adoption) |
| **Status** | Accepted (with known limitation — see Consequences) |
| **Participants** | Russell |
| **Affects** | engineering, data, operations, infosec disciplines; the entire crawl pipeline; the entire planner/briefing stack |
| **Supersedes** | — |

---

## Context

Two different kinds of data needed homes:
1. **Crawl outputs** — JSON audit reports + PNG screenshots, generated daily, content-addressable by `<siteId>/<crawl-date>/`. Large blobs, write-heavy, read-mostly-by-the-app.
2. **Planning data** — markets, channels, briefs, brief-objectives, brief-channel-scopes, AI rules. Relational, queried by the dashboard, edited via the UI.

Mixing both into the same store risked either bloating Supabase with screenshot blobs or pretending the filesystem could hold relational data. The decision was made to split them along their natural grain: relational data in Postgres, blob-shaped crawl outputs on disk.

---

## Decision

**Supabase Postgres** holds: `markets`, `channels`, `initiative_tags`, `standard_objectives`, `briefs`, `brief_objectives`, `brief_channel_scopes`, `ai_rules`, `scoping_questions`.

**Local filesystem** holds: `audit-config.json` (site list) at the repo root, and `audit-data/<siteId>/crawls/<YYYY-MM-DD>/{reports/audit-report.json, screenshots/desktop/*, screenshots/mobile/*}`.

---

## Alternatives considered

- **Everything in Supabase (including blobs via Supabase Storage)** — rejected at the time for simplicity and because the original `SYSTEM_PROMPT.md` spec was filesystem-first. Now looks more attractive given the EROFS issue on Vercel (see Consequences).
- **Everything on the filesystem (no Supabase)** — rejected because the planner / brief creator / admin console need relational queries across markets, channels, objectives.
- **Object store (S3/R2) for blobs + Supabase for relational** — not considered seriously at the time. Likely the right end state if the EROFS limitation is closed.

---

## Consequences

**Positive:**
- Each store plays to its strengths.
- Local dev is fast — no upload latency for screenshots.
- The audit JSON is human-readable on disk, easy to diff.

**Negative / risks:**
- **Vercel's filesystem is read-only at runtime.** The cron path writes `audit-data/...` and updates `lastCrawlTimestamp` in `audit-config.json` — both throw `EROFS` in production. The cron appears to succeed (returns 200) but persists nothing. This is the largest active risk in the project.
- Two stores means two backup stories, two access-control stories, two failure modes.
- Anyone joining the project has to learn both.

**Reversibility:**
- Partially reversible. Moving crawl outputs to Supabase Storage or an object store is mechanical (the reader is `StorageManager` and a few API routes). Moving the relational tables off Supabase would be a much bigger lift.

---

## Follow-up

- A future scope must address the EROFS issue — either move crawl outputs to object storage, or run the cron from an environment with a writable filesystem (GitHub Actions, a small VM, etc.).
- `DATA_INVENTORY.md` (companion doc) should be written next time data work is in scope, listing both stores and their classification.
