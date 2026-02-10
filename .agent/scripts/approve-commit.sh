#!/bin/bash

# Approval Script - Executes the commit after user approval
# Usage: ./approve-commit.sh [timestamp] [optional-custom-message]

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
LOG_DIR="$PROJECT_DIR/.agent/logs"
TIMESTAMP="${1:-$(date +"%Y-%m-%d_%H-%M-%S")}"
CUSTOM_MESSAGE="$2"
LOG_FILE="$LOG_DIR/commit_${TIMESTAMP}.log"

cd "$PROJECT_DIR"

# Logging function
log() {
    echo "[$(date +"%Y-%m-%d %H:%M:%S")] $1" | tee -a "$LOG_FILE"
}

log "========================================="
log "Commit Approval Process Started"
log "========================================="

# Check if there are any changes
if git diff --quiet && git diff --cached --quiet && [ -z "$(git ls-files --others --exclude-standard)" ]; then
    log "❌ No uncommitted changes found. Nothing to commit."
    echo "No changes to commit."
    exit 1
fi

# Count changes to determine strategy
MODIFIED_COUNT=$(git status --short | grep "^ M" | wc -l | tr -d ' ')
ADDED_COUNT=$(git status --short | grep "^??" | wc -l | tr -d ' ')
TOTAL_FILES=$((MODIFIED_COUNT + ADDED_COUNT))

# Determine strategy
STRATEGY="direct"
if [ "$TOTAL_FILES" -ge 3 ]; then
    STRATEGY="branch"
elif git status --short | grep -q "^?? lib/\|^?? app/"; then
    STRATEGY="branch"
fi

log "Strategy: $STRATEGY"
log "Files to commit: $TOTAL_FILES"

# Get or generate commit message
if [ -n "$CUSTOM_MESSAGE" ]; then
    COMMIT_MSG="$CUSTOM_MESSAGE"
    log "Using custom commit message: $COMMIT_MSG"
else
    # Auto-generate commit message
    COMMIT_TYPE="chore"
    COMMIT_DESC="update project files"
    
    if git status --short | grep -q "lib/"; then
        COMMIT_TYPE="feat"
        COMMIT_DESC="update core functionality"
    elif git status --short | grep -q "test"; then
        COMMIT_TYPE="test"
        COMMIT_DESC="update tests"
    elif git status --short | grep -q "docs/\|README"; then
        COMMIT_TYPE="docs"
        COMMIT_DESC="update documentation"
    fi
    
    COMMIT_MSG="$COMMIT_TYPE: $COMMIT_DESC"
    log "Auto-generated commit message: $COMMIT_MSG"
fi

# Execute based on strategy
if [ "$STRATEGY" = "branch" ]; then
    log "📌 Creating feature branch..."
    
    # Generate branch name from commit message
    BRANCH_NAME=$(echo "$COMMIT_MSG" | sed 's/^[^:]*: //' | tr '[:upper:]' '[:lower:]' | tr ' ' '-' | sed 's/[^a-z0-9-]//g' | cut -c1-50)
    BRANCH_NAME="feature/$BRANCH_NAME"
    
    log "Branch name: $BRANCH_NAME"
    
    # Ensure we're on main
    git checkout main 2>&1 | tee -a "$LOG_FILE"
    
    # Create and checkout new branch
    git checkout -b "$BRANCH_NAME" 2>&1 | tee -a "$LOG_FILE"
    
    # Stage all changes
    git add . 2>&1 | tee -a "$LOG_FILE"
    
    # Commit
    git commit -m "$COMMIT_MSG" 2>&1 | tee -a "$LOG_FILE"
    
    # Push to remote
    git push -u origin "$BRANCH_NAME" 2>&1 | tee -a "$LOG_FILE"
    
    log "✅ Feature branch created and pushed: $BRANCH_NAME"
    log "📝 Next: Create a Pull Request on GitHub"
    
    # Send notification
    osascript -e "display notification \"Feature branch '$BRANCH_NAME' created and pushed\" with title \"Commit Approved\" sound name \"Glass\""
    
    echo ""
    echo "✅ Feature branch created: $BRANCH_NAME"
    echo "📝 Create PR: https://github.com/rjperry36/website-audit-platform/pull/new/$BRANCH_NAME"
    
else
    log "📌 Committing directly to main..."
    
    # Ensure we're on main
    git checkout main 2>&1 | tee -a "$LOG_FILE"
    
    # Pull latest
    git pull origin main 2>&1 | tee -a "$LOG_FILE"
    
    # Stage all changes
    git add . 2>&1 | tee -a "$LOG_FILE"
    
    # Commit
    git commit -m "$COMMIT_MSG" 2>&1 | tee -a "$LOG_FILE"
    
    # Push
    git push origin main 2>&1 | tee -a "$LOG_FILE"
    
    log "✅ Changes committed and pushed to main"
    
    # Send notification
    osascript -e "display notification \"Changes committed to main\" with title \"Commit Approved\" sound name \"Glass\""
    
    echo ""
    echo "✅ Changes committed and pushed to main"
fi

log "========================================="
log "Commit process completed successfully"
log "========================================="

exit 0
