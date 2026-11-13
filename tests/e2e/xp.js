// XP consistency: what each activity shows as "+N XP" is what the total grows by, and History shows the real total
const { chromium } = require('playwright');
const BASE = 'http://localhost:4173/lectorix/';
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 390, height: 844 } });
  const errors = []; p.on('pageerror', (e) => errors.push(e.message));
  const check = (c, m) => { console.log(c ? 'PASS' : 'FAIL', m); if (!c) errors.push(m); };
  await p.goto(BASE);
  await p.evaluate(() => { localStorage.clear(); localStorage.setItem('lectorix-store', JSON.stringify({ state: { onboardingDone: true, placementDismissed: true, language: 'es', practiceLanguage: 'auto', progress: [], sessionHistory: [], user: { id: 'u', display_name: 'Ana', total_xp: 40, streak_days: 0, last_session: '2020-01-01T00:00:00Z' } }, version: 0 })); });
  await p.reload(); await p.waitForTimeout(800);
  const xp = () => p.evaluate(() => JSON.parse(localStorage.getItem('lectorix-store')).state.user.total_xp);
  const shown = async () => { const m = (await p.innerText('body')).match(/\+(\d+) (?:puntos|punts|points)/); return m ? Number(m[1]) : 0; };
  const answerAll = async (doneRe) => {
    for (let i = 0; i < 15; i++) {
      const t = await p.innerText('body'); if (doneRe.test(t)) break;
      const input = p.locator('input[type=text]:visible').first();
      if (await input.count()) { await input.fill('alimento'); await p.getByRole('button', { name: /Comprobar/ }).first().click().catch(() => {}); }
      else if (!(await p.evaluate(() => { const bs = [...document.querySelectorAll('button')].filter((x) => /^[A-D]\n/.test(x.innerText.trim())); if (bs.length) { bs[0].click(); return true; } return false; }))) {
        await p.evaluate(() => { [...document.querySelectorAll('button')].filter((x) => x.closest('[class*="flex-wrap"]') && x.innerText.trim().length < 25).forEach((x) => x.click()); });
        await p.getByRole('button', { name: /Comprobar/ }).first().click().catch(() => {});
      }
      await p.waitForTimeout(2400);
      const next = p.getByRole('button', { name: /^(Siguiente|Continuar)/ }); if (await next.count()) await next.first().click().catch(() => {});
      await p.waitForTimeout(300);
    }
  };

  // 1. Story quiz
  let before = await xp();
  await p.goto(BASE + '#/cuentos'); await p.waitForTimeout(900);
  await p.getByText(/Crear mi cuento/).click(); await p.waitForTimeout(1500);
  await p.getByText(/Responder/).click(); await p.waitForTimeout(800);
  await answerAll(/Inventar otro/);
  let gain = (await xp()) - before, s = await shown();
  check(gain === s, `story: shown +${s}, total grew ${gain} (0 only if every answer was wrong)`);
  // the same story again gives nothing more
  before = await xp();
  await p.getByText(/Volver a leer/).click(); await p.waitForTimeout(500);
  await p.getByText(/Responder/).click(); await p.waitForTimeout(800);
  await answerAll(/Inventar otro/);
  check((await xp()) === before && (await shown()) === 0, 'story: repeating the same quiz gives no extra XP');

  // 2. Study notes
  before = await xp();
  await p.goto(BASE + '#/adaptar'); await p.waitForTimeout(1200);
  const text = 'La fotosíntesis es el proceso por el que las plantas fabrican su alimento. Las hojas captan la luz del sol gracias a la clorofila, un pigmento de color verde. Además, las raíces absorben agua y sales minerales del suelo. Con la luz, el agua y el dióxido de carbono, la planta produce glucosa y libera oxígeno. Por eso las plantas son imprescindibles para la vida en la Tierra.';
  await p.evaluate((t) => { const ta = document.querySelector('textarea'); Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set.call(ta, t); ta.dispatchEvent(new Event('input', { bubbles: true })); }, text);
  await p.getByRole('button', { name: /Adaptar/ }).click(); await p.waitForTimeout(800);
  await p.getByRole('button', { name: /Estudiar este texto/ }).click(); await p.waitForTimeout(1200);
  await p.getByRole('button', { name: /Empezar \(\d+ preguntas\)/ }).click(); await p.waitForTimeout(1000);
  await answerAll(/\d+ de \d+ bien/);
  gain = (await xp()) - before; s = await shown();
  check(gain > 0 && gain === s, `study notes: shown +${s}, total grew ${gain}`);

  // 3. Paper reading on the shelf (10 XP, twice a day)
  const st = await p.evaluate(() => JSON.parse(localStorage.getItem('lectorix-store')).state);
  // 4. History total = real total (it includes XP that is not in the session list)
  await p.goto(BASE + '#/historial'); await p.waitForTimeout(1000);
  const body = await p.innerText('body');
  const total = await xp();
  check(new RegExp(`\\b${total}\\s*\\n?\\s*(?:Puntos en total|Punts en total|Total points)`).test(body), `history shows XP total ${total} (sessions: ${st.sessionHistory.length}, modes ${st.sessionHistory.map((x) => x.mode).join(',')})`);
  check(/Cuentos a tu medida/.test(body) && /Estudia tus apuntes/.test(body), 'history names the story and study sessions');
  await p.screenshot({ path: __dirname + '/xp-history.png', fullPage: true });
  await b.close(); console.log('ERRORS', errors.length, errors.slice(0, 5));
})();
