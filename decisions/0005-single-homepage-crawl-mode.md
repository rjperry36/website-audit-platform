# DR-0005 — Production cron crawls a single homepage only

| | |
|---|---|
| **Date** | 2026-05-21 (decision originally made early 2026; backfilled on framework adoption) |
| **Status** | Accepted (interim — intended to be revisited) |
| **Participants** | Russell |
| **Affects** | engineering, operations disciplines; `lib/crawl/production-crawler.ts`; cron path; cost profile |
| **Supersedes** | The original `SYSTEM_PROMPT.md` multi-page sitemap-crawl ambition |

---

## Context

The original spec envisioned a sitemap-driven multi-page crawl per site, with the legacy `Crawler` class (`lib/crawl/crawler.ts`) doing exactly that. On Vercel, the multi-page crawl is impractical: serverless functions have execution limits, ScreenshotOne calls cost money per page, and the AI visual analyzer adds latency + cost per page too. For the current single-active-target (`thebrandingjournal.com`), crawling more than the homepage adds cost without changing the demonstrable output.

`audit-config.json` reflects this by setting `maxPages: 1` and `excludePatterns: ["*"]`, and the `production-crawler.ts` codepath is hardcoded to crawl `site.rootUrl` only.

---

## Decision

The **Vercel cron crawls only the homepage** of each registered site. Multi-page crawls remain possible via the legacy `Crawler` class run locally (`npm run crawl <siteId>`), but they are not on the production path.

---

## Alternatives considered

- **Full sitemap crawl on cron** — rejected on cost, latency, and Vercel execution-limit grounds.
- **Sample N internal links per cron run** — sensible compromise but adds complexity (which N? how chosen? are they comparable across runs?). Deferred until there is a real reason to crawl more than the homepage.
- **Drop the cron, only do manual crawls** — rejected because the daily-cadence freshness is part of the product premise.

---

## Consequences

**Positive:**
- Cost-bounded: one screenshot pair + one AI call + one fetch per site per day.
- Cron finishes well within Vercel limits.
- The audit JSON is simple — one page per crawl.

**Negative / risks:**
- The dashboard is misleading if presented as "site audit" — it is a "homepage audit". Wording on `/overview` should be honest about this.
- Site-wide issues (broken sitemap, orphan pages, dead internal links) are invisible to the production pipeline.
- The legacy `Crawler` class is kept alive only for ad-hoc local runs — a perpetual fork in the codebase. See **ADR queue: consolidate crawlers**.

**Reversibility:**
- Two-way at the config layer (`maxPages` is a number). Reversibility at the *cost* layer is one-way until cron infrastructure changes.

---

## Follow-up

- A future ADR will decide whether to consolidate `Crawler` and `production-crawler.ts` into a single pipeline that can run in either single-page or multi-page mode.
- `/overview` copy should be reviewed by `content-agent` for honesty about scope ("homepage audit" not "site audit").
