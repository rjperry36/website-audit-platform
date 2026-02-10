---
description: Automated daily code review at 6 PM with approval workflow
---

# Daily Code Review Workflow

Automated system that analyzes your code changes every day at 6 PM, runs tests, and generates a beautiful report for your review. **Nothing is committed without your explicit approval.**

## How It Works

### 1. Daily Analysis (Automated at 6 PM)

The system automatically:
- ✅ Checks for uncommitted changes
- ✅ Counts modified, added, and deleted files
- ✅ Runs TypeScript type checking
- ✅ Runs tests (if configured)
- ✅ Determines optimal commit strategy (branch vs direct)
- ✅ Generates proposed commit message
- ✅ Creates beautiful HTML report
- ✅ Opens report in your browser
- ✅ Sends macOS notification

### 2. Review Report

The HTML report shows:
- 📊 Overall recommendation (Safe to commit / Issues detected)
- 📁 List of all changed files
- 🎯 Recommended strategy (feature branch or direct commit)
- 🔍 TypeScript check results
- 🧪 Test results
- 📝 Proposed commit message
- ✅ Three action buttons: Approve, Review, Skip

### 3. Your Decision

You have three options:

**Option 1: Approve & Commit**
- Runs the approval script
- Commits using the recommended strategy
- Pushes to GitHub
- Sends confirmation notification

**Option 2: Review in Terminal**
- Opens terminal for manual review
- You can modify files or commit message
- Run approval script when ready

**Option 3: Skip for Now**
- Closes the report
- Changes remain uncommitted
- Will be included in tomorrow's review

## Installation

### Install the Scheduler

// turbo
```bash
.agent/scripts/install-scheduler.sh
```

This will:
- Copy the launchd plist to ~/Library/LaunchAgents
- Load the launch agent
- Schedule daily runs at 6:00 PM

### Verify Installation

```bash
launchctl list | grep webchecker
```

You should see `com.webchecker.dailyreview` in the list.

## Manual Testing

### Test the Analysis (without waiting for 6 PM)

// turbo
```bash
.agent/scripts/daily-review.sh
```

This will:
- Run the analysis immediately
- Generate a report
- Open it in your browser
- Send a notification

### Test the Approval Process

After reviewing a report, approve the commit:

```bash
.agent/scripts/approve-commit.sh
```

Or with a custom commit message:

```bash
.agent/scripts/approve-commit.sh "" "feat(custom): my custom commit message"
```

## Decision Logic

### Feature Branch Created When:
- 3+ files changed
- New files in `lib/` or `app/` directories
- New directories created
- Core functionality changes

### Direct Commit to Main When:
- 1-2 files changed
- Only docs, tests, or scripts modified
- Minor bug fixes
- No new directories

## File Locations

### Reports
- **Location**: `.agent/reports/`
- **Format**: `review_YYYY-MM-DD_HH-MM-SS.html`
- **Contains**: Full analysis with visual report

### Logs
- **Analysis logs**: `.agent/logs/analysis_YYYY-MM-DD_HH-MM-SS.log`
- **Commit logs**: `.agent/logs/commit_YYYY-MM-DD_HH-MM-SS.log`
- **Scheduler logs**: `.agent/logs/launchd-stdout.log` and `launchd-stderr.log`

## Customization

### Change Schedule Time

Edit `.agent/com.webchecker.dailyreview.plist`:

```xml
<key>StartCalendarInterval</key>
<dict>
    <key>Hour</key>
    <integer>18</integer>  <!-- Change this (0-23) -->
    <key>Minute</key>
    <integer>0</integer>   <!-- Change this (0-59) -->
</dict>
```

Then reload:
```bash
launchctl unload ~/Library/LaunchAgents/com.webchecker.dailyreview.plist
launchctl load ~/Library/LaunchAgents/com.webchecker.dailyreview.plist
```

### Modify Commit Message Templates

Edit `.agent/scripts/daily-review.sh` around line 90 to customize how commit messages are generated.

## Uninstall

```bash
launchctl unload ~/Library/LaunchAgents/com.webchecker.dailyreview.plist
rm ~/Library/LaunchAgents/com.webchecker.dailyreview.plist
```

## Troubleshooting

### No notification at 6 PM

Check if the launch agent is loaded:
```bash
launchctl list | grep webchecker
```

Check the scheduler logs:
```bash
tail -f .agent/logs/launchd-stdout.log
```

### Report doesn't open

The report is saved to `.agent/reports/`. You can open it manually:
```bash
open .agent/reports/review_*.html
```

### Approval script fails

Check the commit log:
```bash
tail -f .agent/logs/commit_*.log
```

Make sure you have uncommitted changes:
```bash
git status
```

## Best Practices

1. **Review daily**: Make it a habit to review the 6 PM report
2. **Don't skip too often**: Accumulating changes makes reviews harder
3. **Customize commit messages**: The auto-generated messages are good, but you can improve them
4. **Check test results**: Don't approve if tests are failing
5. **Use feature branches**: For significant changes, the branch strategy is safer

## Example Workflow

**Day 1 - 6:00 PM:**
- 🔔 Notification: "5 files changed. Click to review."
- 📊 Report opens showing TypeScript errors
- ⏭️ You click "Skip for Now" to fix errors first

**Day 1 - 6:30 PM:**
- 🔧 You fix the TypeScript errors
- ▶️ Run `.agent/scripts/daily-review.sh` manually
- ✅ Report shows all checks passing
- ✅ Click "Approve & Commit"
- 🚀 Feature branch created and pushed

**Day 2 - 6:00 PM:**
- 🔔 Notification: "No uncommitted changes to review"
- ✅ Clean slate!

## Notes

- The system never commits without your approval
- All actions are logged for audit trail
- Reports are kept indefinitely (you can clean up old ones)
- Works with the existing `/smart-commit` workflow
- Compatible with your existing Git workflow
