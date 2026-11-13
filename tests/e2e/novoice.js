// Practising in Valencian on a device with only a Spanish voice: Lectorix must not read Valencian
// with the Spanish voice; it stays silent and shows how to install the voice. With a Catalan voice it speaks with it.
const { chromium, devices } = require('playwright');
const fake = (langs) => `(() => {
  const voices = ${JSON.stringify(langs)}.map((l) => ({ lang: l, name: 'Fake ' + l, localService: true, default: false, voiceURI: l }));
  window.__spoken = [];
  const ss = window.speechSynthesis;
  ss.getVoices = () => voices;
  ss.speak = (u) => { window.__spoken.push({ lang: u.voice ? u.voice.lang : null, text: u.text }); setTimeout(() => u.onend && u.onend(), 30); };
  ss.cancel = () => {};
  Object.defineProperty(SpeechSynthesisUtterance.prototype, 'voice', { configurable: true, get() { return this.__v || null; }, set(v) { this.__v = v; } });
})()`;
(async () => {
  const b = await chromium.launch(); const errors = []; let fails = 0;
  const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
  for (const [langs, expectSpeak] of [[['es-ES', 'en-GB'], false], [['es-ES', 'ca-ES'], true]]) {
    const ctx = await b.newContext({ ...devices['Pixel 7'] });
    await ctx.addInitScript(fake(langs));
    const p = await ctx.newPage(); p.on('pageerror', (e) => errors.push(e.message));
    await p.goto('http://localhost:4173/lectorix/');
    await p.evaluate(() => { localStorage.clear(); localStorage.setItem('lectorix-store', JSON.stringify({ state: { onboardingDone: true, language: 'ca', practiceLanguage: 'auto', progress: [], sessionHistory: [] }, version: 0 })); });
    await p.goto('http://localhost:4173/lectorix/#/enunciados'); await p.reload(); await p.waitForTimeout(2000);
    await p.locator('button[aria-expanded]').first().click(); await p.waitForTimeout(300);
    await p.getByText(/Escolta/).first().click(); await p.waitForTimeout(800);
    const spoken = await p.evaluate(() => window.__spoken);
    const body = await p.innerText('body');
    if (expectSpeak) {
      ok(spoken.length === 1 && spoken[0].lang === 'ca-ES', `with a Catalan voice it reads with it (${JSON.stringify(spoken.map((s) => s.lang))})`);
      ok(!/no té veu en valencià/.test(body), 'no notice when the voice exists');
    } else {
      ok(spoken.length === 0, `without a Catalan voice it does not read with the Spanish voice (${spoken.length} utterances)`);
      ok(/no té veu en valencià/.test(body), 'notice shown in Valencian');
      await p.getByRole('button', { name: /Instal·lar-la/ }).click(); await p.waitForTimeout(1200);
      ok(/voces/.test(p.url()), 'notice button opens the voices page');
      await p.goBack(); await p.waitForTimeout(1000);
      if (!(await p.getByText(/Escolta/).count())) { await p.locator('button[aria-expanded]').first().click(); await p.waitForTimeout(300); }
      await p.getByText(/Escolta/).first().click(); await p.waitForTimeout(800);
      ok(!/no té veu en valencià/.test(await p.innerText('body')), 'notice only once per session');
    }
    await ctx.close();
  }
  console.log('ERRORS', fails, errors); await b.close();
})();
