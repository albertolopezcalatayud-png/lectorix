// Drives the debug build of the Android app through the WebView DevTools protocol.
// Usage: node webview-check.mjs <outDir>   (needs `adb forward tcp:9222 ...` first)
import { execSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';

const OUT = process.argv[2] || '/tmp/out';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const shot = (name) => {
  try { writeFileSync(`${OUT}/${name}.png`, execSync('adb exec-out screencap -p', { maxBuffer: 64 * 1024 * 1024 })); } catch (e) { console.log('shot failed', name, e.message); }
};
const log = (...a) => console.log(...a);

let targets = [];
for (let i = 0; i < 20 && !targets.length; i++) {
  try { targets = (await (await fetch('http://localhost:9222/json')).json()).filter((t) => t.type === 'page'); } catch { /* retry */ }
  if (!targets.length) await sleep(1500);
}
if (!targets.length) { log('RESULT FAIL: no WebView target'); process.exit(0); }
log('target', targets[0].url);

const ws = new WebSocket(targets[0].webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener('open', r));
let id = 0;
const pending = new Map();
const errors = [];
ws.addEventListener('message', (ev) => {
  const m = JSON.parse(ev.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
  if (m.method === 'Runtime.exceptionThrown') errors.push('exception: ' + (m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text));
  if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') errors.push('console: ' + m.params.args.map((a) => a.value ?? a.description).join(' '));
});
const send = (method, params = {}) => new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
const ev = async (expr, timeout = 60000) => {
  const r = await Promise.race([
    send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true }),
    sleep(timeout).then(() => ({ result: { result: { value: 'TIMEOUT' } } })),
  ]);
  if (r.result?.exceptionDetails) return 'ERROR ' + (r.result.exceptionDetails.exception?.description || r.result.exceptionDetails.text);
  return r.result?.result?.value;
};
await send('Runtime.enable');

const results = {};
results.native = await ev('!!(window.Capacitor && Capacitor.isNativePlatform())');
results.userAgent = await ev('navigator.userAgent');
results.speechSynthesisInWebView = await ev("'speechSynthesis' in window");

// Fresh state: skip onboarding, Spanish, a little history for the family panel
await ev(`(() => {
  const now = Date.now(), D = 86400000;
  const mk = (d, module, ok, bad) => ({ id: 'x' + d, module, level: 1, total_questions: ok + bad, correct_answers: ok, score_percent: 0, stars: 1, xp_earned: 10, time_ms: 60000,
    answers: [...Array(ok)].map((_, i) => ({ exercise_id: 'es_' + module + '_l1_m00' + i, selected: 0, correct: 0, is_correct: true, time_ms: 3000 }))
      .concat([...Array(bad)].map((_, i) => ({ exercise_id: 'es_' + module + '_l1_m10' + i, selected: 1, correct: 0, is_correct: false, time_ms: 3000 }))),
    completed_at: new Date(now - d * D).toISOString(), mode: 'normal' });
  localStorage.setItem('lectorix-store', JSON.stringify({ state: { onboardingDone: true, language: 'es', practiceLanguage: 'auto', progress: [], syllableColors: true,
    sessionHistory: [mk(0, 'fonologia', 8, 2), mk(1, 'escritura', 4, 6)] }, version: 0 }));
  return true; })()`);
await ev('location.hash = "#/"; location.reload(); true');
await sleep(5000);

const routes = ['/', '/modulos', '/ejercicio/fonologia/1', '/lectura', '/dictado', '/fluidez', '/adaptar', '/juntos', '/panel-padres', '/ajustes', '/mis-palabras'];
results.routes = {};
for (const r of routes) {
  await ev(`location.hash = '#${r}'; true`);
  await sleep(2200);
  const txt = await ev('document.body.innerText.replace(/\\s+/g, " ").slice(0, 120)');
  results.routes[r] = txt;
  shot('screen' + (r === '/' ? '-home' : r.replace(/\//g, '-')));
}

// Voice (native text-to-speech)
results.tts = {};
for (const lang of ['es-ES', 'ca-ES', 'en-GB']) {
  results.tts[lang] = await ev(`Capacitor.Plugins.TextToSpeech.isLanguageSupported({ lang: '${lang}' }).then(r => r.supported)`);
}
results.ttsSpeak = await ev(`(async () => { const t = Date.now(); await Capacitor.Plugins.TextToSpeech.speak({ text: 'Hola, esto es una prueba de voz.', lang: 'es-ES', rate: 1 }); return 'spoke in ' + (Date.now() - t) + ' ms'; })()`, 30000);
results.ttsWords = await ev(`(async () => { let n = 0; const h = await Capacitor.Plugins.TextToSpeech.addListener('onRangeStart', () => n++);
  await Capacitor.Plugins.TextToSpeech.speak({ text: 'El gato come pescado en la cocina.', lang: 'es-ES', rate: 1 }); await h.remove(); return 'word events: ' + n; })()`, 30000);

// Photo reading (OCR) with a generated page image, through the real file input
await ev(`location.hash = '#/adaptar'; true`);
await sleep(2500);
results.ocr = await ev(`(async () => {
  const c = document.createElement('canvas'); c.width = 900; c.height = 220; const g = c.getContext('2d');
  g.fillStyle = '#fff'; g.fillRect(0, 0, 900, 220); g.fillStyle = '#111'; g.font = '34px serif';
  g.fillText('El río Turia atraviesa la ciudad de Valencia.', 30, 80); g.fillText('Los niños juegan en el parque.', 30, 150);
  const blob = await new Promise((r) => c.toBlob(r, 'image/png'));
  const dt = new DataTransfer(); dt.items.add(new File([blob], 'page.png', { type: 'image/png' }));
  const input = document.querySelector('input[type=file]'); input.files = dt.files; input.dispatchEvent(new Event('change', { bubbles: true }));
  for (let i = 0; i < 90; i++) { await new Promise((r) => setTimeout(r, 1000)); const v = document.querySelector('textarea')?.value; if (v) return 'OK: ' + v; if (/No se ha podido/.test(document.body.innerText)) return 'FAIL: error message'; }
  return 'FAIL: timeout'; })()`, 120000);
shot('screen-ocr');

// Local notifications
results.notifPerm = await ev(`Capacitor.Plugins.LocalNotifications.checkPermissions().then(p => p.display)`);
results.notifSchedule = await ev(`Capacitor.Plugins.LocalNotifications.schedule({ notifications: [{ id: 4242, title: 'Prueba Lectorix', body: 'Recordatorio de prueba', schedule: { at: new Date(Date.now() + 4000) }, smallIcon: 'ic_stat_lectorix' }] }).then(() => 'scheduled')`);
await sleep(7000);
execSync('adb shell cmd statusbar expand-notifications || true');
await sleep(1500);
shot('screen-notification');
execSync('adb shell cmd statusbar collapse || true');

// Android back button inside the app
await ev(`location.hash = '#/modulos'; true`); await sleep(1200);
await ev(`location.hash = '#/ajustes'; true`); await sleep(1200);
execSync('adb shell input keyevent 4'); await sleep(1500);
results.backButton = await ev('location.hash');

results.errors = errors;
log(JSON.stringify(results, null, 2));
const ok = results.native && !results.speechSynthesisInWebView !== undefined && String(results.ocr).startsWith('OK') && errors.length === 0;
log('RESULT', ok ? 'PASS' : 'CHECK');
ws.close();
process.exit(0);
