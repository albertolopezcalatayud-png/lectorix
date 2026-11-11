const { chromium } = require('playwright');
const fs = require('fs');
const OUT = '' + (process.env.OUT || __dirname + '/out/') + '';
const BASE = 'http://localhost:4173/lectorix/';
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 360, height: 640 }, deviceScaleFactor: 3 });
  const p = await ctx.newPage();
  await p.goto(BASE);
  const ex = JSON.parse(fs.readFileSync('/home/claude/lectorix/src/data/exercises/fonologia.json')).exercises;
  const sess = (d, n) => ({ id: 's' + d, module: 'fonologia', level: 3, mode: 'normal', score: 80, time_ms: 300000, xp_earned: 40, stars: 2, completed_at: new Date(Date.now() - d * 86400000).toISOString(),
    answers: ex.filter((e) => e.level === 3).slice(0, n).map((e, i) => ({ exercise_id: e.id, selected: e.correct, correct: e.correct, is_correct: i % 5 !== 0, time_ms: 4000 })) });
  await p.evaluate(({ history }) => {
    localStorage.clear();
    const sl = { fonologia: 3, memoria_visual: 3, comprension_lectora: 3, escritura: 3, retos_rapidos: 3 };
    localStorage.setItem('lectorix-store', JSON.stringify({ state: { onboardingDone: true, language: 'es', practiceLanguage: 'auto', progress: [{ module: 'fonologia', level: 3, best_score: 80, stars: 2 }], sessionHistory: history, startLevels: { es: sl }, placementDone: { es: true }, schoolStage: 'p56',
      user: { id: 'u', display_name: 'Leo', total_xp: 640, streak_days: 6, last_session: new Date().toISOString(), avatar: '🦊' } }, version: 0 }));
    localStorage.setItem('lectorix-interests', JSON.stringify({ state: { interests: ['espacio', 'animales'] }, version: 0 }));
    const items = {}; ['hormiga', 'bicicleta', 'jirafa'].forEach((w, i) => { items['nb' + i] = { id: 'nb' + i, lang: 'es', word: w, box: 1, due: 0, misses: 2, added: 0 }; });
    localStorage.setItem('lectorix-review', JSON.stringify({ state: { items }, version: 0 }));
    localStorage.setItem('lectorix-shelf', JSON.stringify({ state: { books: [{ id: 'b1', title: 'Manolito Gafotas', author: 'Elvira Lindo', pages: 160, page: 72, color: '#8b5cf6', status: 'reading', started: new Date().toISOString() }, { id: 'b2', title: 'El principito', color: '#10b981', status: 'finished', started: new Date().toISOString(), finished: new Date().toISOString() }, { id: 'b3', title: 'Matilda', color: '#f97316', status: 'finished', started: new Date().toISOString(), finished: new Date().toISOString() }], logs: [{ id: 'l1', bookId: 'b1', date: new Date().toISOString(), minutes: 20, page: 72, feel: 2 }, { id: 'l2', bookId: 'b1', date: new Date(Date.now() - 86400000).toISOString(), minutes: 15 }] }, version: 0 }));
  }, { history: [sess(0, 15), sess(1, 15), sess(2, 15), sess(4, 15)] });
  await p.reload(); await p.waitForTimeout(1200);
  const shot = async (name) => { await p.waitForTimeout(700); await p.screenshot({ path: OUT + name + '.png' }); console.log('shot', name); };
  await shot('01-inicio');
  await p.goto(BASE + '#/lectura'); await p.waitForTimeout(900); await shot('02-lecturas');
  await p.goto(BASE + '#/lectura/lectura_l3_planetas'); await p.waitForTimeout(1200); await shot('03-lectura-guiada');
  await p.goto(BASE + '#/cuentos'); await p.waitForTimeout(800);
  await p.locator('button[aria-pressed]').nth(2).click(); await p.locator('button[aria-pressed]').nth(9 + 1).click(); await p.locator('button[aria-pressed]').nth(18 + 7).click();
  await p.getByText('Crear mi cuento').click(); await p.waitForTimeout(1200); await p.evaluate(() => window.scrollTo(0, 0)); await shot('04-cuento');
  await p.goto(BASE + '#/escribe'); await p.waitForTimeout(800);
  await p.click('textarea'); await p.keyboard.type('Ayer vi un pinguino en el zoo con mi ermano. Mañana iremos al cumple', { delay: 5 }); await p.waitForTimeout(800); await shot('05-escribe-prediccion');
  await p.getByRole('button', { name: /Revisar/ }).click(); await p.waitForTimeout(2500);
  await p.locator('button.decoration-wavy').nth(1).click(); await p.waitForTimeout(400); await shot('06-escribe-revision');
  await p.goto(BASE + '#/estanteria'); await p.waitForTimeout(800); await shot('07-estanteria');
  await p.goto(BASE + '#/panel-padres'); await p.waitForTimeout(1500); await shot('08-familias');
  await b.close();
})();
