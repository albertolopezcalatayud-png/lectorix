// Lily was removed from the app. A family that had chosen her gets the first English voice (Lewis), and her
// clips are never asked for.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 390, height: 800 } });
  const ok = (c, m) => console.log((c ? 'PASS ' : 'FAIL ') + m);
  const reqs = []; p.on('request', (r) => { if (/\/audio\/en\/kk-[a-z]+\/[a-z0-9]+\.mp3$/.test(r.url())) reqs.push(r.url().split('/audio/')[1]); });
  await p.goto('http://localhost:4173/lectorix/');
  await p.evaluate(() => {
    localStorage.setItem('lectorix-mode', 'solo');
    localStorage.setItem('lectorix-natural-voice-choice', JSON.stringify({ en: 'kk-lily' }));
    localStorage.setItem('lectorix-store', JSON.stringify({ state: { onboardingDone: true, language: 'en', practiceLanguage: 'auto', progress: [], sessionHistory: [] }, version: 0 }));
  });
  await p.goto('http://localhost:4173/lectorix/#/silabas'); await p.reload(); await p.waitForTimeout(1500);
  await p.getByRole('button', { name: /^d: dog/ }).click(); await p.waitForTimeout(1200);
  ok(reqs.length > 0 && reqs.every((u) => u.startsWith('en/kk-lewis/')), `with Lily chosen before, Lewis speaks (${reqs.join(' ')})`);
  await b.close();
})();
