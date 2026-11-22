// Letters and syllables (#/silabas): the letters, their syllables, the link to tracing and the listening game.
// The voice is stubbed: every text the app says is recorded, so the test knows which syllable to tap.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 390, height: 800 } });
  const errs = [];
  p.on('pageerror', (e) => errs.push(e.message));
  const ok = (c, m) => console.log((c ? 'PASS ' : 'FAIL ') + m);
  await p.addInitScript(() => {
    window.__said = [];
    const real = window.speechSynthesis;
    const fake = { speak: (u) => { window.__said.push(u.text); setTimeout(() => u.onend && u.onend(), 30); }, cancel: () => {}, getVoices: () => real.getVoices(), pause() {}, resume() {}, speaking: false, pending: false, addEventListener() {}, removeEventListener() {}, onvoiceschanged: null };
    Object.defineProperty(window, 'speechSynthesis', { value: fake });
  });
  const setLang = (language) => p.evaluate((l) => { localStorage.setItem('lectorix-mode', 'solo'); localStorage.setItem('lectorix-store', JSON.stringify({ state: { onboardingDone: true, language: l, practiceLanguage: 'auto', schoolStage: 'p12', progress: [], sessionHistory: [] }, version: 0 })); }, language);
  const said = () => p.evaluate(() => window.__said.slice());
  await p.goto('http://localhost:4173/lectorix/'); await setLang('es'); await p.reload(); await p.waitForTimeout(1500);
  ok((await p.getByText('Letras y sílabas').count()) > 0, 'dashboard shows Letters and syllables for 1.º-2.º');
  await p.getByText('Letras y sílabas').first().click(); await p.waitForTimeout(1000);
  ok(/#\/silabas$/.test(p.url()), 'the card opens #/silabas');
  ok((await p.getByRole('button', { name: /^m: mano/ }).count()) === 1 && (await p.getByRole('button', { name: /^ll: llave/ }).count()) === 1, 'Spanish families: m (mano), ll (llave)');
  await p.getByRole('button', { name: /^c: casa/ }).click(); await p.waitForTimeout(500);
  const sylls = await p.locator('.grid-cols-5 button').allInnerTexts();
  ok(sylls.join(' ') === 'ca que qui co cu', `c keeps its spelling: ${sylls.join(' ')}`);
  await p.locator('.grid-cols-5 button').nth(1).click(); await p.waitForTimeout(300);
  ok((await said()).includes('que'), 'tapping a syllable says it');
  await p.getByRole('button', { name: /Todas seguidas/ }).click(); await p.waitForTimeout(1200);
  const s = (await said()).join(' ');
  ok(/ca que qui co cu$/.test(s), `▶ says the five in order (${s.slice(-30)})`);
  await p.getByRole('button', { name: /Trázala/ }).click(); await p.waitForTimeout(900);
  ok(/#\/trazo$/.test(p.url()) && (await p.locator('h2').innerText()) === 'c', 'Trace it opens the tracing of that letter');

  // The game: 10 rounds; tap what was said
  await p.goto('http://localhost:4173/lectorix/#/silabas'); await p.waitForTimeout(800);
  await p.getByRole('tab', { name: 'Escucha' }).click();
  await p.getByRole('button', { name: 'Empezar' }).click();
  let rounds = 0;
  for (let i = 0; i < 10; i++) {
    await p.waitForTimeout(250);
    const last = (await said()).slice(-1)[0];
    const opts = await p.locator('[data-testid=sy-options] button').allInnerTexts();
    if (opts.length !== 4 || !opts.includes(last)) { console.log('round', i, last, opts); break; }
    // first round answered wrong on purpose
    await p.locator('.grid-cols-2 button', { hasText: new RegExp(`^${i === 0 ? opts.find((o) => o !== last) : last}$`) }).click();
    if (i === 0) { await p.waitForTimeout(300); ok(/^Era «/.test(await p.locator('[aria-live=polite]').last().innerText()), 'a wrong answer shows the right one'); await p.waitForTimeout(1700); }
    else await p.waitForTimeout(1000);
    rounds++;
  }
  ok(rounds === 10, `10 rounds, each with 4 options and the said syllable among them (${rounds})`);
  ok(/9 de 10 bien/.test(await p.locator('body').innerText()), 'the score counts 9 of 10');

  // English: words and their first letter
  await setLang('en'); await p.goto('http://localhost:4173/lectorix/#/silabas'); await p.reload(); await p.waitForTimeout(1200);
  ok((await p.getByRole('button', { name: /^d: dog/ }).count()) === 1 && (await p.locator('.grid-cols-5').count()) === 0, 'English: letters with their word, no syllables');
  await p.getByRole('tab', { name: 'Listen' }).click(); await p.getByRole('button', { name: 'Start' }).click(); await p.waitForTimeout(400);
  const w = (await said()).slice(-1)[0]; const opts = await p.locator('[data-testid=sy-options] button').allInnerTexts();
  ok(opts.length === 4 && opts.includes(w[0]), `English game: hear «${w}», tap its first letter among ${opts.join(' ')}`);

  // Mirror letters b d p q: find every one in the grid (one wrong tap on purpose), 5 rounds
  await setLang('es'); await p.goto('http://localhost:4173/lectorix/#/silabas'); await p.reload(); await p.waitForTimeout(1200);
  await p.getByRole('tab', { name: 'b d p q' }).click(); await p.waitForTimeout(300);
  for (let r = 0; r < 5; r++) {
    const title = await p.locator('h2').innerText(); const target = /«(.)»/.exec(title)[1];
    const cells = p.locator('[data-testid=mi-grid] button');
    const letters = await cells.evaluateAll((els) => els.map((e) => e.dataset.letter));
    if (r === 0) { await cells.nth(letters.findIndex((l) => l !== target)).click(); await p.waitForTimeout(200); }
    for (let i = 0; i < letters.length; i++) if (letters[i] === target) await cells.nth(i).click();
    await p.waitForTimeout(900);
  }
  ok(/Terminado, con 1 fallo\./.test(await p.locator('body').innerText()), 'find: five grids, one mistake counted (singular)');
  await p.getByRole('radio', { name: '¿Cuál falta?' }).click(); await p.waitForTimeout(500);
  for (let r = 0; r < 8; r++) {
    const word = (await said()).slice(-1)[0];
    await p.locator('[data-testid=mi-options] button', { hasText: new RegExp(`^${word[0]}$`) }).click(); await p.waitForTimeout(1300);
  }
  ok(/Perfecto, sin fallos/.test(await p.locator('body').innerText()), 'missing letter: eight words, the first letter heard and chosen');

  // Build the word: hear it, tap its pieces in order (graphemes in English, syllables in Spanish)
  const build = async (rounds, wrongFirst) => {
    for (let r = 0; r < rounds; r++) {
      await p.waitForTimeout(300);
      let rest = (await said()).slice(-1)[0];
      const slots = await p.locator('[data-testid=bw-slots] span').count();
      for (let k = 0; k < slots; k++) {
        const tiles = p.locator('[data-testid=bw-tiles] button:not([disabled])');
        const texts = await tiles.allInnerTexts();
        const best = texts.filter((x) => rest.startsWith(x)).sort((x, y) => y.length - x.length)[0];
        if (wrongFirst && r === 0 && k === 0) { await tiles.nth(texts.findIndex((x) => !rest.startsWith(x))).click(); await p.waitForTimeout(700); }
        await tiles.nth(texts.indexOf(best)).click(); rest = rest.slice(best.length);
      }
      await p.waitForTimeout(1700);
    }
  };
  await p.goto('http://localhost:4173/lectorix/#/silabas'); await p.waitForTimeout(800);
  await p.getByRole('tab', { name: 'Forma' }).click(); await p.waitForTimeout(400);
  const firstSlots = await p.locator('[data-testid=bw-slots] span').count();
  ok(firstSlots >= 2 && firstSlots <= 4, `Spanish build: syllable slots (${firstSlots})`);
  await build(8, true);
  ok(/Terminado, con 1 fallo/.test(await p.locator('body').innerText()), 'Spanish build: eight words, the wrong tile counted once');
  await setLang('en'); await p.goto('http://localhost:4173/lectorix/#/silabas'); await p.reload(); await p.waitForTimeout(1200);
  await p.getByRole('tab', { name: 'Build' }).click(); await p.waitForTimeout(400);
  const seen = [];
  for (let r = 0; r < 8; r++) {
    await p.waitForTimeout(300); seen.push((await p.locator('[data-testid=bw-tiles] button').allInnerTexts()).join(','));
    await build(1, false);
  }
  ok(/Perfect, no mistakes/.test(await p.locator('body').innerText()), 'English build: eight words built from their graphemes');
  ok(seen.slice(4).some((t) => /\b(sh|ch|th|ck|ng|ee|ai|oa|igh|oo|ar|or|ow|oi|air|qu|ll)\b/.test(t)), 'English: the last four words have digraph tiles');

  // Valencian: ça ce ci ço çu and ny
  await setLang('ca'); await p.goto('http://localhost:4173/lectorix/#/silabas'); await p.reload(); await p.waitForTimeout(1200);
  await p.getByRole('button', { name: /^ç: braç/ }).click(); await p.waitForTimeout(300);
  ok((await p.locator('.grid-cols-5 button').allInnerTexts()).join(' ') === 'ça ce ci ço çu', 'Valencian ç: ça ce ci ço çu');
  ok(errs.length === 0, 'no page errors ' + errs.join(' | '));
  await b.close();
})();
