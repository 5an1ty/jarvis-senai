#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
repo_dir="$PWD"
: "${ANDROID_HOME:?Set ANDROID_HOME to your Android SDK}"
: "${NEXUS_KEYSTORE:?Set NEXUS_KEYSTORE to the private release keystore outside the repository}"
: "${NEXUS_PASSWORD_FILE:?Set NEXUS_PASSWORD_FILE to its private password file}"
mkdir -p "$repo_dir/apps/web/public/downloads"
(
 cd apps/mobile/android
 ./gradlew :app:assembleRelease -PreactNativeArchitectures=arm64-v8a \
  -Pandroid.enableBundleCompression=true -Pexpo.useLegacyPackaging=true --max-workers="${NEXUS_BUILD_WORKERS:-2}" --console=plain
)
bash "$repo_dir/scripts/sign-android-apk.sh" \
 "$repo_dir/apps/mobile/android/app/build/outputs/apk/release/app-release-unsigned.apk"
