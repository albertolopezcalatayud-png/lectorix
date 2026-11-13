// Testers: "the voices sound robotic". Lectorix must pick the most natural voice the device has
// (neural / online / Google before old desktop voices) and let the family choose another one.
const { chromium } = require('playwright');
const VOICES = [
  { lang: 'es-ES', name: 'Microsoft Helena - Spanish (Spain)', localService: true },
  { lang: 'es-ES', name: 'Google español', localService: false },
  { lang: 'es-ES', name: 'Microsoft Elvira Online (Natural) - Spanish (Spain)', localService: false },
  { lang: 'es-ES', name: 'eSpeak Spanish', localService: true },
  { lang: 'ca-ES', name: 'Microsoft Herena - Catalan (Spain)', localService: true },
  { lang: 'ca-ES', name: 'Microsoft Joana Online (Natural) - Catalan (Spain)', localService: false },
];
const fake = `(() => {
  const voices = ${JSON.stringify(VOICES)}.map((v) => ({ ...v, voiceURI: v.name, default: false }));
  window.__spoken = [];
  const ss = window.speechSynthesis;
  ss.getVoices = () => voices;
  Object.defineProperty(SpeechSynthesisUtterance.prototype, 'voice', { configurable: true, get() { return this.__v || null; }, set(v) { this.__v = v; } });
  ss.speak = (u) => { window.__spoken.push({ voice: u.voice ? u.voice.name : null, rate: u.rate }); setTimeout(() => u.onend && u.onend(), 20); };
  ss.cancel = () => {};
})()`;
(async () => {
  const b = await chromium.launch(); let fails = 0; const errors = [];
  const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 } }); await ctx.addInitScript(fake);
  const p = await ctx.newPage(); p.on('pageerror', (e) => errors.push(e.message));
  await p.goto('http://localhost:4173/lectorix/');
  await p.evaluate(() => { localStorage.clear(); localStorage.setItem('lectorix-store', JSON.stringify({ state: { onboardingDone: true, language: 'es', practiceLanguage: 'auto', progress: [], sessionHistory: [] }, version: 0 })); });
  await p.goto('http://localhost:4173/lectorix/#/enunciados'); await p.reload(); await p.waitForTimeout(1500);
  await p.locator('button[aria-expanded]').first().click(); await p.waitForTimeout(300);
  await p.getByText(/Escuchar/).first().click(); await p.waitForTimeout(500);
  let sp = await p.evaluate(() => window.__spoken.slice(-1)[0]);
  ok(sp && /Elvira Online \(Natural\)/.test(sp.voice), `the natural voice is chosen by default (${sp && sp.voice})`);
  ok(sp && sp.rate >= 0.72, `rate is never robotically slow (${sp && sp.rate})`);
  // a word read slowly is not slower than the natural minimum
  await p.evaluate(() => { window.__spoken = []; });
  await p.goto('http://localhost:4173/lectorix/#/voces'); await p.waitForTimeout(1500);
  const body = await p.innerText('body');
  ok(/Elige la voz en Castellano/i.test(body) && /Recomendada/.test(body), 'voices page lists the Spanish voices with the recommended one');
  ok(!/eSpeak[\s\S]*Recomendada/.test(body.split('Elige la voz en Valenciano')[0] || ''), 'the robotic eSpeak voice is not the recommended one');
  // choose Helena
  const row = p.locator('li', { hasText: 'Helena' });
  await row.getByRole('button', { name: 'Usar' }).click(); await p.waitForTimeout(300);
  await p.goto('http://localhost:4173/lectorix/#/enunciados'); await p.waitForTimeout(1200);
  await p.locator('button[aria-expanded]').first().click(); await p.waitForTimeout(300);
  await p.getByText(/Escuchar/).first().click(); await p.waitForTimeout(500);
  sp = await p.evaluate(() => window.__spoken.slice(-1)[0]);
  ok(sp && /Helena/.test(sp.voice), `the family's choice is used (${sp && sp.voice})`);
  // Valencian practice uses the natural Catalan voice
  await p.evaluate(() => { const s = JSON.parse(localStorage.getItem('lectorix-store')); s.state.language = 'ca'; localStorage.setItem('lectorix-store', JSON.stringify(s)); });
  await p.reload(); await p.waitForTimeout(1500);
  await p.locator('button[aria-expanded]').first().click(); await p.waitForTimeout(300);
  await p.getByText(/Escolta/).first().click(); await p.waitForTimeout(500);
  sp = await p.evaluate(() => window.__spoken.slice(-1)[0]);
  ok(sp && /Joana Online/.test(sp.voice), `Valencian uses the natural Catalan voice (${sp && sp.voice})`);
  console.log('ERRORS', fails, errors); await b.close();
})();
