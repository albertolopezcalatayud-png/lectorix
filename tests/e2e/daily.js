const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 390, height: 844 } });
  const errors = []; p.on('pageerror', (e) => errors.push(e.message));
  await p.goto('http://localhost:4173/lectorix/');
  await p.evaluate(() => { localStorage.clear(); localStorage.setItem('lectorix-store', JSON.stringify({ state: { onboardingDone: true, language: 'es', practiceLanguage: 'auto', progress: [], sessionHistory: [], user: { id: 'u', display_name: 'Ana', total_xp: 100, streak_days: 0, last_session: '2020-01-01T00:00:00Z' } }, version: 0 })); });
  const xp = () => p.evaluate(() => JSON.parse(localStorage.getItem('lectorix-store')).state.user.total_xp);
  for (let round = 1; round <= 2; round++) {
    await p.goto('http://localhost:4173/lectorix/#/reto-diario'); await p.reload(); await p.waitForTimeout(1500);
    const before = await xp();
    for (let i = 0; i < 5; i++) {
      await p.locator('button').filter({ hasText: /^\s*[A-D]\s*\S/ }).first().click();
      await p.waitForTimeout(2300);
      const next = p.getByText(/^(Siguiente|Continuar)/); if (await next.count()) { await next.first().click(); await p.waitForTimeout(500); }
      if (/resultados/.test(p.url())) break;
    }
    await p.waitForTimeout(1200);
    const after = await xp(); const body = await p.innerText('body');
    console.log('round', round, 'url', p.url().split('#')[1], 'xp', before, '→', after, 'gained', after - before, /Incluye \+50 puntos/.test(body) ? 'bonus shown' : 'no bonus line');
    if (round === 1) await p.screenshot({ path: __dirname + '/daily.png' });
  }
  await p.goto('http://localhost:4173/lectorix/#/'); await p.waitForTimeout(800);
  console.log(/Hecha hoy/.test(await p.innerText('body')) ? 'dashboard shows done today' : 'dashboard not updated', 'ERRORS', errors);
  await b.close();
})();
