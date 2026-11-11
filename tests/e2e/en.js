const { chromium } = require('playwright');
const fs = require('fs');
const BASE = 'http://localhost:4173/lectorix/';
const R = '/home/claude/lectorix/src/data/exercises/en/';
const MODS = ['fonologia', 'memoria_visual', 'comprension_lectora', 'escritura', 'retos_rapidos'];
const bank = MODS.flatMap((m) => JSON.parse(fs.readFileSync(R + m + '.json')).exercises);
const mcs = bank.filter((e) => e.type === 'multiple_choice');
(async () => {
  const errors = []; const check = (c, m) => { console.log(c ? 'PASS' : 'FAIL', m); if (!c) errors.push(m); };
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 390, height: 844 } }); const p = await ctx.newPage();
  p.on('pageerror', (e) => errors.push('pageerror ' + e.message)); p.on('console', (m) => { if (m.type() === 'error') errors.push('console ' + m.text()); });
  // Spanish interface, practising English
  const transfer = bank.filter((e) => e.skill === 'transfer').slice(0, 8);
  const hist = [{ id: 's1', module: 'escritura', level: 6, total_questions: 8, correct_answers: 1, score_percent: 12, stars: 0, xp_earned: 5, time_ms: 60000,
    answers: transfer.map((e, i) => ({ exercise_id: e.id, selected: 0, correct: 0, is_correct: i === 0, time_ms: 3000 })), completed_at: '2026-11-10T10:00:00.000Z', mode: 'normal' }];
  await p.goto(BASE);
  await p.evaluate((h) => { localStorage.clear(); localStorage.setItem('lectorix-store', JSON.stringify({ state: { onboardingDone: true, language: 'es', practiceLanguage: 'en', progress: [], sessionHistory: h }, version: 0 })); }, hist);
  await p.reload(); await p.waitForTimeout(1200);
  await p.goto(BASE + '#/modulos/escritura'); await p.waitForTimeout(1000);
  let body = await p.innerText('body');
  check(/Nivel 7 · Saturno\s·\sB1\+/.test(body) && /Nivel 1 · Despegue\s·\sPre.A1/.test(body), 'levels show CEFR bands (Pre-A1 … B1+)');
  check(/Marco Común Europeo/.test(body), 'CEFR note on the levels page');
  await p.screenshot({ path: 'en-levels.png', fullPage: true });
  // Placement all right from 3.º–4.º ESO
  await p.goto(BASE + '#/prueba-nivel'); await p.waitForTimeout(900);
  await p.getByText('3.º–4.º ESO', { exact: true }).click(); await p.getByText('Empezar la prueba', { exact: true }).click(); await p.waitForTimeout(1200);
  for (let i = 0; i < 60; i++) {
    const t = await p.innerText('body'); if (/Ya está!/.test(t)) break;
    const btns = await p.$$('div button'); const texts = (await Promise.all(btns.map((x) => x.innerText()))).map((x) => x.trim().split('\n').pop().trim());
    const ex = mcs.find((e) => t.includes(e.prompt) && e.options.every((o) => texts.includes(o)) && (!e.passage || t.includes(e.passage.slice(0, 40))));
    if (!ex) { await p.waitForTimeout(400); continue; }
    await btns[texts.indexOf(ex.options[ex.correct])].click(); await p.waitForTimeout(2300);
  }
  body = await p.innerText('body');
  check((body.match(/Nivel 7 · Saturno\s·\sB1\+/g) || []).length >= 4, 'all-right English placement reaches B1+');
  await p.screenshot({ path: 'en-plc.png', fullPage: true });
  // B1+ exercise and readings
  await p.goto(BASE + '#/ejercicio/escritura/7'); await p.waitForTimeout(1500); body = await p.innerText('body');
  check(bank.some((e) => e.level === 7 && e.module === 'escritura' && body.includes(e.prompt)), 'level 7 English writing loads B1 content');
  await p.screenshot({ path: 'en-ex7.png', fullPage: true });
  await p.goto(BASE + '#/lectura'); await p.waitForTimeout(1200); body = await p.innerText('body');
  check(/Alan Turing/.test(body) && /gap year/.test(body) && /B1/.test(body), 'reading list has B1 readings with CEFR tags');
  // Skill map shows the new transfer skill
  await p.goto(BASE + '#/panel-padres'); await p.waitForTimeout(1500); body = await p.innerText('body');
  check(/Trampas habituales del inglés/.test(body), 'skill map lists "Trampas habituales del inglés"');
  await p.locator('text=Trampas habituales del inglés').first().scrollIntoViewIfNeeded(); await p.screenshot({ path: 'en-map.png' });
  await b.close(); console.log('ERRORS', errors.length, errors.slice(0, 5));
})();
