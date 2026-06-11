# Dev Framework

A drop-in, project-agnostic process for delivering digital work — code, UI, UX, QA, UAT, security, content, ops — to a consistent standard.

It is opinionated about **how** work moves through a project (phases, gates, decision records) and opinionated about **what good looks like** within each discipline (checklists, standards, templates). It is deliberately silent about the *content* of any one project — the bits that vary live in templates you fill in once at the start.

---

## What's in the box

| Folder | Purpose |
|--------|---------|
| `00-lifecycle/` | The universal six-phase lifecycle (Frame → Plan → Standards → Execute → Verify → Land), the Goal–Plan–Act engine that drives each phase, the quality gates between phases, and the RACI for who does what. |
| `01-disciplines/` | The standards for each discipline — coding, UI, UX, QA, UAT, InfoSec, content, operations, data. Each discipline is a module; a project enables only the modules it needs. |
| `02-templates/` | The files you copy into a project and fill in. Project-specific content lives only here — never in the framework files. |
| `examples/` | Optional, stack-specific worked examples that show how to instantiate framework patterns in real projects. Safe to ignore or delete on a per-project basis. |
| `FRAMEWORK.md` | One-page overview of the philosophy and structure. |
| `RECOMMENDED-TOOLS.md` | Optional appendix of example tools per category. The framework rules do not depend on this file. |
| `CLAUDE.md.template` | Optional orchestrator for agentic projects. Rename to `CLAUDE.md` in the project root if you use an AI coding assistant (see `RECOMMENDED-TOOLS.md`). |

---

## How to drop it in

For any new or existing project:

1. Copy this `dev-framework/` folder into the project root.
2. Open `02-templates/project-brief.md` and fill it in — this captures the project-specific context (name, stakeholders, domain, tech stack, brand).
3. In `01-disciplines/_index.md`, mark the disciplines that apply to this project. Disable the rest.
4. Copy `02-templates/scope.md` to `scopes/<first-piece-of-work>.md` and start at Phase 1 (Frame) of the lifecycle.
5. Optional: copy `CLAUDE.md.template` to the project root as `CLAUDE.md` if you want an AI assistant to follow the same process automatically.

After that, every piece of work follows the lifecycle and uses the templates. The framework files themselves never need editing per-project — only the templates do.

---

## The thirty-second mental model

```
Every piece of work follows six phases:

  Frame ──▶ Plan ──▶ Standards ──▶ Execute ──▶ Verify ──▶ Land

  └ understand ┘ └ choose how ┘ └ what to apply ┘ └ build ┘ └ check ┘ └ ship + record ┘

Inside Plan + Execute, the engine is Goal–Plan–Act:

  GOAL  — state what we're doing in one sentence; flag every unknown
  PLAN  — list every file, function, test, decision; stop if anything is unconfirmed
  ACT   — execute the plan exactly; stop and report if reality diverges

The standards that apply are decided by which disciplines the project has enabled.
The output of every piece of work is a scope file plus any new decision records.
```

---

## What this framework deliberately is *not*

- **Not a methodology.** It works the same in Scrum, Kanban, Waterfall, or none of the above. Pick a cadence; the framework slots in.
- **Not a stack.** No assumptions about language, framework, hosting, or vendor. The standards are framework-agnostic; project-specific tech choices go in the project brief and the relevant decision records.
- **Not a documentation system.** It is a process. Documentation is a *consequence* — scope files, decision records, runbooks — not the goal.
- **Not a substitute for taste.** Standards reduce variance; they do not replace judgement. Every checklist has an "explicit deviation, with reason" path.

---

## Versioning this framework

Treat this folder like a library you've vendored.

- Pin a version (`FRAMEWORK_VERSION` in `FRAMEWORK.md`).
- When you improve a standard inside one project, decide whether the improvement is project-specific (leave it local) or universal (lift it back into the framework and bump the version).
- Avoid silent drift between projects.

---

## Where to start reading

- New to the framework → `FRAMEWORK.md` then `00-lifecycle/lifecycle.md`
- Starting a project → `02-templates/project-brief.md`
- Doing a piece of work → `00-lifecycle/lifecycle.md` then `01-disciplines/_index.md`
- Reviewing someone else's work → `02-templates/code-review-checklist.md` and the relevant discipline `_index.md`
