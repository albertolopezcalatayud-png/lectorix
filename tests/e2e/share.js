const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 390, height: 844 } });
  const errors = []; p.on('pageerror', (e) => errors.push(e.message));
  await p.goto('http://localhost:4173/lectorix/');
  await p.evaluate(() => { localStorage.clear(); localStorage.setItem('lectorix-store', JSON.stringify({ state: { onboardingDone: true, language: 'es', practiceLanguage: 'auto', progress: [], sessionHistory: [] }, version: 0 })); });
  await p.goto('http://localhost:4173/lectorix/?title=Deberes&text=' + encodeURIComponent('El río Turia atraviesa Valencia. Los niños juegan en el parque.'));
  await p.waitForTimeout(1500);
  const body = await p.innerText('body');
  console.log(p.url(), /Turia/.test(body) ? 'PASS shared text opened adapted' : 'FAIL', /Escuchar todo/.test(body), 'ERRORS', errors);
  await b.close();
})();
