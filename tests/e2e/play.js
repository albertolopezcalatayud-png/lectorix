// Plays a whole session of every module at the first, a middle and the last level, in the three languages,
// answering whatever comes (choice, drag, write) and checking it reaches the results page without errors.
const { chromium } = require('playwright');
const BASE = process.env.BASE || 'http://localhost:4173/lectorix/';
const MODULES = ['fonologia', 'memoria_visual', 'comprension_lectora', 'escritura', 'retos_rapidos'];
const LEVELS = { es: [1, 5, 9], ca: [1, 5, 9], en: [1, 4, 7] };

(async () => {
  const b = await chromium.launch();
  const issues = [];
  let played = 0;
  for (const lang of ['es', 'ca', 'en']) {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
    const p = await ctx.newPage();
    let where = '';
    p.on('pageerror', (e) => issues.push(`${lang} ${where} PAGEERROR ${e.message}`));
    p.on('console', (m) => { if (m.type() === 'error' && !/fonts\.g/.test(m.text())) issues.push(`${lang} ${where} CONSOLE ${m.text().slice(0, 160)}`); });
    await p.goto(BASE);
    await p.evaluate((lang) => {
      localStorage.clear();
      const all = { fonologia: 9, memoria_visual: 9, comprension_lectora: 9, escritura: 9, retos_rapidos: 9 };
      localStorage.setItem('lectorix-store', JSON.stringify({ state: { onboardingDone: true, placementDismissed: true, language: lang, practiceLanguage: 'auto', progress: [], sessionHistory: [], startLevels: { [lang]: all }, placementDone: { [lang]: true },
        user: { id: 'u', display_name: 'Ana', total_xp: 0, streak_days: 0, last_session: '2020-01-01T00:00:00Z' } }, version: 0 }));
    }, lang);
    await p.reload(); await p.waitForTimeout(600);
    for (const mod of MODULES) for (const lvl of LEVELS[lang]) {
      where = `${mod}/${lvl}`;
      await p.goto(BASE + `#/ejercicio/${mod}/${lvl}`); await p.waitForTimeout(1500);
      let ok = false;
      for (let i = 0; i < 25; i++) {
        if (/resultados/.test(p.url())) { ok = true; break; }
        const acted = await p.evaluate(() => {
          const vis = (el) => el && el.offsetParent !== null;
          const btns = [...document.querySelectorAll('button')].filter(vis);
          const choice = btns.find((x) => /^[A-D]\n/.test(x.innerText.trim()));
          if (choice) { choice.click(); return 'choice'; }
          const input = [...document.querySelectorAll('input[type=text], textarea')].find(vis);
          if (input) {
            const set = Object.getOwnPropertyDescriptor(input.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype, 'value').set;
            set.call(input, 'casa'); input.dispatchEvent(new Event('input', { bubbles: true }));
            const check = btns.find((x) => /Comprobar|Comprova|Check/.test(x.innerText)); if (check) check.click();
            return 'write';
          }
          // drag & drop exercises: tap every piece in order, then check
          const pieces = btns.filter((x) => x.closest('[class*="flex-wrap"]') && x.innerText.trim().length > 0 && x.innerText.trim().length < 30 && !/Comprobar|Comprova|Check|Siguiente|Següent|Next/.test(x.innerText));
          if (pieces.length) { pieces.forEach((x) => x.click()); const check = [...document.querySelectorAll('button')].filter(vis).find((x) => /Comprobar|Comprova|Check/.test(x.innerText)); if (check) check.click(); return 'drag'; }
          return '';
        });
        await p.waitForTimeout(acted ? 2300 : 800);
        const next = p.getByRole('button', { name: /^(Siguiente|Següent|Next|Continuar|Continua|Continue|Ver resultados|Veure resultats|See results)/ });
        if (await next.count()) await next.first().click().catch(() => {});
        await p.waitForTimeout(400);
      }
      played++;
      if (!ok) { issues.push(`${lang} ${where} did not reach the results (stuck on: ${(await p.innerText('body')).slice(0, 160).replace(/\n/g, ' ')})`); await p.screenshot({ path: `${__dirname}/stuck-${lang}-${mod}-${lvl}.png` }); }
    }
    await ctx.close();
  }
  await b.close();
  const uniq = [...new Set(issues)];
  console.log(uniq.join('\n') || 'no issues');
  console.log('SESSIONS', played, 'ISSUES', uniq.length);
})();
