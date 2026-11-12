// Subject readings: dashboard card → subject section, filter, glossary, questions with XP
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
    await p.reload(); await p.waitForTimeout(600);
    await p.getByText(/^(Lecturas para estudiar|Lectures per a estudiar|Reading for school subjects)$/).click(); await p.waitForTimeout(1200);
    const y = await p.evaluate(() => window.scrollY);
    check(y > 200, `${lang}: card scrolls to the subject section (y=${y})`);
    const n = await p.locator('section.scroll-mt-20 h4').count();
    await p.locator('section.scroll-mt-20 button[aria-pressed]').nth(2).click(); await p.waitForTimeout(300); // physics & chemistry
    const nf = await p.locator('section.scroll-mt-20 h4').count();
    check(n === 12 && nf === 3, `${lang}: 12 subject readings, 3 of physics and chemistry`);
    await p.screenshot({ path: __dirname + `/subj-${lang}-list.png` });
    await p.locator('section.scroll-mt-20 h4').first().click(); await p.waitForTimeout(1200);
    const body = await p.innerText('body');
    check(/(Palabras clave|Paraules clau|Key words)/.test(body), `${lang}: glossary shown`);
    await p.screenshot({ path: __dirname + `/subj-${lang}-reading.png`, fullPage: true });
    await p.getByRole('button', { name: /(He terminado de leer|He acabat de llegir|I have finished reading|Ya he leído|Ja he llegit|Done)/ }).first().click().catch(async () => { await p.locator('button.bg-mint').click(); });
    await p.waitForTimeout(600);
    for (let i = 0; i < 6; i++) {
      if (/resultados/.test(p.url())) break;
      await p.evaluate(() => { const bs = [...document.querySelectorAll('button')].filter((x) => /^[A-D]\n/.test(x.innerText.trim())); bs[0]?.click(); });
      await p.waitForTimeout(2300);
      const next = p.getByRole('button', { name: /^(Siguiente|Següent|Next|Continuar|Continue)/ }); if (await next.count()) await next.first().click().catch(() => {});
      await p.waitForTimeout(400);
    }
    const xp = await p.evaluate(() => JSON.parse(localStorage.getItem('lectorix-store')).state.user.total_xp);
    check(/resultados/.test(p.url()) && xp > 0, `${lang}: questions done, results page, XP ${xp}`);
    await p.close();
  }
  await b.close(); console.log('ERRORS', errors.length, errors.slice(0, 5));
})();
