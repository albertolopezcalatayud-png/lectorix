// Natural-voice clips: when the app has a clip for the exact text, it plays it (not the device voice),
// highlights words with the clip's timings, and falls back to the device voice for texts without a clip.
// Needs test clips in dist/audio (see scripts/audio; the test run creates tone clips for one reading).
const { chromium } = require('playwright');
const BASE = 'http://localhost:4173/lectorix/';
(async () => {
  const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] }); let fails = 0; const errors = [];
  const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
  await ctx.addInitScript(() => {
    window.__device = [];
    const voices = [{ lang: 'es-ES', name: 'Fake es', localService: true, voiceURI: 'Fake es', default: true }];
    speechSynthesis.getVoices = () => voices;
    Object.defineProperty(SpeechSynthesisUtterance.prototype, 'voice', { configurable: true, get() { return this.__v || null; }, set(v) { this.__v = v; } });
    speechSynthesis.speak = (u) => { window.__device.push(u.text); setTimeout(() => u.onend && u.onend(), 30); };
    speechSynthesis.cancel = () => {};
    window.__clips = []; const orig = window.Audio;
    window.Audio = function (src) { const a = new orig(src); window.__clips.push(src); return a; };
  });
  const p = await ctx.newPage(); p.on('pageerror', (e) => errors.push(e.message));
  await p.goto(BASE);
  await p.evaluate(() => { localStorage.clear(); localStorage.setItem('lectorix-store', JSON.stringify({ state: { onboardingDone: true, language: 'es', practiceLanguage: 'auto', progress: [], sessionHistory: [] }, version: 0 })); });
  await p.goto(BASE + '#/lectura/lectura_l1_gato'); await p.reload(); await p.waitForTimeout(1500);
  await p.getByRole('button', { name: /Escuchar|Leer en voz alta|▶/ }).first().click();
  const seen = new Set();
  for (let i = 0; i < 12; i++) { await p.waitForTimeout(180); const w = await p.evaluate(() => document.querySelector('.bg-yellow')?.textContent || ''); if (w) seen.add(w); }
  ok(seen.size >= 3, `words are highlighted as the clip plays (${[...seen].slice(0, 5).join(' ')})`);
  const st = await p.evaluate(() => ({ clips: window.__clips.length, device: window.__device.slice() }));
  ok(st.clips >= 1, `guided reading plays natural-voice clips (${st.clips})`);
  ok(st.device.length === 0, `device voice not used for texts with a clip (${JSON.stringify(st.device.slice(0, 2))})`);
  // stop and tap a word: also a clip
  await p.getByRole('button', { name: /Pausa|Parar|⏸|■/ }).first().click().catch(() => {});
  await p.waitForTimeout(300);
  const before = await p.evaluate(() => window.__clips.length);
  await p.getByText('jardín', { exact: false }).first().click(); await p.waitForTimeout(800);
  ok((await p.evaluate(() => window.__clips.length)) > before, 'tapping a word plays its clip');
  // a text without a clip: device voice
  await p.goto(BASE + '#/lectura/lectura_l1_playa'); await p.waitForTimeout(1500);
  await p.evaluate(() => { window.__device = []; });
  await p.getByRole('button', { name: /Escuchar|Leer en voz alta|▶/ }).first().click(); await p.waitForTimeout(1500);
  ok((await p.evaluate(() => window.__device.length)) > 0, 'texts without a clip use the device voice');
  // turned off in Voces: device voice even with a clip
  await p.evaluate(() => localStorage.setItem('lectorix-natural-voice', 'off'));
  await p.goto(BASE + '#/lectura/lectura_l1_gato'); await p.reload(); await p.waitForTimeout(1500);
  await p.evaluate(() => { window.__device = []; window.__clips = []; });
  await p.getByRole('button', { name: /Escuchar|Leer en voz alta|▶/ }).first().click(); await p.waitForTimeout(1200);
  const off = await p.evaluate(() => ({ clips: window.__clips.length, device: window.__device.length }));
  ok(off.clips === 0 && off.device > 0, `natural voices can be turned off (${JSON.stringify(off)})`);
  console.log('ERRORS', fails, errors); await b.close();
})();
