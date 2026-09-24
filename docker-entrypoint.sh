#!/bin/sh

# An exported-but-empty secret is a missing secret, not a chosen one. Drop it,
# so neither the check below nor the application can mistake "" for a value.
if [ -z "$AUTH_SECRET" ]; then unset AUTH_SECRET; fi
if [ -z "$NEXTAUTH_SECRET" ]; then unset NEXTAUTH_SECRET; fi

# Generate the session-signing secret if not provided by the user. Never ship a
# default here: a known AUTH_SECRET lets anyone forge a session cookie.
if [ -z "$AUTH_SECRET" ] && [ -z "$NEXTAUTH_SECRET" ]; then
  AUTH_SECRET=$(head -c 32 /dev/urandom | od -A n -t x1 | tr -d ' \n')
  if [ -z "$AUTH_SECRET" ] || [ ${#AUTH_SECRET} -lt 64 ]; then
    echo "ERROR: Failed to generate a valid AUTH_SECRET. Aborting."
    exit 1
  fi
  export AUTH_SECRET
  echo "INFO: No AUTH_SECRET provided, generated a random one for this container session."
  echo "WARNING: Every session is invalidated if the container is recreated without persisting the secret."
else
  # Keep in step with `falkordb-browser.wellKnownSecrets` in the Helm chart.
  for weak in SECRET secret changeme CHANGE_ME_IN_PRODUCTION your-secret-here your-secure-secret-here test-secret-for-ci; do
    if [ "$AUTH_SECRET" = "$weak" ] || [ "$NEXTAUTH_SECRET" = "$weak" ]; then
      echo "ERROR: The auth secret is a well-known placeholder value. Anyone who knows it can forge a session cookie."
      echo "ERROR: Replace it with a random 32-byte value, e.g. \`openssl rand -hex 32\`, or unset it to have one generated."
      exit 1
    fi
  done
fi

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
