#!/usr/bin/env bash
# 1) Release build: install, launch, screenshots, relaunch, crashes.
# 2) Debug build: drive the app through the WebView debugger (webview-check.mjs).
set -x
OUT=/tmp/out-$1
mkdir -p "$OUT"
adb wait-for-device
adb shell getprop ro.build.version.release > "$OUT/android-version.txt"
adb shell pm list packages | grep -i -E 'tts|webview' > "$OUT/engines.txt"
adb install -r /tmp/universal.apk > "$OUT/install.txt" 2>&1
adb logcat -c
adb shell am start -W -n com.lectorix.app/.MainActivity > "$OUT/start.txt" 2>&1
sleep 4
adb exec-out screencap -p > "$OUT/release-04s.png"
sleep 10
adb exec-out screencap -p > "$OUT/release-14s.png"
adb shell dumpsys activity activities | grep -E 'topResumedActivity|mResumedActivity' > "$OUT/top-activity.txt"
adb shell pidof com.lectorix.app > "$OUT/pid.txt"
adb shell am force-stop com.lectorix.app
adb shell monkey -p com.lectorix.app -c android.intent.category.LAUNCHER 1 > "$OUT/relaunch.txt" 2>&1
sleep 8
adb exec-out screencap -p > "$OUT/release-relaunch.png"
adb logcat -d > "$OUT/logcat-release.txt"
grep -E -A40 'FATAL EXCEPTION' "$OUT/logcat-release.txt" > "$OUT/crash-release.txt"

# Debug build (same package, different signature): replace and drive it
adb uninstall com.lectorix.app > /dev/null 2>&1
adb install -r /tmp/debug.apk > "$OUT/install-debug.txt" 2>&1
adb shell pm grant com.lectorix.app android.permission.POST_NOTIFICATIONS 2>/dev/null
adb logcat -c
adb shell am start -W -n com.lectorix.app/.MainActivity > /dev/null 2>&1
sleep 8
# wait until the app's WebView can be debugged (it can take a while on a cold emulator)
for i in $(seq 1 20); do
  PID=$(adb shell pidof com.lectorix.app | tr -d '\r')
  adb forward --remove-all > /dev/null 2>&1
  adb forward tcp:9222 localabstract:webview_devtools_remote_$PID > /dev/null 2>&1
  if curl -s --max-time 3 http://localhost:9222/json | grep -q '"type": *"page"'; then break; fi
  sleep 3
done
node .github/scripts/webview-check.mjs "$OUT" > "$OUT/webview-check.txt" 2>&1
adb logcat -d > "$OUT/logcat-debug.txt"
grep -E -A40 'FATAL EXCEPTION' "$OUT/logcat-debug.txt" > "$OUT/crash-debug.txt"
grep -i -E 'Capacitor|TextToSpeech|TTS|Console' "$OUT/logcat-debug.txt" | tail -300 > "$OUT/logcat-app.txt"
# a failed check fails the step, so the workflow tries once more on a fresh emulator
grep -q 'RESULT PASS' "$OUT/webview-check.txt" || exit 1
exit 0
