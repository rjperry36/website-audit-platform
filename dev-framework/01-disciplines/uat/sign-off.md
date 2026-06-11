---
description: UAT sign-off — what it means, who can give it, how it's recorded
last_reviewed: 2026-05-18
review_cadence_days: 90
---

# UAT Sign-Off

Sign-off is the **formal record** that the work has been accepted by the audience. It is not optional for any work where UAT applies.

---

## 1. What sign-off says

Sign-off says:

1. The audience executed the UAT script (or a documented variant).
2. The acceptance criteria are met (or any deviations are recorded with a decision).
3. The audience accepts the work as it stands.
4. The audience accepts the listed known limitations and follow-up commitments.

Sign-off does **not** say:

- "I tested everything." (UAT is sampling, not exhaustive coverage.)
- "I waive future change rights." (Sign-off is acceptance of *this* version.)
- "I take responsibility for defects." (Defect ownership stays with the build team.)

These distinctions matter when a defect surfaces post-launch — the sign-off record protects both sides.

---

## 2. Who signs

| Project type | Required signatories |
|--------------|---------------------|
| Internal tool | Product owner + one team lead from the user team |
| Customer-facing app | Product owner — and UAT recorded with a representative sample |
| Stakeholder deliverable | The stakeholder named in the scope's Frame phase |
| Regulated change | The compliance reviewer + the operational owner |
| Vendor integration | The vendor technical contact + the project's product owner |

**One person never signs in two roles.** If the same person plays product owner and build lead, sign-off requires a second named reviewer to keep the framework's separation intact.

---

## 3. The sign-off record

Sign-off lives in two places:

- **In the scope file** — a final section "Sign-Off" with the table below.
- **In the project's release log** (if maintained separately).

```markdown
## Sign-Off

| Role | Signatory | Date | Version signed off | Notes |
|------|-----------|------|--------------------|-------|
| Product Owner | <name> | YYYY-MM-DD | v1.0 | — |
| Stakeholder | <name> | YYYY-MM-DD | v1.0 | — |
| Compliance (if applicable) | <name> | YYYY-MM-DD | v1.0 | — |

**Acceptance criteria — final status:**
| Criterion | Met? | Notes |
|-----------|------|-------|
| ... | Yes / No / Partial | ... |

**Known limitations accepted:**
- ...

**Follow-up scopes committed:**
- ...
```

---

## 4. Partial sign-off

For substantial work, sign-off can be staged:

- **Conditional sign-off** — accepts the work pending one or two named follow-ups, each with an owner and a date.
- **Phased sign-off** — accepts the work for an initial launch population (e.g. one country, one team) before broader rollout.

Conditional sign-off without dates and owners is just a vague promise. Reject it and re-sign once they're added.

---

## 5. Refused sign-off

If the audience refuses sign-off:

1. **Capture the reason in writing.** Specific, evidence-based.
2. **Assess severity.** Is this a spec gap (Frame failed), an implementation defect (QA failed), or a misalignment of expectations (briefing failed)?
3. **Decide:** fix and re-test, accept and re-scope, or escalate.

Refused sign-off is a signal — usually a Phase 1 or Phase 2 failure that didn't surface until now.

---

## 6. Sign-off and gates

UAT sign-off is the dominant check at **G5 (Verified)** for any scope where UAT applies. G5 is not passed without it.

G6 (Landed) cannot pass if G5 didn't.

---

## 7. Re-sign-off after change

If a signed-off deliverable is materially changed before release (e.g. a late legal edit, a vendor swap, a substantive copy change), re-sign-off is required. The new sign-off references the original and lists what changed.

Minor cosmetic fixes (typos, missing alt text) generally don't require re-sign-off — but a note in the scope's `Decision Log` records the change.

---

## 8. Pre-implementation checklist

```
[ ] Signatories identified at Phase 1, not Phase 5
[ ] Acceptance criteria explicit and in the scope
[ ] Sign-off table prepared (in scope file or release log)
[ ] Conditional sign-off avoided unless conditions are dated + owned
[ ] Refused sign-off treated as a process signal, not a personal one
[ ] Re-sign-off triggered for any post-sign-off material change
```
