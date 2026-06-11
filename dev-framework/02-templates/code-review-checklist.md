# Code Review Checklist — {{PR_OR_SCOPE_TITLE}}

> Used by reviewers at Phase 5 (Verify) before merge. Can be pasted into a PR comment or recorded in the scope's `Gate Log`.

---

## SCOPE

- [ ] Diff matches the Plan; deviations recorded in the scope
- [ ] No "while I'm here" unrelated changes
- [ ] Scope file's `Decision Log` updated for in-scope decisions
- [ ] Decision records exist for cross-cutting decisions

## STANDARDS

- [ ] Coding standards followed (naming, structure, no banned patterns)
- [ ] Error handling: loading / error / empty states present
- [ ] API design: standard response shape, validation, status codes
- [ ] Security: auth on protected handlers, no secrets, no PII in logs, no SELECT *
- [ ] Performance: server/client correct, images optimised, caching deliberate
- [ ] Accessibility: semantic HTML, labels, focus, contrast (if UI)

## TESTS

- [ ] Tests exist for new behaviour
- [ ] Tests verify behaviour, not implementation
- [ ] No `.skip` / `.only` / commented-out tests left
- [ ] Coverage targets met (see `01-disciplines/qa/test-strategy.md`)

## TYPES

- [ ] No new `any` / type escape hatches
- [ ] Public functions have explicit signatures
- [ ] Null-safety enforced

## CHANGE RECORDS

- [ ] Scope file updated to match what was built
- [ ] Migration / change request exists if production behaviour changed
- [ ] Threat model updated if attack surface changed

## SEVERITY-1 STOPPERS (any one blocks merge)

- [ ] No secret / credential committed
- [ ] No auth bypass / privilege escalation
- [ ] No SQL injection / XSS / SSRF / CSRF surface
- [ ] No permission inversion
- [ ] No data loss path (drops without WHERE, untested migrations)
- [ ] No public endpoint without rate limiting

---

## Outcome

- [ ] **Approved** — merge
- [ ] **Approved with non-blocking comments** — address before merge but no re-review
- [ ] **Changes requested** — fix and re-request review
- [ ] **Blocked** — S1 issue found; return to Phase 4

Reviewer: _____________________
Date: _____________________
