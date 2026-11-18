// Tester: "the voices sound great in the samples and terrible in the app". The app kept the first voice list it downloaded,
// so phones installed before a voice change went on with the old voices. Needs: git archive origin/audio voices.json en/kk-lewis en/kk-isabella en/cori | tar -x -C dist/audio
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const p = await b.newPage({ viewport: { width: 390, height: 800 } });
  const reqs = []; p.on('request', (r) => { const u = r.url(); if (u.endsWith('.mp3')) reqs.push(u.replace(/^.*\/audio\//, '')); });
  await p.goto('http://localhost:4173/lectorix/');
  await p.evaluate(async () => {
    localStorage.setItem('lectorix-mode', 'solo'); localStorage.setItem('lectorix-store', JSON.stringify({ state: { onboardingDone: true, language: 'en', practiceLanguage: 'auto', progress: [], sessionHistory: [] }, version: 0 }));
    const c = await caches.open('lectorix-audio-v1');
    await c.put(location.origin + '/lectorix/audio/voices.json', new Response(JSON.stringify({ en: [{ id: 'cori', name: 'Cori', license: '', credit: '' }] }), { headers: { 'content-type': 'application/json' } }));
  });
  await p.goto('http://localhost:4173/lectorix/#/dictado'); await p.reload(); await p.waitForTimeout(1500);
  await p.getByText(/Lift-off/).first().click(); await p.waitForTimeout(4000);
  for (let i = 0; i < 4; i++) {
    const input = p.locator('input[type=text], input:not([type])').first(); if (!(await input.count())) break;
    await input.fill('xx'); await input.press('Enter'); await p.waitForTimeout(600);
    const next = p.getByRole('button', { name: /Next|Continue/ }).first(); if (await next.count()) await next.click();
    await p.waitForTimeout(2500);
  }
  console.log(reqs.join(' '));
  console.log((reqs.length && reqs.every((u) => u.startsWith('en/kk-')) ? 'PASS' : 'FAIL') + ' a stale voice list is replaced by the published one');
  await b.close();
})();
