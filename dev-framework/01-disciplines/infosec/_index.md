---
description: InfoSec discipline — baseline security, secure coding, threat modelling, compliance touchpoints
last_reviewed: 2026-05-18
review_cadence_days: 30
---

# InfoSec Discipline

**Always on.** Every project enables this discipline regardless of stack or size. Security is not optional.

Read at Phase 2 (Plan) to identify the InfoSec scope of the work, Phase 3 (Standards) for the baseline rules, Phase 4 (Execute) for in-flight checks, and Phase 5 (Verify) for the security review.

| Standard | File | When |
|----------|------|------|
| Security baseline | [`security-baseline.md`](security-baseline.md) | Phase 3 every scope; Phase 5 pre-deploy |
| Secure coding | [`secure-coding.md`](secure-coding.md) | Phase 4 every code change |
| Threat modelling | [`threat-modeling.md`](threat-modeling.md) | Phase 2 for any new feature touching auth, data, or external systems |
| Compliance touchpoints | [`compliance.md`](compliance.md) | Phase 2 when regulated data is involved; ongoing for audit-scoped projects |

---

## Companion documents (project-specific)

- **`SECURITY.md`** at the project root — vulnerability disclosure policy, security contacts, dependency policy
- **`THREAT_MODEL.md`** — the live threat model for the project; updated when significant features change the attack surface
- **`COMPLIANCE_MAPPING.md`** — for audit-scoped projects, maps requirements (SOC 2 / ISO / GDPR / etc.) to controls and evidence

---

## Verification checklist (Phase 5)

```
[ ] Security baseline checklist (security-baseline.md §10) all green
[ ] Secure coding checklist for any new code (secure-coding.md)
[ ] Threat model updated if attack surface changed
[ ] Compliance touchpoints addressed if regulated data is involved
[ ] Dependency audit clean of HIGH / CRITICAL findings
[ ] No secrets committed; secret scan clean
[ ] Logging review: no PII, no secrets in logs
```
