const { chromium } = require('playwright');
const BASE = 'http://localhost:4173/lectorix/';
(async () => {
  const b = await chromium.launch();
  const errors = [];
  for (const lang of ['es', 'ca']) {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
    const p = await ctx.newPage();
    p.on('pageerror', e => errors.push(`${lang} pageerror ${e.message}`));
    p.on('console', m => { if (m.type() === 'error') errors.push(`${lang} console ${m.text()}`); });
    await p.goto(BASE);
    const ids = lang === 'es'
      ? [['es_memoria_visual_l2_m013', 'memoria_visual', 2, 'llave'], ['escritura_l2_d03', 'escritura', 2, undefined], ['es_escritura_l3_m018', 'escritura', 3, 'hecho']]
      : [['ca_memoria_visual_l1_m001', 'memoria_visual', 1, 'gat'], ['ca_escritura_l2_m001', 'escritura', 2, 'vaques']];
    await p.evaluate(([lang, ids]) => {
      const y = Date.now() - 86400000;
      const items = {};
      ids.forEach(([id, module, level, word], i) => {
        const key = `${lang}:${id}`;
        items[key] = { key, id, lang, module, level, box: 1, due: y, misses: i + 1, lastMiss: y, word };
      });
      localStorage.setItem('lectorix-store', JSON.stringify({ state: { onboardingDone: true, language: lang, practiceLanguage: 'auto', progress: [], sessionHistory: [] }, version: 0 }));
      localStorage.setItem('lectorix-review', JSON.stringify({ state: { items }, version: 0 }));
    }, [lang, ids]);
    await p.reload(); await p.waitForTimeout(700);
    await p.screenshot({ path: `${lang}-dash.png` });
    console.log(lang, 'dash:', (await p.innerText('body')).replace(/\s+/g, ' ').slice(0, 260));
    await p.goto(BASE + '#/mis-palabras'); await p.waitForTimeout(700);
    await p.screenshot({ path: `${lang}-nb.png`, fullPage: true });
    console.log(lang, 'nb:', (await p.innerText('body')).replace(/\s+/g, ' ').slice(0, 400));
    await p.goto(BASE + '#/repaso'); await p.waitForTimeout(900);
    await p.screenshot({ path: `${lang}-rev.png` });
    // play through: answer whatever is on screen
    for (let step = 0; step < 20; step++) {
      const url = p.url();
      if (url.includes('resultados')) break;
      const input = await p.$('input[type=text]:not([disabled]), textarea:not([disabled])');
      if (input) {
        await input.fill('xxx').catch(() => {});
        await p.keyboard.press('Enter').catch(() => {});
      } else {
        const opts = await p.$$('div.flex.flex-col.gap-2\\.5 > button:not([disabled])');
        if (opts.length) await opts[0].click({ timeout: 1000 }).catch(() => {});
      }
      await p.waitForTimeout(700);
      for (const label of ['Comprobar', 'Comprovar', 'Siguiente', 'Següent']) {
        const btn = await p.$(`button:has-text("${label}"):not([disabled])`);
        if (btn) { await btn.click({ timeout: 1000 }).catch(() => {}); await p.waitForTimeout(500); }
      }
      await p.waitForTimeout(1500);
    }
    await p.waitForTimeout(800);
    await p.screenshot({ path: `${lang}-res.png`, fullPage: true });
    console.log(lang, 'end url', p.url(), (await p.innerText('body')).replace(/\s+/g, ' ').slice(0, 400));
    const st = await p.evaluate(() => localStorage.getItem('lectorix-review'));
    console.log(lang, 'store', st.slice(0, 400));
    await ctx.close();
  }
  console.log('ERRORS', errors.length, errors.slice(0, 20));
  await b.close();
})();
