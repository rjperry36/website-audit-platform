---
description: Compliance touchpoints — frameworks, evidence, data governance interactions
last_reviewed: 2026-05-18
review_cadence_days: 30
anchors:
  - id: soc-2-trust-services
    claim: "SOC 2 covers the Trust Services Criteria: security, availability, processing integrity, confidentiality, and privacy."
    sources:
      - https://www.aicpa-cima.com/topic/audit-assurance/audit-and-assurance-greater-than-soc-2
  - id: iso-27001
    claim: "ISO/IEC 27001 specifies requirements for an information security management system."
    sources:
      - https://www.iso.org/standard/27001
  - id: gdpr-article-30
    claim: "GDPR Article 30 requires a documented record of processing activities."
    sources:
      - https://gdpr-info.eu/art-30-gdpr/
  - id: gdpr-subject-rights
    claim: "GDPR subject rights include access, rectification, erasure, portability, and objection."
    sources:
      - https://gdpr-info.eu/chapter-3/
  - id: gdpr-breach-notification
    claim: "GDPR breach notification to the supervisory authority must occur within 72 hours where feasible."
    sources:
      - https://gdpr-info.eu/art-33-gdpr/
  - id: hipaa-security-rule
    claim: "HIPAA Security Rule requires administrative, physical, and technical safeguards."
    sources:
      - https://www.hhs.gov/hipaa/for-professionals/security/index.html
  - id: pci-dss
    claim: "PCI DSS applies to any organisation handling payment card data."
    sources:
      - https://www.pcisecuritystandards.org/document_library/
---

# Compliance Touchpoints

Read at Phase 2 when work touches regulated data, audit-scoped systems, or compliance posture. Compliance is a framework concern that lives across InfoSec, Data, and Operations.

The framework does not implement compliance — your compliance team or external assessor does. The framework's job is to make the *evidence* available and the *controls* discoverable.

---

## 1. Mapping controls to standards

Compliance is easier when controls are mapped explicitly. Maintain a `COMPLIANCE_MAPPING.md` (project-level) that maps each requirement to the standard or process satisfying it:

| Control | Framework reference | Where it's implemented |
|---------|---------------------|------------------------|
| Encryption in transit | SOC 2 CC6.1, ISO A.10 | `infosec/security-baseline.md §6 HTTPS headers`; infrastructure config |
| Access reviews | SOC 2 CC6.3 | `operations/runbooks.md` — access-review runbook |
| Data inventory | GDPR Art. 30 | `data/data-governance.md`; `data-inventory.md` companion |
| Change records | SOC 2 CC8.1 | `operations/change-management.md`; `decisions/` |
| Encryption at rest | SOC 2 CC6.1, ISO A.10 | Cloud config + ORM-level field encryption where required |
| Vulnerability management | SOC 2 CC7.1 | `infosec/secure-coding.md §11`; CI dependency audit |
| Logging & monitoring | SOC 2 CC7.2 | `infosec/security-baseline.md §9` |
| Incident response | SOC 2 CC7.4 | `operations/incident-management.md`; on-call runbook |
| Backup & recovery | SOC 2 A1.2 | `operations/runbooks.md` — backup runbook |

When a new control is needed, add it to the mapping **before** implementing.

---

## 2. Evidence collection

For audit-scoped systems, evidence is not optional. The pattern:

- **Continuous evidence** — logs, configuration snapshots, infrastructure-as-code commits.
- **Periodic evidence** — access reviews, vulnerability scans, training records.
- **On-event evidence** — incident reports, change records, exception approvals.

Each evidence type has a defined location and retention period — capture both in the mapping document.

---

## 3. Common frameworks — quick reference

| Framework | Scope | Headline disciplines |
|-----------|-------|----------------------|
| SOC 2 | Trust services (security, availability, integrity, confidentiality, privacy) | Access control, change management, monitoring, incident response, vendor management |
| ISO 27001 | Information security management system | Risk register, statement of applicability, internal audits, management review |
| GDPR / UK GDPR | Personal data of EU/UK individuals | Lawful basis, data minimisation, subject rights, DPIA, breach notification |
| HIPAA | US health data | Administrative, physical, technical safeguards; BAAs |
| PCI DSS | Payment card data | Network segmentation, key management, vulnerability management |

If your project hits any of these, open a compliance-scope scope per framework. Don't try to satisfy two frameworks in one scope; the controls differ in detail and the audit trail benefits from clarity.

---

## 4. Data inventory

For any project handling personal or regulated data, maintain `data-inventory.md`:

- **Data category** (e.g. "customer name", "billing address", "support transcript")
- **Source** (where the data comes from)
- **Storage location** (which system / table / bucket)
- **Access list** (who can read it; how access is granted)
- **Retention** (how long it's kept; how it's deleted)
- **Lawful basis** (for GDPR-scope data)
- **Risk tier** (per project — typically Low/Medium/High/Critical)

The inventory is updated **before** new data is captured, not after.

---

## 5. Subject rights (GDPR / UK GDPR / equivalents)

Pre-built operational responses to each right:

| Right | Process |
|-------|---------|
| Access | Self-service export or manual export within 30 days |
| Rectification | Admin UI or manual correction within 30 days |
| Erasure | Documented deletion path that includes backups and logs |
| Portability | Export in a structured, machine-readable format |
| Objection | Process for opt-out of marketing / profiling |
| Withdraw consent | One-click unsubscribe / opt-out + revocation timestamp |

Each one is a runbook under `operations/runbooks/subject-rights/`. Subject-rights requests have legal-deadline SLAs — the runbook ensures the team can meet them under stress.

---

## 6. DPIAs and pre-engagement reviews

For new high-risk processing (large-scale personal data, automated decision-making, sensitive categories), conduct a Data Protection Impact Assessment (DPIA) **before** implementation:

- Describe the processing.
- Assess necessity and proportionality.
- Identify risks to data subjects.
- Identify mitigations.
- Consult the relevant supervisory authority where required.

DPIAs live alongside threat models in `docs/threat-models/`.

---

## 7. Pre-implementation checklist

```
[ ] Applicable frameworks identified for the project
[ ] New controls mapped before implementation
[ ] Evidence collection mechanism defined
[ ] Data inventory updated for any new personal data
[ ] Retention period set per data category
[ ] Subject-rights processes covered for new data types
[ ] DPIA conducted if high-risk processing
[ ] Compliance review scheduled (annual minimum) on the project calendar
```
