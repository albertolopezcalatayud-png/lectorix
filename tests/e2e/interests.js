const { chromium } = require('playwright');
const BASE = 'http://localhost:4173/lectorix/';
const OUT = __dirname + '/int-';
(async () => {
  const b = await chromium.launch();
  const errors = [];
  const check = (c, m) => { console.log(c ? 'PASS' : 'FAIL', m); if (!c) errors.push(m); };
  for (const [lang, level, want] of [['es', 1, 'La Luna'], ['ca', 7, 'Hi va haver aigua a Mart?'], ['en', 5, 'A house in space']]) {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
    const p = await ctx.newPage();
    p.on('pageerror', (e) => errors.push(`${lang} pageerror ${e.message}`));
    p.on('console', (m) => { if (m.type() === 'error') errors.push(`${lang} console ${m.text()}`); });
    await p.goto(BASE);
    await p.evaluate(({ lang, level }) => {
      localStorage.clear();
      const sl = { fonologia: level, memoria_visual: level, comprension_lectora: level, escritura: level, retos_rapidos: level };
      localStorage.setItem('lectorix-store', JSON.stringify({ state: { onboardingDone: true, language: lang, practiceLanguage: 'auto', progress: [], sessionHistory: [], startLevels: { [lang]: sl }, placementDone: { [lang]: true } }, version: 0 }));
    }, { lang, level });
    await p.reload(); await p.waitForTimeout(600);
    await p.goto(BASE + '#/lectura'); await p.waitForTimeout(900);
    await p.getByRole('button', { name: /Espacio|Espai|Space/ }).click(); await p.waitForTimeout(400);
    const body = await p.innerText('body');
    const fy = body.split(/Para ti|Per a tu|For you/)[1]?.split(/(Nivel|Nivell|Level) 1/)[0] ?? '';
    console.log('  for you:', fy.replace(/\n+/g, ' | ').slice(0, 300));
    check(fy.includes(want), `${lang}: "${want}" suggested at level ${level}`);
    await p.screenshot({ path: OUT + lang + '.png' });
    await p.getByText(want, { exact: true }).first().click(); await p.waitForTimeout(1200);
    await p.screenshot({ path: OUT + lang + '-read.png', fullPage: true });
    check((await p.innerText('body')).length > 300, `${lang}: reading opens`);
    await p.reload(); await p.waitForTimeout(600);
    await p.goto(BASE + '#/lectura'); await p.waitForTimeout(800);
    check(await p.getByRole('button', { name: /Espacio|Espai|Space/ }).getAttribute('aria-pressed') === 'true', `${lang}: interest remembered`);
    await ctx.close();
  }
  await b.close();
  console.log('ERRORS', errors.length, errors.slice(0, 10));
})();
