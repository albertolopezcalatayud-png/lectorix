// Testers: "I did the challenge, it gave me 105 points and my total did not go up".
// Devices set up after the sign-in screen was removed had no local profile, so points were never added.
// 1) A device with sessions but no profile gets one with the points of those sessions.
// 2) A brand-new student who goes through the welcome screens gets points from today's task.
const { chromium } = require('playwright');
const BASE = 'http://localhost:4173/lectorix/';
(async () => {
  const b = await chromium.launch(); const errors = []; let fails = 0;
  const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
  const state = (p) => p.evaluate(() => JSON.parse(localStorage.getItem('lectorix-store')).state);
  const playDaily = async (p) => {
    await p.goto(BASE + '#/reto-diario'); await p.waitForTimeout(1500);
    for (let i = 0; i < 8 && !/resultados/.test(p.url()); i++) {
      await p.locator('button').filter({ hasText: /^\s*[A-D]\s*\S/ }).first().click().catch(() => {});
      await p.waitForTimeout(2300);
      const next = p.getByText(/^(Siguiente|Continuar)/); if (await next.count()) { await next.first().click(); await p.waitForTimeout(500); }
    }
    await p.waitForTimeout(1200);
  };

  // 1. existing device: three sessions saved, no profile
  {
    const p = await (await b.newContext({ viewport: { width: 390, height: 844 } })).newPage(); p.on('pageerror', (e) => errors.push(e.message));
    await p.goto(BASE);
    await p.evaluate(() => { const now = Date.now(); localStorage.clear(); localStorage.setItem('lectorix-store', JSON.stringify({ state: { onboardingDone: true, language: 'es', progress: [], user: null,
      sessionHistory: [0, 1, 2].map((i) => ({ id: 's' + i, module: 'fonologia', level: 1, total_questions: 10, correct_answers: 8, score_percent: 80, stars: 2, xp_earned: 35, time_ms: 1000, answers: [], completed_at: new Date(now - i * 86400000).toISOString(), mode: 'normal' })) }, version: 0 })); });
    await p.reload(); await p.waitForTimeout(1500);
    const s = await state(p);
    ok(s.user && s.user.total_xp === 105, `profile rebuilt with the points already earned (${s.user && s.user.total_xp})`);
    ok(s.user && s.user.streak_days === 3, `days in a row rebuilt (${s.user && s.user.streak_days})`);
    ok(/105 puntos en total/.test(await p.innerText('body')), 'dashboard shows the rebuilt total');
    const before = s.user.total_xp; await playDaily(p);
    const after = (await state(p)).user.total_xp;
    ok(after > before, `today's task adds points (${before} → ${after})`);
  }
  // 2. brand-new student through the welcome screens (Spanish device)
  {
    const p = await (await b.newContext({ viewport: { width: 390, height: 844 }, locale: 'es-ES' })).newPage(); p.on('pageerror', (e) => errors.push(e.message));
    await p.goto(BASE); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(1200);
    for (let i = 0; i < 12; i++) {
      const s = await p.evaluate(() => { try { return JSON.parse(localStorage.getItem('lectorix-store')).state.onboardingDone; } catch { return false; } });
      if (s) break;
      const btn = p.getByRole('button', { name: /Saltar tutorial|Siguiente|Empezar/ }).first();
      if (await btn.count()) await btn.click().catch(() => {}); else break;
      await p.waitForTimeout(700);
    }
    const s0 = await state(p);
    ok(s0.onboardingDone && s0.user && s0.user.total_xp === 0, 'a new student gets a profile when the welcome ends');
    await playDaily(p);
    const s1 = await state(p);
    ok(s1.user.total_xp >= 50, `new student's first task counts (${s1.user.total_xp} points, ${s1.sessionHistory[0] && s1.sessionHistory[0].xp_earned} shown)`);
    ok(s1.user.total_xp === s1.sessionHistory[0].xp_earned, 'total equals the points shown on the results screen');
    await p.goto(BASE + '#/'); await p.waitForTimeout(900);
    ok(new RegExp(`${s1.user.total_xp} puntos en total`).test(await p.innerText('body')), 'dashboard total matches');
  }
  console.log('ERRORS', fails, errors); await b.close();
})();
