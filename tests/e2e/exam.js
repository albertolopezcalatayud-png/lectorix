// Exam questions page: learn cards, break a question into tasks, 10-question practice with XP
const { chromium } = require('playwright');
const BASE = 'http://localhost:4173/lectorix/';
(async () => {
  const b = await chromium.launch(); const errors = [];
  const check = (c, m) => { console.log(c ? 'PASS' : 'FAIL', m); if (!c) errors.push(m); };
  for (const lang of ['es', 'ca', 'en']) {
    const p = await b.newPage({ viewport: { width: 390, height: 844 } });
    p.on('pageerror', (e) => errors.push(lang + ' ' + e.message));
    await p.goto(BASE);
    await p.evaluate((lang) => { localStorage.clear(); localStorage.setItem('lectorix-store', JSON.stringify({ state: { onboardingDone: true, placementDismissed: true, language: lang, practiceLanguage: 'auto', progress: [], sessionHistory: [], user: { id: 'u', display_name: 'Ana', total_xp: 0, streak_days: 0, last_session: '2020-01-01T00:00:00Z' } }, version: 0 })); }, lang);
    await p.reload(); await p.waitForTimeout(700);
    check(/Entiende los enunciados|Entén els enunciats|Understand exam questions/.test(await p.innerText('body')), `${lang}: dashboard tool`);
    await p.goto(BASE + '#/enunciados'); await p.waitForTimeout(900);
    await p.locator('button[aria-expanded]').nth(5).click(); await p.waitForTimeout(400);
    const learn = await p.innerText('body');
    check(/Compara|Compare/.test(learn) && /✅/.test(learn), `${lang}: compare card opens with a model answer`);
    await p.screenshot({ path: __dirname + `/exam-${lang}-learn.png`, fullPage: true });
    await p.getByRole('button', { name: /Desmonta|Desmunta|Break it down/ }).click(); await p.waitForTimeout(300);
    await p.getByRole('button', { name: /Ejemplo 1|Exemple 1|Example 1/ }).click(); await p.waitForTimeout(400);
    let body = await p.innerText('body');
    check(/(Te piden|Et demanen|You are asked to do) 3/.test(body), `${lang}: example 1 split into 3 tasks`);
    for (const c of await p.locator('input[type=checkbox]').all()) await c.check();
    check(/(Todo hecho|Tot fet|All done)/.test(await p.innerText('body')), `${lang}: ticking all tasks`);
    await p.screenshot({ path: __dirname + `/exam-${lang}-split.png`, fullPage: true });
    await p.getByRole('button', { name: /Practica|Practise/ }).click(); await p.waitForTimeout(500);
    for (let i = 0; i < 12; i++) {
      const t = await p.innerText('body'); if (/\+\d+ XP|\d+ (de|of) \d+/.test(t) && /(Otras|Altres|more questions)/.test(t)) break;
      if (i === 1) await p.screenshot({ path: __dirname + `/exam-${lang}-q.png`, fullPage: true });
      await p.evaluate(() => { const bs = [...document.querySelectorAll('button')].filter((x) => /^[A-D]\n/.test(x.innerText.trim())); bs[0]?.click(); });
      await p.waitForTimeout(2300);
      const next = p.getByRole('button', { name: /^(Siguiente|Següent|Next|Continuar|Continue)/ }); if (await next.count()) await next.first().click().catch(() => {});
      await p.waitForTimeout(300);
    }
    body = await p.innerText('body');
    const xp = await p.evaluate(() => JSON.parse(localStorage.getItem('lectorix-store')).state.user.total_xp);
    const shown = Number((body.match(/\+(\d+) XP/) || [])[1] || 0);
    check(/(Otras|Altres|more questions)/.test(body) && xp === shown, `${lang}: finished practice, shown +${shown}, total ${xp}`);
    await p.screenshot({ path: __dirname + `/exam-${lang}-done.png`, fullPage: true });
    await p.close();
  }
  await b.close(); console.log('ERRORS', errors.length, errors.slice(0, 5));
})();
