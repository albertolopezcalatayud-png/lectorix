// English dictation plays the Kokoro clips recorded slowly and alternates Lewis and Isabella.
// Needs the audio in the preview: git archive origin/audio voices.json en/kk-lewis en/kk-isabella | tar -x -C dist/audio
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const p = await b.newPage({ viewport: { width: 390, height: 800 } });
  const reqs = []; const errs = [];
  p.on('request', (r) => { const u = r.url(); if (u.endsWith('.mp3')) reqs.push(u.replace(/^.*\/audio\//, '')); });
  p.on('pageerror', (e) => errs.push(e.message));
  await p.goto('http://localhost:4173/lectorix/');
  await p.evaluate(() => { localStorage.setItem('lectorix-mode', 'solo'); localStorage.setItem('lectorix-store', JSON.stringify({ state: { onboardingDone: true, language: 'en', practiceLanguage: 'auto', progress: [], sessionHistory: [] }, version: 0 })); });
  await p.goto('http://localhost:4173/lectorix/#/dictado'); await p.reload();
  await p.waitForTimeout(1500);
  const body = await p.innerText('body');
  console.log(body.slice(0, 300).replace(/\n+/g, ' | '));
  // start a dictation
  const start = p.getByText(/Lift-off|Liftoff|Take-off|Takeoff/).first();
  if (await start.count()) await start.click(); await p.waitForTimeout(2000)
  await p.waitForTimeout(2500);
  for (let i = 0; i < 6; i++) {
    const turtle = p.getByRole('button', { name: /slow/i }).first();
    if (await turtle.count()) { await turtle.click(); await p.waitForTimeout(1500); }
    const input = p.locator('input[type=text], input:not([type])').first();
    if (!(await input.count())) break;
    await input.fill('xx'); await input.press('Enter'); await p.waitForTimeout(600);
    const next = p.getByRole('button', { name: /Next|Continue/ }).first();
    if (await next.count()) await next.click();
    await p.waitForTimeout(1800);
  }
  console.log(reqs.join('\n')); console.log('errors', errs);
  const ok = (c, m) => console.log((c ? 'PASS ' : 'FAIL ') + m);
  ok(reqs.length > 0 && reqs.every((u) => /\/(slow|slower)\//.test(u)), 'dictation uses the slow clips only');
  ok(reqs.some((u) => u.startsWith('en/kk-lewis/')) && reqs.some((u) => u.startsWith('en/kk-isabella/')), 'both English voices (Lewis, Isabella) are used');
  ok(reqs.some((u) => u.includes('/slower/')), '🐢 plays the slower clip');
  ok(errs.length === 0, 'no page errors');
  await b.close();
})();
