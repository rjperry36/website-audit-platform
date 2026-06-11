# WEBChecker

A brand-intelligence platform combining an AI-driven web-audit pipeline (SEO / AEO / GEO / UX / Security / AI visual analysis) with a planning surface for briefs, market plans, and channel objectives.

## Quick start

```bash
git clone https://github.com/rjperry36/website-audit-platform.git
cd website-audit-platform
npm install
cp .env.example .env.local   # fill in Supabase, OpenAI, ScreenshotOne, CRON_SECRET
npm run dev
```

Open <http://localhost:3000>.

## Where everything lives

| Topic | File |
|---|---|
| What the project is, who it's for, how it's run | `PROJECT_BRIEF.md` |
| How work moves through the project (process, gates, templates) | `CLAUDE.md` and `dev-framework/` |
| Decisions and their rationale | `decisions/NNNN-*.md` |
| Active work | `scopes/<slug>.vN.md` |
| Historical reference (original spec, study notes, pre-framework docs) | `archive/` |

## Process

Every non-trivial piece of work follows the six-phase lifecycle defined in `dev-framework/00-lifecycle/lifecycle.md`. AI assistants working in this repo are oriented by `CLAUDE.md` and the agent personas under `.claude/agents/`.

## License

MIT
