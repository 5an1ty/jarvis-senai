#!/usr/bin/env bash
set -euo pipefail
sdk_dir="${ANDROID_HOME:-$RUNNER_TEMP/android-sdk}"
sdk_manager="$sdk_dir/cmdline-tools/latest/bin/sdkmanager"
if [[ ! -x "$sdk_manager" ]]; then
 export NEXUS_ANDROID_SDK_DIR="$sdk_dir"
 python3 - <<'PY'
import os, pathlib, urllib.request, xml.etree.ElementTree as ET, hashlib, zipfile
root=pathlib.Path(os.environ['NEXUS_ANDROID_SDK_DIR'])
name='commandlinetools-linux-13114758_latest.zip'
base='https://dl.google.com/android/repository/'
manifest=ET.fromstring(urllib.request.urlopen(base+'repository2-1.xml').read())
checksum=None
for complete in manifest.iter('complete'):
    if complete.findtext('url')==name:
        checksum=complete.findtext('checksum'); break
if not checksum: raise SystemExit('Official SDK checksum unavailable')
archive=root.parent/'nexus-android-tools.zip'
root.mkdir(parents=True,exist_ok=True)
archive.write_bytes(urllib.request.urlopen(base+name).read())
if hashlib.sha1(archive.read_bytes()).hexdigest()!=checksum: raise SystemExit('SDK checksum mismatch')
with zipfile.ZipFile(archive) as z:z.extractall(root/'nexus-bootstrap')
latest=root/'cmdline-tools/latest'
latest.parent.mkdir(parents=True,exist_ok=True)
(root/'nexus-bootstrap/cmdline-tools').rename(latest)
for p in (latest/'bin').iterdir():p.chmod(0o755)
print('Official Android command line tools verified and installed')
PY
fi
export ANDROID_HOME="$sdk_dir"
# SDK tools may need a newer JVM than the native build's JDK 17.
sdk_java="${JAVA_HOME_21_X64:-$JAVA_HOME}"
set +o pipefail
yes | JAVA_HOME="$sdk_java" "$sdk_manager" --sdk_root="$sdk_dir" --licenses >/dev/null
set -o pipefail
JAVA_HOME="$sdk_java" "$sdk_manager" --sdk_root="$sdk_dir" \
 'platforms;android-35' 'build-tools;35.0.0' 'ndk;27.1.12297006' 'cmake;3.22.1'
if [[ -n "${GITHUB_ENV:-}" ]]; then
 printf 'ANDROID_HOME=%s\nANDROID_SDK_ROOT=%s\n' "$sdk_dir" "$sdk_dir" >> "$GITHUB_ENV"
fi
