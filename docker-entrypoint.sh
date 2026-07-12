#!/bin/sh

# Generate ENCRYPTION_KEY if not provided by the user
if [ -z "$ENCRYPTION_KEY" ]; then
  ENCRYPTION_KEY=$(head -c 32 /dev/urandom | od -A n -t x1 | tr -d ' \n')
  if [ -z "$ENCRYPTION_KEY" ] || [ ${#ENCRYPTION_KEY} -lt 64 ]; then
    echo "ERROR: Failed to generate a valid ENCRYPTION_KEY. Aborting."
    exit 1
  fi
  export ENCRYPTION_KEY
  echo "INFO: No ENCRYPTION_KEY provided, generated a random one for this container session."
  echo "WARNING: Encrypted credentials will be lost if the container is recreated without persisting the key."
fi

# Ensure .data directory exists and is writable (handles volume mounts)
DATA_DIR="/app/.data"
if [ ! -d "$DATA_DIR" ]; then
  mkdir -p "$DATA_DIR" 2>/dev/null || true
fi

# When running as root (default), fix ownership of the data directory so the
# nextjs user can write to it even when a Docker named volume is mounted there
# (named volumes are created owned by root).  Then drop privileges to nextjs.
if [ "$(id -u)" = "0" ]; then
  chown -R nextjs:nodejs "$DATA_DIR" 2>/dev/null || true
  if ! su-exec nextjs:nodejs sh -c 'tmp="$1/.write-test.$$"; touch "$tmp" && rm -f "$tmp"' sh "$DATA_DIR"; then
    echo "ERROR: Data directory $DATA_DIR is not writable for nextjs (uid=1001). Check volume permissions."
    exit 1
  fi
  exec su-exec nextjs:nodejs "$@"
fi

if [ ! -w "$DATA_DIR" ]; then
  echo "ERROR: Data directory $DATA_DIR is not writable. Check volume permissions (uid=1001)."
  exit 1
fi

exec "$@"
