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
# bridge address is never baked into the APK. When that interface is a tunnel
# (a full-tunnel VPN), the phone most likely cannot reach it, so nothing is
# returned. Anything else is left to FALKORDB_BROWSER_URL.
is_tunnel() {
  case "$1" in tun*|tap*|utun*|wg*|ppp*|ipsec*|tailscale*|zt*) return 0 ;; *) return 1 ;; esac
}
lan_ip() {
  if command -v route >/dev/null 2>&1 && command -v ipconfig >/dev/null 2>&1; then
    # macOS: whichever interface the default route uses, not only en0.
    iface="$(route -n get default 2>/dev/null | awk '$1 == "interface:" { print $2 }')"
    [ -n "$iface" ] && ! is_tunnel "$iface" && ipconfig getifaddr "$iface"
  elif command -v ip >/dev/null 2>&1; then
    ip -4 route get 1.1.1.1 | awk '{
      for (i = 1; i < NF; i++) { if ($i == "dev") dev = $(i + 1); if ($i == "src") src = $(i + 1) }
    } END { print dev, src }' | {
      read -r dev src
      is_tunnel "$dev" || echo "$src"
    }
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
