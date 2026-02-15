---
description: Smart Git commit workflow - auto-decides branch vs direct commit vs fork
---

# Smart Git Commit Workflow

This workflow automatically decides whether to create a feature branch, commit directly to main, or create a fork based on permissions and scope.

## Decision Criteria

The workflow will create a **feature branch** if ANY of these conditions are met:
- 3+ files modified
- New directories created
- Changes to core modules (lib/, app/, components/)
- Breaking changes or major features
- Multiple related commits needed

The workflow will **commit directly to main** if ALL of these are true:
- 1-2 files modified
- Only documentation, tests, or scripts changed
- Minor bug fixes or typos
- Single logical change
- **Write access to origin/main confirmed**

The workflow will suggest a **Fork Strategy** if ANY of these are true:
- **No write access** to `origin` repository
- Experimental changes that shouldn't pollute the main repo yet
- Contributing to open source projects

## Steps

### 1. Check Git Status & Remote
// turbo
```bash
git status --short
git remote -v
```

### 2. Analyze Changes & Permissions

Count modified files and check permissions (simulated check):
```bash
# Count modified files
git status --short | wc -l

# Check for new directories
git status --short | grep "^??" | grep "/$"

# Check if push is likely allowed (basic check)
git remote show origin | grep "Push  URL"
```

### 3. Determine Strategy

Based on the analysis:
- If **No Write Access** (or uncertain): Use Fork Strategy
- If **3+ files** OR **new directories** OR **lib/ changes**: Use feature branch
- Otherwise: Direct commit to main

### 4a. Feature Branch Strategy (Standard)

```bash
# Ensure we're on main and up to date
git checkout main
git pull origin main

# Create descriptive feature branch
git checkout -b feature/[DESCRIPTION]

# Stage all changes
git add .

# Commit with descriptive message
git commit -m "[COMMIT_MESSAGE]"

# Push to remote
git push -u origin feature/[DESCRIPTION]

echo "✅ Feature branch created and pushed"
```

### 4b. Direct Commit Strategy (Minor Changes)

// turbo
```bash
# Ensure we're on main and up to date
git checkout main
git pull origin main

# Stage all changes
git add .

# Commit
git commit -m "[COMMIT_MESSAGE]"

# Push
git push origin main

echo "✅ Changes committed directly to main"
```

### 4c. Fork Strategy (No Access / External Contributor)

```bash
# 1. Create a Fork (using GitHub CLI if available)
gh repo fork --clone=false --remote=true

# 2. Create a feature branch on your fork
git checkout -b feature/[DESCRIPTION]

# 3. Stage and Commit
git add .
git commit -m "[COMMIT_MESSAGE]"

# 4. Push to YOUR fork (usually named 'origin' in a fresh clone, or 'my-fork')
# Check remotes first
git remote -v
git push -u origin feature/[DESCRIPTION]

echo "✅ Pushed to fork. Please create a Pull Request from your fork to the upstream repository."
```

## Commit Message Convention

Follow Conventional Commits format: `type(scope): description`
