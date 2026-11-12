// E2E: steps inside a level (dots, ramp preview), skill map in the parent panel, skill of the day, skill training session
const { chromium } = require('playwright');
const fs = require('fs');
const BASE = 'http://localhost:4173/lectorix/';
const ROOT = '/home/claude/lectorix/src/data/exercises';
const OUT = __dirname + '/st-';
const load = (lang, m) => JSON.parse(fs.readFileSync(`${ROOT}/${lang === 'es' ? '' : lang + '/'}${m}.json`)).exercises;

(async () => {
  const errors = [];
  const check = (c, msg) => { console.log(c ? 'PASS' : 'FAIL', msg); if (!c) errors.push(msg); };
  const b = await chromium.launch();

  for (const lang of ['es', 'ca']) {
    const esc = load(lang, 'escritura');
    const fon = load(lang, 'fonologia');
    const mkSession = (d, module, level, score, answers) => ({ id: 's' + d + module + level, module, level, total_questions: answers.length, correct_answers: answers.filter((a) => a.is_correct).length,
      score_percent: score, stars: 2, xp_earned: 10, time_ms: 60000, answers, completed_at: new Date(Date.UTC(2026, 10, 1 + d, 10)).toISOString(), mode: 'normal' });
    const ans = (list, ok) => list.map((e) => ({ exercise_id: e.id, selected: 0, correct: 0, is_correct: ok, time_ms: 3000 }));
    // Writing level 3: three good sessions -> step 3. Accents answered wrong, rhymes right -> weak and strong skills
    const l3 = esc.filter((e) => e.level === 3 && e.skill !== 'esc_accents').slice(0, 10);
    const accents = esc.filter((e) => e.skill === 'esc_accents' && e.level <= 3).slice(0, 8);
    const rhymes = fon.filter((e) => e.skill === 'fon_rhyme').slice(0, 8);
    const history = [
      mkSession(1, 'escritura', 3, 85, ans(l3, true)), mkSession(2, 'escritura', 3, 90, ans(l3, true)), mkSession(3, 'escritura', 3, 100, ans(l3, true)),
      mkSession(4, 'escritura', 2, 30, ans(accents, false)), mkSession(5, 'fonologia', 1, 100, ans(rhymes, true)),
    ];
    const progress = [{ module: 'escritura', level: 1, stars: 3, best_score: 100, attempts: 1, unlocked: true }, { module: 'escritura', level: 2, stars: 1, best_score: 60, attempts: 1, unlocked: true },
      { module: 'escritura', level: 3, stars: 3, best_score: 100, attempts: 3, unlocked: true }];

    const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
    const p = await ctx.newPage();
    p.on('pageerror', (e) => errors.push(`${lang} pageerror ${e.message}`));
    p.on('console', (m) => { if (m.type() === 'error') errors.push(`${lang} console ${m.text()}`); });
    await p.goto(BASE);
    await p.evaluate(({ lang, history, progress }) => {
      localStorage.clear();
      localStorage.setItem('lectorix-store', JSON.stringify({ state: { onboardingDone: true, language: lang, practiceLanguage: 'auto', progress, sessionHistory: history, placementDismissed: true }, version: 0 }));
    }, { lang, history, progress });
    await p.reload(); await p.waitForTimeout(1500);

    // Dashboard: today's training = accents
    let body = await p.innerText('body');
    check(/Tu entrenamiento de hoy|El teu entrenament de hui/i.test(body) && /Tildes|Accents/.test(body), `${lang}: dashboard suggests training accents`);
    await p.screenshot({ path: OUT + lang + '-dash.png' });

    // Levels: step dots
    await p.goto(BASE + '#/modulos/escritura'); await p.waitForTimeout(1000);
    body = await p.innerText('body');
    check(/(Escalón|Graó) 3 de 3/.test(body), `${lang}: level 3 shows step 3 of 3`);
    await p.screenshot({ path: OUT + lang + '-levels.png', fullPage: true });

    // Level 3 session on step 3: ramp previews from level 4 at the end
    let previews = 0, positions = [];
    await p.goto(BASE + '#/ejercicio/escritura/3'); await p.waitForTimeout(1500);
    for (let i = 0; i < 10; i++) {
      const t = await p.innerText('body');
      if (/adelanto del nivel siguiente|avanç del nivell següent/.test(t)) { previews++; positions.push(i + 1); if (previews === 1) await p.screenshot({ path: OUT + lang + '-preview.png', fullPage: true }); }
      // skip to the next question without answering: reopen with state is complex, so read the picked list from the page instead
      break;
    }
    const picked = await p.evaluate(async () => {
      // re-run the picker the page used (same module/level), through the app's own module
      return null;
    });
    // Count previews by stepping through: answer MC by clicking the first option, skip others
    await p.goto(BASE + '#/ejercicio/escritura/3'); await p.waitForTimeout(1500);
    previews = 0; positions = [];
    for (let i = 0; i < 10; i++) {
      const t = await p.innerText('body');
      if (/adelanto del nivel siguiente|avanç del nivell següent/.test(t)) { previews++; positions.push(i + 1); }
      const opt = p.locator('button:has-text("A")').first();
      // Answer anything: MC first option, write -> type something, drag -> press check if present
      const input = p.locator('input[type=text], textarea').first();
      if (await input.count()) { await input.fill('x'); await p.keyboard.press('Enter'); }
      else {
        const btns = p.locator('div.px-4 button');
        const n = await btns.count();
        let clicked = false;
        for (let k = 0; k < n; k++) { const tx = (await btns.nth(k).innerText()).trim(); if (/^[A-D]\n/.test(tx)) { await btns.nth(k).click(); clicked = true; break; } }
        if (!clicked) { const chk = p.getByRole('button', { name: /Comprobar|Comprovar|Check/ }); if (await chk.count()) await chk.first().click(); }
      }
      await p.waitForTimeout(2600);
      const next = p.getByRole('button', { name: /Siguiente|Següent|Next|Continuar|Continue/ });
      if (await next.count()) { await next.first().click(); await p.waitForTimeout(500); }
      if (/resultados/.test(p.url())) break;
    }
    check(previews >= 1, `${lang}: next-level preview questions appear on step 3 (${previews} at positions ${positions})`);

    // Parent panel: skill map. The session just played added random answers, so start again from the seeded history
    await p.evaluate(({ lang, history, progress }) => {
      localStorage.setItem('lectorix-store', JSON.stringify({ state: { onboardingDone: true, language: lang, practiceLanguage: 'auto', progress, sessionHistory: history, placementDismissed: true }, version: 0 }));
    }, { lang, history, progress });
    await p.goto(BASE + '#/panel-padres'); await p.reload(); await p.waitForTimeout(1500);
    body = await p.innerText('body');
    check(/Mapa de habilidades|Mapa d’habilitats/.test(body), `${lang}: skill map in parent panel`);
    check(/Para entrenar[\s\S]*Tildes|Per a entrenar[\s\S]*Accents/.test(body), `${lang}: accents listed to work on`);
    // the map shows three strengths; the rest are behind "see the others"
    const more = p.getByText(/^(Ver las demás|Veure les altres)/); if (await more.count()) { await more.first().click(); await p.waitForTimeout(300); body = await p.innerText('body'); }
    check(/Puntos fuertes|Punts forts/.test(body) && /Rimas|Rimes/.test(body), `${lang}: strengths listed and rhymes present in the map`);
    await p.locator('text=' + (lang === 'es' ? 'Mapa de habilidades' : 'Mapa d’habilitats')).first().scrollIntoViewIfNeeded();
    await p.screenshot({ path: OUT + lang + '-map.png' });

    // Training session for accents
    await p.getByRole('button', { name: /Entrenar ahora|Entrenar ara/ }).first().click();
    await p.waitForTimeout(1500);
    body = await p.innerText('body');
    const accIds = new Set(esc.filter((e) => e.skill === 'esc_accents').map((e) => e.prompt));
    check(/entrenar\/esc_accents/.test(p.url()) && [...accIds].some((pr) => body.includes(pr)), `${lang}: training session shows an accents question`);
    await p.screenshot({ path: OUT + lang + '-train.png', fullPage: true });
    await ctx.close();
  }
  await b.close();
  console.log('ERRORS', errors.length, errors.slice(0, 8));
})();
