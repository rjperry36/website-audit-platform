# WEBChecker — Project Study Notes

_Generated 2026-05-14 from a deep read of the workspace at `/Users/russellperry/Sites/WEBChecker`._

This document summarises what the project is, how the code fits together, how the crawl + audit pipeline works end-to-end, how data is stored, and what is unfinished or inconsistent. Section 5 (Gaps & Risks) is the most important if you are picking the project back up.

---

## 1. What the project actually is

The repo is presented in `README.md` and `SYSTEM_PROMPT.md` as an **autonomous website-auditing platform** — "SiteAudit Agent" — originally written to a spec that imagines an Antigravity agent crawling sites, screenshotting them, running SEO / accessibility / performance / brand-compliance audits, and exposing the results in a local Next.js dashboard.

In practice the code has grown beyond that original spec into a **broader brand-intelligence and market-planning suite**. The actual scope today is:

1. **Audit engine** (the original idea) — crawl one homepage, run SEO / AEO / GEO / UX / Security / AI Visual analysis, save a JSON report and two screenshots per crawl.
2. **Brand health dashboard** — visualises audit scores through Keller's CBBE pyramid and a set of "channel" cards (Search, eCRM, Social, eCommerce, POS).
3. **Market Planner** — a 12-month timeline view per market (UK, US, DE, FR, JP, CN) driven by Supabase.
4. **Briefing system** — a form-based brief creator with objectives and per-channel scoping questions, also persisted to Supabase.
5. **Admin console** — CRUD over markets, channels, and standard objectives in Supabase.

Only #1 actually performs work against external websites. The other surfaces are CRUD over Supabase or render scores from the latest audit report.

The active test target is `https://www.thebrandingjournal.com/` (`audit-config.json` → `site-thebrandingjournal`), crawled at `maxPages: 1` with `excludePatterns: ["*"]` — i.e. only the homepage is crawled. There is also a legacy `site-redstock-test` directory in `audit-data/` from an earlier crawl with ~11 pages.

---

## 2. Tech stack

