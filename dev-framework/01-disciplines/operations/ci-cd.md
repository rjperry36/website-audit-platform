---
description: CI / CD — pipeline expectations, gates, branch strategy
last_reviewed: 2026-05-18
review_cadence_days: 90
anchors:
  - id: conventional-commits
    claim: "Conventional Commits is the recommended commit-message convention."
    sources:
      - https://www.conventionalcommits.org/
  - id: trunk-based-development
    claim: "Trunk-based development with short-lived branches is the framework's default branch strategy."
    sources:
      - https://trunkbaseddevelopment.com/
---

# CI / CD

How the project's continuous integration and continuous delivery pipeline supports the framework's lifecycle gates.

---

## 1. The contract

A good pipeline makes the lifecycle gates **enforceable in machinery**, not just norms:

| Gate | What CI/CD does |
|------|-----------------|
| G4 (Built) | Build succeeds; type-check passes; tests pass; lint clean; secret scan clean; dependency audit clean |
| G5 (Verified) | Preview deploy auto-created; E2E tests run; accessibility audit; security scan; performance budget check |
| G6 (Landed) | Merge to main deploys to production; tag the release; notify channels; capture artefacts |

A merge that bypasses CI is a process failure. The pipeline is the second pair of eyes that's always on.

---

## 2. Branch strategy (default)

The framework recommends — but does not mandate — a trunk-based branch strategy:

```
main                    ← always deployable
  └── feat/<feature>    ← short-lived, scoped to one scope or slice
  └── fix/<description> ← short-lived bugfix
  └── chore/<thing>     ← short-lived maintenance
```

- One branch per scope (or per slice of a large scope).
- Branches are short-lived — merge within days, not weeks.
- No long-running parallel branches that drift from main.
- `main` is always deployable to production at any point.

Alternative strategies (GitFlow, release branches) are fine for projects that genuinely need them; the discipline is "main is always deployable" regardless of names.

---

## 3. Slicing for mergeability

Large scopes split into independently mergeable slices:

- **Slice A:** schema + seed (no UI; no breaking changes; mergeable alone)
- **Slice B:** business logic + tests (no routes wired)
- **Slice C:** routes / endpoints (new surface; nothing existing changes)
- **Slice D:** UI wiring (replaces previous behaviour)

Each slice is reviewed, tested, and merged before the next starts. Keeps `main` clean and makes rollback trivial.

---

## 4. Commit discipline

- Small, focused commits — one logical change per commit.
- Commit message format: Conventional Commits (or the project's chosen convention).
  - `feat:` new feature
  - `fix:` bug fix
  - `chore:` schema, config, deps
  - `refactor:` no behaviour change
  - `test:` tests only
  - `docs:` documentation only
- No "WIP" commits on `main`.

---

## 5. Required pipeline steps

Minimum CI for any code project:

| Step | When |
|------|------|
| Install dependencies (cached) | Every run |
| Lint | Every run |
| Type check | Every run |
| Unit tests | Every run |
| Integration tests | On PRs to `main` |
| E2E (smoke) | On PRs to `main` |
| Build production artefact | On PRs to `main` |
| Secret scan | Every run |
| Dependency audit | Every run; HIGH/CRITICAL block merge |
| Accessibility (automated scanner) | On PRs to `main` for any UI change |
| Preview deploy | On every branch push |

Steps run in parallel where possible. The slowest step bounds time-to-feedback.

---

## 6. Deployment environments

| Environment | Branch | Audience |
|-------------|--------|----------|
| Local / dev | (any) | The developer |
| Preview / per-PR | feature branches | Reviewers, designers, QA, stakeholders |
| Staging (optional) | a long-lived branch or main | Pre-prod validation; performance / load testing |
| Production | `main` | End users |

Production deploys are automated from main but can be gated (manual approval, time-window) for high-risk projects.

---

## 7. Deployment safety

- **Database migrations** run before code that depends on them — and are backwards-compatible for one release where possible.
- **Feature flags** for risky changes — ship dark, enable in a window, monitor, roll out.
- **Canary / progressive rollout** for high-traffic services — 1% → 10% → 50% → 100% with metrics gates between.
- **Automatic rollback** if SLO breach thresholds are crossed within a defined window post-deploy.

---

## 8. Observability

Every deploy must produce:

- A traceable artefact (commit SHA, version tag, build ID).
- Logs that include the build / version.
- Health-check endpoints that downstream monitoring uses.
- Alerts when error rate or latency deviates from baseline.

A deploy that "works" but has no observability is a deploy that's broken silently.

---

## 9. Pre-implementation checklist

```
[ ] Branch strategy documented in CONVENTIONS.md
[ ] Commit message convention documented and enforced
[ ] CI pipeline runs all required steps and blocks merge on failure
[ ] Preview deploys auto-created per branch
[ ] Migration strategy documented (additive-first; reversible where possible)
[ ] Feature flag mechanism in place for risky changes
[ ] Observability hooks present (logs, metrics, health checks)
[ ] Rollback procedure tested at least once per release cycle
```
