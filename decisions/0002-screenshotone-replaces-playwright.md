# DR-0002 — ScreenshotOne replaces Playwright for screenshot capture

| | |
|---|---|
| **Date** | 2026-05-21 (decision originally made early 2026, commit `78ab915`; backfilled on framework adoption) |
| **Status** | Accepted |
| **Participants** | Russell |
| **Affects** | engineering, operations, infosec disciplines; `lib/crawl/screenshot-capture.ts`; cron path |
| **Supersedes** | The implicit "use Playwright" of the original spec |

---

## Context

The audit pipeline needs desktop + mobile screenshots of the crawl target's homepage. Playwright was the initial choice (per `SYSTEM_PROMPT.md`), but Playwright requires bundled browser binaries that are awkward on Vercel: cold-starts are heavy, the deployment grows, and headless Chrome's behaviour on serverless functions is unreliable. The runtime requirement was reliable PNGs from a serverless cron, not full browser automation.

---

## Decision

Use **ScreenshotOne** (`screenshotone-api-sdk`) as a managed screenshot service. The wrapper lives in `lib/crawl/screenshot-capture.ts` with exponential-backoff retries.

---

## Alternatives considered

- **Playwright (the original choice)** — rejected on Vercel cost, cold-start, and reliability grounds.
- **Puppeteer / Chrome AWS Lambda** — same class of problem as Playwright on Vercel; not materially better.
- **Browserless.io / Urlbox / other vendors** — ScreenshotOne won on pricing for the current volume (single homepage daily). No formal comparison; this could be revisited if usage scales.
- **Skip screenshots entirely; do text-only audits** — rejected because the visual analyzer (`gpt-4o`) needs an image input; see ADR-0003.

---

## Consequences

**Positive:**
- Cron runs cleanly on Vercel; no browser binary management.
- Single HTTP call per screenshot; easy to retry.

**Negative / risks:**
- External vendor dependency. Outage on ScreenshotOne = no screenshots = no visual analysis = degraded audit.
- API key (`SCREENSHOTONE_ACCESS_KEY`) becomes a secret to protect.
- Vendor pricing scales with volume; if WEBChecker grows beyond single-homepage daily, costs will need watching.

**Reversibility:**
- Two-way. The `ScreenshotCapture` interface is small; swapping vendors would touch one file plus env vars.

---

## Follow-up

- `operations-agent` runbook should include a "ScreenshotOne is down" branch.
- Cost monitoring belongs in the `_local/ai-agents` discipline (because screenshots feed the AI visual analyzer, the cost story is joint).
