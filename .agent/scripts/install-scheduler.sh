#!/bin/bash

# Installation script for Daily Code Review automation

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
PLIST_FILE="$PROJECT_DIR/.agent/com.webchecker.dailyreview.plist"
PLIST_DEST="$HOME/Library/LaunchAgents/com.webchecker.dailyreview.plist"

echo "========================================="
echo "Daily Code Review - Installation"
echo "========================================="
echo ""

# Create LaunchAgents directory if it doesn't exist
mkdir -p "$HOME/Library/LaunchAgents"

# Copy plist file
echo "📋 Installing launchd configuration..."
cp "$PLIST_FILE" "$PLIST_DEST"

# Load the launch agent
echo "🚀 Loading launch agent..."
launchctl unload "$PLIST_DEST" 2>/dev/null || true
launchctl load "$PLIST_DEST"

echo ""
echo "✅ Installation complete!"
echo ""
echo "📅 Daily code review will run at 6:00 PM every day"
echo "📊 Reports will be saved to: $PROJECT_DIR/.agent/reports/"
echo "📝 Logs will be saved to: $PROJECT_DIR/.agent/logs/"
echo ""
echo "To test immediately, run:"
echo "  .agent/scripts/daily-review.sh"
echo ""
echo "To uninstall, run:"
echo "  launchctl unload $PLIST_DEST"
echo "  rm $PLIST_DEST"
echo ""
echo "========================================="
