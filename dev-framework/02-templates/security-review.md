# Security Review — {{SCOPE_NAME}}

> Completed at Phase 5 for any scope that touches authentication, authorisation, sensitive data, public attack surface, or any item flagged in the scope's threat model.
>
> Lives inside the scope file or as `scopes/<feature>-security-review.md`.

---

## Header

| | |
|---|---|
| **Scope** | *(link)* |
| **Reviewer** | |
| **Date** | YYYY-MM-DD |
| **Build / version reviewed** | |
| **Threat model reference** | *(link to threat-model file or section)* |

---

## 1. Scope of review

What was reviewed and what was deliberately out of scope.

- **In scope:** ...
- **Out of scope:** ...

---

## 2. Security baseline checklist

(From `01-disciplines/infosec/security-baseline.md §10`)

```
[ ] All new server-side handlers have an auth check at the top
[ ] All new public endpoints either validate auth or are explicitly public
[ ] No dangerouslySetInnerHTML / v-html / equivalent without sanitisation
[ ] No new secrets in source; secret scan clean
[ ] No PII in migrations / fixtures / logs
[ ] File uploads validated server-side (type + size)
[ ] New DB tables have access controls — no "enable all" dev policies
[ ] No SELECT * on public endpoints
[ ] No PII in logs
[ ] Cron/webhook routes check the shared secret
[ ] External links use rel="noopener noreferrer"
[ ] User input escaped before HTML email embedding
[ ] Error messages generic to client; full detail logged server-side
[ ] Security headers set in framework config
[ ] Dependency audit clean of HIGH/CRITICAL
[ ] Threat model updated if attack surface changed
```

Each item: ✅ pass / ⚠ partial (with note) / ❌ fail.

---

## 3. STRIDE walk-through

For each threat in the scope's threat model, confirm the mitigation is implemented.

| Threat ID | Category | Mitigation | Implemented? | Evidence |
|-----------|----------|------------|--------------|----------|
| T1 | | | Yes / No / Partial | |
| T2 | | | | |

---

## 4. Data classification check

For any new data captured or transformed:

| Data element | Classification | Handling correct? | Evidence |
|--------------|----------------|-------------------|----------|
| | Public / Internal / Confidential / Restricted | Yes / No | |

---

## 5. Dependency review

- Dependency audit: ✅ clean / ⚠ findings listed below.
- Findings:

| Package | Severity | CVE / advisory | Action |
|---------|----------|----------------|--------|
| | | | |

---

## 6. Logging and observability

- [ ] No PII or secrets in new logs
- [ ] Structured log format used
- [ ] Auth events logged (login, logout, permission change, failure)
- [ ] Correlation IDs present
- [ ] Anomaly alerts in place for the new surface

---

## 7. Compliance touchpoints

If the project is in scope for SOC 2 / ISO 27001 / GDPR / HIPAA / PCI:

| Control | Framework reference | Status | Evidence |
|---------|---------------------|--------|----------|
| | | | |

---

## 8. Findings

Findings are categorised by severity. Each finding has an owner and a deadline.

### CRITICAL

*(Production block. Must fix before deploy.)*

| Finding | File / Area | Action | Owner | Deadline |
|---------|-------------|--------|-------|----------|
| | | | | |

### HIGH

*(Fix before next release at the latest.)*

### MEDIUM

*(Schedule into the next sprint.)*

### LOW / INFORMATIONAL

*(Backlog; may be batched.)*

---

## 9. Outcome

- [ ] **Pass** — no open CRITICAL or HIGH findings; deploy approved.
- [ ] **Conditional pass** — open findings remediated within the agreed window; deploy approved with follow-up tracker.
- [ ] **Fail** — open findings block deploy; scope returns to Phase 4.

---

## 10. Sign-off

| Role | Signatory | Date |
|------|-----------|------|
| InfoSec Reviewer | | |
| Engineering Lead | | |
| (if applicable) Compliance | | |
