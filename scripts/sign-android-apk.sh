#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
repo_dir="$PWD"
unsigned_apk="${1:?Pass the unsigned APK path}"
: "${ANDROID_HOME:?Set ANDROID_HOME to your Android SDK}"
: "${NEXUS_KEYSTORE:?Set NEXUS_KEYSTORE to the private release keystore outside the repository}"
: "${NEXUS_PASSWORD_FILE:?Set NEXUS_PASSWORD_FILE to its private password file}"
android_tools="$ANDROID_HOME/build-tools/35.0.0"
artifact_name="nexus-home-1.0.0-arm64.apk"
output_dir="$repo_dir/apps/web/public/downloads"
test -s "$unsigned_apk"
mkdir -p "$output_dir"
aligned_apk=$(mktemp /tmp/nexus-aligned.XXXXXX.apk)
trap 'rm -f "$aligned_apk"' EXIT
"$android_tools/zipalign" -P 16 -f 4 "$unsigned_apk" "$aligned_apk"
"$android_tools/apksigner" sign --ks "$NEXUS_KEYSTORE" --ks-key-alias nexus-home \
 --ks-pass "file:$NEXUS_PASSWORD_FILE" \
 --v4-signing-enabled false --out "$output_dir/$artifact_name" "$aligned_apk"
"$android_tools/apksigner" verify --verbose --print-certs "$output_dir/$artifact_name"
(
 cd "$output_dir"
 sha256sum "$artifact_name" > "$artifact_name.sha256"
)
echo "APK signed and verified: apps/web/public/downloads/$artifact_name"
