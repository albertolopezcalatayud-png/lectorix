// A family that chose Lily keeps her for texts, but a word said on its own (letters and words, tracing examples)
// is played by the first dictation voice: Lily stretches the first sound of single words.
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
  ok(reqs.length > 0 && reqs.every((u) => u.startsWith('en/kk-lewis/')), `a single word is played by Lewis, not Lily (${reqs.join(' ')})`);
  await b.close();
})();
