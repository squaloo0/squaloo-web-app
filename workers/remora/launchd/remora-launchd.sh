#!/bin/sh
# The machine on a Mac: install | uninstall | status | logs
#
#   npm run remora:install      render the plist with this Mac's absolute paths, load it
#   npm run remora:uninstall    unload and remove it
#   npm run remora:status       is it running, and what did it say last
#
# Reads .env.local from the repo root at run time (the worker does that itself).
# Keeps the Mac awake only while a vend is running? No: launchd cannot. If this Mac
# sleeps, the worker sleeps with it and the stale sweep on another worker (or this one,
# on waking) returns any half-vended coin to the shelf. See the LOG for pmset notes.
set -eu

LABEL="com.squaloo.remora.worker"
REPO="$(cd "$(dirname "$0")/../../.." && pwd)"
HERE="$REPO/workers/remora/launchd"
PLIST="$HOME/Library/LaunchAgents/$LABEL.plist"
LOGDIR="$HOME/Library/Logs/remora"
LOG="$LOGDIR/worker.log"
TARGET="gui/$(id -u)"

render() {
  NODE="$(command -v node || true)"
  [ -n "$NODE" ] || { echo "node not on PATH; install Node 22 first"; exit 3; }
  YTDLP="$(command -v yt-dlp || true)"
  FFMPEG="$(command -v ffmpeg || true)"
  [ -n "$YTDLP" ] || echo "warning: yt-dlp not on PATH (brew install yt-dlp); the worker will say OUT OF ORDER"
  [ -n "$FFMPEG" ] || echo "warning: ffmpeg not on PATH (brew install ffmpeg); merges will fail"
  # PATH for launchd: wherever node, yt-dlp and ffmpeg live on this Mac, plus the basics.
  P="$(dirname "$NODE")"
  [ -n "$YTDLP" ] && P="$P:$(dirname "$YTDLP")"
  [ -n "$FFMPEG" ] && P="$P:$(dirname "$FFMPEG")"
  P="$P:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin"
  MACHINE="${REMORA_MACHINE_NAME:-$(hostname -s | tr 'A-Z' 'a-z')}"
  mkdir -p "$LOGDIR" "$HOME/Library/LaunchAgents"
  sed -e "s|@NODE@|$NODE|g" -e "s|@REPO@|$REPO|g" -e "s|@PATH@|$P|g" -e "s|@HOME@|$HOME|g" \
      -e "s|@MACHINE@|$MACHINE|g" -e "s|@LOG@|$LOG|g" \
      "$HERE/$LABEL.plist.template" > "$PLIST"
  plutil -lint "$PLIST" >/dev/null
  echo "rendered $PLIST"
  echo "  node    $NODE"
  echo "  yt-dlp  ${YTDLP:-missing}"
  echo "  ffmpeg  ${FFMPEG:-missing}"
  echo "  machine $MACHINE"
  echo "  repo    $REPO"
  echo "  log     $LOG"
}

case "${1:-}" in
  install)
    [ -f "$REPO/.env.local" ] || { echo "no $REPO/.env.local: the worker needs NEON_DATABASE_URL and REMORA_R2_* (see LOG)"; exit 3; }
    render
    launchctl bootout "$TARGET/$LABEL" 2>/dev/null || true
    launchctl bootstrap "$TARGET" "$PLIST"
    launchctl kickstart -k "$TARGET/$LABEL"
    echo "loaded. tail the log: npm run remora:status"
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
    echo "  log: $LOG"
    [ -f "$LOG" ] && tail -n 8 "$LOG" | sed 's/^/  /'
    ;;
  logs)
    tail -f "$LOG"
    ;;
  *)
    echo "usage: remora-launchd.sh install|uninstall|status|logs"; exit 2 ;;
esac
