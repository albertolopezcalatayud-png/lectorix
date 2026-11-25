// Before writing (#/antes-de-escribir): eye and hand (targets, paths), series, shapes and grid copying.
// Plays every kind of activity with simulated touches, checks that mistakes are caught, stars are kept,
// texts in es/ca/en have no raw keys, nothing scrolls sideways; saves screenshots (SHOTS=folder).
const { chromium } = require('playwright');
const SHOTS = process.env.SHOTS || '/tmp/pw-shots';
require('fs').mkdirSync(SHOTS, { recursive: true });
(async () => {
  const b = await chromium.launch();
  let fails = 0;
  const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
  const errs = [];
  for (const lang of ['es', 'ca', 'en']) {
    const p = await b.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true, deviceScaleFactor: 2 });
    p.on('pageerror', (e) => errs.push(`${lang}: ${e.message}`));
    await p.goto('http://localhost:4173/lectorix/');
    await p.evaluate((l) => { localStorage.setItem('lectorix-mode', 'solo'); localStorage.setItem('lectorix-store', JSON.stringify({ state: { onboardingDone: true, language: l, practiceLanguage: 'auto', schoolStage: 'p12', progress: [], sessionHistory: [] }, version: 0 })); }, lang);
    await p.reload(); await p.waitForTimeout(1200);
    await p.goto('http://localhost:4173/lectorix/#/trazo'); await p.waitForTimeout(1000);
    ok(await p.getByTestId('to-prewriting').count() === 1, `${lang}: the letter tracing page points to "before writing" first`);
    await p.getByTestId('to-prewriting').click(); await p.waitForTimeout(800);
    ok(/#\/antes-de-escribir$/.test(p.url()), `${lang}: it opens #/antes-de-escribir`);
    const raw = async (where) => { const tx = await p.locator('body').innerText(); ok(!/\bpw_[a-z_0-9]+|undefined|NaN/.test(tx), `${lang} ${where}: no raw keys`); ok(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${lang} ${where}: no sideways scroll`); };
    await raw('sections'); await p.screenshot({ path: `${SHOTS}/${lang}-0-sections.png` });
    const toScreen = (sel, pts) => p.evaluate(([s, ps]) => { const m = document.querySelector(s).getScreenCTM(); return ps.map(([x, y]) => { const r = new DOMPoint(x, y).matrixTransform(m); return [r.x, r.y]; }); }, [sel, pts]);
    const drag = async (pts) => { await p.mouse.move(pts[0][0], pts[0][1]); await p.mouse.down(); for (const [x, y] of pts.slice(1)) await p.mouse.move(x, y, { steps: 1 }); await p.mouse.up(); await p.waitForTimeout(180); };
    const msg = () => p.locator('[aria-live=polite]').first().innerText();
    const sel = (id) => `[data-testid=${id}]`;

    // ── 1. Eye and hand: targets
    await p.getByTestId('pw-sec-eye').click(); await p.waitForTimeout(300);
    await raw('eye list'); await p.screenshot({ path: `${SHOTS}/${lang}-1-eye.png` });
    await p.getByTestId('pw-item-tap').click(); await p.waitForTimeout(300);
    const tapOnce = async (miss) => { const g = p.getByTestId('pw-target'); const x = +(await g.getAttribute('data-x')); const y = +(await g.getAttribute('data-y')); const [[sx, sy]] = await toScreen(sel('pw-tap'), [[miss ? (x > 50 ? x - 20 : x + 20) : x + 0.5, y]]); await p.mouse.click(sx, sy); await p.waitForTimeout(60); };
    await tapOnce(true);
    ok((await msg()).length > 0, `${lang}: a miss is told (${await msg()})`);
    for (let i = 0; i < 10; i++) await tapOnce(false);
    if (lang === 'es') await p.screenshot({ path: `${SHOTS}/${lang}-1b-tap.png` });
    await p.waitForTimeout(1800);
    ok(await p.getByRole('tab', { selected: true }).innerText().then((s) => s.startsWith('2')), `${lang}: targets move on to the smaller step`);
    await p.getByRole('button', { name: /‹/ }).first().click(); await p.waitForTimeout(300);
    ok(/1/.test(await p.getByTestId('pw-item-tap').getAttribute('aria-label')), `${lang}: the target game keeps 1 star`);

    // paths: follow the wave; then go off it
    await p.getByTestId('pw-item-path-wave').click(); await p.waitForTimeout(300);
    const model = await p.evaluate(() => { const svg = document.querySelector('[data-testid=pw-path]'); const path = svg.querySelector('path'); const L = path.getTotalLength(); const out = []; for (let s = 0; s <= L; s += 1.5) { const q = path.getPointAtLength(s); out.push([q.x, q.y]); } const e = path.getPointAtLength(L); out.push([e.x, e.y]); return out; });
    await drag(await toScreen(sel('pw-path'), model.map(([x, y], i) => [x, y + (i > 20 ? 15 : 0)])));
    ok((await msg()).length > 0 && (await p.locator('[data-testid=pw-path] path[stroke="var(--color-accent)"]').count()) === 0, `${lang}: leaving the path stops the try (${await msg()})`);
    await drag(await toScreen(sel('pw-path'), model.map(([x, y]) => [x, y + 2])));
    if (lang === 'es') await p.screenshot({ path: `${SHOTS}/${lang}-1c-path.png` });
    await p.waitForTimeout(1800);
    await drag(await toScreen(sel('pw-path'), model));
    await p.waitForTimeout(1800);
    await drag(await toScreen(sel('pw-path'), model));
    await p.waitForTimeout(300);
    await p.getByRole('button', { name: /‹/ }).first().click(); await p.waitForTimeout(300);
    ok(/3/.test(await p.getByTestId('pw-item-path-wave').getAttribute('aria-label')), `${lang}: wide, medium and narrow paths give 3 stars`);
    await p.getByRole('button', { name: /‹/ }).first().click(); await p.waitForTimeout(300);

    // ── 2. Series: dot, dash
    await p.getByTestId('pw-sec-series').click(); await p.waitForTimeout(300);
    await raw('series list'); await p.screenshot({ path: `${SHOTS}/${lang}-2-series.png` });
    const playSeries = async (id, mistakes) => {
      await p.getByTestId(`pw-item-ser-${id}`).click(); await p.waitForTimeout(300);
      for (let round = 0; round < 3; round++) {
        const slots = await p.$$eval('[data-testid=pw-series] g[data-slot]', (gs) => gs.map((g) => ({ i: +g.dataset.slot, el: g.dataset.el, x: +g.dataset.x, y: +g.dataset.y })));
        const draw = async (el, x, y) => {
          if (el === 'dot') { const [[sx, sy]] = await toScreen(sel('pw-series'), [[x, y - 6]]); await p.mouse.click(sx, sy); await p.waitForTimeout(80); return; }
          let pts;
          if (el === 'dash') pts = Array.from({ length: 10 }, (_, k) => [x - 4.5 + k, y - 6]);
          else if (el === 'stick') pts = Array.from({ length: 14 }, (_, k) => [x, y - 15 + k * 15 / 13]);
          else pts = Array.from({ length: 26 }, (_, k) => [x + 4.2 * Math.sin((k / 25) * 2 * Math.PI), y - 6 - 4.2 * Math.cos((k / 25) * 2 * Math.PI)]);
          await drag(await toScreen(sel('pw-series'), pts));
        };
        const first = slots.find((s) => s.i >= 4 && s.el !== 'gap' && !(s.i < (id === 'dotdotdash' ? 6 : 4)));
        if (mistakes && round === 0) {
          const wrongEl = first.el === 'dot' ? 'stick' : 'dot';
          await draw(wrongEl, first.x, first.y);
          ok(/\S/.test(await msg()), `${lang}: a wrong element in the series is caught (${await msg()})`);
          const gap = slots.find((s) => s.el === 'gap' && s.i >= 4);
          if (gap) { await draw('dot', gap.x, gap.y); ok(/\S/.test(await msg()), `${lang}: drawing in a gap is caught (${await msg()})`); }
        }
        const start = id === 'dotdotdash' ? 6 : 4;
        for (const s of slots) if (s.i >= start && s.el !== 'gap') await draw(s.el, s.x, s.y);
        if (round === 0 && lang === 'es') await p.screenshot({ path: `${SHOTS}/${lang}-2b-series-${id}.png` });
        await p.waitForTimeout(1800);
      }
      await p.getByRole('button', { name: /‹/ }).first().click(); await p.waitForTimeout(300);
      return p.getByTestId(`pw-item-ser-${id}`).getAttribute('aria-label');
    };
    ok(/3/.test(await playSeries('dotdash', true)), `${lang}: dot, dash series done in its three steps`);
    ok(/3/.test(await playSeries('dotgap', false)), `${lang}: dot, no dot series done`);
    ok(/3/.test(await playSeries('ringstick', false)), `${lang}: circle, stick series done`);
    await p.getByRole('button', { name: /‹/ }).first().click(); await p.waitForTimeout(300);

    // ── 3. Shapes: the square opens the stroke-by-stroke tracing
    await p.getByTestId('pw-sec-shapes').click(); await p.waitForTimeout(300);
    await raw('shapes list'); await p.screenshot({ path: `${SHOTS}/${lang}-3-shapes.png` });
    await p.getByTestId('pw-item-pw-square').click(); await p.waitForTimeout(500);
    ok(await p.getByTestId('trace-pad').count() === 1, `${lang}: the square opens the tracing pad`);
    if (lang === 'es') await p.screenshot({ path: `${SHOTS}/${lang}-3b-square.png` });
    await p.getByRole('button', { name: /‹/ }).first().click(); await p.waitForTimeout(300);
    await p.getByRole('button', { name: /‹/ }).first().click(); await p.waitForTimeout(300);

    // ── 4. Grid: the stairs, a wrong line, then the three steps
    await p.getByTestId('pw-sec-grid').click(); await p.waitForTimeout(300);
    await raw('grid list'); await p.screenshot({ path: `${SHOTS}/${lang}-4-grid.png` });
    await p.getByTestId('pw-item-grid-stairs').click(); await p.waitForTimeout(300);
    const G0 = 8, GS = 84 / 6; const gx = (i) => G0 + i * GS;
    const stairs = [[0, 0], [1, 0], [1, 1], [2, 1], [2, 2], [3, 2], [3, 3]];
    const line = async (a, b2) => { const pts = Array.from({ length: 12 }, (_, k) => [gx(a[0]) + (gx(b2[0]) - gx(a[0])) * k / 11, gx(a[1]) + (gx(b2[1]) - gx(a[1])) * k / 11]); await drag(await toScreen(sel('pw-grid'), pts)); };
    for (let step = 0; step < 3; step++) {
      const off = (await p.locator('[data-off]').getAttribute('data-off')).split(',').map(Number);
      if (step === 0) { await line([off[0], off[1]], [off[0] + 3, off[1] + 3]); ok(/\S/.test(await msg()), `${lang}: a line that is not in the model is caught (${await msg()})`); }
      if (step === 2) ok(off.join(',') !== '1,1', `${lang}: step 3 puts the copy somewhere else (${off})`);
      for (let k = 1; k < stairs.length; k++) await line([stairs[k - 1][0] + off[0], stairs[k - 1][1] + off[1]], [stairs[k][0] + off[0], stairs[k][1] + off[1]]);
      if (lang === 'es' && step === 1) await p.screenshot({ path: `${SHOTS}/${lang}-4b-grid-copy.png` });
      await p.waitForTimeout(1800);
    }
    await p.getByRole('button', { name: /‹/ }).first().click(); await p.waitForTimeout(300);
    ok(/3/.test(await p.getByTestId('pw-item-grid-stairs').getAttribute('aria-label')), `${lang}: the stairs copied in the three steps give 3 stars`);
    // the house: two lines in one go (a long straight line counts as several squares)
    await p.getByTestId('pw-item-grid-house').click(); await p.waitForTimeout(300);
    for (const [a, c] of [[[1, 5], [1, 3]], [[1, 3], [3, 1]], [[3, 1], [5, 3]], [[5, 3], [5, 5]], [[5, 5], [1, 5]], [[2, 5], [2, 4]], [[2, 4], [3, 4]], [[3, 4], [3, 5]]]) await line(a, c);
    ok(/Muy bien|Molt bé|Well done/.test(await msg()), `${lang}: the house traced with long lines is accepted (${await msg()})`);
    await p.getByRole('button', { name: /‹/ }).first().click(); await p.waitForTimeout(300);
    // stars survive a reload
    await p.reload(); await p.waitForTimeout(1200);
    await p.getByTestId('pw-sec-grid').click(); await p.waitForTimeout(300);
    ok(/3/.test(await p.getByTestId('pw-item-grid-stairs').getAttribute('aria-label')), `${lang}: stars are kept after reloading`);
    await p.close();
  }
  ok(errs.length === 0, 'no page errors ' + errs.slice(0, 3).join(' | '));
  await b.close();
  console.log(fails ? `${fails} FAILED` : 'ALL PASSED');
  process.exit(fails ? 1 : 0);
})();
