#!/bin/sh

# Generate ENCRYPTION_KEY if not provided by the user
if [ -z "$ENCRYPTION_KEY" ]; then
  export ENCRYPTION_KEY=$(head -c 32 /dev/urandom | od -A n -t x1 | tr -d ' \n')
  echo "INFO: No ENCRYPTION_KEY provided, generated a random one for this container session."
  echo "WARNING: Encrypted credentials will be lost if the container is recreated without persisting the key."
fi

exec "$@"
