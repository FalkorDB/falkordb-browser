#!/bin/sh

# Convert CYPHER environment variable to boolean for supervisord
if [ "$CYPHER" = "1" ]; then
    export CYPHER="true"
    echo "text-to-cypher mode enabled"
else
    export CYPHER="false"
    echo "text-to-cypher mode disabled"
fi

# Start supervisord
exec /usr/bin/supervisord -n -c /etc/supervisor/conf.d/supervisord.conf