// Real end-to-end check of the fluency test with Lectorix's own recogniser (runs in GitHub Actions, asr.yml).
// 1) opens the test to see which text it gives, 2) synthesises that text (correct, and with close words
// swapped in), 3) feeds it to Chromium's microphone and checks: the checker gets ready by itself, the
// words are checked, swapped words are doubtful and count as errors, and every word can be listened back.
//   LANG_UNDER_TEST=es|ca|en node fluency-real.js <piper-model.onnx>
const { chromium } = require('playwright');
const { execFileSync } = require('child_process');
const fs = require('fs');
const voice = process.argv[2];
const BASE = 'http://localhost:4173/lectorix/';
const LANG = process.env.LANG_UNDER_TEST || 'es';
const L = {
  es: { prepare: 'Preparar el texto', adult: /Prefiero que lo corrija un adulto/, start: /Empezar/, startRe: 'Empezar', finished: 'He terminado el texto', listen: /^🔊 Escuchar$/, micOn: /El dispositivo escuchará la lectura/ },
  ca: { prepare: 'Preparar el text', adult: /Preferisc que ho corregisca un adult/, start: /Començar/, startRe: 'Començar', finished: 'He acabat el text', listen: /^🔊 Escoltar$/, micOn: /El dispositiu escoltarà la lectura/ },
  en: { prepare: 'Get the text ready', adult: /I would rather an adult listens/, start: /^▶ Start$/, startRe: 'Start', finished: 'I have finished the text', listen: /^🔊 Listen$/, micOn: /The device will listen to the reading/ },
}[LANG];
const seed = (LANG_SEED) => {
  localStorage.clear();
  localStorage.setItem('lectorix-mode', 'solo');
  localStorage.setItem('lectorix-store', JSON.stringify({ state: { onboardingDone: true, language: LANG_SEED, practiceLanguage: 'auto', progress: [], sessionHistory: [], user: { id: 'u', display_name: 'Ana', total_xp: 0, streak_days: 0 } }, version: 0 }));
};
const fixRandom = () => { Math.random = () => 0.01; };
let fails = 0;
const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };

