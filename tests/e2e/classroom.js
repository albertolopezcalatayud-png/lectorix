// "For the classroom": the teacher option on the first screen, the paper booklet (its QR codes are decoded from
// the printed page and opened), the listening screen a QR opens, and the homework of the week with its stamp.
// Needs jsqr and pngjs (MIT / Apache-2.0) to read the QR codes: NODE_PATH pointing at a folder that has them.
const { chromium } = require('playwright');
const jsQR = require('jsqr');
const { PNG } = require('pngjs');
const BASE = 'http://localhost:4173/lectorix/';
(async () => {
  const b = await chromium.launch();
  const ok = (c, m) => console.log((c ? 'PASS ' : 'FAIL ') + m);
  const errs = [];
  const stubVoice = () => {
    window.__said = [];
    const real = window.speechSynthesis;
    Object.defineProperty(window, 'speechSynthesis', { value: { speak: (u) => { window.__said.push(u.text); setTimeout(() => u.onend && u.onend(), 30); }, cancel() {}, getVoices: () => real.getVoices(), pause() {}, resume() {}, speaking: false, pending: false, addEventListener() {}, removeEventListener() {} } });
  };
  const fresh = async () => { const c = await b.newContext({ viewport: { width: 390, height: 800 }, locale: 'es-ES' }); await c.addInitScript(stubVoice); const p = await c.newPage(); p.on('pageerror', (e) => errs.push(e.message)); return p; };

  // 1. First screen: "I am a teacher" opens the classroom section
  let p = await fresh();
  await p.goto(BASE); await p.waitForTimeout(1200);
  await p.getByRole('button', { name: /Soy docente/ }).click(); await p.waitForTimeout(1200);
  ok(/#\/aula$/.test(p.url()) && (await p.getByText('Para el aula').count()) > 0, 'Soy docente opens Para el aula');

  // 2. Booklet: 1.º-2.º, Spanish, 2 weeks
  await p.getByRole('combobox', { name: /Curso/ }).selectOption('p12').catch(() => {});
  await p.locator('select').nth(2).selectOption('2');
  const [book] = await Promise.all([p.waitForEvent('popup'), p.getByRole('button', { name: /Crear el cuadernillo/ }).click()]);
  await book.waitForLoadState(); await book.waitForTimeout(500);
  const html = await book.content();
  ok(/Semana 1/.test(html) && /Semana 2/.test(html) && !/Semana 3/.test(html), 'the booklet has the weeks asked for');
  ok((html.match(/class="g"/g) || []).length >= 6, `tracing rows for the youngest (${(html.match(/class="g"/g) || []).length})`);
  ok(/class="sy"/.test(html), 'syllables to read in 1.º-2.º');
  ok(/Para el profe: soluciones y dictados/.test(html), 'a last page with the answers for the teacher');
  const qrCount = (html.match(/aria-label="QR"/g) || []).length;
  ok(qrCount >= 6, `QR codes for syllables, dictations and readings (${qrCount})`);
  // decode every QR from a screenshot of each figure
  await book.setViewportSize({ width: 900, height: 1200 });
  const figs = book.locator('figure svg');
  const urls = [];
  for (let i = 0; i < await figs.count(); i++) {
    const png = PNG.sync.read(await figs.nth(i).screenshot({ scale: 'device' }));
    const code = jsQR(new Uint8ClampedArray(png.data), png.width, png.height);
    urls.push(code ? code.data : null);
  }
  ok(urls.length === qrCount && urls.every((u) => u && u.startsWith('https://albertolopezcalatayud-png.github.io/lectorix/#/escucha/es/')), `every QR decodes to a listening link on the web (${urls.filter(Boolean).length}/${urls.length})`);
  await book.close();

  // 3. The QR links open on a phone that never used Lectorix: no welcome screens
  const local = (u) => u.replace('https://albertolopezcalatayud-png.github.io/lectorix/', BASE);
  const dictUrl = urls.find((u) => /\/d\//.test(u)); const readUrl = urls.find((u) => /\/r\//.test(u)); const sylUrl = urls.find((u) => /\/s\//.test(u));
  let q = await fresh();
  await q.goto(local(dictUrl)); await q.waitForTimeout(1500);
  ok((await q.getByRole('button', { name: /Soy docente|Para mí/ }).count()) === 0, 'a QR link skips the first screens');
  const n = await q.getByRole('button', { name: /^Escuchar el \d/ }).count();
  ok(n === 5, `the dictation shows its five items (${n})`);
  await q.getByRole('button', { name: 'Escuchar el 1' }).click(); await q.waitForTimeout(400);
  const said = await q.evaluate(() => window.__said.slice());
  ok(said.length === 1 && said[0].length > 1, `tapping 1 says the first dictation (${said[0]})`);
  await q.goto(local(readUrl)); await q.reload(); await q.waitForTimeout(1500);
  await q.getByRole('button', { name: /Escuchar la lectura/ }).click(); await q.waitForTimeout(400);
  ok((await q.evaluate(() => window.__said.slice(-1)[0] || '')).length > 40, 'the reading QR reads the text');
  await q.goto(local(sylUrl)); await q.reload(); await q.waitForTimeout(1500);
  const syl = await q.locator('.grid-cols-5 button').allInnerTexts();
  ok(syl.length === 10, `the syllables QR shows two families (${syl.join(' ')})`);
  await q.context().close();

  // 4. Homework: the strips, then a fresh phone does it and gets the same stamp as the teacher's sheet
  await p.goto(BASE + '#/aula'); await p.waitForTimeout(1000);
  await p.getByRole('combobox', { name: 'Actividad' }).selectOption('mir-find'); await p.waitForTimeout(200);
  const expected = (await p.getByTestId('expected-stamp').innerText()).trim();
  const [strips] = await Promise.all([p.waitForEvent('popup'), p.getByRole('button', { name: /Imprimir tiras/ }).click()]);
  await strips.waitForLoadState(); const sh = await strips.content();
  ok((sh.match(/class="strip"/g) || []).length === 8 && sh.includes(expected), `8 strips per sheet and the teacher's page shows ${expected}`);
  await strips.setViewportSize({ width: 900, height: 1200 });
  const png = PNG.sync.read(await strips.locator('.strip svg').first().screenshot({ scale: 'device' }));
  const deberUrl = jsQR(new Uint8ClampedArray(png.data), png.width, png.height)?.data;
  ok(deberUrl === 'https://albertolopezcalatayud-png.github.io/lectorix/#/deber/es.mir-find', `the strip QR opens the homework (${deberUrl})`);
  await strips.close();
  q = await fresh();
  await q.goto(local(deberUrl)); await q.waitForTimeout(1500);
  ok((await q.getByText('Deber de la semana').count()) > 0, 'the homework opens straight away on a fresh phone');
  for (let r = 0; r < 5; r++) {
    const title = await q.locator('h2').innerText(); const target = /«(.)»/.exec(title)[1];
    const cells = q.locator('[data-testid=mi-grid] button');
    const letters = await cells.evaluateAll((els) => els.map((e) => e.dataset.letter));
    for (let i = 0; i < letters.length; i++) if (letters[i] === target) await cells.nth(i).click();
    await q.waitForTimeout(900);
  }
  const stamp = (await q.getByTestId('stamp').innerText()).trim();
  ok(stamp === expected, `the child sees the same stamp as the teacher (${stamp})`);
  await q.context().close();

  // 5. Valencian homework on a fresh phone: the screen is in Valencian
  q = await fresh();
  await q.goto(BASE + '#/deber/ca.trc.l-o'); await q.waitForTimeout(1500);
  ok((await q.getByText('Deure de la setmana').count()) > 0 && (await q.getByText('Traça: o').count()) > 0, 'a Valencian homework speaks Valencian');
  await q.goto(BASE + '#/deber/xx.nope'); await q.reload(); await q.waitForTimeout(1200);
  ok((await q.getByText(/no és vàlid|no es válido/).count()) > 0, 'a wrong code says so');
  await q.context().close();

  ok(errs.length === 0, 'no page errors ' + errs.join(' | '));
  await b.close();
})();
