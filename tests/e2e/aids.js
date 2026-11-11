const { chromium } = require('playwright');
const BASE = 'http://localhost:4173/lectorix/';
(async () => {
  const b = await chromium.launch();
  const errors = [];
  for (const lang of ['es', 'ca', 'en']) {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
    const p = await ctx.newPage();
    p.on('pageerror', e => errors.push(`${lang} pageerror ${e.message}`));
    p.on('console', m => { if (m.type() === 'error') errors.push(`${lang} console ${m.text()}`); });
    await p.goto(BASE);
    await p.evaluate((lang) => localStorage.setItem('lectorix-store', JSON.stringify({ state: { onboardingDone: true, language: lang, practiceLanguage: 'auto', progress: [], sessionHistory: [], syllableColors: true, readingRuler: true, letterSpacing: 'wide', lineSpacing: 'relaxed' }, version: 0 })), lang);
    await p.reload(); await p.waitForTimeout(600);
    await p.goto(BASE + '#/ajustes'); await p.waitForTimeout(700);
    const card = await p.$('text=' + ({ es: 'Ayudas de lectura', ca: 'Ajudes de lectura', en: 'Reading aids' })[lang]);
    if (card) await card.scrollIntoViewIfNeeded();
    await p.waitForTimeout(300);
    await p.screenshot({ path: `${lang}-aids-settings.png` });
    await p.goto(BASE + '#/lectura'); await p.waitForTimeout(700);
    const first = await p.$('main a, [class*="cursor-pointer"]');
    const links = await p.$$('div.cursor-pointer');
    if (links.length) await links[0].click();
    await p.waitForTimeout(900);
    await p.screenshot({ path: `${lang}-aids-reading.png` });
    await p.goto(BASE + '#/ejercicio/comprension_lectora/1'); await p.waitForTimeout(900);
    await p.screenshot({ path: `${lang}-aids-comp.png` });
    await ctx.close();
  }
  console.log('ERRORS', errors.length, errors.slice(0, 10));
  await b.close();
})();
