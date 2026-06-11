---
description: Worked examples that show how to instantiate framework patterns in real stacks
last_reviewed: 2026-05-18
review_cadence_days: 180
---

# Examples

This folder holds **worked examples** — concrete instantiations of framework patterns for specific stacks or domains. The framework itself stays agnostic; examples show how to wire it up to a real project.

Examples are intentionally **reference implementations**, not generic templates. They are:

- **Stack-specific** — each example targets one tech stack or one domain.
- **Copyable, not importable** — projects should clone, rename, and customise.
- **Optional** — the framework does not depend on any example. Delete the whole folder and nothing breaks.
- **Loosely versioned** — examples drift faster than the framework itself; expect to update them per release of the underlying stack.

---

## Available examples

| Example | Pattern instantiated | When to look at it |
|---------|---------------------|--------------------|
| [`stack-conventions-auditor/`](stack-conventions-auditor/) | The freshness lifecycle (`00-lifecycle/standards-refresh.md`) applied to a Next.js + Vercel + Neon project | If you are running a Next.js project on Vercel with a Neon database and want the standards-refresh loop wired up automatically |

---

## How to use an example

1. **Read it.** Start with the example's `README.md` to understand what it does and what assumptions it makes.
2. **Copy the relevant files into your project.** Examples include both project-level files (e.g. a project's `CLAUDE.md`, a cron route handler) and global files (e.g. a Claude Code skill). The example README tells you which is which.
3. **Replace placeholders.** Every example has clearly-marked placeholders (owner email, project name, environment variable names). Search-and-replace before deploying.
4. **Don't edit the framework files because of the example.** If the example exposes a gap in a framework standard, raise it as a framework improvement (see `FRAMEWORK.md §9`).

---

## What's *not* in examples

- **Project source code.** Examples carry the patterns and the scaffolding, not the actual feature code.
- **Secrets, environment values, or production data.** Examples are public-safe.
- **Stack-agnostic templates.** Those live in `02-templates/` — they are part of the framework, not examples.

---

## Adding a new example

When a recurring pattern shows up across two or more of your projects, lift it here:

1. Create a folder under `examples/<example-name>/`.
2. Add a `README.md` describing: what pattern it instantiates, what stack it assumes, what files it contains, how to adopt it.
3. Keep the file count small. An example with 20 files is no longer an example.
4. Update this index file.

The bar for adding an example is **the same pattern in two real projects**. Speculative examples become dead weight fast.
