#!/usr/bin/env bash
# Diagnostics ("doctor") for this Übersicht widget. Read-only: it checks setup
# and prints pass/fail per item so you can see exactly why a widget is blank.
#
# Usage:  ./check.sh
set -uo pipefail
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CFG="$HOME/.config/widgetsuite"
WIDGETS="$HOME/Library/Application Support/Übersicht/widgets"
pass() { printf '  \033[32m✓\033[0m %s\n' "$*"; }
warn() { printf '  \033[33m!\033[0m %s\n' "$*"; }
fail() { printf '  \033[31m✗\033[0m %s\n' "$*"; }
NAME="$(basename "$(/bin/ls -d "$DIR"/*.widget 2>/dev/null | head -1)")"
echo "Checking ${NAME:-widget}"
if [ -d "$WIDGETS" ]; then pass "Übersicht widgets folder found"; else fail "Übersicht widgets folder missing ($WIDGETS) — install Übersicht"; fi
if [ -n "${NAME:-}" ] && [ -d "$WIDGETS/$NAME" ]; then pass "$NAME is installed"; else warn "$NAME not copied into Übersicht yet — run ./install.sh"; fi
if pgrep -x "Übersicht" >/dev/null 2>&1; then pass "Übersicht is running"; else warn "Übersicht is not running"; fi
if defaults read tracesOf.Uebersicht 2>/dev/null | grep -qi shortcut; then pass "an interaction shortcut is set"; else warn "no interaction shortcut found — set one in Übersicht → Preferences → General, or the widget cannot receive clicks"; fi