async function shownText() {
  const b = await chromium.launch(); const ctx = await b.newContext(); await ctx.addInitScript(fixRandom);
  const p = await ctx.newPage(); await p.goto(BASE); await p.evaluate(seed, LANG);
  await p.goto(BASE + '#/fluidez'); await p.reload(); await p.waitForTimeout(1500);
  await p.getByRole('button', { name: L.prepare }).click(); await p.waitForTimeout(800);
  // the text is shown once the test starts: start it in adult mode just to read it
  await p.getByRole('button', { name: L.adult }).click(); await p.waitForTimeout(300);
  await p.getByRole('button', { name: L.start }).click(); await p.waitForTimeout(800);
  const words = await p.evaluate(() => [...document.querySelectorAll('.reading-text > span > span')].map((s) => s.textContent.trim()));
  await b.close();
  if (!words.length) throw new Error('no text shown');
  return words;
}
function synth(text, name) {
  fs.writeFileSync(`/tmp/${name}.txt`, text);
  execFileSync('piper', ['-m', voice, '-c', voice + '.json', '-f', `/tmp/${name}.raw.wav`], { input: text });
  execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-i', `/tmp/${name}.raw.wav`, '-af', 'adelay=1500,apad=pad_dur=3', '-ar', '48000', '-ac', '1', `/tmp/${name}.wav`]);
  return Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', `/tmp/${name}.wav`]).toString());
}
async function run(wav, seconds, n) {
  const b = await chromium.launch({ args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', `--use-file-for-fake-audio-capture=${wav}%noloop`, '--autoplay-policy=no-user-gesture-required'] });
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, permissions: ['microphone'] });
  await ctx.addInitScript(fixRandom);
  await ctx.addInitScript(() => { window.__played = 0; const s = AudioBufferSourceNode.prototype.start; AudioBufferSourceNode.prototype.start = function (...a) { window.__played++; return s.apply(this, a); }; });
  const p = await ctx.newPage(); const errors = []; p.on('pageerror', (e) => errors.push(e.message));
  await p.goto(BASE); await p.evaluate(seed, LANG);
  await p.goto(BASE + '#/fluidez'); await p.reload(); await p.waitForTimeout(1500);
  await p.getByRole('button', { name: L.prepare }).click();
  const t0 = Date.now();
  await p.waitForFunction((st) => { const b = [...document.querySelectorAll('button')].find((x) => x.textContent.includes(st)); return b && !b.disabled; }, L.startRe, { timeout: 300000 });
  console.log('checker ready by itself in', Math.round((Date.now() - t0) / 1000), 's');
  ok(L.micOn.test(await p.innerText('body')), 'microphone check on, with no button to find');
  await p.getByRole('button', { name: L.start }).click();
  await p.waitForTimeout(seconds * 1000 + 1500);
  const fin = p.getByRole('button', { name: L.finished });
  if (await fin.count()) await fin.click(); // the test may already have ended on its own
  await p.waitForTimeout(1500);
  // the second listen (checking word by word) can take a while on a slow machine
  await p.waitForFunction(() => !document.body.innerText.includes('🔎'), null, { timeout: 240000 }).catch(() => console.log('still checking after 4 min'));
  await p.waitForTimeout(800);
  console.log('second listen took', await p.evaluate(() => window.__lxCheckMs), 'ms for', Math.round(seconds), 's of reading');
  const body = await p.innerText('body');
  console.log('page:', body.replace(/\s+/g, ' ').slice(0, 400));
  const info = await p.evaluate(() => {
    const spans = [...document.querySelectorAll('.reading-text > span > span')];
    const last = spans.findIndex((s) => s.className.includes('ring-2'));
    return { last, doubt: spans.filter((s) => s.className.includes('decoration-dotted')).length, struck: spans.filter((s) => s.className.includes('line-through')).length,
      review: spans.map((s, i) => (s.className.includes('decoration-dotted') && !s.className.includes('line-through') ? i + ':' + s.textContent.trim() : '')).filter(Boolean),
      marked: spans.map((s, i) => (s.className.includes('line-through') ? (s.className.includes('decoration-dotted') ? '?' : 'x') + i + ':' + s.textContent.trim() : '')).filter(Boolean),
      heard: window.__lxHeard, second: window.__lxSecond, spans: window.__lxSpans };
  });
  const tabs = await p.getByRole('button', { name: L.listen }).count();
  await p.getByRole('button', { name: L.listen }).click().catch(() => {});
  const idx = await p.evaluate(() => [...document.querySelectorAll('.reading-text > span > span')].findIndex((s, i) => i >= 2 && !s.className.includes('line-through') && !s.className.includes('decoration-dotted')));
  await p.locator('.reading-text > span > span').nth(Math.max(2, idx)).click(); await p.waitForTimeout(1500);
  const played = await p.evaluate(() => window.__played);
  console.log('clicked word', idx, 'played', played);
  await b.close();
  return { ...info, tabs, played, errors, n };
}
(async () => {
  const words = await shownText();
  const n = Math.min(words.length, 40);
  const read = words.slice(0, n).join(' ');
  // close real words, from the app's own rival rule: change one letter of a few longer words
  const swaps = [];
  const swapped = words.slice(0, n).map((w, i) => {
    const c = w.toLowerCase().replace(/[^a-záéíóúüñàèòïç]/g, '');
    if (swaps.length < 3 && i >= 3 && i % 5 === 3 && c.length >= 4) { const x = c.slice(0, 1) + (c[1] === 'a' ? 'e' : 'a') + c.slice(2); swaps.push([c, x]); return x; }
    return w;
  }).join(' ');
  console.log('lang:', LANG); console.log('text:', read.slice(0, 120), '…'); console.log('swaps:', JSON.stringify(swaps));
  const d1 = synth(read, 'flu_ok'); const d2 = synth(swapped, 'flu_swap');
  const r1 = await run('/tmp/flu_ok.wav', d1, n);
  console.log('correct reading:', JSON.stringify(r1));
  ok(r1.last >= Math.floor(n * 0.75), `correct reading: last word heard ${r1.last + 1} of ${n}`);
  ok(r1.struck <= Math.ceil(n * 0.12), `correct reading: few words marked (${r1.struck})`);
  ok(r1.tabs >= 1 && r1.played >= 1, `every word can be listened back (tab ${r1.tabs}, played ${r1.played})`);
  const r2 = await run('/tmp/flu_swap.wav', d2, n);
  console.log('with swapped words:', JSON.stringify(r2));
  ok(r2.struck >= Math.min(2, swaps.length), `swapped words count as errors (${r2.struck} marked, ${swaps.length} swapped)`);
  ok(r1.errors.length === 0 && r2.errors.length === 0, 'no page errors ' + [...r1.errors, ...r2.errors].join(' | '));
  process.exit(fails ? 1 : 0);
})();
