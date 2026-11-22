// Letter tracing (#/trazo): the finger must start at the green dot, follow the stroke the right way and stay on it.
// Traces with simulated touches along the model; checks the stars, the dashboard card and the printable sheet.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 390, height: 800 }, hasTouch: true });
  const errs = [];
  p.on('pageerror', (e) => errs.push(e.message));
  const ok = (c, m) => console.log((c ? 'PASS ' : 'FAIL ') + m);
  await p.goto('http://localhost:4173/lectorix/');
  await p.evaluate(() => { localStorage.setItem('lectorix-mode', 'solo'); localStorage.setItem('lectorix-store', JSON.stringify({ state: { onboardingDone: true, language: 'es', practiceLanguage: 'auto', schoolStage: 'p12', progress: [], sessionHistory: [] }, version: 0 })); });
  await p.reload(); await p.waitForTimeout(1500);
  ok((await p.getByText('Trazo de letras').count()) > 0, 'dashboard shows the tracing card for 1.º-2.º');
  await p.getByText('Trazo de letras').first().click(); await p.waitForTimeout(1200);
  ok(/#\/trazo$/.test(p.url()), 'the card opens #/trazo');

  // Points of the model of the stroke being traced, in screen coordinates
  const modelPts = (strokeD) => p.evaluate((d) => {
    const svg = document.querySelector('[data-testid=trace-pad]');
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path'); path.setAttribute('d', d); svg.appendChild(path);
    const m = svg.getScreenCTM(); const L = path.getTotalLength(); const out = [];
    for (let s = 0; s <= L; s += 2) { const q = path.getPointAtLength(s); const r = new DOMPoint(q.x, q.y).matrixTransform(m); out.push([r.x, r.y]); }
    const e = path.getPointAtLength(L); const r = new DOMPoint(e.x, e.y).matrixTransform(m); out.push([r.x, r.y]);
    path.remove(); return out;
  }, strokeD);
  const drag = async (pts) => {
    await p.mouse.move(pts[0][0], pts[0][1]); await p.mouse.down();
    for (const [x, y] of pts.slice(1)) await p.mouse.move(x, y, { steps: 1 });
    await p.mouse.up(); await p.waitForTimeout(250);
  };
  const msg = () => p.locator('[aria-live=polite]').innerText();
  const inkCount = () => p.locator('[data-testid=trace-pad] path[stroke="var(--color-accent)"]').count();

  // Lowercase l: one stroke from the top down
  await p.getByRole('tab', { name: 'minúsculas' }).click(); await p.waitForTimeout(300);
  await p.getByRole('button', { name: /^l,/ }).click(); await p.waitForTimeout(500);
  const L = await modelPts('M10 10 L10 70');
  await drag([...L].reverse());
  ok(/punto verde/.test(await msg()), 'starting at the wrong end asks to start at the green dot');
  await drag(L.slice(0, Math.floor(L.length / 2)));
  ok(/final del trazo/.test(await msg()), 'half a stroke asks to go on to the end');
  await drag(L.map(([x, y], i) => [x + (i > 3 ? 60 : 0), y]));
  ok(/encima de la línea|final del trazo/.test(await msg()) && (await inkCount()) === 0, 'wandering off the line is not accepted');
  await drag(L.map(([x, y]) => [x + 3, y]));
  ok(/Muy bien/.test(await msg()), `tracing it right is praised (${await msg()})`);
  ok((await p.getByText('luna').count()) > 0, 'the example word appears (luna)');
  await p.waitForTimeout(1900);
  ok(await p.getByRole('tab', { name: /Con puntos/ }).getAttribute('aria-selected') === 'true', 'it moves on to step 2 (dots)');
  await drag(L);
  await p.waitForTimeout(1900);
  ok(await p.getByRole('tab', { name: /Sin ayuda/ }).getAttribute('aria-selected') === 'true', 'then to step 3 (on your own)');
  await drag(L);
  ok(/Tres estrellas/.test(await msg()), 'step 3 gives the three stars');

  // Lowercase a: circle anticlockwise, then the stick; the circle drawn clockwise does not count
  await p.getByRole('button', { name: /‹ Todas/ }).first().click(); await p.waitForTimeout(300);
  const stars = await p.getByRole('button', { name: /^l,/ }).getAttribute('aria-label');
  ok(/3 de 3/.test(stars), `the stars are kept (${stars})`);
  await p.getByRole('button', { name: /^a,/ }).click(); await p.waitForTimeout(500);
  const circle = await p.evaluate(() => {
    // the first model stroke of a, as drawn on the pad (guide path)
    return document.querySelectorAll('[data-testid=trace-pad] path[data-guide]')[0].getAttribute('d');
  });
  const C = await modelPts(circle);
  await drag([C[0], ...C.slice(1).reverse()]);
  ok(!/Ahora el trazo 2/.test(await msg()), 'the circle the wrong way round is not accepted');
  await drag(C);
  ok(/Ahora el trazo 2/.test(await msg()), 'the circle the right way round is accepted, now stroke 2');
  const stick = await p.evaluate(() => document.querySelectorAll('[data-testid=trace-pad] path[data-guide]')[1].getAttribute('d'));
  await drag(await modelPts(stick));
  ok(/Muy bien/.test(await msg()), 'the stick finishes the a');

  // i: the dot is a tap
  await p.getByRole('button', { name: /Siguiente/ }).click(); await p.waitForTimeout(400);
  await p.getByRole('button', { name: /‹ Todas/ }).first().click(); await p.getByRole('button', { name: /^i,/ }).click(); await p.waitForTimeout(400);
  await drag(await modelPts('M12 40 L12 70'));
  const dot = await modelPts('M12 28 L12 28.5');
  await p.mouse.click(dot[0][0] + 2, dot[0][1] + 2); await p.waitForTimeout(300);
  ok(/Muy bien/.test(await msg()), 'the dot of the i is a tap');

  // Patterns and the watch button
  await p.getByRole('button', { name: /‹ Todas/ }).first().click();
  await p.getByRole('tab', { name: 'Grafismos' }).click(); await p.getByRole('button', { name: /^Olas,/ }).click(); await p.waitForTimeout(300);
  await p.getByRole('button', { name: /Mira cómo se hace/ }).click(); await p.waitForTimeout(700);
  ok((await p.locator('[data-testid=trace-pad] circle[fill="var(--color-coral)"]').count()) === 1, 'watch shows the moving dot');
  await p.waitForTimeout(2500);
  const waves = await p.evaluate(() => document.querySelector('[data-testid=trace-pad] path[data-guide]').getAttribute('d'));
  await drag(await modelPts(waves));
  ok(/Muy bien/.test(await msg()), 'the waves can be traced');

  // Printable sheet: opens a print window with the SVG rows
  await p.getByRole('button', { name: /‹ Todas/ }).first().click();
  const [popup] = await Promise.all([p.waitForEvent('popup'), p.getByRole('button', { name: /Ficha para imprimir/ }).click()]);
  await popup.waitForLoadState(); const html = await popup.content();
  ok(/Ficha de trazo/.test(html) && (html.match(/<svg/g) || []).length === 20, `the sheet has two rows per pattern (${(html.match(/<svg/g) || []).length} rows)`);

  // Joined handwriting and words. Traces every stroke of the guide in order (dots are taps).
  const traceAll = async () => {
    const ds = await p.evaluate(() => [...document.querySelectorAll('[data-testid=trace-pad] path[data-guide]')].map((e) => e.getAttribute('d')));
    for (const d of ds) {
      const pts = await modelPts(d);
      const len = Math.hypot(pts[pts.length - 1][0] - pts[0][0], pts[pts.length - 1][1] - pts[0][1]);
      if (pts.length <= 2 && len < 3) { await p.mouse.click(pts[0][0], pts[0][1]); await p.waitForTimeout(200); } else await drag(pts);
    }
    return ds.length;
  };
  await p.evaluate(() => { const s = JSON.parse(localStorage.getItem('lectorix-store')); s.state.user = { display_name: 'Sofía', total_xp: 0 }; localStorage.setItem('lectorix-store', JSON.stringify(s)); });
  await p.reload(); await p.waitForTimeout(1200);
  await p.getByRole('tab', { name: 'minúsculas' }).click();
  await p.getByRole('radio', { name: 'Ligada' }).click(); await p.waitForTimeout(300);
  ok((await p.locator('button[aria-label^="a,"] svg').count()) === 1, 'joined letters are shown as drawings');
  await p.getByRole('button', { name: /^a,/ }).click(); await p.waitForTimeout(400);
  ok(await traceAll() === 1, 'the joined a is one stroke (with its lead-in)');
  ok(/Muy bien/.test(await msg()), 'the joined a can be traced');
  await p.getByRole('button', { name: /‹ Todas/ }).first().click();
  await p.getByRole('tab', { name: 'Palabras' }).click(); await p.waitForTimeout(300);
  ok((await p.getByRole('radio', { name: 'Ligada' }).getAttribute('aria-checked')) === 'true', 'the handwriting choice is remembered');
  const first = await p.locator('.grid.gap-2 button[aria-label]').first().getAttribute('aria-label');
  ok(/^Sofía,/.test(first), `the child's name comes first (${first})`);
  await p.getByRole('button', { name: /^Sofía,/ }).click(); await p.waitForTimeout(400);
  const n = await traceAll();
  ok(n === 3 && /Muy bien/.test(await msg()), `Sofía in joined handwriting: print S, the joined word and the accent (${n} strokes)`);
  await p.getByRole('button', { name: /‹ Todas/ }).first().click();
  await p.getByRole('textbox', { name: 'Añade una palabra' }).fill('dos palabras'); await p.getByRole('button', { name: 'Añadir' }).click();
  ok((await p.getByRole('alert').count()) === 1, 'two words are not accepted');
  await p.getByRole('textbox', { name: 'Añade una palabra' }).fill('pez'); await p.getByRole('button', { name: 'Añadir' }).click(); await p.waitForTimeout(200);
  ok((await p.getByRole('button', { name: /^pez,/ }).count()) === 1, 'an added word appears');
  await p.getByRole('radio', { name: 'Imprenta' }).click(); await p.waitForTimeout(200);
  await p.getByRole('button', { name: /^pez,/ }).click(); await p.waitForTimeout(400);
  ok(await traceAll() === 4 && /Muy bien/.test(await msg()), 'pez in print: p (2 strokes), e, z');
  await p.getByRole('button', { name: /‹ Todas/ }).first().click();
  await p.getByRole('button', { name: 'Quitar pez' }).click(); await p.waitForTimeout(200);
  ok((await p.getByRole('button', { name: /^pez,/ }).count()) === 0, 'an added word can be removed');

  // English: different examples, no ñ
  await p.evaluate(() => { const s = JSON.parse(localStorage.getItem('lectorix-store')); s.state.language = 'en'; localStorage.setItem('lectorix-store', JSON.stringify(s)); });
  await p.reload(); await p.waitForTimeout(1200);
  await p.getByRole('tab', { name: 'lowercase' }).click();
  ok((await p.getByRole('button', { name: /^ñ,/ }).count()) === 0 && (await p.getByRole('button', { name: /^z,/ }).count()) === 1, 'English letters: no ñ');

  ok(errs.length === 0, 'no page errors ' + errs.join(' | '));
  await b.close();
})();
