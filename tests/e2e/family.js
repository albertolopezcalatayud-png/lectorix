const { chromium } = require('playwright');
const BASE = 'http://localhost:4173/lectorix/';
(async () => {
  const b = await chromium.launch();
  const errors = [];
  for (const lang of ['es', 'ca', 'en']) {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
    const p = await ctx.newPage();
    p.on('pageerror', e => errors.push(`${lang} pageerror ${e.message}`));
    p.on('console', m => { if (m.type() === 'error') errors.push(`${lang} console ${m.text()}`); });
    await p.goto(BASE);
    await p.evaluate((lang) => {
      const D = 86400000, now = Date.now();
      const mk = (daysAgo, module, mode, nOk, nBad) => {
        const answers = [];
        for (let i = 0; i < nOk; i++) answers.push({ exercise_id: `${lang}_${module}_l1_m00${i}`, selected: 0, correct: 0, is_correct: true, time_ms: 4000 });
        for (let i = 0; i < nBad; i++) answers.push({ exercise_id: `${lang}_${module}_l1_m10${i}`, selected: 1, correct: 0, is_correct: false, time_ms: 6000 });
        return { id: 'x' + Math.random(), module, level: 1, total_questions: nOk + nBad, correct_answers: nOk, score_percent: 0, stars: 1, xp_earned: 10, time_ms: (nOk + nBad) * 5000, answers, completed_at: new Date(now - daysAgo * D).toISOString(), mode };
      };
      const hist = [mk(0, 'fonologia', 'normal', 9, 1), mk(1, 'escritura', 'normal', 4, 6), mk(3, 'memoria_visual', 'normal', 8, 2), mk(3, 'escritura', 'dictation', 3, 3), mk(9, 'fonologia', 'normal', 5, 5), mk(10, 'fonologia', 'normal', 5, 5)];
      localStorage.setItem('lectorix-store', JSON.stringify({ state: { onboardingDone: true, language: lang, practiceLanguage: 'auto', progress: [], sessionHistory: hist, user: { id: '1', display_name: 'Lucía', email: '', plan: 'free', total_xp: 120, streak_days: 2, last_session: new Date().toISOString(), created_at: new Date().toISOString() } }, version: 0 }));
      const key = `${lang}:${lang}_memoria_visual_l2_m013`;
      localStorage.setItem('lectorix-review', JSON.stringify({ state: { items: { [key]: { key, id: `${lang}_memoria_visual_l2_m013`, lang, module: 'memoria_visual', level: 2, box: 1, due: now, misses: 2, lastMiss: now, word: lang === 'en' ? 'friend' : lang === 'ca' ? 'vaques' : 'llave' } } }, version: 0 }));
    }, lang);
    await p.reload(); await p.waitForTimeout(500); await p.goto(BASE + '#/panel-padres'); await p.waitForTimeout(900);
    await p.screenshot({ path: `${lang}-family.png`, fullPage: true });
    console.log(lang, (await p.innerText('body')).replace(/\s+/g, ' ').slice(0, 900));
    await ctx.close();
  }
  console.log('ERRORS', errors.length, errors.slice(0, 10));
  await b.close();
})();
