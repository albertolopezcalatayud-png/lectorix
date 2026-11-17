/**
 * Lectorix's own reading recogniser: Vosk (free, Apache 2.0) running inside the app with WebAssembly.
 * The audio is analysed on the device and never leaves it; nothing is recorded or stored.
 * It listens only for the words of the text being read (plus "unknown"), which makes it fast on modest
 * phones, good at following a correct reading and strict with made-up or skipped words.
 * Android app: the language models come installed with the app (asr_pack, install-time asset pack), so
 * there is nothing to download. Web: the model (about 40 MB) is downloaded once per language and kept.
 */
import { Capacitor } from '@capacitor/core';

type Lang = 'es' | 'ca' | 'en';
type State = 'available' | 'downloadable' | 'downloading' | 'unavailable';
const REMOTE = 'https://albertolopezcalatayud-png.github.io/lectorix/asr/';
const LOCAL = (() => { try { return new URL(`${import.meta.env.BASE_URL}asr/`, window.location.href).href; } catch { return `${import.meta.env.BASE_URL}asr/`; } })();
/** Models installed with the Android app (found at start-up in voskReady) */
let bundled = false;
const base = () => (Capacitor.isNativePlatform() && !bundled ? REMOTE : LOCAL);
const FLAG = (l: string) => `lectorix-asr-${l}`;
const isLang = (l: string): l is Lang => l === 'es' || l === 'ca' || l === 'en';

type VoskModel = import('vosk-browser').Model;
const models: Partial<Record<Lang, Promise<VoskModel>>> = {};
const loading = new Set<string>();

export function voskSupported(): boolean {
  return typeof WebAssembly === 'object' && typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia
    && typeof (window.AudioContext ?? (window as unknown as { webkitAudioContext?: unknown }).webkitAudioContext) === 'function';
}

let ready: Promise<boolean> | null = null;
/** Are the language models published? (asked once; the answer is remembered for offline use) */
export function voskReady(): Promise<boolean> {
  if (!voskSupported()) return Promise.resolve(false);
  if (!ready) {
    ready = (Capacitor.isNativePlatform()
      ? fetch(`${LOCAL}ready.json`).then(async (r) => { bundled = r.ok && ((await r.json().catch(() => null)) as { bundled?: boolean } | null)?.bundled === true; }).catch(() => { bundled = false; })
      : Promise.resolve())
      .then(() => fetch(`${base()}ready.json`, { cache: 'no-cache' }))
      .then(async (r) => { const ok = r.ok && ((await r.json().catch(() => null)) as { engine?: string } | null)?.engine === 'vosk'; try { localStorage.setItem('lectorix-asr', ok ? 'on' : 'off'); } catch { /* ignore */ } return ok; })
      .catch(() => { try { return localStorage.getItem('lectorix-asr') === 'on'; } catch { return false; } });
  }
  return ready;
}

export function voskState(lang: string): State {
  if (!isLang(lang) || !voskSupported()) return 'unavailable';
  if (loading.has(lang)) return 'downloading';
  if (bundled) return 'available'; // installed with the app: it only has to be opened (a few seconds, the first time)
  try { return localStorage.getItem(FLAG(lang)) === 'ready' ? 'available' : 'downloadable'; } catch { return 'downloadable'; }
}

/** Loads the model (downloading it the first time). The library keeps it in the browser's storage. */
function model(lang: Lang): Promise<VoskModel> {
  if (!models[lang]) {
    loading.add(lang);
    models[lang] = import('vosk-browser')
      .then(({ createModel }) => createModel(`${base()}${lang}.tar.gz`, -1))
      .then((m) => { try { localStorage.setItem(FLAG(lang), 'ready'); } catch { /* ignore */ } return m; })
      .catch((e) => { delete models[lang]; throw e; })
      .finally(() => loading.delete(lang));
  }
  return models[lang]!;
}
export async function voskInstall(lang: string): Promise<boolean> {
  if (!isLang(lang) || !voskSupported()) return false;
  try { await model(lang); return true; } catch { return false; }
}

export const clean = (w: string) => w.toLowerCase().replace(/[^\p{L}\p{N}'·-]/gu, '').replace(/^['-]+|['-]+$/g, '');

/**
 * Listens until stop(). onText gets the whole transcript so far. `words` are the words of the text being
 * read: the recogniser then only looks for those (anything else is heard as "unknown" and dropped).
 * `rivals` are close real words it may also hear (rivals.ts); they come back in the transcript like any other word.
 */
export async function voskListen(
  lang: string, onText: (text: string) => void, onError: (code: string) => void, words?: string[], rivals?: string[],
): Promise<{ stop: () => void }> {
  if (!isLang(lang) || !voskSupported()) throw new Error('unavailable');
  let stream: MediaStream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true } });
  } catch (e) { console.warn('microphone', e); onError('permission'); throw new Error('permission'); }
  let m: VoskModel;
  try { m = await model(lang); } catch (e) { console.warn('recogniser model', e); stream.getTracks().forEach((t) => t.stop()); onError('language'); throw new Error('language'); }

  const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const ctx = new Ctx();
  const grammar = words?.length ? JSON.stringify([...new Set([...words.map(clean), ...(rivals ?? [])].filter(Boolean)), '[unk]']) : undefined;
  const rec = new m.KaldiRecognizer(ctx.sampleRate, grammar);
  let done = '';
  const tidy = (s: string) => s.replace(/\[unk\]/g, ' ').replace(/\s+/g, ' ').trim();
  const join = (a: string, b: string) => (a && b ? `${a} ${b}` : a || b);
  rec.on('result', (msg) => { const t = tidy((msg as { result: { text?: string } }).result.text ?? ''); if (t) { done = join(done, t); onText(done); } });
  rec.on('partialresult', (msg) => { const t = tidy((msg as { result: { partial?: string } }).result.partial ?? ''); onText(join(done, t)); });

  const source = ctx.createMediaStreamSource(stream);
  // ScriptProcessor is old but works everywhere the app runs, including Android's WebView
  const node = ctx.createScriptProcessor(4096, 1, 1);
  node.onaudioprocess = (e) => { try { rec.acceptWaveform(e.inputBuffer); } catch { /* recogniser closed */ } };
  const mute = ctx.createGain(); mute.gain.value = 0;
  source.connect(node); node.connect(mute); mute.connect(ctx.destination);
  if (ctx.state === 'suspended') void ctx.resume();

  return {
    stop: () => {
      try { node.disconnect(); source.disconnect(); mute.disconnect(); } catch { /* ignore */ }
      stream.getTracks().forEach((t) => t.stop());
      try { rec.remove(); } catch { /* ignore */ }
      void ctx.close().catch(() => undefined);
    },
  };
}
