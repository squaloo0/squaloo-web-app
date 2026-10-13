#!/bin/sh
# The Garage's work loop on a Mac: install | uninstall | status | logs
#
#   npm run garage:install      render the plist with this Mac's absolute paths, load it
#   npm run garage:uninstall    unload and remove it
#   npm run garage:status       is it running, and what did it say last
#
# What the host needs, checked here by existence only, never by value:
#   - .env.local with NEON_DATABASE_URL (the ledger)
#   - wrasse's token in the login Keychain: service squaloo-garage, account wrasse
#     (mint with `claude setup-token`, store with
#      security add-generic-password -U -s squaloo-garage -a wrasse -w "$(pbpaste)")
#   - gh signed in, for publishing approved diffs
# Reads .env.local from the repo root at run time (the CLI does that itself).
set -eu

LABEL="com.squaloo.garage.work"
REPO="$(cd "$(dirname "$0")/../../.." && pwd)"
HERE="$REPO/workers/garage/launchd"
PLIST="$HOME/Library/LaunchAgents/$LABEL.plist"
LOGDIR="$HOME/Library/Logs/garage"
LOG="$LOGDIR/work.log"
TARGET="gui/$(id -u)"

render() {
  NODE="$(command -v node || true)"
  [ -n "$NODE" ] || { echo "node not on PATH; install Node 22 first"; exit 3; }
  GH="$(command -v gh || true)"
  GIT="$(command -v git || true)"
  [ -n "$GH" ] || echo "warning: gh not on PATH (brew install gh); approved diffs cannot be published from this Mac"
  P="$(dirname "$NODE")"
  [ -n "$GH" ] && P="$P:$(dirname "$GH")"
  [ -n "$GIT" ] && P="$P:$(dirname "$GIT")"
  P="$P:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin"
  MACHINE="${GARAGE_MACHINE_NAME:-$(hostname -s | tr 'A-Z' 'a-z')}"
  mkdir -p "$LOGDIR" "$HOME/Library/LaunchAgents"
  sed -e "s|@NODE@|$NODE|g" -e "s|@REPO@|$REPO|g" -e "s|@PATH@|$P|g" -e "s|@HOME@|$HOME|g" \
      -e "s|@MACHINE@|$MACHINE|g" -e "s|@LOG@|$LOG|g" \
      "$HERE/$LABEL.plist.template" > "$PLIST"
  plutil -lint "$PLIST" >/dev/null
  echo "rendered $PLIST"
  echo "  node    $NODE"
  echo "  gh      ${GH:-missing}"
  echo "  machine $MACHINE"
  echo "  repo    $REPO"
  echo "  log     $LOG"
}

probe() {
  [ -f "$REPO/.env.local" ] || { echo "no $REPO/.env.local: the work loop needs NEON_DATABASE_URL"; exit 3; }
  if security find-generic-password -s squaloo-garage -a wrasse -w >/dev/null 2>&1; then
    echo "  token   keychain squaloo-garage/wrasse: present"
  else
    echo "  token   keychain squaloo-garage/wrasse: MISSING; runs would use this Mac's host login, if any"
  fi
  if command -v gh >/dev/null 2>&1 && gh auth status >/dev/null 2>&1; then
    echo "  gh      signed in"
  else
    echo "  gh      not signed in; publishing will fail until it is"
  fi
}

case "${1:-}" in
  install)
    probe
    render
    launchctl bootout "$TARGET/$LABEL" 2>/dev/null || true
    launchctl bootstrap "$TARGET" "$PLIST"
    launchctl kickstart -k "$TARGET/$LABEL"
    echo "loaded. tail the log: npm run garage:status"
    ;;
  uninstall)
    launchctl bootout "$TARGET/$LABEL" 2>/dev/null && echo "unloaded" || echo "was not loaded"
    rm -f "$PLIST" && echo "removed $PLIST"
    ;;
  status)
    if launchctl print "$TARGET/$LABEL" >/dev/null 2>&1; then
      launchctl print "$TARGET/$LABEL" | grep -E "state =|pid =|last exit" | sed 's/^/  /'
    else
      echo "  not loaded"
    fi
    probe
    echo "  log: $LOG"
    [ -f "$LOG" ] && tail -n 8 "$LOG" | sed 's/^/  /'
    ;;
  logs)
    tail -f "$LOG"
    ;;
  *)
    echo "usage: garage-launchd.sh install|uninstall|status|logs"; exit 2 ;;
esac
