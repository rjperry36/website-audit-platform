#!/bin/bash

# Daily Code Review Analysis Script
# Analyzes uncommitted changes, runs tests, and generates a report for review
# Does NOT commit anything without explicit user approval

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
REPORT_DIR="$PROJECT_DIR/.agent/reports"
LOG_DIR="$PROJECT_DIR/.agent/logs"
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
REPORT_FILE="$REPORT_DIR/review_${TIMESTAMP}.html"
LOG_FILE="$LOG_DIR/analysis_${TIMESTAMP}.log"

cd "$PROJECT_DIR"

# Logging function
log() {
    echo "[$(date +"%Y-%m-%d %H:%M:%S")] $1" | tee -a "$LOG_FILE"
}

log "========================================="
log "Daily Code Review Analysis Started"
log "========================================="

# Check if there are any changes
if git diff --quiet && git diff --cached --quiet && [ -z "$(git ls-files --others --exclude-standard)" ]; then
    log "✅ No uncommitted changes found. Nothing to review."
    
    # Send notification
    osascript -e 'display notification "No uncommitted changes to review" with title "Daily Code Review" sound name "Glass"'
    
    exit 0
fi

log "📊 Analyzing uncommitted changes..."

# Count changes
MODIFIED_COUNT=$(git status --short | grep "^ M" | wc -l | tr -d ' ')
ADDED_COUNT=$(git status --short | grep "^??" | wc -l | tr -d ' ')
DELETED_COUNT=$(git status --short | grep "^ D" | wc -l | tr -d ' ')
TOTAL_FILES=$((MODIFIED_COUNT + ADDED_COUNT + DELETED_COUNT))

log "Files changed: $TOTAL_FILES (Modified: $MODIFIED_COUNT, Added: $ADDED_COUNT, Deleted: $DELETED_COUNT)"

# Determine strategy (branch vs direct commit)
STRATEGY="direct"
STRATEGY_REASON="Minor changes"

if [ "$TOTAL_FILES" -ge 3 ]; then
    STRATEGY="branch"
    STRATEGY_REASON="3+ files changed"
elif git status --short | grep -q "^?? lib/"; then
    STRATEGY="branch"
    STRATEGY_REASON="New files in lib/ directory"
elif git status --short | grep -q "^?? app/"; then
    STRATEGY="branch"
    STRATEGY_REASON="New files in app/ directory"
elif [ "$ADDED_COUNT" -gt 0 ] && git status --short | grep -q "^?? .*/$"; then
    STRATEGY="branch"
    STRATEGY_REASON="New directories created"
fi

log "📋 Recommended strategy: $STRATEGY ($STRATEGY_REASON)"

# Run TypeScript type checking
log "🔍 Running TypeScript type check..."
TS_CHECK_OUTPUT=$(npx tsc --noEmit 2>&1 || echo "TypeScript errors found")
TS_CHECK_STATUS=$?

if [ $TS_CHECK_STATUS -eq 0 ]; then
    TS_STATUS="✅ PASS"
    TS_RESULT="No TypeScript errors"
else
    TS_STATUS="❌ FAIL"
    TS_RESULT="TypeScript errors detected (see details below)"
fi

log "TypeScript check: $TS_STATUS"

# Run tests if they exist
log "🧪 Checking for tests..."
TEST_STATUS="⚠️ SKIP"
TEST_RESULT="No test script configured"

if grep -q '"test"' package.json; then
    log "Running tests..."
    TEST_OUTPUT=$(npm test 2>&1 || echo "Tests failed")
    TEST_EXIT_CODE=$?
    
    if [ $TEST_EXIT_CODE -eq 0 ]; then
        TEST_STATUS="✅ PASS"
        TEST_RESULT="All tests passed"
    else
        TEST_STATUS="❌ FAIL"
        TEST_RESULT="Some tests failed (see details below)"
    fi
else
    log "No test script found in package.json"
fi

# Get changed files list
CHANGED_FILES=$(git status --short)

# Generate proposed commit message
COMMIT_TYPE="chore"
COMMIT_SCOPE=""
COMMIT_DESC="update project files"

