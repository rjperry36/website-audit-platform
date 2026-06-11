# Threat Model — {{FEATURE_OR_SCOPE_NAME}}

> Lightweight STRIDE-based threat model. Lives inside a scope file or as a standalone `threat-models/<feature>-<date>.md`.

---

## Header

| | |
|---|---|
| **Scope / feature** | *(link to the scope)* |
| **Date** | YYYY-MM-DD |
| **Author** | |
| **Reviewers** | |
| **Last reviewed** | YYYY-MM-DD |

---

## 1. Scope of the model

What this model covers and what's out of scope.

- **In scope:** *(systems / flows / data covered)*
- **Out of scope:** *(what's intentionally not modelled — and why)*

---

## 2. Assets

What's worth protecting in this feature?

| Asset | Why it matters | Classification |
|-------|----------------|----------------|
| | | Public / Internal / Confidential / Restricted |

---

## 3. Data flow

A short description (and / or diagram) of how data enters, moves, and is stored.

```
User input  →  Validation  →  DB write  →  Audit log
                                       ↘  Email queue  →  Mail provider
```

---

## 4. Trust boundaries

The points where untrusted data meets trusted code, or where credentials change.

- *(e.g. "HTTP boundary between browser and server API")*
- *(e.g. "Trust boundary between project DB and the email vendor")*

---

## 5. Threats (STRIDE)

For each category, list threats that apply. Many features won't have entries in every category — that's fine; list "None identified" explicitly.

### Spoofing — identity / authentication

| ID | Threat | Likelihood | Impact | Mitigation | Owner | Status |
|----|--------|------------|--------|------------|-------|--------|
| S1 | | Low / Med / High | Low / Med / High | | | Open / Mitigated / Accepted |

### Tampering — data integrity

| ID | Threat | Likelihood | Impact | Mitigation | Owner | Status |
|----|--------|------------|--------|------------|-------|--------|
| T1 | | | | | | |

### Repudiation — auditability

| ID | Threat | Likelihood | Impact | Mitigation | Owner | Status |
|----|--------|------------|--------|------------|-------|--------|
| R1 | | | | | | |

### Information disclosure — confidentiality

| ID | Threat | Likelihood | Impact | Mitigation | Owner | Status |
|----|--------|------------|--------|------------|-------|--------|
| I1 | | | | | | |

### Denial of service — availability

| ID | Threat | Likelihood | Impact | Mitigation | Owner | Status |
|----|--------|------------|--------|------------|-------|--------|
| D1 | | | | | | |

### Elevation of privilege — authorisation

| ID | Threat | Likelihood | Impact | Mitigation | Owner | Status |
|----|--------|------------|--------|------------|-------|--------|
| E1 | | | | | | |

---

## 6. Residual risk

Threats knowingly accepted, with rationale and revisit date.

| ID | Risk accepted | Rationale | Revisit by | Approver |
|----|---------------|-----------|------------|----------|
| | | | | |

---

## 7. Open questions

Anything that needs answering before this feature can ship.

- CONFIRM: ...

---

## 8. Review log

| Date | Reviewer | Notes |
|------|----------|-------|
| | | |
