---
description: How standards stay current — the freshness lifecycle that runs alongside the work lifecycle
last_reviewed: 2026-05-18
review_cadence_days: 180
---

# Standards Refresh

Standards are not eternal. The world they describe changes — framework defaults flip between versions, regulatory frameworks issue new control numbers, vendors rename APIs, best practice evolves. A standard that was right in March can be wrong in November.

The framework's six-phase lifecycle covers a piece of *work* from frame to land. This file describes the **second lifecycle** that runs in parallel: how each *standard* stays current.

Both lifecycles are framework concerns. The work lifecycle prevents one piece of work from going off the rails. The refresh lifecycle prevents the rails themselves from going stale.

---

## The freshness loop

```
SOURCE          ◀──── the authoritative document (vendor docs, regulation, internal policy)
   │
   ▼
CLAIM           ◀──── what the standard asserts is true ("Auth check at top of every Server Action")
   │
   ▼
ANCHOR          ◀──── a structured fingerprint binding the claim to its source(s)
   │
   ▼
PERIODIC DIFF   ◀──── on a cadence, an auditor compares the claim against the current source
   │
   ▼
FINDING         ◀──── classified: OK · MINOR · MAJOR · NEW · BROKEN
   │
   ▼
HUMAN GATE      ◀──── a person reviews, approves, or rejects the proposed change
   │
   ▼
UPDATED STANDARD ─┐
   │              │
   └──────────────┘  (loop repeats on the next cadence)
```

The loop is identical for every domain — engineering, content, infosec, compliance, operations. Only the source documents and the audit cadence change.

---

## The four artefacts

### 1. Anchors

Every standard's frontmatter can carry an `anchors:` block. Each anchor is a small, machine-readable record:

```yaml
anchors:
  - id: wcag-aa-contrast
    claim: "Body text contrast minimum is 4.5:1; large text minimum is 3:1 (WCAG 2.1 AA)."
    sources:
      - https://www.w3.org/TR/WCAG21/#contrast-minimum
```

An anchor has three required fields:

- **`id`** — a short, stable identifier. Never reused, never silently renamed.
- **`claim`** — exactly the assertion the standard makes, in one sentence. This is the fingerprint the auditor matches against current sources.
- **`sources`** — one or more authoritative URLs where the claim can be verified.

Anchors are intentionally lightweight. Not every paragraph needs one — only the **load-bearing claims** that the standard would be wrong without.

### 2. Freshness metadata

Every standard's frontmatter declares its review cadence:

```yaml
last_reviewed: 2026-05-18
review_cadence_days: 90
```

`review_cadence_days` defaults differ by domain:

| Domain | Default cadence | Why |
|---|---|---|
| `infosec` | 30 days | Threats and CVEs move fast |
| `engineering` (framework-level) | 90 days | Framework releases land on this kind of rhythm |
| `ui`, `ux`, `qa`, `uat`, `operations`, `data`, `content` | 90 days | Same rationale — quarterly review |
| `00-lifecycle/` and `02-templates/` | 180 days | The lifecycle and templates change rarely; review twice a year |

A project can override these defaults in its `PROJECT_BRIEF.md` if it wants tighter or looser cadences.

### 3. The auditor (interactive)

An auditor is anything — a person, a script, an AI skill — that:

1. Parses a standard's frontmatter
2. Fetches the current state of each `sources` URL
3. Diffs the `claim` against current text
4. Classifies findings and proposes replacement text

Most projects start with **manual audits**: a person reads the standard, opens the sources, decides if anything has changed. For high-traffic standards (engineering, infosec), an automated auditor pays back.

See `examples/stack-conventions-auditor/` for a worked example of an AI-driven auditor.

### 4. The auditor (scheduled)

The same auditor can run on a cadence. A scheduled run produces one of three outcomes:

- **No findings** — log the run; bump `last_reviewed`; no other action.
- **Findings, low risk** — propose a patch via the project's normal change mechanism (a PR, a decision record, a comment in the file).
- **Findings, high risk** — same, plus a notification to the standard's owner.

Scheduling can be a calendar reminder, a cron job, a CI workflow, or a manual quarterly review. The mechanism doesn't matter — the cadence does.

---

## Finding classification

Every audit finding lands in one of five buckets:

