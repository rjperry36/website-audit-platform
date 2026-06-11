---
description: UAT process — preparation, execution, outcomes
last_reviewed: 2026-05-18
review_cadence_days: 90
---

# UAT Process

User / stakeholder / customer Acceptance Testing — the structured confirmation that the work meets the actual need, not just the specification.

---

## 1. Who runs UAT

UAT is run by the **real audience** for the work:

| Project type | Typical UAT participant |
|--------------|------------------------|
| Internal tool | The internal team that will use it daily |
| Customer-facing app | A representative sample of real customers (recruited; not staff) |
| Stakeholder deliverable | The stakeholder who commissioned the work |
| Vendor / partner integration | The partner's technical contact |
| Regulated process | The compliance / legal reviewer responsible for sign-off |

The development team **does not** sign UAT off. The audience does. The development team facilitates and observes.

---

## 2. UAT precedes nothing — it follows everything

UAT is a Phase 5 activity. Before UAT begins:

- QA (functional and non-functional) has completed.
- The build under test is **production-like** — same environment, same data shape, same configuration.
- Any defects above P3 have been resolved.

Running UAT on a half-built thing wastes everyone's time and trains participants to ignore "known issues" — exactly the issues they should be catching.

---

## 3. The UAT script

Every UAT session runs from a script — see `02-templates/uat-script.md`. It contains:

- **The acceptance criteria** (from the scope's Frame phase).
- **Tasks** to perform, in user terms: "Book a meeting for next Tuesday" — not "click button X."
- **Expected outcomes** per task.
- **A space to record actual outcomes**, with pass/fail and notes.
- **A free-form feedback section** for things the script didn't anticipate.

Tasks reflect real-world usage, not edge-case engineering tests. UAT finds gaps in the spec; QA finds gaps in the code.

---

## 4. Setup

Before the session:

- **Environment ready.** Production-like, with seeded data that reflects the participant's reality.
- **Test accounts provisioned.** Real-shaped accounts with appropriate permissions.
- **Recording / note-taking arranged.** With consent.
- **Time-boxed.** Long sessions reduce signal — keep to under 90 minutes per participant.

---

## 5. During the session

- **The facilitator does not lead.** No "click here next." Let the participant find their way; the friction is the data.
- **Observe, don't explain.** When a participant goes off-track, note it. Explain only if they're truly stuck.
- **Record verbatim.** Quotes are more useful than paraphrases for design decisions.
- **Don't fix defects mid-session.** Note them; carry on.

---

## 6. After the session

- **Defects captured** with severity (see `qa/defect-management.md`).
- **Open issues categorised**: spec gap (Frame missed something), implementation bug (code is wrong), UX issue (user is confused), out-of-scope (genuine extension).
- **Acceptance criteria status updated**: each criterion ticked, marked failed, or marked partial with notes.
- **Decision: ship / fix-then-ship / re-test.** The audience makes the call, recorded with date and signature.

---

## 7. Multiple participants

For consumer-facing work, run UAT with multiple participants (3–5 minimum) before sign-off. Patterns across participants matter more than any single participant's opinion.

For stakeholder deliverables, a single sign-off is usually appropriate — but consider a "second pair of eyes" reviewer for high-stakes work.

---

## 8. UAT for content

UAT applies to content work too:

- **Stakeholder review** of voice, accuracy, brand-fit.
- **Audience preview** for high-stakes campaigns — a small group reads before publication.
- **Legal / compliance review** where regulatory exposure exists.

The script is different (read the content, answer "does this sound like us / accurately reflect our offer / is it clear / is anything missing"), but the structure is the same.

---

## 9. UAT for change requests

For ops change requests, UAT translates to:

- **Pre-change dry run** in a non-production environment with the stakeholder watching.
- **Sign-off on the change record** before the change window opens.
- **Post-change validation** — the stakeholder confirms the system behaves as expected after the change.

---

## 10. Pre-implementation checklist

```
[ ] UAT participants identified — real audience, not internal proxies
[ ] Acceptance criteria from the scope are the basis for the UAT script
[ ] UAT script written using 02-templates/uat-script.md
[ ] Environment is production-like with realistic data
[ ] All defects above P3 resolved before session
[ ] Facilitation rules briefed (don't lead, observe, record)
[ ] Defect / open-issue categorisation defined
[ ] Sign-off process and signatories defined
```
