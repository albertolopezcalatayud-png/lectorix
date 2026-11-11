const { chromium } = require('playwright');
const BASE = 'http://localhost:4173/lectorix/';
(async () => {
  const b = await chromium.launch();
  const errors = [];
  const check = (c, m) => { console.log(c ? 'PASS' : 'FAIL', m); if (!c) errors.push(m); };
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
  await ctx.addInitScript(() => {
    // Fake on-device recognizer that "hears" the gato text with one word skipped
    class Fake {
      constructor() { this.processLocally = false; }
      start() {
        if (!this.processLocally) throw new Error('must be local');
        const said = 'Tom es un gato gris vive en una casa con jardín por la mañana tom toma leche por la tarde juega con una bola de lana por la noche duerme en su cama tom es un feliz';
        const words = said.split(' ');
        let i = 0;
        const tick = () => {
          i = Math.min(words.length, i + 4);
          const res = [Object.assign([{ transcript: words.slice(0, i).join(' ') }], { isFinal: false })];
          this.onresult && this.onresult({ results: res, resultIndex: 0 });
          if (i < words.length) setTimeout(tick, 120);
        };
        setTimeout(tick, 200);
      }
      stop() {} abort() {}
    }
    Fake.available = async () => 'available';
    window.SpeechRecognition = Fake;
  });
  const p = await ctx.newPage();
  p.on('pageerror', (e) => errors.push(`pageerror ${e.message}`));
  await p.goto(BASE);
  await p.evaluate(() => { localStorage.clear(); localStorage.setItem('lectorix-store', JSON.stringify({ state: { onboardingDone: true, language: 'es', practiceLanguage: 'auto', progress: [], sessionHistory: [] }, version: 0 })); localStorage.setItem('lectorix-ra-probe', JSON.stringify({ langs: { 'es-ES': 'available' } })); localStorage.setItem('lectorix-readaloud', JSON.stringify({ state: { enabled: true }, version: 0 })); });
  await p.goto(BASE + '#/leer-en-voz-alta/lectura_l1_gato'); await p.reload(); await p.waitForTimeout(900);
  await p.getByText('Empezar a leer').click();
  await p.waitForTimeout(1200);
  await p.screenshot({ path: __dirname + '/ra-live.png' });
  await p.waitForTimeout(1500);
  const body = await p.innerText('body');
  if (/He terminado/.test(body)) await p.getByText('He terminado').click();
  await p.waitForTimeout(400);
  const b2 = await p.innerText('body');
  await p.screenshot({ path: __dirname + '/ra-done.png', fullPage: true });
  console.log(b2.split('\n').filter((l) => /reconocido|🔊/.test(l)).join(' | '));
  check(/Ha reconocido (3[0-9]|4[0-9]) de \d+ palabras/.test(b2), 'result counts words');
  check(/🔊 gato/.test(b2), 'skipped word "gato" proposed');
  await b.close();
  console.log('ERRORS', errors.length, errors.slice(0, 10));
})();
