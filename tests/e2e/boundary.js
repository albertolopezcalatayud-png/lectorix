const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 390, height: 844 } });
  const BASE = 'http://localhost:4173/lectorix/';
  await p.goto(BASE);
  await p.evaluate(() => { localStorage.clear(); localStorage.setItem('lectorix-store', JSON.stringify({ state: { onboardingDone: true, language: 'es', progress: [null], sessionHistory: [] }, version: 0 })); });
  await p.reload(); await p.waitForTimeout(800);
  await p.goto(BASE + '#/modulos/fonologia'); await p.waitForTimeout(1500);
  let t = await p.innerText('body'); console.log(/algo no ha salido bien/.test(t) ? 'PASS fallback shown instead of a blank screen' : 'FAIL: ' + t.slice(0, 120));
  await p.screenshot({ path: 'boundary.png' });
  const n = await p.evaluate(() => JSON.parse(localStorage.getItem('lectorix-errors') || '[]').length); console.log(n > 0 ? 'PASS error saved (' + n + ')' : 'FAIL nothing saved');
  // Fix the data and go home: the app recovers
  await p.evaluate(() => { const s = JSON.parse(localStorage.getItem('lectorix-store')); s.state.progress = []; localStorage.setItem('lectorix-store', JSON.stringify(s)); });
  await p.reload(); await p.waitForTimeout(1000);
  await p.goto(BASE + '#/ajustes'); await p.waitForTimeout(1200); t = await p.innerText('body');
  console.log(/Informe de errores/.test(t) && /Hay \d+ errores guardados/.test(t) ? 'PASS error report in settings' : 'FAIL report: ' + (t.match(/Informe[\s\S]{0,120}/) || [''])[0]);
  await p.locator('text=Informe de errores').scrollIntoViewIfNeeded(); await p.screenshot({ path: 'report.png' });
  await b.close(); })();
