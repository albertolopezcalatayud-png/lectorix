const { chromium, devices } = require('playwright');
(async () => {
  const b = await chromium.launch(); const errors = [];
  const ctx = await b.newContext({ ...devices['Pixel 7'] });
  const p = await ctx.newPage(); p.on('pageerror', (e) => errors.push(e.message));
  await p.goto('http://localhost:4173/lectorix/');
  await p.evaluate(() => { localStorage.clear(); localStorage.setItem('lectorix-store', JSON.stringify({ state: { onboardingDone: true, language: 'ca', practiceLanguage: 'auto', progress: [], sessionHistory: [] }, version: 0 })); });
  await p.reload(); await p.waitForTimeout(2500);
  const dash = await p.innerText('body');
  console.log(/Falta la veu en valencià/.test(dash) ? 'PASS banner on dashboard' : 'FAIL no banner');
  await p.getByText(/Falta la veu en valencià/).click(); await p.waitForTimeout(2500);
  const body = await p.innerText('body');
  console.log(/Text a veu/.test(body) && /Serveis de veu de Google/.test(body) && /«Català» \(per al valencià\)/.test(body) ? 'PASS Android steps in Valencian' : 'FAIL steps', p.url().split('#')[1]);
  await p.screenshot({ path: __dirname + '/voices.png', fullPage: true });
  console.log('ERRORS', errors); await b.close();
})();
