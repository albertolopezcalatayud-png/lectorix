const { chromium } = require('playwright');
const fs = require('fs');
(async () => {
  const b = await chromium.launch(); const errors = [];
  for (const [lang, level] of [['es', 2], ['ca', 7], ['en', 5]]) {
    const p = await b.newPage({ viewport: { width: 390, height: 844 } }); p.on('pageerror', (e) => errors.push(e.message));
    await p.goto('http://localhost:4173/lectorix/');
    await p.evaluate(({ lang, level }) => { localStorage.clear(); const sl = { fonologia: level, memoria_visual: level, comprension_lectora: level, escritura: level, retos_rapidos: level };
      localStorage.setItem('lectorix-store', JSON.stringify({ state: { onboardingDone: true, language: lang, practiceLanguage: 'auto', progress: [], sessionHistory: [], startLevels: { [lang]: sl }, placementDone: { [lang]: true } }, version: 0 })); }, { lang, level });
    await p.goto('http://localhost:4173/lectorix/#/fichas'); await p.reload(); await p.waitForTimeout(1000);
    await p.evaluate(() => { window.__html = null; window.open = () => ({ document: { write: (h) => { window.__html = h; }, close() {} }, focus() {}, print() {} }); });
    await p.getByRole('button', { name: /Crear la (ficha|fitxa)|Create and print/ }).click();
    await p.waitForTimeout(2500);
    const html = await p.evaluate(() => window.__html);
    if (!html) { console.log(lang, 'FAIL no html'); continue; }
    fs.writeFileSync(`${__dirname}/ws-${lang}.html`, html);
    const q = await b.newPage(); await q.setContent(html); await q.pdf({ path: `${__dirname}/ws-${lang}.pdf`, format: 'A4' });
    const items = (html.match(/class="item"/g) || []).length;
    console.log(lang, 'items', items, 'dict lines', (html.match(/class="dline"/g) || []).length, 'reading', /class="reading"/.test(html), 'answers', (html.match(/<div>\d+\./g) || []).length);
    await q.close(); await p.close();
  }
  console.log('ERRORS', errors); await b.close();
})();
