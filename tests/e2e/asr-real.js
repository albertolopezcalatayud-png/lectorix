// Real end-to-end check of Lectorix's own recogniser (runs in GitHub Actions, see asr.yml):
// Chromium's microphone is fed with a WAV file, the app downloads the model, listens and marks the words.
//   node asr-real.js <wav> <readingId> <minRead> <maxRead>
const { chromium } = require('playwright');
const [wav, id, minRead, maxRead] = process.argv.slice(2);
(async () => {
  const b = await chromium.launch({ args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', `--use-file-for-fake-audio-capture=${wav}%noloop`, '--autoplay-policy=no-user-gesture-required'] });
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, permissions: ['microphone'] });
  const p = await ctx.newPage(); const errors = [];
  p.on('pageerror', (e) => errors.push(e.message));
  await p.goto('http://localhost:4173/lectorix/');
  await p.evaluate(() => { localStorage.clear(); localStorage.setItem('lectorix-store', JSON.stringify({ state: { onboardingDone: true, language: 'es', practiceLanguage: 'auto', progress: [], sessionHistory: [] }, version: 0 })); localStorage.setItem('lectorix-readaloud', JSON.stringify({ state: { enabled: true }, version: 0 })); });
  await p.goto(`http://localhost:4173/lectorix/#/leer-en-voz-alta/${id}`); await p.reload(); await p.waitForTimeout(2500);
  const dl = p.getByRole('button', { name: 'Descargar el idioma' });
  if (await dl.count()) { const t0 = Date.now(); await dl.click(); await p.getByRole('button', { name: /Empezar a leer/ }).waitFor({ timeout: 240000 }); console.log('model downloaded and loaded in', Math.round((Date.now() - t0) / 1000), 's'); }
  await p.getByRole('button', { name: /Empezar a leer/ }).click();
  await p.waitForTimeout(Number(process.env.LISTEN_MS || 25000));
  await p.getByRole('button', { name: /He terminado/ }).click(); await p.waitForTimeout(800);
  const body = await p.innerText('body');
  const m = body.match(/Ha reconocido (\d+) de (\d+) palabras/);
  const read = m ? +m[1] : -1;
  const ok = read >= +minRead && read <= +maxRead && errors.length === 0;
  console.log((ok ? 'PASS ' : 'FAIL ') + `${wav.split('/').pop()}: recognised ${read} of ${m ? m[2] : '?'} (expected ${minRead}–${maxRead})`, errors);
  await b.close(); process.exit(ok ? 0 : 1);
})();
