# End-to-end checks (Playwright)

Run against a local build:

```
npm run build
npx vite preview --port 4173 &
node tests/e2e/<name>.js
```

Each script prints PASS/FAIL lines and `ERRORS n`. Seeds go into localStorage and need a reload.
`shots.js` makes the 1080×1920 Play Store screenshots (set OUT=folder).
The Android checks run in CI: `.github/workflows/android-test.yml` → branches `android-test-34/35`.
