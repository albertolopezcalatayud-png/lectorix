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

Daily checks (also run by the scheduled daily sweep):
- `sweep.js`: every screen in es/ca/en, new and used profile; page and console errors, failed requests, broken images, horizontal scroll, `undefined`/`NaN`/raw keys in the text.
- `play.js`: a whole session of every module at the first, a middle and the last level in each language.
- `a11y.js`: axe WCAG 2 AA audit in light and dark mode (`AXE=/path/axe.min.js`).
