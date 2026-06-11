# Runbook: {{NAME}}

> Saved as `runbooks/<name>.md`. The audience is "you at 2am, three months from now, paged about something you didn't write." Over-specify.

---

## Header

| | |
|---|---|
| **Version** | 1 |
| **Owner** | *(team or named person)* |
| **Last verified** | YYYY-MM-DD |
| **Estimated time** | N minutes |
| **Risk level** | Low / Medium / High |
| **Related runbooks** | *(link any prerequisites or follow-ups)* |

---

## 1. When to use this

One paragraph. The signal that triggers this runbook — what someone sees that makes them open it.

- *(e.g. "PagerDuty alert: queue depth > 1000 for 10 minutes")*

---

## 2. Pre-requisites

Access required, tools needed, and conditions that must be true before starting.

- **Access:**
  - *(system X, role Y)*
- **Tools:**
  - *(CLI tool, dashboard URL, credentials reference)*
- **Conditions:**
  - *(e.g. "On-call has paged; another engineer is aware")*

---

## 3. Procedure

Every step has the exact command or specific click target. Decision points are explicit.

### Step 1 — *(short description)*

```
<exact command or click path>
```

**Expected output:**

```
<what success looks like>
```

**If you see X:** go to step 5.
**If you see Y:** go to step 7.

---

### Step 2 — *(short description)*

*(repeat structure)*

---

### Step 3 — *(short description)*

*(repeat structure)*

---

## 4. Verification

How you know it worked. Specific things to check.

- [ ] *(e.g. "Queue depth < 100 in the next 5 minutes")*
- [ ] *(e.g. "Health endpoint returns 200")*
- [ ] *(e.g. "No new alerts in the last 10 minutes")*

---

## 5. Rollback

Step-by-step undo. If rollback isn't possible, state so explicitly and link to escalation.

| Step | What | Verification |
|------|------|--------------|
| 1 | | |
| 2 | | |

**Rollback time estimate:** ~ N minutes.

---

## 6. Escalation

Who to contact and when. Phone / team-chat channel / on-call rotation.

| When | Contact | How |
|------|---------|-----|
| If step N fails | | |
| If rollback fails | | |
| If unsure | | |

---

## 7. Last incidents

Append (don't overwrite) each time this runbook is used.

| Date | Used by | Outcome | Notes |
|------|---------|---------|-------|
| YYYY-MM-DD | | Success / Partial / Failed | |

---

## 8. Change log

| Date | Change | Author |
|------|--------|--------|
| YYYY-MM-DD | Initial version | |