# Try to determine commit type from changes
if echo "$CHANGED_FILES" | grep -q "lib/"; then
    COMMIT_TYPE="feat"
    COMMIT_SCOPE="core"
    COMMIT_DESC="update core functionality"
elif echo "$CHANGED_FILES" | grep -q "test"; then
    COMMIT_TYPE="test"
    COMMIT_DESC="update tests"
elif echo "$CHANGED_FILES" | grep -q "docs/\|README"; then
    COMMIT_TYPE="docs"
    COMMIT_DESC="update documentation"
elif echo "$CHANGED_FILES" | grep -q "scripts/"; then
    COMMIT_TYPE="chore"
    COMMIT_SCOPE="scripts"
    COMMIT_DESC="update scripts"
fi

if [ -n "$COMMIT_SCOPE" ]; then
    PROPOSED_COMMIT_MSG="$COMMIT_TYPE($COMMIT_SCOPE): $COMMIT_DESC"
else
    PROPOSED_COMMIT_MSG="$COMMIT_TYPE: $COMMIT_DESC"
fi

log "📝 Proposed commit message: $PROPOSED_COMMIT_MSG"

# Determine overall recommendation
RECOMMENDATION="⚠️ REVIEW REQUIRED"
if [ "$TS_CHECK_STATUS" -eq 0 ] && [ "$TEST_STATUS" != "❌ FAIL" ]; then
    RECOMMENDATION="✅ SAFE TO COMMIT"
else
    RECOMMENDATION="⚠️ ISSUES DETECTED - Review before committing"
fi

# Generate HTML report
log "📄 Generating HTML report..."

