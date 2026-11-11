// Stress the daily review and the daily challenge: due items from every area/level/type, several rounds, all languages
const { chromium } = require('playwright');
const fs = require('fs');
const BASE = process.env.BASE || 'http://localhost:4173/lectorix/';
const ROOT = '/home/claude/lectorix/src/data/exercises/';
const MODS = ['fonologia', 'memoria_visual', 'comprension_lectora', 'escritura', 'retos_rapidos'];
(async () => {
  const errors = [];
  const b = await chromium.launch();
  for (const lang of (process.env.LANGS || 'es,ca,en').split(',')) {
    const bank = MODS.flatMap((m) => JSON.parse(fs.readFileSync(ROOT + (lang === 'es' ? '' : lang + '/') + m + '.json')).exercises);
    for (let round = 0; round < (+process.env.ROUNDS || 1); round++) {
      const pick = []; for (let i = 0; i < 12; i++) pick.push(bank[Math.floor(Math.random() * bank.length)]);
      const now = Date.now(); const day = new Date(); day.setHours(0, 0, 0, 0);
      const items = {};
      pick.forEach((e) => { items[`${lang}:${e.id}`] = { key: `${lang}:${e.id}`, id: e.id, lang, module: e.module, level: e.level, box: 1, due: day.getTime(), misses: 1, lastMiss: now - 86400000, word: e.word }; });
      items[`${lang}:custom:murciélago`] = { key: `${lang}:custom:murciélago`, id: 'custom:murciélago', lang, module: 'escritura', level: 1, box: 1, due: day.getTime(), misses: 0, lastMiss: 0, word: 'murciélago' };
      const ctx = await b.newContext({ viewport: { width: 390, height: 844 } }); const p = await ctx.newPage();
      p.on('pageerror', (e) => errors.push(`${lang} r${round} pageerror ${e.message}`));
      p.on('console', (m) => { if (m.type() === 'error') errors.push(`${lang} r${round} console ${m.text().slice(0, 200)}`); });
      await p.goto(BASE);
      await p.evaluate(({ lang, items }) => { localStorage.clear();
        localStorage.setItem('lectorix-store', JSON.stringify({ state: { onboardingDone: true, language: 'es', practiceLanguage: lang, progress: [], sessionHistory: [], placementDismissed: true }, version: 0 }));
        localStorage.setItem('lectorix-review', JSON.stringify({ state: { items }, version: 0 })); }, { lang, items });
      await p.reload(); await p.waitForTimeout(800);
      for (const route of ['#/repaso', '#/reto-diario']) {
        await p.goto(BASE + route); await p.waitForTimeout(1500);
        let steps = 0;
        for (; steps < 40; steps++) {
          if (/resultados/.test(p.url())) break;
          const txt = (await p.innerText('body')).trim();
          if (txt.length < 5) { errors.push(`${lang} r${round} ${route} BLANK SCREEN at step ${steps}`); break; }
          const input = p.locator('input[type=text]:visible, textarea:visible').first();
          if (await input.count()) { await input.fill(Math.random() < 0.5 ? 'x' : 'casa'); const chk = p.getByRole('button', { name: /Comprobar|Comprovar|Check/ }); if (await chk.count()) await chk.first().click(); else await p.keyboard.press('Enter'); }
          else {
            const clicked = await p.evaluate(() => {
              const bs = [...document.querySelectorAll('button')].filter((x) => /^[A-D]\n/.test(x.innerText.trim()) && !x.disabled);
              if (bs.length) { bs[Math.floor(Math.random() * bs.length)].click(); return 'mc'; }
              return null;
            });
            if (!clicked) { // drag & drop: tap every piece, then check
              await p.evaluate(() => { [...document.querySelectorAll('button')].filter((x) => x.closest('[class*="flex-wrap"]') && x.innerText.trim().length < 25 && !/Comprobar|Comprovar|Check|Pista|Hint/.test(x.innerText)).forEach((x) => x.click()); });
              await p.waitForTimeout(300);
              const chk = p.getByRole('button', { name: /Comprobar|Comprovar|Check/ }); if (await chk.count()) await chk.first().click({ timeout: 1500 }).catch(() => {});
            }
          }
          await p.waitForTimeout(2200);
          const next = p.getByRole('button', { name: /^(Siguiente|Següent|Next|Continuar|Continue)/ });
          if (await next.count()) await next.first().click().catch(() => {});
          await p.waitForTimeout(300);
        }
        await p.waitForTimeout(3000);
        const end = (await p.innerText('body')).trim();
        if (end.length < 5) { await p.screenshot({ path: `blank-${lang}-${round}.png` }); fs.writeFileSync(`blank-${lang}-${round}.html`, await p.content()); }
        console.log(lang, 'round', round, route, 'steps', steps, /resultados/.test(p.url()) ? 'RESULTS' : 'stuck: ' + end.slice(0, 80).replace(/\n/g, ' '));
        if (/resultados/.test(p.url()) && end.length < 5) errors.push(`${lang} r${round} BLANK RESULTS`);
      }
      await ctx.close();
    }
  }
  await b.close();
  console.log('ERRORS', errors.length); for (const e of errors.slice(0, 15)) console.log('  ', e);
})();
