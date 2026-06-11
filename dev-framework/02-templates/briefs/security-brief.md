# Security Brief — {{TASK_TITLE}}

> Brief for an InfoSec contributor doing a security review, threat-modelling pass, or audit-prep work.

---

## 1. Context

| | |
|---|---|
| **Scope** | *(link)* |
| **Phase** | 2 (threat-model) / 5 (security review) |
| **Build / version under review** | |
| **Audit framework in play (if any)** | SOC 2 / ISO 27001 / GDPR / HIPAA / PCI / none |
| **Sensitivity of the work** | Routine / Elevated / High-risk |

---

## 2. Read before starting

- **Scope:** `scopes/<feature>.md`
- **Existing threat model:** `threat-models/<feature>-<date>.md` (if any)
- **Standards:**
  - `dev-framework/01-disciplines/infosec/security-baseline.md`
  - `dev-framework/01-disciplines/infosec/secure-coding.md`
  - `dev-framework/01-disciplines/infosec/threat-modeling.md`
  - `dev-framework/01-disciplines/infosec/compliance.md` (if regulated work)
- **Companion docs:**
  - `SECURITY.md`
  - `DATA_INVENTORY.md`
  - `COMPLIANCE_MAPPING.md` (if applicable)

---

## 3. Goal (one sentence)

---

## 4. Tasks

Pick whichever applies; remove the rest.

### Phase 2 — Threat model

- [ ] Identify trust boundaries
- [ ] Walk STRIDE — list threats per category
- [ ] Define mitigations and owners
- [ ] Capture residual risk and review date
- [ ] Save threat model in `threat-models/<feature>-<date>.md`

### Phase 5 — Security review

- [ ] Run the security baseline checklist (`security-baseline.md §10`)
- [ ] Confirm each mitigation in the threat model is implemented
- [ ] Dependency audit (HIGH/CRITICAL clean)
- [ ] Secret scan clean
- [ ] Logging review: no PII; no secrets; structured
- [ ] Compliance touchpoints addressed (if applicable)
- [ ] Save security review in `scopes/<feature>-security-review.md`

---

## 5. Definition of done

- [ ] Required artefact saved (`threat-models/...` or `security-review.md`)
- [ ] Findings categorised by severity (CRITICAL / HIGH / MEDIUM / LOW)
- [ ] Each finding has an owner and a deadline
- [ ] CRITICAL / HIGH findings block deploy until resolved
- [ ] Sign-off recorded

---

## 6. Sign-off

| Role | Signatory | Date |
|------|-----------|------|
| InfoSec Reviewer | | |
| Engineering Lead | | |
| (if applicable) Compliance | | |
