const { chromium } = require('playwright');
const BASE = 'http://localhost:4173/lectorix/';
const txt = async (p) => (await p.innerText('body')).replace(/\s+/g, ' ').slice(0, 300);
(async () => {
  const b = await chromium.launch();
  const errors = [];
  for (const lang of ['es', 'ca', 'en']) {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
    const p = await ctx.newPage();
    p.on('pageerror', e => errors.push(`${lang} pageerror ${e.message}`));
    p.on('console', m => { if (m.type() === 'error') errors.push(`${lang} console ${m.text()}`); });
    await p.goto(BASE);
    await p.evaluate((lang) => localStorage.setItem('lectorix-store', JSON.stringify({ state: { onboardingDone: true, language: lang, practiceLanguage: 'auto', progress: [], sessionHistory: [], syllableColors: true } , version: 0 })), lang);
    await p.reload(); await p.waitForTimeout(600);
    await p.screenshot({ path: `${lang}-dash2.png`, fullPage: true });
    // Fluency
    await p.goto(BASE + '#/fluidez'); await p.waitForTimeout(700);
    await p.click('button:has-text("2")');
    await p.click({ es: 'text=Preparar el texto', ca: 'text=Preparar el text', en: 'text=Get the text ready' }[lang]);
    await p.waitForTimeout(300);
    await p.click({ es: 'button:has-text("Empezar")', ca: 'button:has-text("Començar")', en: 'button:has-text("Start")' }[lang]);
    await p.waitForTimeout(2500);
    await p.click({ es: 'text=He terminado el texto', ca: 'text=He acabat el text', en: 'text=I have finished the text' }[lang]);
    await p.waitForTimeout(300);
    const spans = await p.$$('.reading-text span.rounded');
    await spans[20].click();
    await p.click({ es: 'button:has-text("Errores")', ca: 'button:has-text("Errors")', en: 'button:has-text("Errors")' }[lang]);
    await spans[3].click(); await spans[7].click();
    await p.click({ es: 'text=Ver el resultado', ca: 'text=Veure el resultat', en: 'text=See the result' }[lang]);
    await p.waitForTimeout(500);
    await p.screenshot({ path: `${lang}-flu.png` });
    console.log(lang, 'FLU', await txt(p));
    // Homework (text)
    await p.goto(BASE + '#/adaptar'); await p.waitForTimeout(600);
    await p.fill('textarea', { es: 'El río Turia atraviesa la ciudad de Valencia.\n\nHoy estudiamos los ecosistemas.', ca: 'El riu Túria travessa la ciutat de València.\n\nHui estudiem els ecosistemes.', en: 'The river runs through the city.\n\nToday we study ecosystems.' }[lang]);
    await p.click({ es: 'text=Adaptar el texto', ca: 'text=Adaptar el text', en: 'text=Adapt the text' }[lang]);
    await p.waitForTimeout(500);
    const ws = await p.$$('.reading-text span.cursor-pointer');
    await ws[1].click(); await p.waitForTimeout(300);
    await p.click({ es: 'button:has-text("Guardar")', ca: 'button:has-text("Guardar")', en: 'button:has-text("Save")' }[lang]);
    await p.waitForTimeout(300);
    await p.screenshot({ path: `${lang}-hw.png` });
    console.log(lang, 'HW', await txt(p));
    console.log(lang, 'review', (await p.evaluate(() => localStorage.getItem('lectorix-review'))).slice(0, 200));
    // Together
    await p.goto(BASE + '#/juntos'); await p.waitForTimeout(800);
    const cards = await p.$$('div.grid > div');
    for (let g = 0; g < 4; g++) {
      await p.goto(BASE + '#/juntos'); await p.reload(); await p.waitForTimeout(900);
      const cs = await p.$$('div.grid.grid-cols-2 > *');
      console.log('cards', cs.length);
      await cs[g].click(); await p.waitForTimeout(500);
      await p.screenshot({ path: `${lang}-tg${g}.png` });
      console.log(lang, 'TG' + g, await txt(p));
    }
    await ctx.close();
  }
  console.log('ERRORS', errors.length, errors.slice(0, 10));
  await b.close();
})();
