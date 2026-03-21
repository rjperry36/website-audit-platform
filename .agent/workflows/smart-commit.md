---
description: Smart Git commit workflow - auto-decides branch vs direct commit vs fork with governance and guardrails
---

# Smart Git Commit & GitHub Manager

This workflow enforces best practices for Git and GitHub management, acting as a "governance layer" to ensure code quality, security, and repository health.

## 🛡️ Governance & Guardrails

| Principle | Guardrail / Implementation |
| :--- | :--- |
| **Safety First** | No commits without `git pull --rebase` to avoid merge conflicts. |
| **Security** | Automated checks for sensitive files (`.env`, `*.pem`, etc.) before staging. |
| **Quality** | Mandatory `npm run lint` for all code changes. |
| **Architecture** | Feature branches for any core module changes or >3 files. |
| **Clarity** | Conventional Commits only (`feat:`, `fix:`, `chore:`, etc.). |

---

## 🚀 Step 1: Pre-Flight Sync & Status

Before starting ANY work or committing, synchronize with the remote.

// turbo
```bash
# Ensure local is up to date and rebased
git pull --rebase origin main

# Check current status
git status --short
```

---

## 🛠️ Step 2: Security & Quality Guardrails

### 2a. Sensitive File Check
Ensure no secrets are being accidentally staged.

```bash
# Check if any .env or secret files are untracked/modified
git status --short | grep -E ".env|secrets|pem|key"
```

### 2b. Static Analysis (Linting)
Verify code standards before proceeding.

```bash
# Run project linting
npm run lint
```

---

## 🧠 Step 3: Decision Logic

Analyze the diff to determine the safest strategy.

```bash
# Count modified files
FILE_COUNT=$(git status --short | wc -l)

# Check for core module changes (app/, lib/, components/)
CORE_CHANGES=$(git status --short | grep -E "app/|lib/|components/" | wc -l)
```

| Strategy | Criteria |
| :--- | :--- |
| **Feature Branch** | `FILE_COUNT` > 3 **OR** `CORE_CHANGES` > 0 **OR** major new feature. |
| **Direct to Main** | Minor typos, documentation, or single-file script changes. |
| **Fork** | No write access to the upstream repository. |

---

## 📝 Step 4: Execution Strategies

### 🚂 A: Feature Branch Strategy (Recommended)

1. **Branch Naming**: `feature/[short-desc]`, `fix/[short-desc]`, or `docs/[short-desc]`.
2. **Execute**:
```bash
git checkout -b feature/[DESC]
git add .
git commit -m "feat([scope]): [description]"
git push -u origin feature/[DESC]
```
3. **GitHub Management**:
```bash
# Create a Pull Request (requires GitHub CLI 'gh')
gh pr create --title "feat: [DESCRIPTION]" --body "Summary of changes..."
```

### ⚡ B: Direct Commit Strategy (Minor Only)

**ONLY** if changes are trivial (typos, docs).

// turbo
```bash
git add .
git commit -m "docs: fix typo in README"
git push origin main
```

---

## 🤝 Step 5: Merge & Cleanup (Post-PR)

After your Pull Request is merged on GitHub:

```bash
# Switch back to main and update
git checkout main
git pull --rebase origin main

# Delete the local feature branch
git branch -d feature/[DESC]

# Cleanup remote tracking branches
git fetch --prune
```

## 📜 Commit Message Reference
Follow [Conventional Commits](https://www.conventionalcommits.org/):
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to the build process or auxiliary tools
