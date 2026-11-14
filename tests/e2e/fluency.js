// Tester: "In the fluency test I can make up any words and it says they are right".
// With the microphone check on, only words the device hears count; without it, an adult must listen,
// and impossible speeds are rejected.
const { chromium } = require('playwright');
const BASE = 'http://localhost:4173/lectorix/';
const fakeRec = () => {
  class Fake {
    constructor() { this.processLocally = false; }
    start() {
      if (!this.processLocally) throw new Error('must be local');
      let i = 0;
      const tick = () => {
        if (!window.__script) { setTimeout(tick, 100); return; }   // waits until the test says what is "heard"
        const words = window.__script.split(' ').filter(Boolean);
        i = Math.min(words.length, i + 3);
        const res = [Object.assign([{ transcript: words.slice(0, i).join(' ') }], { isFinal: false })];
        this.onresult && this.onresult({ results: res, resultIndex: 0 });
        if (i < words.length) setTimeout(tick, 100);
      };
      setTimeout(tick, 150);
    }
    stop() {} abort() {}
  }
  Fake.available = async () => 'available';
  window.SpeechRecognition = Fake;
};
(async () => {
  const b = await chromium.launch(); let fails = 0; const errors = [];
  const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
  const seed = (mic) => (m) => { localStorage.clear(); localStorage.setItem('lectorix-store', JSON.stringify({ state: { onboardingDone: true, language: 'es', practiceLanguage: 'auto', progress: [], sessionHistory: [] }, version: 0 }));
    if (m) { localStorage.setItem('lectorix-ra-probe', JSON.stringify({ langs: { 'es-ES': 'available' } })); localStorage.setItem('lectorix-readaloud', JSON.stringify({ state: { enabled: true }, version: 0 })); } };
  const open = async (mic) => {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 } }); if (mic) await ctx.addInitScript(fakeRec);
    const p = await ctx.newPage(); p.on('pageerror', (e) => errors.push(e.message));
    await p.goto(BASE); await p.evaluate(seed(mic), mic);
    await p.goto(BASE + '#/fluidez'); await p.reload(); await p.waitForTimeout(1200);
    await p.getByRole('button', { name: 'Preparar el texto' }).click(); await p.waitForTimeout(600);
    return p;
  };
  const textWords = (p) => p.evaluate(() => [...document.querySelectorAll('.reading-text > span > span')].map((s) => s.textContent.trim()));
  const saved = (p) => p.evaluate(() => { try { return JSON.parse(localStorage.getItem('lectorix-fluency') || '{"state":{"results":[]}}').state.results.length; } catch { return -1; } });

  // 1. Without microphone: the adult must listen; finishing the whole text in a few seconds is rejected
  {
    const p = await open(false);
    ok(/un adulto tiene que escuchar/.test(await p.innerText('body')), 'without microphone it says an adult must listen');
    await p.getByRole('button', { name: /Empezar/ }).click(); await p.waitForTimeout(1500);
    await p.getByRole('button', { name: 'He terminado el texto' }).click(); await p.waitForTimeout(500);
    ok(/el adulto que ha escuchado marca/.test(await p.innerText('body')), 'mark step explains the adult marks');
    await p.getByRole('button', { name: /Lo ha escuchado un adulto/ }).click(); await p.waitForTimeout(500);
    ok(/demasiado rápido/.test(await p.innerText('body')), 'whole text "read" in 5 s is rejected as too fast');
    ok((await saved(p)) === 0, 'impossible result not saved');
    await p.context().close();
  }
  // 2. Microphone: made-up words count for nothing
  {
    const p = await open(true);
    ok(/El dispositivo escuchará la lectura/.test(await p.innerText('body')), 'microphone mode announced');
    await p.evaluate(() => { window.__script = 'patata zumbido farola tijera bombilla cocodrilo nube trompeta'; });
    await p.getByRole('button', { name: /Empezar/ }).click(); await p.waitForTimeout(2500);
    await p.getByRole('button', { name: 'He terminado el texto' }).click(); await p.waitForTimeout(500);
    ok(/No se ha oído ninguna palabra del texto/.test(await p.innerText('body')), 'made-up words: nothing counted');
    ok(!(await p.getByRole('button', { name: 'Ver el resultado' }).count()), 'no result can be saved');
    await p.context().close();
  }
  // 3. Microphone: the first 12 words read for real, then made-up words
  {
    const p = await open(true);
    await p.getByRole('button', { name: /Empezar/ }).click(); await p.waitForTimeout(300);
    const w = await textWords(p);
    await p.evaluate((s) => { window.__script = s; }, w.slice(0, 12).join(' ') + ' blablá tururú pimpampum');
    await p.waitForTimeout(1500);
    const green = await p.evaluate(() => document.querySelectorAll('.reading-text .bg-mint\\/30').length);
    ok(green >= 10, `words turn green while they are heard (${green})`);
    await p.waitForTimeout(3500);
    await p.getByRole('button', { name: 'He terminado el texto' }).click(); await p.waitForTimeout(500);
    const last = await p.evaluate(() => [...document.querySelectorAll('.reading-text > span > span')].findIndex((s) => s.className.includes('ring-2')));
    ok(last === 11, `last word is the last one heard (index ${last})`);
    // try to claim more words by tapping further on
    await p.locator('.reading-text > span > span').nth(30).click(); await p.waitForTimeout(200);
    const last2 = await p.evaluate(() => [...document.querySelectorAll('.reading-text > span > span')].findIndex((s) => s.className.includes('ring-2')));
    ok(last2 === 11, 'cannot claim words the device did not hear');
    ok(/Lo ha comprobado el micrófono/.test(await p.innerText('body')), 'says the microphone checked it');
    await p.getByRole('button', { name: 'Ver el resultado' }).click(); await p.waitForTimeout(800);
    const r = await p.evaluate(() => JSON.parse(localStorage.getItem('lectorix-fluency')).state.results.slice(-1)[0]);
    ok(r && r.wordsRead === 12 && r.errors === 0, `saved 12 words read, 0 errors (${r && r.wordsRead}, ${r && r.errors})`);
    await p.context().close();
  }
  console.log('ERRORS', fails, errors); await b.close();
})();
