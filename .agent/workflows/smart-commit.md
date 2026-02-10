---
description: Smart Git commit workflow - auto-decides branch vs direct commit
---

# Smart Git Commit Workflow

This workflow automatically decides whether to create a feature branch or commit directly to main based on the scope of changes.

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

## Steps

### 1. Check Git Status
// turbo
```bash
git status --short
```

### 2. Analyze Changes

Count the number of modified files and check if new directories were created:
```bash
# Count modified files
git status --short | wc -l

# Check for new directories
git status --short | grep "^??" | grep "/$"
```

### 3. Determine Strategy

Based on the analysis:
- If **3+ files** OR **new directories** OR **lib/ changes**: Use feature branch
- Otherwise: Direct commit to main

### 4a. Feature Branch Strategy (for significant changes)

```bash
# Ensure we're on main and up to date
git checkout main
git pull origin main

# Create descriptive feature branch
# Format: feature/short-description or fix/short-description
git checkout -b feature/[DESCRIPTION]

# Stage all changes
git add .

# Commit with descriptive message
# Format: type(scope): description
# Types: feat, fix, docs, test, refactor, chore
git commit -m "[COMMIT_MESSAGE]"

# Push to remote
git push -u origin feature/[DESCRIPTION]

# Output next steps
echo "✅ Feature branch created and pushed"
echo "📝 Next steps:"
echo "   1. Create a Pull Request on GitHub/GitLab"
echo "   2. Request code review if needed"
echo "   3. Merge after approval"
echo "   4. Delete branch: git branch -d feature/[DESCRIPTION]"
```

### 4b. Direct Commit Strategy (for minor changes)

// turbo
```bash
# Ensure we're on main and up to date
git checkout main
git pull origin main

# Stage all changes
git add .

# Commit with descriptive message
git commit -m "[COMMIT_MESSAGE]"

# Push to remote
git push origin main

echo "✅ Changes committed directly to main"
```

## Usage Examples

**Example 1: Major Feature (SEO Audit Engine)**
- Files changed: 5+ (lib/audit/seo-audit.ts, lib/crawl/crawler.ts, lib/types.ts, scripts/test-seo-audit.ts, docs/)
- Decision: **Feature branch** → `feature/seo-audit-aeo-geo`
- Commit message: `feat(audit): add SEO audit engine with AEO and GEO criteria`

**Example 2: Documentation Update**
- Files changed: 1 (README.md)
- Decision: **Direct commit**
- Commit message: `docs: update installation instructions`

**Example 3: Bug Fix**
- Files changed: 1 (lib/crawler.ts)
- Decision: Could go either way, but if it's a critical fix: **Direct commit**
- Commit message: `fix(crawler): handle null response in fetchHTML`

**Example 4: New Feature Module**
- Files changed: 3+ with new directory (lib/analytics/)
- Decision: **Feature branch** → `feature/analytics-module`
- Commit message: `feat(analytics): add page analytics tracking`

## Commit Message Convention

Follow Conventional Commits format:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `test`: Adding or updating tests
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `chore`: Maintenance tasks, dependency updates
- `perf`: Performance improvements

**Examples:**
- `feat(audit): add AEO and GEO criteria to SEO audit`
- `fix(crawler): prevent null pointer in HTML fetch`
- `docs(readme): add SEO audit documentation`
- `test(audit): add comprehensive SEO audit tests`
- `refactor(types): extract audit types to separate file`

## Notes

- Always pull before creating a branch or committing
- Use descriptive branch names and commit messages
- For feature branches, create a PR for code review
- Delete feature branches after merging
- If unsure, prefer feature branch over direct commit
