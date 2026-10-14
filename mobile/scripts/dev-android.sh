#!/bin/sh
# Builds a debug APK that opens a browser served over plain http on your local
# network, for trying the app on a phone before anything is deployed.
#
#   npm run dev:android                          # http://<this machine's LAN IP>:3000 (npm run dev)
#   FALKORDB_BROWSER_URL=http://192.168.1.52:3000 npm run dev:android
#
# The APK lands in mobile/dist/FalkorDB-Browser-android-dev.apk. Release builds
# never come from here: they are built and signed by .github/workflows/mobile.yml.
set -eu

cd "$(dirname "$0")/.."

# The address of the interface the default route goes out of, so a Docker
# bridge or VPN address is never baked into the APK. Anything else is left to
# FALKORDB_BROWSER_URL.
lan_ip() {
  if command -v ipconfig >/dev/null 2>&1 && ipconfig getifaddr en0 >/dev/null 2>&1; then
    ipconfig getifaddr en0
  elif command -v ip >/dev/null 2>&1; then
    ip -4 route get 1.1.1.1 | awk '{ for (i = 1; i < NF; i++) if ($i == "src") { print $(i + 1); exit } }'
  fi
}

: "${PORT:=3000}"
if [ -z "${FALKORDB_BROWSER_URL:-}" ]; then
  ip="$(lan_ip 2>/dev/null || true)"
  if [ -z "$ip" ]; then
    echo "Could not find this machine's LAN IP; set FALKORDB_BROWSER_URL=http://<ip>:<port> yourself." >&2
    exit 1
  fi
  FALKORDB_BROWSER_URL="http://$ip:$PORT"
fi
export FALKORDB_BROWSER_URL
export FALKORDB_BROWSER_ALLOW_HTTP=1

echo "Building a debug APK that opens $FALKORDB_BROWSER_URL"

if [ -d android ]; then npx cap sync android; else npx cap add android; fi

# Android blocks plain http unless the manifest allows it. Allow it in the
# debug source set only, which release builds never include.
debug_manifest=android/app/src/debug/AndroidManifest.xml
if [ ! -f "$debug_manifest" ]; then
  mkdir -p "$(dirname "$debug_manifest")"
  cat > "$debug_manifest" <<'EOF'
<?xml version="1.0" encoding="utf-8"?>
<!-- Debug builds only: lets npm run dev:android open an http:// dev server. -->
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <application android:usesCleartextTraffic="true" />
</manifest>
EOF
fi

(cd android && ./gradlew assembleDebug --no-daemon -q)

mkdir -p dist
cp android/app/build/outputs/apk/debug/app-debug.apk dist/FalkorDB-Browser-android-dev.apk
echo "Built mobile/dist/FalkorDB-Browser-android-dev.apk"