| Class | Meaning | Action |
|-------|---------|--------|
| **OK** | Claim still matches current source. | None. Bump `last_reviewed`. |
| **MINOR** | Version bump or wording clarification, no behaviour change. | Update wording. Merge with light review. |
| **MAJOR** | Source has changed in a way that makes the claim wrong or misleading. | Update the standard. Heavier review. May need a decision record. |
| **NEW** | The source has a new best practice the standard doesn't yet capture. | Decide whether to adopt. If yes, extend the standard. |
| **BROKEN** | Source URL is dead or the content has moved. | Re-anchor: find the new canonical source or remove the anchor. |

Classifications are **conservative by default** — when in doubt, flag MAJOR rather than auto-fixing. The standard's owner makes the call.

---

## What to anchor (and what not to)

**Anchor:**

- Claims with a specific, citable source (WCAG criteria, OWASP rules, regulatory clauses, framework defaults, vendor SLAs)
- Versioned facts ("Framework X v2 changed default Y to Z")
- Numerical thresholds tied to an external authority ("Core Web Vitals 'good' LCP is < 2.5s")

**Don't anchor:**

- Universal principles that aren't tied to any source ("Use the right tool for the job")
- Opinion-based recommendations that the team owns ("Default to bullet lists over paragraphs in scopes")
- Internal conventions ("Branches named `feat/<name>` or `fix/<name>`")

Internal conventions don't need anchors — they need *ownership*. Anchors only add value when there's an external moving target.

---

## How this lifecycle interacts with the work lifecycle

The two lifecycles touch in three places:

1. **Phase 3 (Standards Check) — the work lifecycle.** When a contributor reads a standard, they see its `last_reviewed` date. If the standard is past its cadence, that's a signal: read with extra care, and flag any contradictions you spot for the standard's owner. *Don't* refuse to do the work — but do raise the freshness concern as a scope note.

2. **Phase 6 (Land) — the work lifecycle.** Work that exercised a standard in an unexpected way may surface a NEW finding. The Phase 6 closing step "Roadmap / Known Limitations" is the natural place to log "standard X needs to be extended to cover case Y."

3. **Anti-pattern: refreshing the standard mid-scope.** Don't rewrite a standard while doing a piece of work that depends on it. Open a separate scope for the refresh, with the new standard as the deliverable. Otherwise the work and the standard change at the same time and you can't tell which one moved.

---

## What this is *not*

- **Not a guarantee.** A standard with a recent `last_reviewed` date can still be wrong — review quality matters more than review recency. The metadata makes drift visible; it doesn't prevent it.
- **Not a substitute for ownership.** Every standard has an owner (named in the project brief, the discipline lead, or `MAINTAINERS.md`). Anchors and cadences exist to *support* the owner, not replace them.
- **Not a code linter.** This lifecycle audits the *standards* against external sources. It does **not** audit project code against the standards — that's QA's job at Phase 5 of the work lifecycle.

---

## The pattern is bigger than this framework

The same loop — source → claim → anchor → periodic diff → human gate → updated standard — applies to:

- **Brand voice rules** anchored to a brand book
- **Compliance controls** anchored to SOC 2 / ISO 27001 / GDPR / HIPAA / PCI clauses
- **Editorial style** anchored to a house style guide
- **Operational runbooks** anchored to vendor APIs
- **Internal policies** anchored to HR / legal / finance documents

If you find yourself building a third or fourth one-off "check that X is still current" mechanism in your team, build the loop instead. See `examples/stack-conventions-auditor/` for a reference implementation.

---

## Adoption sequence for an existing project

If a project is adopting standards-refresh for the first time:

1. **Pick the three highest-leverage standards.** Usually `infosec/security-baseline.md`, the project's design system, and any compliance-mapping doc. Add `last_reviewed:` and `anchors:` to those first.
2. **Run one manual audit.** Read the sources; verify each anchor's claim. Update wording where reality has drifted. This is the baseline.
3. **Pick a cadence.** Quarterly is the default. Put a calendar reminder against the standard's owner.
4. **Decide whether to automate.** For a small project, the calendar reminder is enough. For a stack-heavy project (Next.js + Vercel + Neon, where vendor defaults change often), wire an automated auditor — see `examples/stack-conventions-auditor/`.
5. **Roll out gradually.** Add anchors to other standards as you touch them naturally. Don't try to anchor everything in one sweep; you'll lose the signal.

---

## See also

- `00-lifecycle/lifecycle.md` — the work lifecycle that runs alongside this one
- `00-lifecycle/gates.md` — gates G5 (Verified) and G6 (Landed) interact with freshness
- `examples/stack-conventions-auditor/` — a worked example for Next.js + Vercel + Neon
- `FRAMEWORK.md §9` — how the framework itself evolves