cat > "$REPORT_FILE" << EOF
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Daily Code Review - $(date +"%Y-%m-%d %H:%M")</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
            min-height: 100vh;
        }
        .container {
            max-width: 900px;
            margin: 0 auto;
            background: white;
            border-radius: 16px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 { font-size: 28px; margin-bottom: 10px; }
        .header p { opacity: 0.9; font-size: 14px; }
        .content { padding: 30px; }
        .section {
            margin-bottom: 30px;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 12px;
            border-left: 4px solid #667eea;
        }
        .section h2 {
            font-size: 18px;
            margin-bottom: 15px;
            color: #333;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .status-badge {
            display: inline-block;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            margin-left: auto;
        }
        .status-pass { background: #d4edda; color: #155724; }
        .status-fail { background: #f8d7da; color: #721c24; }
        .status-warn { background: #fff3cd; color: #856404; }
        .file-list {
            background: white;
            padding: 15px;
            border-radius: 8px;
            font-family: 'Monaco', 'Courier New', monospace;
            font-size: 13px;
            line-height: 1.6;
            overflow-x: auto;
        }
        .file-item {
            padding: 4px 0;
            border-bottom: 1px solid #eee;
        }
        .file-item:last-child { border-bottom: none; }
        .recommendation {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 25px;
            border-radius: 12px;
            text-align: center;
            font-size: 20px;
            font-weight: 600;
            margin-bottom: 20px;
        }
        .strategy-box {
            background: white;
            padding: 15px;
            border-radius: 8px;
            margin-top: 10px;
        }
        .strategy-box strong { color: #667eea; }
        .commit-msg {
            background: #2d3748;
            color: #68d391;
            padding: 15px;
            border-radius: 8px;
            font-family: 'Monaco', 'Courier New', monospace;
            font-size: 14px;
            margin-top: 10px;
        }
        .actions {
            display: flex;
            gap: 15px;
            margin-top: 30px;
        }
        .btn {
            flex: 1;
            padding: 15px;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.2s;
        }
        .btn:hover { transform: translateY(-2px); }
        .btn-approve {
            background: #48bb78;
            color: white;
        }
        .btn-review {
            background: #4299e1;
            color: white;
        }
        .btn-skip {
            background: #cbd5e0;
            color: #2d3748;
        }
        .code-block {
            background: #2d3748;
            color: #e2e8f0;
            padding: 15px;
            border-radius: 8px;
            font-family: 'Monaco', 'Courier New', monospace;
            font-size: 12px;
            line-height: 1.6;
            overflow-x: auto;
            margin-top: 10px;
            max-height: 300px;
            overflow-y: auto;
        }
        .timestamp {
            text-align: center;
            color: #718096;
            font-size: 12px;
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📊 Daily Code Review</h1>
            <p>$(date +"%A, %B %d, %Y at %H:%M")</p>
        </div>
        
        <div class="content">
            <div class="recommendation">
                $RECOMMENDATION
            </div>
            
            <div class="section">
                <h2>
                    📁 Changed Files
                    <span class="status-badge status-warn">$TOTAL_FILES files</span>
                </h2>
                <div class="file-list">
$(echo "$CHANGED_FILES" | sed 's/^/<div class="file-item">/' | sed 's/$/<\/div>/')
                </div>
            </div>
            
            <div class="section">
                <h2>
                    🎯 Recommended Strategy
                </h2>
                <div class="strategy-box">
                    <strong>$(echo $STRATEGY | tr '[:lower:]' '[:upper:]')</strong> - $STRATEGY_REASON
                    <p style="margin-top: 10px; font-size: 14px; color: #666;">
                        $(if [ "$STRATEGY" = "branch" ]; then
                            echo "Create a feature branch for these changes to enable code review and safe integration."
                        else
                            echo "Changes are minor enough for direct commit to main branch."
                        fi)
                    </p>
                </div>
            </div>
            
            <div class="section">
                <h2>
                    🔍 TypeScript Check
                    <span class="status-badge $(if [ $TS_CHECK_STATUS -eq 0 ]; then echo 'status-pass'; else echo 'status-fail'; fi)">$TS_STATUS</span>
                </h2>
                <p>$TS_RESULT</p>
                $(if [ $TS_CHECK_STATUS -ne 0 ]; then
                    echo "<div class=\"code-block\">$(echo "$TS_CHECK_OUTPUT" | head -20 | sed 's/</\&lt;/g' | sed 's/>/\&gt;/g')</div>"
                fi)
            </div>
            
            <div class="section">
                <h2>
                    🧪 Tests
                    <span class="status-badge $(if [ "$TEST_STATUS" = "✅ PASS" ]; then echo 'status-pass'; elif [ "$TEST_STATUS" = "❌ FAIL" ]; then echo 'status-fail'; else echo 'status-warn'; fi)">$TEST_STATUS</span>
                </h2>
                <p>$TEST_RESULT</p>
            </div>
            
            <div class="section">
                <h2>📝 Proposed Commit Message</h2>
                <div class="commit-msg">$PROPOSED_COMMIT_MSG</div>
                <p style="margin-top: 10px; font-size: 13px; color: #666;">
                    You can modify this message when approving the commit.
                </p>
            </div>
            
            <div class="actions">
                <button class="btn btn-approve" onclick="approve()">✅ Approve & Commit</button>
                <button class="btn btn-review" onclick="openTerminal()">📝 Review in Terminal</button>
                <button class="btn btn-skip" onclick="skip()">⏭️ Skip for Now</button>
            </div>
            
            <div class="timestamp">
                Report generated: $(date +"%Y-%m-%d %H:%M:%S")<br>
                Log file: $LOG_FILE
            </div>
        </div>
    </div>
    
    <script>
        function approve() {
            if (confirm('To approve this commit, run:\\n\\n.agent/scripts/approve-commit.sh "$TIMESTAMP"\\n\\nThis will commit using the recommended strategy.\\n\\nClick OK to see the command, or Cancel to go back.')) {
                // User clicked OK - they've seen the command
            }
        }
        
        function openTerminal() {
            if (confirm('Opening terminal...\\n\\nRun: cd "$PROJECT_DIR" && git status\\n\\nClick OK to continue, or Cancel to go back.')) {
                // User acknowledged
            }
        }
        
        function skip() {
            if (confirm('Skip this review? Changes will remain uncommitted.')) {
                window.close();
            }
        }
    </script>
</body>
</html>
EOF

log "✅ Report generated: $REPORT_FILE"

# Open the report in default browser
open "$REPORT_FILE"

# Send macOS notification
osascript -e "display notification \"$TOTAL_FILES files changed. Click to review.\" with title \"Daily Code Review Ready\" sound name \"Glass\""

log "========================================="
log "Analysis complete. Awaiting user review."
log "========================================="

exit 0