- **Framework:** Next.js 14 (App Router), React 18, TypeScript 5.4, `output: 'standalone'`.
- **Styling:** Tailwind CSS 3.4 with a custom `primary` palette and `glass` colours, Framer Motion for animation, lucide-react for icons, shadcn-style UI primitives in `components/ui/`.
- **Crawling/parsing:** native `fetch`, `cheerio` for HTML parsing, `xml2js` for sitemaps.
- **Screenshots:** [ScreenshotOne](https://screenshotone.com/) via `screenshotone-api-sdk` (replaced Playwright early on — see commit `78ab915`).
- **AI:** `openai` SDK using `gpt-4o` for visual analysis of the desktop screenshot.
- **Data:** mixed storage — **Supabase Postgres** for markets/channels/objectives/briefs/AI rules, and a **local filesystem `audit-data/`** tree for crawl outputs (screenshots + JSON reports). There is also a legacy `localStorage` client config (`lib/client-config.ts`) that is no longer the source of truth but still imported in places.
- **Auth:** optional HTTP Basic Auth via `middleware.ts` (env-gated). Cron auth via `Bearer ${CRON_SECRET}`.
- **Hosting:** Vercel — `vercel.json` declares a daily cron at `0 0 * * *` hitting `/api/cron/crawl`. `next.config.js` ships hardened security headers (HSTS, CSP, X-Frame-Options, etc.).
- **Scripts (`tsx` based):**
  - `npm run crawl <siteId>` — legacy multi-page Crawler class (`lib/crawl/crawler.ts`).
  - `npm run production-crawl` — single-URL production crawler used by Vercel cron.
  - `npm run browser-crawl` — alternative browser-driven crawler entry.
  - `npm run init-test-site` — seeds the test site config.
  - `npm run test-crawl`, `test-ai-integration`, `test-seo-audit`, etc. — dev/test harnesses.
  - `npm run audit:security` — internal repo security audit (`scripts/security-audit.ts`).
  - SQL migrations (`scripts/*.sql`) and one-off migration scripts (`migrate-all-rules.ts`, `migrate-channel-scopes.ts`, `seed-supabase.ts`).

---

## 3. Repository layout

```
WEBChecker/
├── app/                          Next.js App Router
│   ├── page.tsx                  Marketing landing page (hero + 4 entry tiles)
│   ├── layout.tsx                Root layout (Inter font, metadata)
│   ├── globals.css               Tailwind + glass theme tokens
│   ├── (dashboard)/              Route-group with shared dashboard layout
│   │   ├── layout.tsx            Glass header + TabNavigation (loads markets/channels from Supabase)
│   │   ├── overview/page.tsx     Brand health dashboard (CBBE pyramid + channel cards)
│   │   ├── admin/page.tsx        Admin console (markets/channels/objectives CRUD)
│   │   ├── briefing/page.tsx     Hosts <BriefingForm/>
│   │   ├── planner/[market]/     12-month timeline per market (Supabase-driven)
│   │   ├── search/               page.tsx (mock summary) + seo/aeo/geo drill-downs (mock)
│   │   ├── ux/                   page.tsx + visual/experience/personas/cialdini drill-downs
│   │   └── ecrm|social|ecommerce|pos/page.tsx   "Coming Soon" placeholder pages (~96 lines each)
│   ├── actions/
│   │   ├── audit.ts              Server actions: getCrawlHistory, getCrawlReport
│   │   └── config.ts             Server actions: CRUD markets/channels/objectives in Supabase
│   └── api/
│       ├── sites/route.ts                       GET list / POST create site config
│       ├── sites/[siteId]/route.ts              GET / PUT / DELETE one site
│       ├── sites/[siteId]/crawls/route.ts       GET history; POST currently disabled (Vercel FS read-only)
│       ├── sites/[siteId]/crawls/[crawlDate]/   GET specific report
│       ├── sites/[siteId]/latest-crawl/         GET latest report + previousScores
│       ├── screenshots/route.ts                 GET ?path=… serves PNG from /audit-data
│       ├── cron/crawl/route.ts                  Daily Vercel cron — runs crawlSite() if due
│       └── briefs/route.ts                      POST brief + objectives + channel scopes
├── lib/
│   ├── types.ts                  Core shared types (SiteConfig, CrawlReport, Finding, etc.)
│   ├── logger.ts                 Emoji-prefixed console logger
│   ├── config.ts                 ConfigManager — reads/writes audit-config.json (server FS)
│   ├── client-config.ts          ClientConfigManager — localStorage fallback (legacy)
│   ├── storage.ts                StorageManager — audit-data/ directory + report I/O
│   ├── supabase.ts               Single supabase client (NEXT_PUBLIC_… vars)
│   ├── utils.ts                  cn(), formatPercentage, getScoreColor, etc.
│   ├── animations.ts             Framer Motion variants
│   ├── audit-helpers.ts          Stubbed SEOAuditResult loader (returns null)
│   ├── channel-experts.ts        Channel-expert metadata + icon lookup
│   ├── initiatives.ts            Lookup maps from channel-initiative-types.json + initiative-tags.json
│   ├── planner-types.ts          Planner types (ProjectBrief, MarketConfig, etc.)
│   ├── planner-data.ts           Planner row/event types and month/week tables
│   ├── audit/                    *** the audit engine ***
│   │   ├── seo-analyzer.ts       Extract+audit SEO (data-only)
│   │   ├── seo-audit.ts          $('').based combined SEO+AEO+GEO audit (used by Crawler)
│   │   ├── geo-analyzer.ts       Extract+audit GEO (data-only)
│   │   ├── ux-analyzer.ts        Extract+audit UX (accessibility + mobile) using ux.json rules
│   │   ├── visual-analyzer.ts    AI visual analysis via GPT-4o + Supabase ai_rules
│   │   ├── security-analyzer.ts  Header + HTML signal extraction
│   │   └── security-audit.ts     Apply rules from config/rules/security.json
│   ├── crawl/                    *** the crawl engine ***
│   │   ├── crawler.ts            Class-based multi-page crawler (sitemap → fallback links)
│   │   ├── link-crawler.ts       BFS link crawler used as sitemap fallback
│   │   ├── sitemap-parser.ts     /sitemap.xml + sitemapindex parser
│   │   ├── screenshot-capture.ts ScreenshotOne wrapper with exp-backoff retries
│   │   ├── url-utils.ts          normalizeUrl, getDomainSlug, generatePageSlug, etc.
│   │   └── production-crawler.ts Single-URL crawler used by cron + npm script
│   ├── config/
│   │   ├── personas.json         Persona definitions for visual analyzer
│   │   ├── cialdini.json         Cialdini principles for visual analyzer
│   │   └── rules/
│   │       ├── ux.json           UX rules (UX-A11Y-*, UX-MOB-*)
│   │       └── security.json     Security rules (SEC-ARCH-*, SEC-HEAD-*, SEC-INP-*, SEC-DISC-*)
│   └── mock-data/seo-findings.ts Static findings used by the mock /search drill-down pages
├── components/
│   ├── ui/                       Card, Button, Badge, Skeleton, Input, Label, AnimatedNumber
│   ├── layout/tab-navigation.tsx Dashboard top-tabs
│   ├── dashboard/                ScoreCard, CrawlHistory, AuditCategoryCard, TrendIndicator
│   ├── brand/cbbe-pyramid.tsx    SVG CBBE pyramid for /overview
│   ├── search/findings-table.tsx Findings table for /search drill-downs
│   ├── admin/AdminInterface.tsx + ConfigForms.tsx  Admin console
│   ├── briefing/BriefingForm.tsx + ObjectiveList + ChannelScoping
│   └── planner/                  Timeline.tsx, TimelineRow, TimelineHeader, EventBar, EventHoverCard, PlannerListView, PlanningMarker, TimelineFilter
├── scripts/                      tsx-runnable scripts + raw SQL migrations
├── audit-data/                   Per-site, per-date crawl outputs (gitignored)
│   ├── site-thebrandingjournal/crawls/2026-02-{10,11,17}/
│   └── site-redstock-test/crawls/2026-02-{09,17}/
├── audit-config.json             Source of truth for site configs (one site at present)
├── middleware.ts                 Optional Basic Auth
├── next.config.js                Security headers + CSP + standalone output
├── vercel.json                   Daily cron → /api/cron/crawl
├── docs/                         component-checklist, design-system, seo-audit-criteria
├── public/                       Static assets
├── README.md                     Marketing-style README (largely matches SYSTEM_PROMPT)
└── SYSTEM_PROMPT.md              Original Antigravity agent spec — much grander than what's built
```

---

## 4. Architecture — how it actually runs

### 4.1 Layered model

```
┌────────────────────────────────────────────────────────────────────┐
│  Next.js App Router (Vercel-deployed)                              │
│                                                                    │
│  ┌── Landing ──┐  ┌── Dashboard (route group) ──────────────────┐ │
│  │   /         │  │  /overview   /admin    /briefing            │ │
│  └─────────────┘  │  /planner/[market]                          │ │
│                   │  /search (+ /seo, /aeo, /geo drill-downs)   │ │
│                   │  /ux (+ /visual, /experience, /personas,    │ │
│                   │        /cialdini drill-downs)               │ │
│                   │  /ecrm /social /ecommerce /pos (placeholder)│ │
│                   └─────────────────────────────────────────────┘ │
│                                                                    │
│  API routes                          Server actions                │
│   /api/sites/* (file-backed)          getCrawlHistory/Report       │
│   /api/sites/[id]/latest-crawl        createMarket/Channel/...     │
│   /api/screenshots?path=             (Supabase mutations)          │
│   /api/cron/crawl   (Bearer auth)                                  │
│   /api/briefs       (Supabase)                                     │
└──────────────────┬───────────────────────────┬─────────────────────┘
                   │                           │
        ┌──────────▼──────────┐     ┌──────────▼──────────┐
        │ Local filesystem    │     │  Supabase Postgres  │
        │  audit-config.json  │     │  markets, channels, │
        │  audit-data/<site>/ │     │  standard_objectives│
        │    crawls/<date>/   │     │  briefs, brief_*    │
        │      reports/       │     │  ai_rules           │
        │      screenshots/   │     │  (see scripts/*.sql)│
        └──────────▲──────────┘     └──────────▲──────────┘
                   │                           │
   ┌───────────────┴────────────┐ ┌────────────┴──────────────┐
   │  Audit engine (lib/audit)  │ │  Crawl engine (lib/crawl) │
   │  seo, aeo, geo, ux,        │ │  sitemap, link-crawler,   │
   │  security, visual (GPT-4o) │ │  screenshot-capture       │
   └────────────────────────────┘ └───────────────────────────┘
              │                              │
              │  fetch() + cheerio()         │  ScreenshotOne API
              ▼                              ▼
   ┌────────────────────────────────────────────────────┐
   │ Target website (e.g. thebrandingjournal.com)       │
   └────────────────────────────────────────────────────┘
```

### 4.2 Two coexisting crawl pipelines

There are **two parallel crawlers** in the codebase, and the dashboard reads reports written by the production one. They are not unified.

| | `lib/crawl/crawler.ts` (Crawler class) | `lib/crawl/production-crawler.ts` (`crawlSite`) |
|---|---|---|
| Entry | `npm run crawl <siteId>` via `scripts/crawl.ts`, also imported by `app/api/sites/[siteId]/crawls/route.ts` (currently dead — the POST returns a "run locally" message) | `scripts/production-crawl.ts` and the Vercel cron `/api/cron/crawl` |
| Discovery | sitemap.xml → fallback BFS link crawl | none — crawls only `site.rootUrl` |
| Pages | up to `maxPages`, 1.5s delay | 1 |
| Audits | `auditSEO` (combined trad/AEO/GEO via `seo-audit.ts`) + `auditSecurity` + `auditVisualDesign`; accessibility/performance/brandCompliance left at score 0 | `extractSEOData`+`auditSEO`, `extractAEOData`+`auditAEO`, `extractGEOData`+`auditGEO`, `extractUXData`+`auditAccessibility`+`auditMobileUsability` (UX) — **no security, no visual analysis** |
| Report shape | `CrawlReport` (typed) | `ProductionCrawlReport` (untyped `any[]` findings) |
| Output | `audit-data/<id>/crawls/<date>/reports/audit-report.json` | same path, but different JSON shape |

The samples in `audit-data/site-thebrandingjournal/` follow the **production crawler's** schema (`scores: {overall, seo, aeo, geo, ux}`, `findings: {seo, aeo, geo, ux: {accessibility, mobile}}`). The legacy `site-redstock-test/` directory was written by an even older code path.

`crawlSite()` also calls `ConfigManager.updateSite()` afterwards to bump `lastCrawlTimestamp` — which **writes back to `audit-config.json`**. That mutation can't happen on Vercel's read-only filesystem, so the cron will succeed in fetching+auditing but fail to persist the timestamp; the comment in `app/api/sites/[siteId]/crawls/route.ts` explicitly acknowledges this limitation.

### 4.3 The audit engine

Six analyzer modules, all `lib/audit/*`, all built on `cheerio`:

| Module | What it does | Rule source | Status |
|---|---|---|---|
| `seo-analyzer.ts` | Title length, meta desc, canonical, robots, H1 count, heading hierarchy, alt text quality, OG/Twitter tags, URL cleanliness | Inline (SEO-001…SEO-011) | Used by production crawler |
| `seo-audit.ts` | Same coverage but combined with AEO+GEO into one weighted overall score (50/30/20) | Inline | Used by `Crawler` class (legacy) |
| `geo-analyzer.ts` | AI-crawler access, llms.txt (advisory only), citation chunks, statistics, external citations, author info, image alt quality | Inline (GEO-001…GEO-010) | Used by production crawler |
| `ux-analyzer.ts` | Viewport meta, lang attribute, form labels, ARIA landmarks, skip link, mobile font size, CTAs | `lib/config/rules/ux.json` — **but the production crawler resolves only a subset of UX-A11Y / UX-MOB rules** | Used by production crawler |
| `security-analyzer.ts` + `security-audit.ts` | HTTPS, HSTS, CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, target=_blank safety, mixed content, server/X-Powered-By disclosure | `lib/config/rules/security.json` | Wired into `Crawler` (legacy) only — **production cron does not run security audit** |
| `visual-analyzer.ts` | Sends desktop screenshot to GPT-4o with personas+Cialdini prompts, parses JSON, joins with `ai_rules` rows in Supabase | Supabase `ai_rules` + `personas.json` + `cialdini.json` | Wired into `Crawler` (legacy) only — **production cron does not run visual analysis** |

Scoring is the same pattern across modules: weight by level (mandatory=3, advisory=2, acceptable=1 — security uses 5/2/1), award full weight for `pass`, half for `warning`, zero for `fail`, normalise to 0-100.

### 4.4 The dashboard surfaces

- **`/`** — marketing landing page (no data calls).
- **`/overview`** — fetches `getCrawlHistory(siteId)` + `getCrawlReport(siteId, activeDate)` (server actions, FS-backed). Maps `report.scores.seo/ux/geo/aeo/visual` into the six CBBE levels — this is a loose mapping, not a true CBBE assessment. Channel cards show real SEO score; everything else is "Coming Soon".
- **`/search`** and its `/seo`, `/aeo`, `/geo` drill-downs render **mock findings** (`lib/mock-data/seo-findings.ts`), not the live report. The actual scores in the report are never surfaced to these pages.
- **`/ux`, `/ux/visual`, `/ux/experience`, `/ux/personas`, `/ux/cialdini`** all fetch `/api/sites/[siteId]/latest-crawl` and assume the report contains `findings.ux.visualDesign`, `findings.ux.userExperience`, `findings.ux.personas`, `findings.ux.cialdini` — **but the production crawler does not emit those keys**, only `findings.ux.accessibility` and `findings.ux.mobile`. So these pages effectively show empty data unless the legacy `Crawler` is used. See §5.
- **`/admin`, `/briefing`, `/planner/[market]`** — Supabase-backed, independent of the crawl pipeline.
- **`/ecrm`, `/social`, `/ecommerce`, `/pos`** — 96-line stub pages that just say "Coming Soon".

### 4.5 Cron path

```
Vercel cron (daily 00:00 UTC, vercel.json)
   └─► GET /api/cron/crawl  (Bearer ${CRON_SECRET})
         └─► ConfigManager.getSites()          (reads audit-config.json)
               └─► for each site, if due (lastCrawlTimestamp + crawlIntervalDays < now)
                     └─► crawlSite(site.id)    (lib/crawl/production-crawler.ts)
                           ├─► fetchHTML(rootUrl)
                           ├─► extractPageTitle(rootUrl)
                           ├─► captureScreenshots() → ScreenshotOne API
                           ├─► fs.writeFile(desktopPath/mobilePath)
                           ├─► run SEO/AEO/GEO/UX analyzers
                           ├─► write audit-report.json
                           └─► ConfigManager.updateSite(lastCrawlTimestamp)   ❗ FS-write on Vercel
```

---

## 5. Data model & storage

### 5.1 Filesystem (the audit side)

The original spec's structure is faithfully implemented by `StorageManager`:

```
audit-data/
└── <siteId>/
    └── crawls/
        └── <YYYY-MM-DD>/
            ├── reports/
            │   └── audit-report.json
            └── screenshots/
                ├── desktop/<filename>.png
                └── mobile/<filename>.png
```

Screenshot filenames follow `{domain}-{date}-{device}-{slug}.png` (see `getDomainSlug`/`generatePageSlug` in `lib/crawl/url-utils.ts`). The production crawler **overrides** this naming with a fixed `homepage.png` for both viewports — only the legacy `Crawler` honours the spec'd naming. Existing screenshots under `site-redstock-test/` use the spec'd naming, confirming they came from the older path.

`audit-config.json` (root) is the **source of truth for site list**. It currently holds one entry:

```json
{
  "sites": [{
    "id": "site-thebrandingjournal",
    "name": "The Branding Journal",
    "rootUrl": "https://www.thebrandingjournal.com/",
    "crawlIntervalDays": 3,
    "lastCrawlTimestamp": "2026-02-17T15:34:20.844Z",
    "maxPages": 1,
    "excludePatterns": ["*"],
    "guidelines": { "global": {…}, "pageTypes": {} }
  }]
}
```

### 5.2 Supabase (the planning side)

Defined in `scripts/schema.sql` and `scripts/config_migration.sql`:

| Table | Purpose | Notes |
|---|---|---|
| `markets` | Per-market config (UK, US, DE, FR, JP, CN) | id, label, currency, flag_icon, is_active |
| `channels` | Channel taxonomy used by planner + briefing | id, label, color, is_active |
| `initiative_tags` | LIFECYCLE / LOCAL / GLOBAL / etc. | id, label, color |
| `standard_objectives` | Default objective templates (KPI + target) | uuid PK |
| `projects` / `initiatives` | Legacy — not actively written from the UI | Schema present, code paths sparse |
| `briefs` | Brief metadata (title, markets, channel_types, start/end_date, status, tags) | id is `brief_${Date.now()}` |
| `brief_objectives` | Per-brief objective rows (objective/kpi/target) | FK to briefs |
| `brief_channel_scopes` | Per-(brief × channel) JSONB responses | UNIQUE(brief_id, channel_id) |
| `ai_rules` | Rules referenced by `visual-analyzer.ts` | id, category, rule_name, priority_level, impact, recommendation, thresholds |
| `scoping_questions` | Implied by `lib/channel-experts.ts` and `migrate-channel-scopes.ts` (full DDL in `scripts/scoping_migration.sql`) | Drives the per-channel briefing questions |

Mutations go through server actions (`app/actions/config.ts`) and the briefs API route. There's **no Row Level Security** mentioned anywhere; everything uses `NEXT_PUBLIC_SUPABASE_ANON_KEY` directly, so any RLS policies live only in Supabase itself.

### 5.3 Two config managers — pick one

- `ConfigManager` (server, FS) is used by the production crawler, cron, and `/api/sites/*` routes.
- `ClientConfigManager` (browser, localStorage) is imported by `app/api/sites/[siteId]/crawls/route.ts` (commented-out path) and `scripts/crawl.ts`. Anywhere it appears server-side it silently no-ops because `typeof window === 'undefined'`.

This dual setup is a known limitation called out in the disabled API route — file-based persistence doesn't work on Vercel's read-only FS, so the team tried localStorage as a fallback, then largely reverted to FS. Today the production path requires the local filesystem.

### 5.4 Report shape mismatch

The frontend (`/ux/*` drill-downs) is written against an idealised report shape:

```ts
data.findings.ux = {
  accessibility: Finding[],   // produced by production crawler ✓
  mobile:        Finding[],   // produced by production crawler ✓
  visualDesign:  Finding[],   // NEVER produced ✗
  userExperience:Finding[],   // NEVER produced ✗
  personas:      Finding[],   // NEVER produced ✗
  cialdini:      Finding[],   // NEVER produced ✗
}
```

`visual-analyzer.ts` does produce persona and Cialdini findings, but it is only invoked by the **legacy `Crawler` class**, which uses the typed `CrawlReport` shape (not `ProductionCrawlReport`) and writes findings under `audits.visual`, not `findings.ux.*`. So even running the legacy crawler wouldn't satisfy the dashboard's expectations without a transform layer.

---

## 6. Gaps, inconsistencies & unfinished work

This is the section worth coming back to.

### 6.1 Two crawl pipelines, no unified output

The biggest structural debt. Either consolidate on `production-crawler.ts` (single-page, Vercel-runnable) and add the missing audits (security, visual, AEO/personas/Cialdini) to it, or commit to `Crawler` for local-only runs and stop pretending the cron does anything useful. Right now the cron emits a slim report and the dashboard expects the rich one.

### 6.2 Dashboard ↔ report shape mismatch

`/ux/visual`, `/ux/experience`, `/ux/personas`, `/ux/cialdini` read keys that the active crawler never writes. Either:
- Extend the production crawler to run `auditVisualDesign()` and put its outputs under `findings.ux.visualDesign|userExperience|personas|cialdini`, or
- Have these pages call separate endpoints and synthesise the missing data, or
- Hide the pages until the crawler catches up.

### 6.3 `/search` drill-downs are mocked

`/search/seo`, `/search/aeo`, `/search/geo` import `mockSEOFindings`/`mockAEOFindings`/`mockGEOFindings` from `lib/mock-data/seo-findings.ts`. The latest crawl already has the real findings — wiring them in would replace the mocks 1:1.

### 6.4 Vercel cron will silently fail to update `lastCrawlTimestamp`

`crawlSite()` calls `ConfigManager.updateSite(...)` which writes `audit-config.json`. On Vercel that throws `EROFS`. The cron will appear to succeed (return 200) but the next run will think the site is still due, and `audit-data/` writes will also fail. Either move site config + crawl outputs to Supabase / object storage, or run the cron from somewhere with a writable FS (a separate VM, GitHub Actions, etc.).

### 6.5 CBBE mapping is cosmetic

`/overview` maps audit scores onto Keller's CBBE pyramid (Resonance ← UX, Salience ← SEO, etc.) but the mapping is a one-line proxy, not a real CBBE assessment. The "Strengths" / "Opportunities" cards on `/overview` are hard-coded copy ("Salience 92/100…") regardless of the actual report.

### 6.6 Placeholder channels

`/ecrm`, `/social`, `/ecommerce`, `/pos` are all ~96-line stubs. The CBBE channel cards on `/overview` show "Coming Soon" for these too. Either ship them or remove them from the nav.

### 6.7 Two SEO modules with overlapping logic

`lib/audit/seo-analyzer.ts` and `lib/audit/seo-audit.ts` re-implement the same rules in two slightly different styles (the former uses `extractX` + `auditX`, the latter is a single pass that calls cheerio directly). They diverge in details (e.g. status thresholds for title length). Consolidate.

### 6.8 `lib/audit-helpers.ts` is dead code

`loadAuditData` and `getAvailableSites` are stubs returning `null`/`[]`. Nothing meaningful imports them. Remove or implement.

### 6.9 Schema-vs-code drift

- `lib/types.ts` defines `PageAudit.audits.visual` and `.security`, but the production crawler emits `findings.ux.*` and no security findings at all.
- `ProductionCrawlReport.findings.seo` etc. are typed `any[]`, papering over the type safety the rest of the codebase claims.
- `lib/config/rules/ux.json` lists 22+ rules but only ~6 are actually evaluated in code; the rest are aspirational.

### 6.10 No automated tests

`scripts/test-*.ts` are manual harnesses, not a test suite. There's no `npm test`, no CI test runs. Given the crawl/audit logic has clear pure-function boundaries, this would be a productive area to add unit tests (especially for the rule scoring).

### 6.11 Security observations

`scripts/security-audit.ts` audits the repo itself; `next.config.js` ships strong headers (HSTS, CSP, Permissions-Policy). The CSP allows `'unsafe-eval'` and `'unsafe-inline'` for scripts and styles (likely needed for Next.js + Framer Motion in dev), but if you tighten this in production it would be a meaningful upgrade. `middleware.ts` provides optional Basic Auth — good for protected previews.

### 6.12 SYSTEM_PROMPT.md ↔ reality drift

The prompt describes Lighthouse-driven Core Web Vitals, brand-compliance with reference-image overlays, structured `/setup`/`/crawl`/`/dashboard` CLI commands, multi-site support with per-page-type guidelines, and a self-contained `npm start` agent. Almost none of that is implemented. The agent posture is now mostly aspirational — keep the file as design history, but don't treat it as a spec of what runs.

---

## 7. Quick mental model

When picking this back up, hold these three sentences:

1. **The crawl + audit pipeline is real but narrow:** one homepage, fetched with `fetch()`, parsed with cheerio, scored against in-code rules, screenshotted via ScreenshotOne, written to `audit-data/<site>/crawls/<date>/`.
2. **The dashboard is partly powered by that pipeline and partly cosmetic:** `/overview` and `/ux` read the latest report; `/search/*` is mocked; `/ecrm /social /ecommerce /pos` are stubs.
3. **The planner + briefing + admin surfaces are an entirely separate app on Supabase** that happens to share a header and nav with the audit dashboard.

Everything else is consequence — the cron, the two crawlers, the report-shape mismatch, the CBBE mapping — of those three facts not quite lining up yet.
