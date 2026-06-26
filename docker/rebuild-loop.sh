#!/bin/sh
# Periodic content refresh for the static site.
#
# The café owner edits the Google Sheet; this loop re-runs the sheet sync +
# Astro build every REBUILD_INTERVAL seconds and publishes the result into a
# shared volume that the nginx container serves. No manual deploy needed —
# edits go live within one interval.
#
# Publishing is atomic: each build lands in its own release-<ts> directory,
# then a *relative* `current` symlink is flipped to point at it. The symlink
# is relative (not /srv/site/...) on purpose — the same volume is mounted at a
# different path inside the nginx container, so an absolute target would dangle
# there. A relative target resolves correctly in both containers.
#
# If a build fails (sheet unreachable, bad data, type error), the previous
# release stays live and we simply retry next interval — the site never breaks.

set -u

INTERVAL="${REBUILD_INTERVAL:-300}"
# After a failed build (e.g. the network/DNS isn't ready yet in the first
# seconds of a fresh container, or a transient fetch error), retry soon
# instead of waiting the full interval — so a blip costs seconds, not minutes.
FAIL_RETRY="${REBUILD_FAIL_RETRY:-15}"
PUBLISH_DIR="${PUBLISH_DIR:-/srv/site}"
KEEP_RELEASES=3

mkdir -p "$PUBLISH_DIR"

# Make `docker stop` responsive: a TERM during the sleep ends the loop cleanly.
trap 'echo "[rebuild] received stop signal — exiting"; exit 0' TERM INT

log() { echo "[rebuild] $(date -u '+%Y-%m-%dT%H:%M:%SZ') $*"; }

while true; do
  log "syncing sheets + building…"

  if npm run build:content; then
    release="release-$(date +%s)"
    cp -a dist "$PUBLISH_DIR/$release"

    # Flip the live pointer atomically (relative target — see header note).
    ( cd "$PUBLISH_DIR" && ln -sfn "$release" current )
    log "published $release — next refresh in ${INTERVAL}s"

    # Prune old releases, keeping the newest $KEEP_RELEASES.
    ( cd "$PUBLISH_DIR" \
        && ls -1dt release-* 2>/dev/null \
        | tail -n +$((KEEP_RELEASES + 1)) \
        | xargs rm -rf 2>/dev/null ) || true

    nap="$INTERVAL"
  else
    log "BUILD FAILED — keeping the previously published site, retrying in ${FAIL_RETRY}s"
    nap="$FAIL_RETRY"
  fi

  sleep "$nap" &
  wait "$!"
done
