// E2E: 9 levels, placement test (all right / all wrong), parent starting point, ESO content, English stays at 5
const { chromium } = require('playwright');
const fs = require('fs');
const BASE = 'http://localhost:4173/lectorix/';
const ROOT = '/home/claude/lectorix/src/data/exercises';
const OUT = __dirname + '/lv-';
const MODS = ['fonologia', 'memoria_visual', 'comprension_lectora', 'escritura', 'retos_rapidos'];
const bank = {};
for (const lang of (process.env.LANGS || 'es,ca').split(',')) {
  bank[lang] = MODS.flatMap((m) => JSON.parse(fs.readFileSync(`${ROOT}/${lang === 'es' ? '' : lang + '/'}${m}.json`)).exercises)
    .filter((e) => e.type === 'multiple_choice');
}
const seed = (lang, extra = {}) => (args) => {
  localStorage.clear();
  localStorage.setItem('lectorix-store', JSON.stringify({ state: { onboardingDone: true, language: args.lang, practiceLanguage: 'auto', progress: [], sessionHistory: [], ...args.extra }, version: 0 }));
};

async function answerAll(p, lang, mode) {
  // Answers placement questions until the results screen appears
  for (let i = 0; i < 80; i++) {
    const body = await p.innerText('body');
    if (/Ya está!|Ja està!|All done!/.test(body)) return i;
    const buttons = await p.$$('main button, div button');
    const texts = (await Promise.all(buttons.map((b) => b.innerText()))).map((t) => t.trim().split('\n').pop().trim());
    const ex = bank[lang].find((e) => body.includes(e.prompt) && e.options.every((o) => texts.some((t) => t.trim() === o)) && (!e.passage || body.includes(e.passage.slice(0, 40))));
    if (!ex) { await p.waitForTimeout(400); continue; }
    const want = mode === 'right' ? ex.options[ex.correct] : ex.options.find((_, k) => k !== ex.correct);
    const idx = texts.findIndex((t) => t.trim() === want);
    await buttons[idx].click();
    await p.waitForTimeout(2300);
  }
  return -1;
}

