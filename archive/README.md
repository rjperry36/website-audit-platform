# Archive

Historical artifacts preserved on Dev Framework adoption (2026-05-21).

Nothing in this folder is operational. Code does not reference these files. They are kept for context and audit, not for use.

| File | Original location | Why kept |
|---|---|---|
| `PROJECT_NOTES-2026-05-14.md` | repo root as `PROJECT_NOTES.md` | The 30k-word deep-read of the codebase from 2026-05-14. Its substantive content was lifted into `PROJECT_BRIEF.md` and the seed ADRs `decisions/0001-…` through `0006-…`. Kept for the level of detail those documents do not carry. |
| `SYSTEM_PROMPT-original.md` | repo root as `SYSTEM_PROMPT.md` | The original "SiteAudit Agent" specification — much grander than what was built. Kept as design history per `PROJECT_BRIEF.md` §9. Do not treat as a spec of what runs. |
| `README-original.md` | repo root as `README.md` | The original README. Replaced by a short, honest README on adoption. Original made claims about Playwright/Puppeteer, Google Antigravity, and CLI commands that the codebase does not implement. |
| `docs-original/` | repo root as `docs/` | Original `component-checklist.md`, `design-system.md`, `seo-audit-criteria.md`, `knowledge-graph.md`. Their content will be re-evaluated when `ui-agent` and `content-agent` personas come online. Until then, treat as reference, not authority. |

If you find code that references any of these paths, that is a bug — please raise it.
