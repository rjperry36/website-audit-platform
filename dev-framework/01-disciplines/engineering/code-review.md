---
description: Code review — how to review, what to look for, how to give feedback
last_reviewed: 2026-05-18
review_cadence_days: 90
---

# Code Review

Code review is part of Phase 5 (Verify). It is not a vibe check — it follows a structured checklist and produces a recorded outcome.

The reviewer is the second pair of eyes that the framework explicitly requires. For small work, the reviewer can be the same person revisiting the work after a delay. For larger work, the reviewer is a different person.

---

## 1. What review is for

| Catches | Doesn't catch (test for these) |
|---------|--------------------------------|
| Wrong patterns; misuse of standards | Logical bugs in unfamiliar logic |
| Security issues a checklist surfaces | Performance regressions in production-like data |
| Naming, readability, future-maintainability | Race conditions under load |
| Missing tests, missing error states | UX issues only visible on a real device |
| Drift from the design system or architecture | Accessibility issues a screen reader would catch |

Review is necessary but not sufficient. It complements automated tests, security tooling, design reviews, and accessibility audits — it doesn't replace any of them.

---

## 2. The review pass

A reviewer reads the diff in this order:

1. **Scope first.** Read the scope file's Goal and Plan. Is the diff what was planned? Anything outside the plan?
2. **Tests.** Are there tests for the new behaviour? Do the tests verify the **behaviour** rather than the implementation?
3. **Public surface.** Read public APIs / exported types / route handlers before reading their internals. Is the surface coherent?
4. **Implementation.** Read the actual code. Look for the items on the checklist below.
5. **Diff hygiene.** Are there unrelated changes? Whitespace-only files? Commented-out blocks?

---

## 3. The review checklist

```
SCOPE
[ ] Diff matches the Plan; deviations recorded in the scope
[ ] No "while I'm here" unrelated changes

STANDARDS
[ ] Coding standards followed (naming, structure, no banned patterns)
[ ] Error handling: loading / error / empty states present
[ ] API design: standard response shape, validation, status codes
[ ] Security: auth on protected handlers, no secrets, no PII in logs, no SELECT *
[ ] Performance: server/client correct, images optimised, caching deliberate
[ ] Accessibility: semantic HTML, labels, focus, contrast (if UI)

TESTS
[ ] Tests exist for new behaviour
[ ] Tests verify behaviour, not implementation
[ ] No .skip / .only / commented-out tests left
[ ] Coverage targets met (see qa/test-strategy.md)

TYPES
[ ] No new `any` / type escape hatches
[ ] Public functions have explicit signatures
[ ] Null-safety enforced

CHANGE RECORDS
[ ] Scope file updated to match what was built
[ ] Decision Log entries for in-scope decisions
[ ] Decision records for cross-cutting decisions
[ ] Migration / change request exists if production behaviour changed
```

---

## 4. Giving feedback

- **Lead with what works.** Reviewers who only criticise build adversarial culture. Note good choices explicitly; they're not free.
- **Separate must-fix from suggestion.** Prefix or label each comment: `NIT:` (taste; reviewer can be overruled), `ASK:` (clarifying question), `NEEDS-FIX:` (blocks merge), `BLOCKING:` (severity 1).
- **Critique the code, not the author.** "This function is hard to read because of nested conditions" — not "you wrote unreadable code."
- **Give the fix when you can.** A suggested patch is more useful than a complaint.
- **Pick your battles.** Five sharply-aimed comments beat fifty scattered ones.

---

## 5. Receiving feedback

- **Address every comment.** Either implement the suggestion, push back with a reason, or accept the suggestion with a note.
- **Don't argue scope.** If a comment is out of scope, log it as a follow-up; don't expand the current work to swallow it.
- **Be quick.** Long-lived branches rot. Aim to resolve a review within one working day end-to-end.

---

## 6. Severity-1 stoppers

These block merge regardless of project pressure:

- Secret / credential committed
- Auth bypass / privilege escalation
- SQL injection / XSS / SSRF / CSRF surface
- Permission system inverted (denies become allows or vice versa)
- Data loss path (DROP without WHERE, untested migration on real data)
- Public endpoint without rate limiting

If a S1 stopper is found, the work returns to Phase 4. There is no "we'll fix it after merge."

---

## 7. Recording the review

For non-trivial work, the review outcome is recorded in the scope file's `Gate Log` (G4 or G5 entry) — reviewer name, date, pass/fail/conditional, notes. The PR conversation is the rationale; the scope file is the record.

---

## 8. The "one-letter rule"

If the only feedback on a substantial change is a single "LGTM," the review wasn't thorough. Either the reviewer is rubber-stamping (a problem) or the work was so small that the time should have been compressed (also fine). Either way, log honestly.
