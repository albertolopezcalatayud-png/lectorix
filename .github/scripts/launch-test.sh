#!/usr/bin/env bash
# Installs the universal APK, launches Lectorix and records what happens.
set -x
OUT=/tmp/out-$1
mkdir -p "$OUT"
adb wait-for-device
adb shell getprop ro.build.version.release > "$OUT/android-version.txt"
adb shell pm list packages | grep -i -E 'chrome|webview|browser' > "$OUT/browsers.txt"
adb shell dumpsys package com.android.chrome | grep -i versionName >> "$OUT/browsers.txt"
INSTALLER=""; case "$1" in play-*) INSTALLER="-i com.android.vending";; esac
adb install -r $INSTALLER /tmp/universal.apk > "$OUT/install.txt" 2>&1
# Skip Chrome's first-run screens so the web app itself is shown
adb shell am set-debug-app --persistent com.android.chrome
adb shell "echo '_ --disable-fre --no-default-browser-check --no-first-run' > /data/local/tmp/chrome-command-line"
adb shell am force-stop com.android.chrome
adb logcat -c
adb shell am start -W -n com.lectorix.app/com.google.androidbrowserhelper.trusted.LauncherActivity > "$OUT/start.txt" 2>&1
sleep 25
adb exec-out screencap -p > "$OUT/screen-25s.png"
sleep 20
adb exec-out screencap -p > "$OUT/screen-45s.png"
adb shell dumpsys activity activities | grep -E 'mResumedActivity|topResumedActivity|ResumedActivity' > "$OUT/top-activity.txt"
adb shell pidof com.lectorix.app > "$OUT/pid.txt"
# Second launch from the launcher, like a user reopening the app
adb shell am force-stop com.lectorix.app
adb shell monkey -p com.lectorix.app -c android.intent.category.LAUNCHER 1 > "$OUT/relaunch.txt" 2>&1
sleep 20
adb exec-out screencap -p > "$OUT/screen-relaunch.png"
adb shell dumpsys activity activities | grep -E 'topResumedActivity|mResumedActivity' > "$OUT/top-activity-relaunch.txt"
adb shell pm get-app-links com.lectorix.app > "$OUT/app-links.txt" 2>&1
adb logcat -d > "$OUT/logcat-full.txt"
grep -E -A40 'FATAL EXCEPTION|AndroidRuntime' "$OUT/logcat-full.txt" > "$OUT/crash.txt"
grep -i -E 'lectorix|TWA|TrustedWeb|browserhelper|ActivityTaskManager' "$OUT/logcat-full.txt" > "$OUT/logcat-app.txt"
exit 0
