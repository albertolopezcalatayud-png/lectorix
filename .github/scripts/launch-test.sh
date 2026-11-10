#!/usr/bin/env bash
# Installs the universal APK, launches Lectorix and records what happens.
set -x
OUT=/tmp/out-$1
mkdir -p "$OUT"
adb wait-for-device
adb shell getprop ro.build.version.release > "$OUT/android-version.txt"
adb shell pm list packages | grep -i -E 'chrome|webview|browser' > "$OUT/browsers.txt"
adb shell dumpsys package com.android.chrome | grep -i versionName >> "$OUT/browsers.txt"
adb install -r /tmp/universal.apk > "$OUT/install.txt" 2>&1
adb logcat -c
adb shell am start -W -n com.lectorix.app/com.google.androidbrowserhelper.trusted.LauncherActivity > "$OUT/start.txt" 2>&1
sleep 25
adb exec-out screencap -p > "$OUT/screen-25s.png"
adb shell dumpsys activity activities | grep -E 'mResumedActivity|topResumedActivity|ResumedActivity' > "$OUT/top-activity.txt"
adb shell pidof com.lectorix.app > "$OUT/pid.txt"
adb logcat -d > "$OUT/logcat-full.txt"
grep -E -A40 'FATAL EXCEPTION|AndroidRuntime' "$OUT/logcat-full.txt" > "$OUT/crash.txt"
grep -i -E 'lectorix|TWA|TrustedWeb|browserhelper|ActivityTaskManager' "$OUT/logcat-full.txt" > "$OUT/logcat-app.txt"
exit 0
