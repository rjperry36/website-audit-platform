# Scope: fix-launchd-plist-path

| | |
|---|---|
| **Version** | v0 |
| **Status** | In progress — G1 passed; awaiting G2 approval |
| **Owner** | Russell (Product Owner) / Claude as `delivery-lead` |
| **Disciplines** | operations (primary), infosec, engineering (light) |
| **Created** | 2026-05-21 |
| **Last updated** | 2026-05-21 |
| **Related scopes** | — (first scope opened against the framework) |
| **Related decision records** | none yet |

---

## 1. Frame

**Problem:**
The daily-review launchd job (`com.webchecker.dailyreview`) is configured to run `/Users/russellperry/Documents/WEBChecker/.agent/scripts/daily-review.sh`, but the WEBChecker project actually lives at `/Users/russellperry/Sites/WEBChecker/`. Every reference to the project path in the plist — `ProgramArguments`, `WorkingDirectory`, `StandardOutPath`, `StandardErrorPath` — points at a directory that does not exist on this Mac. As a result, the scheduled 18:00 daily-review job either fails silently, fails noisily into stderr that nobody reads, or never executes at all. We do not know which.

This came to light during the framework-adoption verification pass on 2026-05-21. It is a pre-existing issue, not caused by the framework drop-in.

**Success criteria:**
1. After this scope lands, `launchctl list | grep com.webchecker.dailyreview` shows the job loaded with status `0` (last exit clean) on the next scheduled run.
2. The next scheduled run produces a non-empty `StandardOutPath` log file at the new (correct) location, dated after the scope lands.
3. The path inside the plist matches the project's actual location at `/Users/russellperry/Sites/WEBChecker/`.
4. The change is recorded in `.agent/` operationally (a runbook entry exists explaining what the job does, where its paths are, and how to verify it).

**Constraints:**
- The plist is inside `.agent/`, which is operational and protected per `CLAUDE.md` §2 — any edit to `.agent/` requires a change-request scope (this one).
- The launchd job runs under the user's local launchd, not a sandbox — verification requires `launchctl unload` + `launchctl load` on the user's actual machine, which means computer-use (Terminal at tier "click", so commands go via clipboard + click, not typing) or the user runs them.
- No production code outside `.agent/` is affected by this scope.
- We do not yet know what `daily-review.sh` actually does inside the project (presumably it runs a daily report or audit summary). The script's behaviour is out of scope here — only its file path is in scope. If running the script reveals further issues, those become their own scopes.

**Stakeholders:**
- **Product Owner:** Russell (approves gates).
- **Operations:** delivery-lead reads `dev-framework/01-disciplines/operations/_index.md` inline; `operations-agent` does not yet exist as a persona.
- **InfoSec:** `infosec-agent` consulted because the change touches `.agent/` and modifies a production-side scheduled job.

**Initial risks and unknowns:**

