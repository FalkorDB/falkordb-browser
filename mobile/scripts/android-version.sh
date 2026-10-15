#!/bin/sh
# Stamps a release tag onto the Android project:
#
#   sh scripts/android-version.sh v2.6.1 android/app/build.gradle
#   -> versionName "2.6.1", versionCode 20601
#
# The code only grows from release to release (major*10000 + minor*100 + patch),
# so Android installs each release over the previous one. Pre-release tags
# (v3.0.0-rc1) are refused: they would share one code with the final release,
# which then would not count as an update to the release candidate.
set -eu

tag="$1"
gradle="$2"

version="${tag#v}"

# The whole tag is checked before any of it reaches arithmetic or sed: numbers
# without leading zeros (sh reads 08 as octal), MINOR and PATCH below 100 so the
# code keeps growing, and no pre-release suffix.
if ! printf '%s\n' "$version" | grep -Eq '^(0|[1-9][0-9]*)\.(0|[1-9][0-9]?)\.(0|[1-9][0-9]?)$'; then
  echo "Expected vMAJOR.MINOR.PATCH with MINOR and PATCH below 100, and no pre-release suffix: $tag" >&2
  exit 1
fi

major="${version%%.*}"
rest="${version#*.}"
minor="${rest%%.*}"
patch="${rest#*.}"

code=$((major * 10000 + minor * 100 + patch))
# Android requires a positive versionCode, which only v0.0.0 misses, and
# Google Play refuses codes above 2100000000.
if [ "$code" -lt 1 ] || [ "$code" -gt 2100000000 ]; then
  echo "versionCode must be between 1 and 2100000000: $tag" >&2
  exit 1
fi

sed -i.bak \
  -e "s/versionCode [0-9][0-9]*/versionCode $code/" \
  -e "s/versionName \"[^\"]*\"/versionName \"$version\"/" \
  "$gradle"
rm -f "$gradle.bak"

grep -q "versionCode $code" "$gradle" || { echo "No versionCode in $gradle" >&2; exit 1; }
echo "versionName $version, versionCode $code"
