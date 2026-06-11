---
description: Test strategy — what to test, what NOT to test, the testing pyramid in practice
last_reviewed: 2026-05-18
review_cadence_days: 90
---

# Test Strategy

Read at Phase 2 of any non-trivial scope. The goal is not coverage percentages — it is **confidence that the critical paths can't break silently**.

---

## 1. What gets tested

Focus tests on code (or flows) where a bug causes one of these:

- A user-facing failure (primary CTA path, search, signup, checkout)
- A security vulnerability (auth, validation, rate limiting, secret handling)
- Data corruption (writes, publish, billing, anything that changes state)
- Regulatory exposure (consent, retention, audit trail)

### Required (no exceptions)

| Area | Why |
|------|-----|
| API input validation | Bad input must be rejected correctly |
| Auth and authorisation | Privileged operations cannot be called by unprivileged callers |
| Rate limits | Abuse protection actually works |
| File upload validation | Server-side type + size enforced |
| Slug / URL / identifier generation | Slug bugs break SEO and links permanently |
| Email / message template construction | Prevents XSS and malformed recipient fields |
| Anything financial | Money calculations are integer-correct; rounding is explicit |
| Anything in the regulated set | Consent capture, retention enforcement, data export |

### Strongly recommended

| Area | Why |
|------|-----|
| External integrations | Mock the wire; verify behaviour isolated from vendor |
| Cache invalidation | Easy to forget; tests catch missing invalidations |
| AI output handling | LLM output formats change; tests catch regressions |
| Date / time / timezone logic | Source of many late-night bugs |

### Often skipped (legitimately, in some cases)

| Area | When skippable |
|------|----------------|
| Pure UI snapshot tests | If they only test that the snapshot equals itself, they're noise; cover behaviour instead |
| Trivial getters/setters | If the code is so simple a test is more code than the thing, the test isn't earning |
| Third-party library internals | They have their own tests; you're testing your wiring |

---

## 2. The pyramid — in practice

```
                ▲   E2E / system tests             few, slow, full-confidence
               ───
              integration tests                 medium count, medium speed
             ───────
            unit tests                       many, fast, focused
           ─────────
          static + type checks              effectively free, always on
```

| Layer | Examples | Cost | Quantity |
|-------|----------|------|----------|
| Static / type checks | Linter, type checker, format check | Cheap | Continuous |
| Unit | Pure functions, validators, utilities | Fast | Many |
| Integration | API + DB, multi-module flows | Slower | Medium |
| E2E / System | Full user flow through real browser / app | Slow | Few but critical |

A project that has 1,000 unit tests and zero E2E tests has a confidence gap. A project that has 50 E2E tests and zero unit tests has a maintenance problem. Aim for the pyramid.

---

## 3. Test plan structure (per scope)

Every non-trivial scope has a test plan inside it (or as a separate file using `02-templates/test-plan.md`):

```markdown
## Test plan
- Scope: <what's in / out of test>
- Environments: <which environments tests run on>
- Test data: <fixtures, anonymisation strategy, where data lives>
- Tools: <test runners, browsers, mobile devices>
- Coverage:
  - Unit: <what's covered>
  - Integration: <what's covered>
  - E2E: <user flows covered>
  - Manual: <what can't be automated and why>
  - Accessibility: <automated scanner + manual keyboard + screen reader>
- Exit criteria: <when is testing "done">
- Out of scope: <what we are deliberately NOT testing this release>
```

---

## 4. Environments

| Environment | Purpose |
|-------------|---------|
| Local / dev | Developer's machine; unit + integration on a local DB |
| CI | Every PR / branch; full unit + integration; smoke E2E |
| Preview / staging | Per-PR or per-feature; full E2E; pre-merge manual checks |
| Production-mirror / pre-prod | (Optional) — for high-risk or regulated work, an environment that matches prod |
| Production | Synthetic / canary tests only — never real test data |

Never use production data in lower environments unless it's properly anonymised — see `infosec/compliance.md` and the data-governance standard.

---

## 5. Test data

- **Fixtures** under version control for deterministic test runs.
- **Seed scripts** to populate environments — repeatable, idempotent, parameterised.
- **No real PII** in fixtures committed to the repo.
- **Synthetic data generators** for high-volume / load scenarios.

---

## 6. Coverage targets

| Area | Minimum coverage |
|------|------------------|
| Critical paths (auth, payment, primary CTA) | Behaviour fully exercised — E2E + integration |
| Validation logic | 90%+ unit |
| Utility functions | 80%+ unit |
| UI components | Behaviour, not implementation. No minimum % — test what the user does |
| Generated code | Coverage doesn't apply — covered by upstream tests |

Coverage is a signal, not a goal. A 95%-coverage project with 0 tests on the payment flow is more dangerous than a 60%-coverage project with payment fully tested.

---

## 7. When tests fail

| Failure type | Action |
|--------------|--------|
| Flake (passes on retry) | Investigate within 24 hours. Quarantine the test if needed but **log** the flake — repeated quarantines are the smell |
| Real failure | Stop the merge. Fix or revert |
| Test no longer applies | Update or delete the test; don't comment it out |

Disabled tests are technical debt that compounds. Audit `.skip` / `.only` / `xit` / pending tests every release.

---

## 8. Non-functional tests

Beyond functional correctness:

- **Performance** — load tests for critical endpoints; bundle size budgets in CI; web-vitals audit against preview deployments
- **Accessibility** — automated scanner in CI; manual keyboard pass at Phase 5; screen reader spot check
- **Security** — dependency audit in CI; secret scanning; dynamic-application security testing (DAST) for web apps on pre-production
- **Visual regression** — for design-heavy projects, a screenshot diff tool catches unintended visual drift

(See `RECOMMENDED-TOOLS.md` for examples per category.)

---

## 9. Pre-implementation checklist (writing the test plan)

```
[ ] Test plan written into the scope
[ ] Critical paths identified and covered at the right level
[ ] Environments listed
[ ] Test data strategy decided (fixtures, seeds, anonymisation)
[ ] Coverage targets aligned with risk
[ ] Non-functional tests in scope (perf, a11y, security)
[ ] Exit criteria explicit
[ ] Out-of-scope items listed (so they're not silently dropped)
```