| Risk | Why it matters |
|---|---|
| The job has been failing for an unknown period. The new run might surface a *second* failure (e.g. the script itself doesn't work) that we didn't predict. | The success criterion above (non-empty log file) might not be met for reasons unrelated to the path fix. We'd then need a second scope. |
| `launchctl` requires the job to be unloaded before reloading. If the unload fails (e.g. the job isn't currently loaded at all), the reload procedure differs slightly. | The runbook step needs both branches: "if loaded, unload then load" and "if not loaded, just load". |
| The plist path `~/Library/LaunchAgents/com.webchecker.dailyreview.plist` is where launchd looks. The file inside the repo at `.agent/com.webchecker.dailyreview.plist` is a *source of truth*, not what launchd reads. **Both must be updated** — and we need to verify that the LaunchAgents path even has a copy of this plist installed today, or whether launchd is reading the repo copy via some symlink. | If the LaunchAgents copy doesn't exist, this scope also needs an install step. If it's symlinked back to the repo, then editing the repo copy is enough. We do not currently know which. — `CONFIRM:` listed below. |
| Documents/ folder may also exist on the Mac as an old project location with stale content — confirming it's safe to abandon. | We don't want to silently abandon a folder that still has work we care about. — `CONFIRM:` listed below. |

**`CONFIRM:` questions — all resolved (G1 passed 2026-05-21):**

- `CONFIRM:` Does `~/Library/LaunchAgents/com.webchecker.dailyreview.plist` exist as a separate file, a symlink, or not at all?
  → **RESOLVED:** Does not exist. The plist was never installed into launchd. The job has never fired on schedule. Log evidence (only morning manual-run logs in `.agent/logs/`) corroborates.
- `CONFIRM:` Is `/Users/russellperry/Documents/WEBChecker/` still on disk?
  → **RESOLVED:** Does not exist. Safe to ignore. No cleanup needed.
- `CONFIRM:` Keep the 18:00 daily run time?
  → **RESOLVED:** Yes, keep 18:00.

---

## 2. Plan

**Approach:**

The fix is two mechanical steps, in order:

1. **Edit `.agent/com.webchecker.dailyreview.plist`** to replace every occurrence of `/Users/russellperry/Documents/WEBChecker/` with `/Users/russellperry/Sites/WEBChecker/`. Four lines affected: `ProgramArguments`, `WorkingDirectory`, `StandardOutPath`, `StandardErrorPath`. Run time (`Hour: 18`, `Minute: 0`) is unchanged.
2. **Run `bash .agent/scripts/install-scheduler.sh`** on the user's Mac. The existing install script already does the right thing: it resolves the project path dynamically, copies the plist into `~/Library/LaunchAgents/`, and runs `launchctl unload` (no-op since not currently loaded) followed by `launchctl load`. The script is intentionally idempotent.

Step 1 happens from this session via the file tools. Step 2 happens on the user's Mac — either the user runs it themselves, or (preferred) we drive it via computer-use on Terminal. Terminal is tier "click" so we cannot type into it; we put the command in the clipboard and the user pastes-and-runs, or we click Run on a pre-prepared file. **Cleanest path: I prepare clipboard with the command, you paste it into Terminal and press Enter.**

The scripts (`daily-review.sh`, `approve-commit.sh`, `install-scheduler.sh`) all use dynamic path resolution (`PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"`) and do not need editing.

**Alternatives considered:**

- **Make the plist paths dynamic too** — rejected. launchd plists are static XML; macOS does not expand shell variables inside them. A "make it dynamic" version would require a templating wrapper that generates the plist at install time, which is overkill for a single-machine solo project.
- **Symlink the plist into LaunchAgents instead of copying** — rejected. macOS launchd reads the file once at load time, so the symlink-vs-copy distinction is mostly aesthetic. The existing install script uses `cp`; we follow that convention.
- **Replace the project location** (move `/Sites/WEBChecker/` back to `/Documents/WEBChecker/`) — rejected, obviously. The project's authoritative location is `/Sites/WEBChecker/`; the plist is wrong, not the project.
- **Inline the install in this session via computer-use Terminal** — possible but Terminal is tier "click", which means we cannot type and cannot use modifier-clicks. We can only paste via the menu bar or send commands via clipboard. Doable but fragile. **The lower-friction path is for the user to run the single one-line command after we prepare the plist.**

**Disciplines this scope will draw on:**

- **operations** — primary. Read `dev-framework/01-disciplines/operations/_index.md`, and the standards inside relevant to this scope: `runbooks.md` (Phase 6 deliverable — write a verification runbook for the daily-review job) and `change-management.md` (this is a production-affecting change inside `.agent/`). Read inline since `operations-agent` does not yet exist as a persona.
- **infosec** — light touch. Read `dev-framework/01-disciplines/infosec/_index.md` and apply the cron/auth/secrets non-negotiable check. No secrets, no new network calls, no new attack surface introduced — but the change touches `.agent/` (protected per `CLAUDE.md` §2 non-negotiables), so InfoSec is consulted as a matter of process, not because of a real surface delta.
- **engineering** — light. The plist edit is a four-line find-and-replace; no code logic changes. `engineering-agent`'s standards on coding-standards / error-handling don't meaningfully apply.

**Cost / time / risk estimate:**

- **Time:** ~10 minutes total. Step 1 in this session (under 2 min). Step 2 on user's Mac (under 1 min once Terminal is open). Verification (~5 min). Phase 6 runbook write-up (~3 min).
- **Cost:** zero — no new vendor calls, no new dependencies.
- **Risk:** low. The plist edit is purely textual and the install script is idempotent. The worst failure mode is "the job loads but tonight's 18:00 run fails for a reason unrelated to the path" — that surfaces in the verification log file tomorrow morning, becomes a separate scope. Today's scope passes Phase 5 the moment `launchctl list | grep com.webchecker.dailyreview` shows it loaded with exit status `0`.

**`CONFIRM:` open questions:** *(none — all resolved at G1)*


---

## 3. Standards Applied

*Not started.*

---

## 4. Architecture / Approach

*Not started.*

---

## 5. Environment / Dependencies

*Not started.*

---

## 6. Verification

*Not started.*

---

## 7. Roadmap / Known Limitations

**Known limitations of this scope:**

- macOS launchd will not fire missed jobs while the laptop is asleep. If the Mac is asleep at 18:00, the job is silently skipped that day. Today this is accepted — out of scope to fix here. See follow-up below.

**Follow-ups for future scopes (not landing in this one):**

- **`RunAtLoad: true`** — add to the plist so the job also fires whenever the user logs in or reboots, partially covering the "asleep at 18:00" case. Discussed during planning, deferred for simplicity. Worth a small follow-up scope if reliability turns out to be an issue.
- **Templatised plist generation** — if WEBChecker ever moves between paths again (or runs on multiple Macs), generate the plist from a template at install time rather than maintaining hardcoded paths. Not justified today on a one-machine solo project.
- **Test harness scope** — the daily-review script runs `npm test`, which currently does not exist; the script handles this by marking tests as `⚠️ SKIP`. The first scope queued for the framework's first real test (Vitest + audit-pipeline test) will populate `npm test`, at which point the daily review starts producing meaningful test signal.

---

## 8. Decision Log

- **2026-05-21** — Decided to drive this scope inline with Claude wearing the `delivery-lead` hat rather than spinning up an `operations-agent` persona today. Rationale: the user's MVP-roster decision (`delivery-lead` + `engineering` + `infosec` + `qa`) holds — operations standards are read inline. If this work reveals a pattern that recurs, raise a follow-up to add `operations-agent`. (Recorded here rather than as a cross-cutting ADR because the decision is scope-local.)

---

## 9. Gate Log

| Gate | Date | Pass / Fail | Reviewer | Notes |
|------|------|-------------|----------|-------|
| G1 — Framed | 2026-05-21 | **Pass** | Russell | Frame complete. All three `CONFIRM:` questions resolved. |
| G2 — Planned | 2026-05-21 | *Pending user approval* | Russell | Approach is 2 mechanical steps; alternatives considered; disciplines noted; no open `CONFIRM:`. |
| G3 — Standards Read | — | — | — | — |
| G4 — Built | — | — | — | — |
| G5 — Verified | — | — | — | — |
| G6 — Landed | — | — | — | — |

---

## 10. Sign-Off (if UAT applies)

*Not applicable — UAT discipline is deferred on this project.*