(async () => {
  const b = await chromium.launch();
  const errors = [];
  const check = (cond, msg) => { console.log(cond ? 'PASS' : 'FAIL', msg); if (!cond) errors.push(msg); };

  for (const lang of (process.env.LANGS || 'es,ca').split(',')) {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
    const p = await ctx.newPage();
    p.on('pageerror', (e) => errors.push(`${lang} pageerror ${e.message}`));
    p.on('console', (m) => { if (m.type() === 'error') errors.push(`${lang} console ${m.text()}`); });
    await p.goto(BASE);
    await p.evaluate(seed(lang), { lang, extra: {} });
    await p.reload(); await p.waitForTimeout(800);
    if (process.env.ONLY_WRONG) { await ctx.close(); } else {
    let body = await p.innerText('body');
    check(/Encuentra tu nivel|Troba el teu nivell/.test(body), `${lang}: dashboard invites to the level check`);
    await p.screenshot({ path: OUT + lang + '-dash.png' });

    // Levels before any placement: 9 levels, only level 1 open, no PREMIUM
    await p.goto(BASE + '#/modulos/fonologia'); await p.waitForTimeout(900);
    body = await p.innerText('body');
    check(/Nivel 9|Nivell 9/.test(body) && !/Nivel 10|Nivell 10/.test(body), `${lang}: 9 levels listed`);
    check(!/PREMIUM/.test(body), `${lang}: no PREMIUM badge on levels`);
    const locks = (body.match(/🔒/g) || []).length;
    check(locks === 8, `${lang}: 8 locked levels before the test (got ${locks})`);

    // Placement, all right, starting from 3.º–4.º ESO
    await p.goto(BASE + '#/prueba-nivel'); await p.waitForTimeout(900);
    await p.screenshot({ path: OUT + lang + '-plc-intro.png', fullPage: true });
    await p.getByText(lang === 'es' ? '3.º–4.º ESO' : '3r–4t ESO', { exact: true }).click();
    await p.getByText(lang === 'es' ? 'Empezar la prueba' : 'Començar la prova', { exact: true }).click();
    await p.waitForTimeout(1200);
    await p.screenshot({ path: OUT + lang + '-plc-q.png', fullPage: true });
    const n = await answerAll(p, lang, 'right');
    check(n > 0, `${lang}: placement finished after ${n} answers (all right)`);
    await p.screenshot({ path: OUT + lang + '-plc-done.png', fullPage: true });
    body = await p.innerText('body');
    const nines = (body.match(/(Nivel|Nivell) 9/g) || []).length;
    check(nines >= 4, `${lang}: all-right student placed at level 9 in tested areas (got ${nines})`);
    const st = await p.evaluate(() => JSON.parse(localStorage.getItem('lectorix-store')).state);
    console.log('  startLevels', JSON.stringify(st.startLevels), 'stage', st.schoolStage, 'done', JSON.stringify(st.placementDone));

    await p.goto(BASE + '#/modulos/escritura'); await p.waitForTimeout(900);
    body = await p.innerText('body');
    check(!body.includes('🔒'), `${lang}: after placement all 9 levels open`);
    await p.screenshot({ path: OUT + lang + '-levels.png', fullPage: true });

    // ESO exercise loads
    await p.goto(BASE + '#/ejercicio/escritura/8'); await p.waitForTimeout(1500);
    await p.screenshot({ path: OUT + lang + '-ex8.png', fullPage: true });
    body = await p.innerText('body');
    check(bank[lang].some((e) => e.level === 8 && e.module === 'escritura' && body.includes(e.prompt)) || /Escucha|Escolta|Ordena|Corrige|Corregix|Escribe|Escriu|Substituïx/.test(body), `${lang}: level 8 writing exercise shows ESO content`);

    // Parent panel: starting point, one level down
    await p.goto(BASE + '#/panel-padres'); await p.waitForTimeout(1200);
    const down = p.getByRole('button', { name: new RegExp((lang === 'es' ? 'Bajar un nivel: ' : 'Baixar un nivell: ') + (lang === 'es' ? 'Fonología' : 'Fonologia')) });
    await down.click(); await p.waitForTimeout(300);
    const st2 = await p.evaluate((l) => JSON.parse(localStorage.getItem('lectorix-store')).state.startLevels[l].fonologia, lang);
    check(st2 === 8, `${lang}: parent panel lowers phonology start to 8 (got ${st2})`);
    await p.locator('text=' + (lang === 'es' ? 'Punto de partida' : 'Punt de partida')).scrollIntoViewIfNeeded();
    await p.screenshot({ path: OUT + lang + '-parent.png' });

    // Dictations and readings list levels 6-9
    await p.goto(BASE + '#/dictado'); await p.waitForTimeout(1200);
    body = await p.innerText('body');
    check(/Galaxia|Galàxia/.test(body) && /Júpiter/.test(body), `${lang}: dictation list includes ESO levels`);
    await p.goto(BASE + '#/lectura'); await p.waitForTimeout(1200);
    body = await p.innerText('body');
    check(/Dama/.test(body) && /(Generación|Generació) del 27/.test(body), `${lang}: reading list includes ESO readings`);
    await p.screenshot({ path: OUT + lang + '-reads.png', fullPage: true });
    await p.goto(BASE + '#/lectura/' + (lang === 'es' ? 'lectura_l8_tribunal' : 'lectura_ca_l8_tribunal')); await p.waitForTimeout(1200);
    await p.screenshot({ path: OUT + lang + '-read8.png', fullPage: true });
    check(/Tribunal/.test(await p.innerText('body')), `${lang}: ESO reading opens`);
    await ctx.close();
    }

    // Placement, all wrong, from 1.º–2.º Primaria: everything at level 1
    const ctx2 = await b.newContext({ viewport: { width: 390, height: 844 } });
    const q = await ctx2.newPage();
    q.on('pageerror', (e) => errors.push(`${lang} pageerror ${e.message}`));
    await q.goto(BASE);
    await q.evaluate(seed(lang), { lang, extra: {} });
    await q.reload(); await q.waitForTimeout(500);
    await q.goto(BASE + '#/prueba-nivel'); await q.waitForTimeout(900);
    await q.getByText(lang === 'es' ? '1.º–2.º Primaria' : '1r–2n Primària', { exact: true }).click();
    await q.getByText(lang === 'es' ? 'Empezar la prueba' : 'Començar la prova', { exact: true }).click();
    await q.waitForTimeout(1000);
    const n2 = await answerAll(q, lang, 'wrong');
    const st3 = await q.evaluate((l) => JSON.parse(localStorage.getItem('lectorix-store')).state.startLevels[l], lang);
    check(n2 > 0 && Object.values(st3).every((v) => v === 1), `${lang}: all-wrong student stays at level 1 (${JSON.stringify(st3)}, ${n2} answers)`);
    await ctx2.close();
  }

  // English keeps 5 levels
  const ctx3 = await b.newContext({ viewport: { width: 390, height: 844 } });
  const e = await ctx3.newPage();
  await e.goto(BASE);
  await e.evaluate(seed('en'), { lang: 'en', extra: { schoolStage: 'eso34' } });
  await e.reload(); await e.waitForTimeout(500);
  await e.goto(BASE + '#/modulos/fonologia'); await e.waitForTimeout(900);
  const eb = await e.innerText('body');
  check(/Level 7/.test(eb) && !/Level 8/.test(eb) && /B1\+/.test(eb), 'en: 7 CEFR levels');
  check((eb.match(/🔒/g) || []).length === 2, 'en: 3.º-4.º ESO opens levels 1-5 (up to A2+) in English');
  await ctx3.close();

  await b.close();
  console.log('ERRORS', errors.length, errors.slice(0, 10));
})();
