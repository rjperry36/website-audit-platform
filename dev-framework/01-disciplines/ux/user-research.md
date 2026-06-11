---
description: User research — generative and evaluative methods, when to use which
last_reviewed: 2026-05-18
review_cadence_days: 90
---

# User Research

Research is evidence. The framework treats every UX claim that isn't backed by evidence as a hypothesis — which is fine, but it has to be labelled.

---

## 1. Generative vs evaluative

| Type | When | Methods | Output |
|------|------|---------|--------|
| **Generative** | Before deciding what to build | Interviews, diary studies, contextual inquiry, surveys, support-ticket review, analytics dives | Problems, jobs-to-be-done, segments, opportunities |
| **Evaluative** | Validating a thing already built or designed | Usability tests, A/B tests, click testing, accessibility audits, post-launch surveys | Pass/fail on a specific design or feature |

Most projects need both, at different phases.

---

## 2. When to do research

Research isn't optional for substantial user-facing changes. The minimum:

- **Phase 1 (Frame):** 3–5 user touchpoints (interview, observation, or rich survey) to confirm the problem is real and shape success criteria.
- **Phase 4 (Execute):** 1 usability check on the highest-fidelity available prototype before committing engineering time at scale.
- **Phase 5 (Verify):** 1 round of evaluative testing on the built thing.
- **Phase 6 (Land):** plan a follow-up review at +30 / +90 days.

For small changes, this collapses. For high-risk changes (revenue path, regulatory, primary CTA), it expands.

---

## 3. Sample size

Common myths to dispel:

- **"5 users is enough" is contextually true** for usability testing of a single flow with a homogeneous audience. It is not enough for segmenting an unknown audience, quantitative claims, or rare populations.
- **Statistical significance** requires sample sizes the design phase usually can't afford. For evaluative work, "good enough to ship" is qualitative confidence + risk-weighted judgement, not a p-value.
- **A/B tests** need power calculations. A test with 100 visitors won't tell you anything useful no matter how dramatic the lift looks.

---

## 4. Recruiting

- Recruit from the **actual** user population, not the team's mailing list.
- Pay participants for their time unless there is a clear ethical/regulatory reason not to.
- Recruit a screener even for "small" tests — accidental researchers (your designer's friend) are the most expensive participants.
- Diversity in recruitment: vary ability, age, device, region. A homogeneous panel finds homogeneous problems.

---

## 5. Conducting an interview / test

- **Open questions, not closed.** "Walk me through how you do X" beats "Do you do X?"
- **Tasks, not opinions.** Watch what users do, not what they say they would do.
- **Don't lead.** "What do you think of this button?" is leading. "What would you do next?" is not.
- **Sit on your hands.** Resist the urge to help when the user gets stuck — the stuck moment is the data.
- **Record (with consent).** Memory is unreliable; transcripts are evidence.

---

## 6. Analysis

- **Affinity mapping** for qualitative themes: collect notes, cluster them, label the clusters, prioritise.
- **Be honest about what was observed vs interpreted.** Three people struggled at step 4 (observation). The instructions are unclear (interpretation). Don't conflate.
- **Look for what surprised you.** Confirming bias is comforting; disconfirming evidence is valuable.
- **Document negative results.** A test that confirmed the existing design is still a useful record.

---

## 7. Sharing research

Researchers don't hoard insights. The framework writes them into:

- The scope file's "Research" section (top-level findings)
- A research artefact (`research/<study>-<date>.md`) for the detail
- Decision records when findings drove a non-obvious choice

---

## 8. Ethical baseline

- **Consent.** Participants know they're being recorded and what the recording will be used for.
- **Privacy.** Recordings are stored securely; PII is redacted from artefacts where possible.
- **No deception** unless the research method specifically requires it and a debrief follows.
- **Right to withdraw** without penalty.
- **Vulnerable participants** (children, medical conditions, accessibility-specific studies) require additional safeguards — defer to your project's ethics review where one exists.

---

## 9. Pre-implementation checklist

```
[ ] Research question stated; method matches the question
[ ] Sample size appropriate to claim being made
[ ] Recruitment representative of actual users
[ ] Consent + privacy handled
[ ] Tasks observed, not opinions asked
[ ] Analysis separates observation from interpretation
[ ] Findings written into the scope and (where relevant) a decision record
[ ] Follow-up post-launch research planned
```
