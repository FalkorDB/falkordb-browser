#!/bin/sh
# Stamps a release tag onto the Android project:
#
#   sh scripts/android-version.sh v2.6.1 android/app/build.gradle
#   -> versionName "2.6.1", versionCode 20601
#
# The code only grows from release to release (major*10000 + minor*100 + patch),
# so Android installs each release over the previous one. A pre-release suffix
# (v3.0.0-rc1) stays in the name and is left out of the code.
set -eu

tag="$1"
gradle="$2"

version="${tag#v}"
core="${version%%-*}"

case "$core" in
  *[!0-9.]* | *..* | .* | *. | "") echo "Not a release tag: $tag" >&2; exit 1 ;;
esac

IFS=. read -r major minor patch extra <<EOF
$core
EOF
if [ -z "${major:-}" ] || [ -z "${minor:-}" ] || [ -z "${patch:-}" ] || [ -n "${extra:-}" ] \
  || [ "$minor" -gt 99 ] || [ "$patch" -gt 99 ]; then
  echo "Expected vMAJOR.MINOR.PATCH with MINOR and PATCH below 100: $tag" >&2
  exit 1
fi

code=$((major * 10000 + minor * 100 + patch))

sed -i.bak \
  -e "s/versionCode [0-9][0-9]*/versionCode $code/" \
  -e "s/versionName \"[^\"]*\"/versionName \"$version\"/" \
  "$gradle"
rm -f "$gradle.bak"

grep -q "versionCode $code" "$gradle" || { echo "No versionCode in $gradle" >&2; exit 1; }
echo "versionName $version, versionCode $code"
