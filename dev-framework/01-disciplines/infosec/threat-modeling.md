---
description: Threat modelling — lightweight STRIDE for new features and architectural changes
last_reviewed: 2026-05-18
review_cadence_days: 90
anchors:
  - id: stride-categories
    claim: "STRIDE covers Spoofing, Tampering, Repudiation, Information disclosure, Denial of service, and Elevation of privilege."
    sources:
      - https://learn.microsoft.com/en-us/azure/security/develop/threat-modeling-tool-threats
  - id: owasp-threat-modeling
    claim: "OWASP Threat Modeling Process informs the framework's lightweight approach."
    sources:
      - https://owasp.org/www-community/Threat_Modeling_Process
---

# Threat Modelling

A lightweight, framework-agnostic threat-modelling process. Applied at Phase 2 (Plan) for any work that:

- Introduces or changes an authentication / authorisation flow
- Touches sensitive or regulated data
- Adds a new external system integration
- Changes the public attack surface (new endpoints, new file-upload paths, new integrations)
- Modifies the security boundary in any way

For incremental work that doesn't move the security boundary, threat modelling collapses to "no change to the threat model, recorded in the scope."

---

## 1. Use STRIDE, lightweight

The STRIDE mnemonic covers the common threat categories. For each new feature or change:

| Category | Question |
|----------|---------|
| **S — Spoofing** | Can an attacker pretend to be someone else? |
| **T — Tampering** | Can an attacker modify data in transit or at rest? |
| **R — Repudiation** | Can a legitimate user later deny they did something? |
| **I — Information disclosure** | Can an attacker read data they shouldn't? |
| **D — Denial of service** | Can an attacker make the system unavailable? |
| **E — Elevation of privilege** | Can a low-privilege user become high-privilege? |

For each category that applies, ask:

- **Threat:** what could an attacker do?
- **Likelihood:** how easy is it?
- **Impact:** how bad if it happens?
- **Mitigation:** what reduces or eliminates it?

A simple table per change captures this without ceremony.

---

## 2. The threat model document

For substantial work, the threat model is its own file (`docs/threat-models/<feature>-<date>.md`) using `02-templates/threat-model.md`. For smaller work, a section in the scope file is enough.

```markdown
# Threat Model — <feature>

## Scope
What part of the system this model covers. What's out of scope.

## Data flow
A simple diagram or description: where untrusted data enters, where it touches sensitive operations.

## Trust boundaries
List the boundaries this feature crosses or introduces.

## Threats

| ID | Category | Threat | Likelihood | Impact | Mitigation | Owner |
|----|----------|--------|------------|--------|------------|-------|
| T1 | S | ... | Low/Med/High | Low/Med/High | ... | ... |
| T2 | I | ... | ... | ... | ... | ... |

## Residual risk
Threats that are knowingly accepted, with rationale and revisit date.

## Open questions
Anything that needs answering before this feature can ship.
```

---

## 3. When the threat model is wrong

A threat model is a hypothesis. When it's contradicted by reality:

- A new attack vector is discovered → add a threat, update the mitigation.
- A mitigation fails or doesn't apply → update the model and remediate.
- A residual risk crystallises into an incident → the post-mortem updates the model.

The model is a living document. A threat model that hasn't been updated in 12 months on an active project is almost certainly stale.

---

## 4. Common patterns to check

A handful of patterns surface across most threat models:

- **Auth on every handler.** Spoofing + elevation of privilege.
- **Validation at every input boundary.** Tampering + information disclosure.
- **Rate limits on public endpoints.** Denial of service.
- **Audit logs for sensitive actions.** Repudiation.
- **Least-privilege credentials.** Elevation of privilege.
- **Encryption in transit (TLS) and at rest.** Information disclosure + tampering.
- **Idempotency for mutations.** Tampering (replay).
- **Separation of admin and user contexts.** Elevation of privilege.

If a new feature is missing any of these, the threat model has a gap.

---

## 5. Reviewing a threat model

The reviewer asks:

1. Are the trust boundaries explicit?
2. Are STRIDE categories considered, not just the obvious ones?
3. Is each threat tied to a concrete mitigation (or an accepted residual risk)?
4. Is the model reviewable — can someone unfamiliar with the feature understand the risk picture in 10 minutes?

A threat model that requires a 90-minute walkthrough to interpret hasn't been written well.

---

## 6. Lightweight is not optional

The framework's threat-modelling discipline is intentionally lightweight — most threat models for routine features are one page. The trap is going so light it becomes "we thought about it" with no record. The minimum surviving artefact:

- A table of threats, mitigations, and owners.
- A statement of accepted residual risk (even if "none").
- A pointer to the relevant standards that apply.

Below that minimum, the threat model isn't there.

---

## 7. Pre-implementation checklist

```
[ ] Threat model exists for this work (in scope file or standalone)
[ ] STRIDE categories considered explicitly
[ ] Trust boundaries identified
[ ] Each threat has a mitigation (or an accepted residual)
[ ] Owner named per mitigation
[ ] Open questions resolved before Act
[ ] Model linked from the scope file
```
