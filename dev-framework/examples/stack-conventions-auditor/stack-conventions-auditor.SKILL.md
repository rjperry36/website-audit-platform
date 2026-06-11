---
name: stack-conventions-auditor
description: Audit a project's CLAUDE.md (or equivalent conventions file) against the current Next.js, Vercel, and Neon documentation to detect outdated conventions, breaking changes, and missing best practices. Use this skill whenever the user wants to "audit my stack conventions", "review project conventions", "check if my CLAUDE.md is current", "refresh stack guidelines", or when running the monthly automated review. Triggers include any mention of stale documentation, framework upgrades (Next.js / React / Tailwind / Neon driver version bumps), or a request to compare project conventions against current docs. Always use this skill when the user shares a CLAUDE.md, PROJECT.md, or conventions file and asks about freshness. Also triggered automatically by Vercel Cron via the /api/cron/conventions-audit endpoint — when invoked in that context, output a structured report suitable for a GitHub PR description.
---

# Stack Conventions Auditor

A skill for keeping `CLAUDE.md` (and equivalent conventions files) current against Next.js, Vercel, and Neon documentation.

## When to use

- User invokes manually: "audit my stack conventions", "review my CLAUDE.md", "check if these conventions are still current"
- Automated invocation: monthly via Vercel Cron through `/api/cron/conventions-audit`
- After any major framework release (Next.js, React, Tailwind, Neon driver)

## Required inputs

Before starting, you need:

1. **The current CLAUDE.md** (or conventions file). If not provided, request it. The file must contain the `audit:` metadata block and `anchors:` block to do a structured audit.
2. **Stack scope**: confirm the project is Next.js + Vercel + Neon. If different, ask before proceeding.
3. **Output target**: GitHub PR (default for cron) or in-chat report (default for manual).

## Workflow

### Step 1 — Parse the input file

Extract:
- `audit.last_reviewed` date
- `audit.next_version`, `audit.react_version`, `audit.tailwind_version`, `audit.neon_driver_version`, `audit.node_version`
- The `anchors:` list — each anchor is a fingerprint with an `id`, `claim`, and `sources` array

If any of these are missing, **stop and ask the user**. The audit format requires them. Do not invent anchors.

### Step 2 — Fetch current state

For each anchor's `sources`, fetch the current documentation. Use `web_fetch` for the URLs listed, then cross-reference with `web_search` for any release notes from the last 90 days.

Also fetch these unconditionally:

- `https://nextjs.org/blog` (or release notes) — for the latest Next.js version and breaking changes
- `https://vercel.com/changelog` — for Vercel platform changes
- `https://neon.com/docs/changelog` — for Neon driver and platform changes
- Package registry (`https://www.npmjs.com/package/next`, `/react`, `/tailwindcss`, `/@neondatabase/serverless`, `/drizzle-orm`) — for current versions

### Step 3 — Diff

For each anchor, compare:
1. Is the `claim` still accurate according to current docs?
2. Are the `sources` still valid URLs returning relevant content?
3. Is the relevant package version pinned in `audit:` still current (or within one major)?

Classify each finding into one of:

- **OK** — no change needed
- **MINOR** — version bump, no behavior change (e.g. Next.js 15.2 → 15.4)
- **MAJOR** — behavior change requires a conventions update (e.g. caching defaults changed, new API replaces old)
- **NEW** — a new best practice exists that isn't yet captured (e.g. Partial Prerendering becomes stable)
- **BROKEN** — anchor source URL is dead or content moved

### Step 4 — Produce the report

Output a structured Markdown report with this shape:

```markdown
# Stack Conventions Audit — <project-name> — <YYYY-MM-DD>

## Summary
- Last reviewed: <date> (<N days ago>)
- Findings: <X> MAJOR, <Y> MINOR, <Z> NEW, <W> BROKEN

## Major findings
<!-- requires conventions rewrite -->
### [anchor-id] <one-line summary>
- **Current claim**: <quoted from CLAUDE.md>
- **What changed**: <2-3 sentences>
- **Proposed update**: <exact replacement text for CLAUDE.md>
- **Source**: <URL with citation>

## Minor findings
<!-- version bumps, clarifications -->
[...same structure...]

## New best practices to consider
[...]

## Broken anchors
[...]

## Proposed CLAUDE.md patch
<!-- ready-to-apply diff -->
```diff
- old line
+ new line
```
```

### Step 5 — Deliver

- **If invoked manually in chat**: present the report inline. Offer to apply the patch directly to the file if the user confirms.
- **If invoked via Vercel Cron**: return the report as the function response. The cron route handler will create a branch, write the report to `audits/<date>-conventions-audit.md`, and open a PR with the report as the description.

## Output format requirements

- **Cite every claim** with the URL it came from. No unsourced findings.
- **Propose exact replacement text**, not vague guidance. The user should be able to copy-paste.
- **Conservative on MAJOR classifications.** Only flag MAJOR if there's a clear behavior change or breaking change in current docs.
- **Be specific about versions.** "Next.js 15 caches by default" is wrong; "Next.js 14 cached fetch by default; Next.js 15+ does not" is right.

## What this skill does NOT do

- It does not rewrite the CLAUDE.md autonomously. It proposes; the human (or the PR review) decides.
- It does not audit project code against the conventions — that's a separate task. This skill only audits the conventions themselves against the docs.
- It does not invent best practices from blog posts. Only official docs (Next.js, Vercel, Neon, React, Tailwind) and verified package registry data are authoritative.

## Failure modes to avoid

- **Hallucinated version numbers.** Always fetch the npm registry for current versions; don't infer from training data.
- **Stale snippets.** When quoting current docs, use `web_fetch` on the same day as the audit. Don't trust cached training data for any claim about "current" behavior.
- **Anchor drift.** If a CLAUDE.md anchor's wording has drifted from the auditor's expectations, flag it as BROKEN rather than auto-correcting. The user should re-anchor explicitly.

## Integration with the Vercel Cron route

When invoked from `/api/cron/conventions-audit`:

1. The route handler passes the project's `CLAUDE.md` content as input
2. This skill produces the report
3. The route handler commits the report to a new branch and opens a PR via the GitHub API
4. The PR description is the full report; the PR diff is the proposed CLAUDE.md patch

See `route.ts` in this folder for the implementation.

---

_This skill is designed to be invoked both interactively (by the project owner in Claude Code) and programmatically (by Vercel Cron). The output format is the same in both cases; only the delivery channel differs._
