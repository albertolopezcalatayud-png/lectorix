const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 390, height: 844 } });
  const errors = []; p.on('pageerror', (e) => errors.push(e.message));
  await p.goto('http://localhost:4173/lectorix/');
  await p.evaluate(() => { localStorage.clear(); localStorage.setItem('lectorix-store', JSON.stringify({ state: { onboardingDone: true, language: 'es', practiceLanguage: 'auto', progress: [], sessionHistory: [], user: { id: 'u', display_name: 'Lucía Pérez', total_xp: 5, streak_days: 1, last_session: new Date().toISOString() } }, version: 0 })); });
  await p.goto('http://localhost:4173/lectorix/#/ajustes'); await p.reload(); await p.waitForTimeout(1000);
  // capture the mailto
  await p.evaluate(() => { const orig = Object.getOwnPropertyDescriptor(Location.prototype, 'href'); window.__mail = null; document.addEventListener('click', () => {}, true); });
  await p.getByRole('button', { name: 'Error en un ejercicio' }).click();
  const [req] = await Promise.all([
    p.waitForEvent('framenavigated', { timeout: 3000 }).catch(() => null),
    p.getByRole('button', { name: /Escribir el correo/ }).click(),
  ]);
  await p.waitForTimeout(500);
  await p.getByText('Enviar una sugerencia').scrollIntoViewIfNeeded();
  await p.screenshot({ path: __dirname + '/fb.png' });
  console.log('rendered', await p.getByText('Enviar una sugerencia').count(), 'ERRORS', errors);
  await b.close();
})();
