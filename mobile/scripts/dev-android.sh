#!/bin/sh
# Builds a debug APK that opens a browser served over plain http on your local
# network, for trying the app on a phone before anything is deployed.
#
#   npm run dev:android                          # http://<this machine's LAN IP>:3300
#   FALKORDB_BROWSER_URL=http://192.168.1.52:3000 npm run dev:android
#
# The APK lands in mobile/dist/FalkorDB-Browser-android-dev.apk. Release builds
# never come from here: they are built and signed by .github/workflows/mobile.yml.
set -eu

cd "$(dirname "$0")/.."

lan_ip() {
  if command -v ipconfig >/dev/null 2>&1 && ipconfig getifaddr en0 >/dev/null 2>&1; then
    ipconfig getifaddr en0
  else
    hostname -I | awk '{print $1}'
  fi
}

: "${PORT:=3300}"
: "${FALKORDB_BROWSER_URL:=http://$(lan_ip):$PORT}"
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
