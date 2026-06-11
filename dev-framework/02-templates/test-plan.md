# Test Plan — {{SCOPE_NAME}}

> One per non-trivial scope. Can live inside the scope file's "Test Plan" section, or as a separate `scopes/<feature>-test-plan.md`.

---

## Header

| | |
|---|---|
| **Scope** | *(link to the scope file)* |
| **Owner** | |
| **Status** | Draft / Ready / Executing / Complete |
| **Last updated** | YYYY-MM-DD |

---

## 1. Scope of testing

**In scope:**

- *(what's being tested)*

**Out of scope:**

- *(what's deliberately NOT being tested in this round, with rationale)*

---

## 2. Acceptance criteria

From the scope's Frame section. The test plan must demonstrate each is met.

| # | Criterion | How tested | Result |
|---|-----------|------------|--------|
| 1 | | | Pass / Fail / Partial |
| 2 | | | |

---

## 3. Environments

| Environment | URL / details | Purpose | Owner |
|-------------|---------------|---------|-------|
| Dev / local | | | |
| CI | | | |
| Preview / staging | | | |
| Pre-prod (if any) | | | |

---

## 4. Test data

- **Fixtures:** *(where they live)*
- **Seed scripts:** *(commands)*
- **Anonymisation strategy:** *(if production-derived data is used in lower envs)*
- **Special-case data:** *(e.g. very long names, unicode, edge dates)*

---

## 5. Coverage

| Layer | What's covered | Tooling | Owner |
|-------|----------------|---------|-------|
| Static / type | | Linter, type checker | |
| Unit | | | |
| Integration | | | |
| E2E | | | |
| Manual functional | *(what can't be automated and why)* | | |
| Accessibility | | Automated scanner + manual | |
| Performance | | Web-vitals + load tool | |
| Security | | Dependency audit, secret scan, SAST | |
| Visual regression | (if applicable) | | |

---

## 6. Non-functional tests

| Concern | Target / SLO | Test | Result |
|---------|---------------|------|--------|
| Performance — LCP | < 2.5 s | Web-vitals tool on preview | |
| Performance — INP | < 200 ms | | |
| Performance — CLS | < 0.1 | | |
| Accessibility | WCAG 2.1 AA, zero automated violations | Automated scanner + manual keyboard + screen reader | |
| Security | No HIGH / CRITICAL CVEs | Dependency audit | |
| Load (where relevant) | <project SLO> | Load tool | |

---

## 7. Test scenarios — happy path

Numbered scenarios with steps and expected outcomes.

| # | Scenario | Steps | Expected | Result |
|---|----------|-------|----------|--------|
| H1 | | | | |
| H2 | | | | |

---

## 8. Test scenarios — edge cases and unhappy paths

| # | Scenario | Steps | Expected | Result |
|---|----------|-------|----------|--------|
| E1 | Empty state | | | |
| E2 | Error state | | | |
| E3 | Slow connection | | | |
| E4 | Long input | | | |
| E5 | Permission denied | | | |
| E6 | Concurrent change | | | |
| E7 | Browser back / refresh | | | |

---

## 9. Exit criteria

Testing is "done" when:

- [ ] All acceptance criteria pass.
- [ ] All P1 defects resolved; all P2 defects resolved or explicitly accepted.
- [ ] Coverage targets met per `01-disciplines/qa/test-strategy.md §6`.
- [ ] Non-functional targets met or accepted with rationale.
- [ ] Accessibility audit clean.
- [ ] Security checks clean.
- [ ] Test artefacts retained (logs, screenshots, videos, reports).

---

## 10. Defects

Defects raised during this test cycle. Severity and links to defect records.

| DEF-ID | Title | Severity | Status |
|--------|-------|----------|--------|
| | | P1 / P2 / P3 / P4 | Open / Fixed / Verified / Won't fix |

---

## 11. Sign-off

| Role | Signatory | Date | Notes |
|------|-----------|------|-------|
| QA Lead | | | |
| Engineering Lead | | | |
| Product Owner | | | |
