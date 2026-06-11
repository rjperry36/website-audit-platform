---
description: Data governance — inventory, classification, retention, access, lifecycle
last_reviewed: 2026-05-18
review_cadence_days: 90
anchors:
  - id: gdpr-article-30
    claim: "GDPR Article 30 requires a documented record of processing activities."
    sources:
      - https://gdpr-info.eu/art-30-gdpr/
  - id: gdpr-lawful-basis
    claim: "GDPR Article 6 lawful bases govern processing of personal data."
    sources:
      - https://gdpr-info.eu/art-6-gdpr/
  - id: gdpr-special-category
    claim: "GDPR Article 9 special categories require an additional condition for processing."
    sources:
      - https://gdpr-info.eu/art-9-gdpr/
---

# Data Governance

Read at Phase 2 whenever new data is captured, transformed, or moved. Pairs with `infosec/compliance.md` for regulatory aspects.

---

## 1. The data inventory

Every project that handles personal, regulated, or otherwise sensitive data maintains `DATA_INVENTORY.md` at the project root. Each dataset gets a row:

| Field | Example |
|-------|---------|
| Dataset name | `customer_orders` |
| Description | One sentence of what's in it |
| Source | Where the data comes from (form, vendor, internal system) |
| Classification | Public / Internal / Confidential / Restricted |
| Personal data? | Yes / No; if yes, lawful basis (GDPR Art. 6) |
| Special category? | Yes / No; if yes, GDPR Art. 9 condition |
| Storage location | DB table / object store / vendor system |
| Access list | Roles that can read; how access is granted |
| Retention | How long it's kept; how it's deleted |
| Backup policy | Where backups live; retention; encryption |
| Owner | Named individual |
| Risk tier | Low / Medium / High / Critical |

The inventory is updated **before** new data is captured, not after.

---

## 2. Classification

| Class | Definition | Handling |
|-------|------------|----------|
| **Public** | Intended for public release; no sensitivity | Standard care |
| **Internal** | Not public but no individual risk | Authenticated access only |
| **Confidential** | Loss would damage individuals or the business | Authenticated + authorised; logged access |
| **Restricted** | Regulatory or contractual restrictions | Audit-trailed; least-privilege; encrypted at rest with managed keys |

Personal data is at minimum Confidential. Sensitive personal data (health, biometric, sexual orientation, etc.) is Restricted.

---

## 3. Retention

Every dataset has a retention period. Reasons it matters:

- **Legal** — GDPR data minimisation; HIPAA; PCI; sector-specific rules.
- **Risk** — data you don't have can't be breached.
- **Cost** — storage compounds; old data without value compounds the cost.

Retention is **enforced**, not just declared. The implementation is typically:

- A scheduled job that deletes (or archives) data past its retention window.
- A runbook documenting the procedure.
- Monitoring that confirms it ran.

A dataset declared "30-day retention" with no enforcement is a 30-day claim, not a 30-day policy.

---

## 4. Access

- **Least privilege.** A role can read what it needs and nothing else.
- **Role-based, not user-based.** Roles persist; users come and go.
- **Periodic access reviews** — quarterly or per the compliance framework. Runbook in `operations/runbooks/`.
- **Logged access** for Confidential / Restricted data — who saw what, when.

---

## 5. Data lifecycle

```
Capture  →  Validate  →  Store  →  Use  →  Archive  →  Delete
```

Each stage has obligations:

- **Capture:** lawful basis, consent where required, minimum necessary.
- **Validate:** type, integrity, anonymisation/pseudonymisation if applicable.
- **Store:** classified, encrypted as required, access-controlled.
- **Use:** logged where Restricted; sharing rules enforced.
- **Archive:** when active use ends but retention obligations remain.
- **Delete:** verified, including backups and indexes.

---

## 6. Cross-environment movement

Production data moving to lower environments is a common compliance hotspot:

- **Default:** don't. Use synthetic or anonymised data in dev / staging.
- **If genuinely necessary:** anonymise / pseudonymise irreversibly before copying. Record the procedure in a runbook.
- **Never:** copy raw production data to a developer's laptop.

---

## 7. Third-party data sharing

- Every third party receiving data is named in the inventory.
- A contract / DPA is in place where required.
- The lawful basis covers the third-party processing.
- Data shared is the minimum necessary.
- Termination procedure documented — what happens to the data when the relationship ends.

---

## 8. Subject rights (cross-reference)

See `infosec/compliance.md §5`. Each subject right has a runbook; the data inventory underpins the ability to fulfil them (you can't honour an erasure request if you don't know where the data is).

---

## 9. Pre-implementation checklist

```
[ ] New dataset added to DATA_INVENTORY.md with all fields
[ ] Classification assigned
[ ] Lawful basis identified for personal data
[ ] Retention period set; enforcement mechanism in place
[ ] Access list reviewed; least-privilege applied
[ ] Backup policy aligned with retention
[ ] Third-party sharing reviewed (if applicable); DPA in place
[ ] Subject-rights processes cover this data type
[ ] Anonymisation procedure for lower environments documented
```
