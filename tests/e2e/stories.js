const { chromium } = require('playwright');
const BASE = 'http://localhost:4173/lectorix/';
const OUT = __dirname + '/sto-';
(async () => {
  const b = await chromium.launch();
  const errors = [];
  const check = (c, m) => { console.log(c ? 'PASS' : 'FAIL', m); if (!c) errors.push(m); };
  for (const [lang, level, withWords] of [['es', 1, true], ['ca', 6, false], ['en', 4, true]]) {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
    const p = await ctx.newPage();
    p.on('pageerror', (e) => errors.push(`${lang} pageerror ${e.message}`));
    p.on('console', (m) => { if (m.type() === 'error') errors.push(`${lang} console ${m.text()}`); });
    await p.goto(BASE);
    await p.evaluate(({ lang, level, withWords }) => {
      localStorage.clear();
      const sl = { fonologia: level, memoria_visual: level, comprension_lectora: level, escritura: level, retos_rapidos: level };
      localStorage.setItem('lectorix-store', JSON.stringify({ state: { onboardingDone: true, language: lang, practiceLanguage: 'auto', progress: [], sessionHistory: [], startLevels: { [lang]: sl }, placementDone: { [lang]: true } }, version: 0 }));
      if (withWords) {
        const items = {};
        const ws = lang === 'en' ? ['because', 'beautiful'] : ['hormiga', 'vaca'];
        ws.forEach((w, i) => { items['nb_' + i] = { id: 'nb_' + i, lang, word: w, box: 1, due: 0, misses: 1, added: 0 }; });
        localStorage.setItem('lectorix-review', JSON.stringify({ state: { items }, version: 0 }));
      }
    }, { lang, level, withWords });
    await p.reload(); await p.waitForTimeout(800);
    const dash = await p.innerText('body');
    check(/Cuentos a tu medida|Contes a la teua mida|Stories made for you/.test(dash), `${lang}: dashboard card`);
    await p.goto(BASE + '#/cuentos'); await p.waitForTimeout(900);
    await p.screenshot({ path: OUT + lang + '-pick.png', fullPage: true });
    await p.locator('button[aria-pressed]').nth(3).click(); // cat
    await p.locator('button[aria-pressed]').nth(6 + 4).click(); // castle
    await p.locator('button[aria-pressed]').nth(12 + 1).click(); // key
    await p.getByText(/Crear mi cuento|Crear el meu conte|Create my story/).click();
    await p.waitForTimeout(1500);
    await p.screenshot({ path: OUT + lang + '-read.png', fullPage: true });
    const body = await p.innerText('body');
    console.log('---', lang, '\n' + body.slice(0, 1600));
    check(/Misi/.test(body), `${lang}: story about Misi`);
    if (withWords) check(lang === 'en' ? /because/.test(body) : /hormiga/.test(body), `${lang}: notebook word used`);
    await p.getByText(/Responder|Respondre|Answer \d/).click(); await p.waitForTimeout(800);
    let n = 0;
    for (let i = 0; i < 8; i++) {
      const t = await p.innerText('body');
      if (/Inventar otro|Inventar un altre|Make another/.test(t) && /Volver a leer|Tornar a llegir|Read the story again/.test(t)) break;
      if (i === 0) await p.screenshot({ path: OUT + lang + '-q.png', fullPage: true });
      const opts = p.locator('main button, div button').filter({ hasText: /^\s*[A-D]\s*\S/ });
      await opts.first().click(); n++;
      await p.waitForTimeout(2600);
      const cont = p.getByText(/^(Siguiente|Següent|Next|Continuar|Continue)/);
      if (await cont.count()) { await cont.first().click(); await p.waitForTimeout(600); }
    }
    await p.screenshot({ path: OUT + lang + '-done.png', fullPage: true });
    check(n >= 3, `${lang}: answered ${n} questions and reached the end`);
    await p.getByText(/Inventar otro|Inventar un altre|Make another/).first().click(); await p.waitForTimeout(500);
    check(/Mis cuentos|Els meus contes|My stories/.test(await p.innerText('body')), `${lang}: story saved in the list`);
    await ctx.close();
  }
  await b.close();
  console.log('ERRORS', errors.length, errors.slice(0, 10));
})();
