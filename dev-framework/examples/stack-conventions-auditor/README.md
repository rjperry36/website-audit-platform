# Example — Stack Conventions Auditor (Next.js + Vercel + Neon)

> Worked example of the **standards-refresh** pattern (`00-lifecycle/standards-refresh.md`) applied to a project running on Next.js, Vercel, and a Neon database.
>
> The framework files describe the *pattern*. The files in this folder show one *implementation* of it.

---

## What this example does

Once wired up, the loop runs by itself:

```
month N, day 1, 09:00 UTC
    ↓
Vercel Cron fires `/api/cron/conventions-audit`
    ↓
the cron handler invokes the Claude `stack-conventions-auditor` skill
    ↓
the skill parses the project CLAUDE.md anchors, fetches current Next.js / Vercel / Neon docs, diffs each claim
    ↓
findings? → open a GitHub PR titled "🔍 Stack conventions audit — <date>"
no findings? → bump `last_reviewed` and exit quietly
    ↓
you review the PR during your next sit-down → merge or reject
    ↓
the merged CLAUDE.md is the new source of truth → all Claude Code sessions pick it up automatically
```

This is the freshness loop from `00-lifecycle/standards-refresh.md`, made concrete for one stack.

---

## What's in this folder

| File | Purpose | Where it lives in a real project |
|------|---------|----------------------------------|
| `project-CLAUDE.md` | Project-level conventions file with `audit:` metadata and `anchors:` block | Project root (renamed to `CLAUDE.md`) |
| `stack-conventions-auditor.SKILL.md` | The Claude Code skill that performs the audit | Installed globally at `~/.claude/skills/stack-conventions-auditor/SKILL.md` |
| `route.ts` | Vercel Cron endpoint that runs the audit monthly | Project at `app/api/cron/conventions-audit/route.ts` |
| `vercel.json` | Cron schedule | Project root (merge into existing `vercel.json` if present) |

> Note: `project-CLAUDE.md` is distinct from the framework's own `CLAUDE.md.template` at the framework root. The framework's template is project-type-agnostic; this one is opinionated for the Next.js + Vercel + Neon stack and demonstrates anchors in action.

---

## Adopting this example in a project

### 1. Drop the project CLAUDE.md into your repo

Copy `project-CLAUDE.md` to the project root, rename to `CLAUDE.md`, and:

- Set `audit.last_reviewed` to today's date
- Set `audit.owner` to the responsible person's email
- Update the version pins (`next_version`, `react_version`, etc.) to your actual stack
- Review the `anchors:` block — remove any anchors that don't apply to your project; add any project-specific anchors you need

### 2. Install the skill globally for Claude Code

```bash
mkdir -p ~/.claude/skills/stack-conventions-auditor
cp stack-conventions-auditor.SKILL.md ~/.claude/skills/stack-conventions-auditor/SKILL.md
```

Then in any project, you can invoke it interactively:

> "Audit my stack conventions"
> "Review my CLAUDE.md against current docs"
> "Is my CLAUDE.md still current?"

### 3. Deploy the Vercel Cron auditor

The cron route handler lives **inside each project** (each project has its own `CLAUDE.md`):

```
app/api/cron/conventions-audit/route.ts
vercel.json   (merge `crons` array if existing)
```

Install dependencies:

```bash
pnpm add @anthropic-ai/sdk @octokit/rest zod
```

Set these environment variables in Vercel project settings:

| Variable | Notes |
|----------|-------|
| `CRON_SECRET` | A 32+ char random string. Vercel sends it as `Authorization: Bearer ...` automatically. |
| `ANTHROPIC_API_KEY` | From the Anthropic console. |
| `GITHUB_TOKEN` | Fine-grained PAT with `Contents: write` and `Pull requests: write` on the repo. |
| `GITHUB_OWNER`, `GITHUB_REPO` | Your repo coordinates. |
| `CLAUDE_MD_PATH` | Defaults to `CLAUDE.md`. Override if the file is elsewhere. |
| `AUDIT_DIR` | Defaults to `audits`. Where audit reports get committed. |
| `BASE_BRANCH` | Defaults to `main`. |

### 4. Test the cron endpoint locally

```bash
curl -H "Authorization: Bearer $CRON_SECRET" \
  http://localhost:3000/api/cron/conventions-audit
```

---

## Schedule

The default schedule is `0 9 1 * *` — 09:00 UTC on the 1st of every month.

Adjust the cron expression in `vercel.json` to taste. Some teams prefer weekly during periods of heavy framework change; quarterly is plenty when the stack is settled.

---

## When the audit fires

Each run produces one of two outcomes:

- **No findings.** The endpoint returns `200` with `{"action":"no-pr"}`. No commit, no PR. The `last_reviewed` date is bumped on the *next* run if any findings appear — or you can bump it manually.
- **Findings.** The endpoint:
  1. Creates branch `audit/conventions-<date>`
  2. Commits the report to `audits/<date>-conventions-audit.md`
  3. Bumps `last_reviewed` in `CLAUDE.md`
  4. Opens a PR titled `🔍 Stack conventions audit — <date>` with the full report as the description

You review during your next sit-down. Merge for valid findings; reject (with a comment) for false positives.

---

## How to extend this example

Things you might want to add when this pattern proves itself:

- **Slack / Teams notification** — POST to a webhook in addition to opening the PR. Useful for shared visibility.
- **Multi-project rollup** — a dashboard route aggregating audit findings across all projects.
- **Auto-merge for MINOR findings** — if the audit only finds version bumps, merge the PR automatically. Reserve human review for MAJOR.
- **Stack variants** — fork the project CLAUDE.md into variants for different stacks (mobile, embedded, low-code platforms, etc.), each with its own anchor set tied to that stack's authoritative sources.

When a variant solidifies, consider lifting it into its own example folder under `examples/`.

---

## Relationship to the framework

This example demonstrates one pattern from one framework lifecycle file:

- **`00-lifecycle/standards-refresh.md`** — the freshness loop pattern that this example instantiates.

It does not change any framework standard. If the auditor finds something that should become a framework rule (rather than a project-level rule), open a separate framework PR — don't smuggle stack-specific rules into framework standards.

---

## File index

| File | Role |
|------|------|
| `README.md` | This guide |
| `project-CLAUDE.md` | The opinionated project-level conventions file with anchors |
| `stack-conventions-auditor.SKILL.md` | The global Claude Code skill that runs the audit |
| `route.ts` | The monthly cron endpoint (project-side) |
| `vercel.json` | The cron schedule |
