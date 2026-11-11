const { chromium } = require('playwright');
(async () => {
  const errors = []; const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 390, height: 844 } });
  p.on('pageerror', (e) => errors.push(e.message)); p.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  const BASE = 'http://localhost:4173/lectorix/';
  await p.goto(BASE);
  await p.evaluate(() => { localStorage.clear(); localStorage.setItem('lectorix-store', JSON.stringify({ state: { onboardingDone: true, language: 'es', placementDismissed: true }, version: 0 })); });
  await p.reload(); await p.waitForTimeout(800);
  await p.goto(BASE + '#/adaptar'); await p.waitForTimeout(1200);
  const text = 'La fotosíntesis es el proceso por el que las plantas fabrican su alimento. Las hojas captan la luz del sol gracias a la clorofila, un pigmento de color verde. Además, las raíces absorben agua y sales minerales del suelo. Con la luz, el agua y el dióxido de carbono, la planta produce glucosa y libera oxígeno. Por eso las plantas son imprescindibles para la vida en la Tierra.';
  await p.evaluate((t) => { const ta = document.querySelector('textarea'); Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set.call(ta, t); ta.dispatchEvent(new Event('input', { bubbles: true })); }, text);
  await p.getByRole('button', { name: /Adaptar/ }).click(); await p.waitForTimeout(800);
  await p.getByRole('button', { name: /Estudiar este texto/ }).click(); await p.waitForTimeout(1200);
  let body = await p.innerText('body');
  console.log(/Palabras clave del texto/.test(body) && /fotosíntesis/.test(body) ? 'PASS key words screen' : 'FAIL words: ' + body.slice(0, 200));
  await p.screenshot({ path: 'study-words.png', fullPage: true });
  await p.getByRole('button', { name: /Empezar \(\d+ preguntas\)/ }).click(); await p.waitForTimeout(1000);
  await p.screenshot({ path: 'study-q1.png', fullPage: true });
  for (let i = 0; i < 15; i++) {
    const t = await p.innerText('body'); if (/de \d+ bien/.test(t)) break;
    const input = p.locator('input[type=text]:visible').first();
    if (await input.count()) { await input.fill('alimento'); await p.getByRole('button', { name: /Comprobar/ }).first().click().catch(() => {}); }
    else if (!(await p.evaluate(() => { const bs = [...document.querySelectorAll('button')].filter((x) => /^[A-D]\n/.test(x.innerText.trim())); if (bs.length) { bs[0].click(); return true; } return false; }))) {
      await p.evaluate(() => { [...document.querySelectorAll('button')].filter((x) => x.closest('[class*="flex-wrap"]') && x.innerText.trim().length < 25).forEach((x) => x.click()); });
      await p.getByRole('button', { name: /Comprobar/ }).first().click().catch(() => {});
    }
    await p.waitForTimeout(2300);
    const next = p.getByRole('button', { name: /^(Siguiente|Continuar)/ }); if (await next.count()) await next.first().click().catch(() => {});
    await p.waitForTimeout(300);
  }
  body = await p.innerText('body');
  console.log(/\d+ de \d+ bien/.test(body) ? 'PASS finished: ' + body.match(/\d+ de \d+ bien/)[0] : 'FAIL not finished: ' + body.slice(0, 200));
  await p.screenshot({ path: 'study-done.png', fullPage: true });
  const save = p.getByRole('button', { name: /Guardar en Mis palabras/ });
  if (await save.count()) { await save.click(); await p.waitForTimeout(300); const n = await p.evaluate(() => Object.keys(JSON.parse(localStorage.getItem('lectorix-review')).state.items).length); console.log(n > 0 ? 'PASS missed words saved to the notebook (' + n + ')' : 'FAIL not saved'); }
  await b.close(); console.log('ERRORS', errors.length, errors.slice(0, 3));
})();
