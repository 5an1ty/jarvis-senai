#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
repo_dir="$PWD"
: "${ANDROID_HOME:?Set ANDROID_HOME to your Android SDK}"
: "${NEXUS_KEYSTORE:?Set NEXUS_KEYSTORE to the private release keystore outside the repository}"
: "${NEXUS_PASSWORD_FILE:?Set NEXUS_PASSWORD_FILE to its private password file}"
android_tools="$ANDROID_HOME/build-tools/35.0.0"
artifact_name="nexus-home-1.0.0-arm64.apk"
mkdir -p "$repo_dir/apps/web/public/downloads"
(
 cd apps/mobile/android
 ./gradlew :app:assembleRelease -PreactNativeArchitectures=arm64-v8a \
  -Pandroid.enableBundleCompression=true -Pexpo.useLegacyPackaging=true --max-workers="${NEXUS_BUILD_WORKERS:-2}" --console=plain
)
"$android_tools/zipalign" -P 16 -f 4 \
 "$repo_dir/apps/mobile/android/app/build/outputs/apk/release/app-release-unsigned.apk" \
 "$repo_dir/apps/mobile/android/app/build/outputs/apk/release/app-release-aligned.apk"
"$android_tools/apksigner" sign --ks "$NEXUS_KEYSTORE" --ks-key-alias nexus-home \
 --ks-pass "file:$NEXUS_PASSWORD_FILE" --key-pass "file:$NEXUS_PASSWORD_FILE" \
 --v4-signing-enabled false \
 --out "$repo_dir/apps/web/public/downloads/$artifact_name" \
 "$repo_dir/apps/mobile/android/app/build/outputs/apk/release/app-release-aligned.apk"
"$android_tools/apksigner" verify --verbose --print-certs \
 "$repo_dir/apps/web/public/downloads/$artifact_name"
(
 cd apps/web/public/downloads
 sha256sum "$artifact_name" > "$artifact_name.sha256"
)
echo "APK signed and verified: apps/web/public/downloads/$artifact_name"
