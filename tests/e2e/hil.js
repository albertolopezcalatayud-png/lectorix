const { chromium } = require('playwright');
const fs = require('fs');
const BASE = 'http://localhost:4173/lectorix/';
const OUT = __dirname + '/hil-';
(async () => {
  const b = await chromium.launch();
  const errors = [];
  const check = (c, m) => { console.log(c ? 'PASS' : 'FAIL', m); if (!c) errors.push(m); };
  for (const lang of ['es', 'ca', 'en']) {
    // history: 10 right answers in one skill, 10 wrong in another
    const root = '/home/claude/lectorix/src/data/exercises/' + (lang === 'es' ? '' : lang + '/');
    const ex = JSON.parse(fs.readFileSync(root + 'fonologia.json')).exercises;
    const sk = [...new Set(ex.map((e) => e.skill))];
    const good = ex.filter((e) => e.skill === sk[0]).slice(0, 10), bad = ex.filter((e) => e.skill === sk[1]).slice(0, 10);
    const answers = [...good.map((e) => ({ exercise_id: e.id, selected: e.correct, correct: e.correct, is_correct: true, time_ms: 1000 })), ...bad.map((e) => ({ exercise_id: e.id, selected: 9, correct: e.correct, is_correct: false, time_ms: 1000 }))];
    const session = { id: 's1', module: 'fonologia', level: 1, mode: 'normal', answers, score: 50, time_ms: 60000, completed_at: new Date().toISOString(), xp_earned: 10, stars: 1 };
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
    const p = await ctx.newPage();
    p.on('pageerror', (e) => errors.push(`${lang} pageerror ${e.message}`));
    p.on('console', (m) => { if (m.type() === 'error') errors.push(`${lang} console ${m.text()}`); });
    await p.goto(BASE);
    await p.evaluate(({ lang, session }) => { localStorage.clear(); localStorage.setItem('lectorix-store', JSON.stringify({ state: { onboardingDone: true, language: lang, practiceLanguage: 'auto', progress: [], sessionHistory: [session] }, version: 0 })); }, { lang, session });
    await p.reload(); await p.waitForTimeout(600);
    await p.goto(BASE + '#/perfil'); await p.waitForTimeout(700);
    await p.getByText(/Entiendo cómo aprendo|Entenc com aprenc|How I learn/).click(); await p.waitForTimeout(1200);
    const body = await p.innerText('body');
    await p.screenshot({ path: OUT + lang + '.png', fullPage: true });
    check(/(Tus puntos fuertes|Els teus punts forts|Your strengths)/.test(body) && /(Lo que estás entrenando|El que estàs entrenant|What you are training)/.test(body), `${lang}: strengths and training shown`);
    console.log('  ', sk[0], '/', sk[1]);
    await p.getByText(/Guía para la familia|Guia per a la família|Guide for families/).last().click(); await p.waitForTimeout(800);
    await p.screenshot({ path: OUT + lang + '-fam.png', fullPage: true });
    check(/(diagnósticos|diagnòstics|diagnose)/.test(await p.innerText('body')), `${lang}: family guide opens`);
    await p.goto(BASE + '#/panel-padres'); await p.waitForTimeout(1000);
    check(/(Guía para la familia|Guia per a la família|Guide for families)/.test(await p.innerText('body')), `${lang}: parent panel link`);
    await ctx.close();
  }
  await b.close();
  console.log('ERRORS', errors.length, errors.slice(0, 10));
})();
