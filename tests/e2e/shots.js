const { chromium } = require('playwright');
const fs = require('fs');
const OUT = '' + (process.env.OUT || __dirname + '/out/') + '';
const BASE = 'http://localhost:4173/lectorix/';
const LANG = process.env.LANG_SHOTS || 'es';
const L = {
  es: { words: ['hormiga', 'bicicleta', 'jirafa'], reading: 'lectura_l3_planetas', story: 'Crear mi cuento', type: 'Ayer vi un pinguino en el zoo con mi ermano. Mañana iremos al cumple',
    books: [['Manolito Gafotas', 'Elvira Lindo'], ['El principito'], ['Matilda']], interests: ['espacio', 'animales'] },
  ca: { words: ['formiga', 'bicicleta', 'girafa'], reading: 'lectura_ca_l3_planetes', story: 'Crear el meu conte', type: 'Ahir vaig vore un pingüi al zoo amb el meu germa. Demà anirem a la fes',
    books: [['Mecanoscrit del segon origen', 'Manuel de Pedrolo'], ['El Petit Príncep'], ['Matilda']], interests: ['espacio', 'animales'] },
  en: { words: ['because', 'beautiful', 'giraffe'], reading: 'reading_en_l3_planets', story: 'Create my story', type: 'Yesterday I saw a pengiun at the zoo with my bruther. Tomorrow we are going to a bir',
    books: [['Matilda', 'Roald Dahl'], ['The Little Prince'], ["Charlotte's Web"]], interests: ['espacio', 'animales'] },
}[LANG];
const ESSAY = {
  es: ['Hoy en día muchos alumnos llevan el móvil a clase. En mi opinión, debería estar guardado durante las clases.', 'En primer lugar, el móvil distrae mucho. Por ejemplo, cuando suena una notificación todo el mundo mira la pantalla.', 'En segundo lugar, sin móviles hablamos más con los compañeros y jugamos juntos en el recreo.', '', 'En conclusión, creo que los móviles deben estar guardados, salvo para una actividad consreta.'],
  ca: ['Hui dia molts alumnes porten el mòbil a classe. Al meu parer, hauria d’estar guardat durant les classes.', 'En primer lloc, el mòbil distrau molt. Per exemple, quan sona una notificació tothom mira la pantalla.', 'En segon lloc, sense mòbils parlem més amb els companys i juguem junts al pati.', '', 'En conclusió, crec que els mòbils han d’estar guardats, excepte per a una activitat concretta.'],
  en: ['Nowadays many students bring their phones to class. In my opinion, phones should be put away during lessons.', 'Firstly, phones are very distracting. For example, when a notification arrives everyone looks at the screen.', 'Secondly, without phones we talk more to our classmates and play together at break time.', '', 'In conclusion, I think phones should be put away, except for a specfic activity.'],
}[LANG];
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 360, height: 640 }, deviceScaleFactor: 3 });
  // the screenshots show a device with the three voices installed
  await ctx.addInitScript(() => { if (window.speechSynthesis) { const vs = ['es-ES', 'ca-ES', 'en-GB'].map((lang) => ({ lang, name: lang, voiceURI: lang, localService: true, default: false })); window.speechSynthesis.getVoices = () => vs; } });
  const p = await ctx.newPage();
  await p.goto(BASE);
  const ex = JSON.parse(fs.readFileSync('/home/claude/lectorix/src/data/exercises/fonologia.json')).exercises;
  const sess = (d, n) => ({ id: 's' + d, module: 'fonologia', level: 3, mode: 'normal', score: 80, time_ms: 300000, xp_earned: 40, stars: 2, completed_at: new Date(Date.now() - d * 86400000).toISOString(),
    answers: ex.filter((e) => e.level === 3).slice(0, n).map((e, i) => ({ exercise_id: e.id, selected: e.correct, correct: e.correct, is_correct: i % 5 !== 0, time_ms: 4000 })) });
  await p.evaluate(({ history, LANG, L }) => {
    localStorage.clear();
    const sl = { fonologia: 3, memoria_visual: 3, comprension_lectora: 3, escritura: 3, retos_rapidos: 3 };
    localStorage.setItem('lectorix-store', JSON.stringify({ state: { onboardingDone: true, language: LANG, practiceLanguage: 'auto', progress: [{ module: 'fonologia', level: 3, best_score: 80, stars: 2 }], sessionHistory: history, startLevels: { [LANG]: sl }, placementDone: { [LANG]: true }, schoolStage: 'p56',
      user: { id: 'u', display_name: 'Leo', total_xp: 640, streak_days: 6, last_session: new Date().toISOString(), avatar: '🦊' } }, version: 0 }));
    localStorage.setItem('lectorix-interests', JSON.stringify({ state: { interests: L.interests }, version: 0 }));
    const items = {}; L.words.forEach((w, i) => { items['nb' + i] = { id: 'nb' + i, lang: LANG, word: w, box: 1, due: 0, misses: 2, added: 0 }; });
    localStorage.setItem('lectorix-review', JSON.stringify({ state: { items }, version: 0 }));
    localStorage.setItem('lectorix-shelf', JSON.stringify({ state: { books: [{ id: 'b1', title: L.books[0][0], author: L.books[0][1], pages: 160, page: 72, color: '#8b5cf6', status: 'reading', started: new Date().toISOString() }, { id: 'b2', title: L.books[1][0], color: '#10b981', status: 'finished', started: new Date().toISOString(), finished: new Date().toISOString() }, { id: 'b3', title: L.books[2][0], color: '#f97316', status: 'finished', started: new Date().toISOString(), finished: new Date().toISOString() }], logs: [{ id: 'l1', bookId: 'b1', date: new Date().toISOString(), minutes: 20, page: 72, feel: 2 }, { id: 'l2', bookId: 'b1', date: new Date(Date.now() - 86400000).toISOString(), minutes: 15 }] }, version: 0 }));
  }, { history: [sess(0, 15), sess(1, 15), sess(2, 15), sess(4, 15)], LANG, L });
  await p.reload(); await p.waitForTimeout(1200);
  const shot = async (name) => { await p.waitForTimeout(700); await p.screenshot({ path: OUT + name + '.png' }); console.log('shot', name); };
  await shot('01-inicio');
  await p.goto(BASE + '#/lectura/' + L.reading); await p.waitForTimeout(1200); await shot('02-lectura-guiada');
  await p.goto(BASE + '#/cuentos'); await p.waitForTimeout(800);
  await p.locator('button[aria-pressed]').nth(2).click(); await p.locator('button[aria-pressed]').nth(9 + 1).click(); await p.locator('button[aria-pressed]').nth(18 + 7).click();
  await p.getByText(L.story).click(); await p.waitForTimeout(1200); await p.evaluate(() => window.scrollTo(0, 0)); await shot('03-cuento');
  await p.goto(BASE + '#/escribe'); await p.waitForTimeout(800);
  await p.click('textarea'); await p.keyboard.type(L.type, { delay: 5 }); await p.waitForTimeout(800); await shot('04-escribe-prediccion');
  await p.goto(BASE + '#/enunciados'); await p.waitForTimeout(800);
  await p.locator('[role=group] button').nth(1).click(); await p.waitForTimeout(300);
  await p.locator('button', { hasText: /^(Ejemplo|Exemple|Example) 3$/ }).click(); await p.waitForTimeout(400);
  await p.locator('input[type=checkbox]').first().check();
  await p.locator('textarea').evaluate((el) => window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 70)); await shot('05-enunciados');
  await p.goto(BASE + '#/redaccion'); await p.waitForTimeout(800);
  await p.locator('h3').first().click(); await p.waitForTimeout(400);
  await p.locator('button.text-left.bg-accent-pale').first().click();
  await p.locator('[aria-label] button').nth(1).click(); await p.waitForTimeout(400); // step 2
  const tas = p.locator('textarea'); for (let i = 0; i < 5; i++) if (ESSAY[i]) await tas.nth(i).fill(ESSAY[i]);
  await p.locator('[aria-label] button').nth(2).click(); await p.waitForTimeout(2500); await p.evaluate(() => window.scrollTo(0, 0)); await shot('06-redaccion');
  await p.goto(BASE + '#/estanteria'); await p.waitForTimeout(800); await shot('07-estanteria');
  await p.goto(BASE + '#/panel-padres'); await p.waitForTimeout(1500); await shot('08-familias');
  await b.close();
})();
