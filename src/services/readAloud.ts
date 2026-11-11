/**
 * Optional read-aloud check. The family turns it on; it is off by default.
 * Speech recognition runs ONLY on the device: on Android through the on-device recognizer
 * (OnDeviceSpeechPlugin.java), on the web through the Web Speech API with processLocally = true.
 * If on-device recognition is not available, the feature is not offered (never an online fallback).
 * No audio is recorded or stored: the recognizer returns text, which is compared with the reading
 * and discarded when the page closes.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Capacitor, registerPlugin, type PluginListenerHandle } from '@capacitor/core';

export type Availability = 'available' | 'downloadable' | 'downloading' | 'unavailable';
export const SPEECH_TAG: Record<string, string> = { es: 'es-ES', ca: 'ca-ES', en: 'en-GB' };

export const useReadAloud = create<{ enabled: boolean; setEnabled: (v: boolean) => void }>()(
  persist((set) => ({ enabled: false, setEnabled: (enabled) => set({ enabled }) }), { name: 'lectorix-readaloud' }),
);

interface NativeSpeech {
  availability(o: { lang: string }): Promise<{ state: Availability }>;
  install(o: { lang: string }): Promise<{ ok: boolean }>;
  start(o: { lang: string }): Promise<void>;
  stop(): Promise<void>;
  cancel(): Promise<void>;
  addListener(event: 'partial' | 'final', cb: (d: { text: string }) => void): Promise<PluginListenerHandle>;
  addListener(event: 'end' | 'ready', cb: () => void): Promise<PluginListenerHandle>;
  addListener(event: 'error', cb: (d: { code: number }) => void): Promise<PluginListenerHandle>;
}
const native = Capacitor.isNativePlatform() ? registerPlugin<NativeSpeech>('OnDeviceSpeech') : null;

// Web Speech API (types are not in lib.dom for the on-device parts yet)
type WebRec = {
  lang: string; continuous: boolean; interimResults: boolean; processLocally?: boolean;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }>; resultIndex: number }) => void) | null;
  onend: (() => void) | null; onerror: ((e: { error: string }) => void) | null;
  start(): void; stop(): void; abort(): void;
};
type WebRecCtor = {
  new (): WebRec;
  available?: (o: { langs: string[]; processLocally: boolean; quality?: string }) => Promise<Availability>;
  install?: (o: { langs: string[]; processLocally: boolean; quality?: string }) => Promise<boolean>;
};
const WebRecognition: WebRecCtor | undefined = typeof window !== 'undefined'
  ? ((window as unknown as { SpeechRecognition?: WebRecCtor; webkitSpeechRecognition?: WebRecCtor }).SpeechRecognition
    ?? (window as unknown as { webkitSpeechRecognition?: WebRecCtor }).webkitSpeechRecognition)
  : undefined;

// On the web the on-device check can crash the tab in some Chromium builds, so it only runs when the
// family asks for it, and a crash during the check is remembered: the option is then never offered there.
const PROBE_KEY = 'lectorix-ra-probe';
const PROBING_KEY = 'lectorix-ra-probing';
type ProbeCache = { crashed?: boolean; langs: Record<string, Availability> };
function readProbe(): ProbeCache {
  try {
    const c = JSON.parse(localStorage.getItem(PROBE_KEY) || '{"langs":{}}') as ProbeCache;
    if (localStorage.getItem(PROBING_KEY)) { // the last check never finished
      c.crashed = true;
      localStorage.removeItem(PROBING_KEY);
      localStorage.setItem(PROBE_KEY, JSON.stringify(c));
    }
    return c;
  } catch { return { crashed: true, langs: {} }; }
}

/**
 * On-device availability for a language. On the web, without `probe` it only returns the answer of an
 * earlier check ('unchecked' if there was none).
 */
export async function availability(lang: string, probe = false): Promise<Availability | 'unchecked'> {
  const tag = SPEECH_TAG[lang] ?? lang;
  try {
    if (native) return (await native.availability({ lang: tag })).state;
    // Only browsers that can promise on-device processing qualify
    if (!WebRecognition?.available) return 'unavailable';
    const cache = readProbe();
    if (cache.crashed) return 'unavailable';
    if (!probe) return cache.langs[tag] ?? 'unchecked';
    localStorage.setItem(PROBING_KEY, '1');
    const state = await WebRecognition.available({ langs: [tag], processLocally: true, quality: 'dictation' });
    localStorage.removeItem(PROBING_KEY);
    cache.langs[tag] = state;
    localStorage.setItem(PROBE_KEY, JSON.stringify(cache));
    return state;
  } catch {
    try { localStorage.removeItem(PROBING_KEY); } catch { /* storage unavailable */ }
    return 'unavailable';
  }
}

export async function installLanguage(lang: string): Promise<boolean> {
  const tag = SPEECH_TAG[lang] ?? lang;
  try {
    if (native) return (await native.install({ lang: tag })).ok;
    if (!WebRecognition?.install) return false;
    return await WebRecognition.install({ langs: [tag], processLocally: true, quality: 'dictation' });
  } catch {
    return false;
  }
}

export interface Listening { stop: () => void }

/**
 * Listens until stop() is called. onText receives the whole transcript so far (finished parts + the
 * part being recognised). Android stops after a pause, so it is restarted while the session is on.
 */
export async function listen(lang: string, onText: (text: string) => void, onError: (code: string) => void): Promise<Listening> {
  const tag = SPEECH_TAG[lang] ?? lang;
  let done = '';
  let active = true;
  const join = (a: string, b: string) => (a && b ? `${a} ${b}` : a || b);

  if (native) {
    const handles: PluginListenerHandle[] = [];
    handles.push(await native.addListener('partial', ({ text }) => { if (active) onText(join(done, text)); }));
    handles.push(await native.addListener('final', ({ text }) => { if (active) { done = join(done, text); onText(done); } }));
    handles.push(await native.addListener('end', () => { if (active) void native.start({ lang: tag }).catch(() => onError('unavailable')); }));
    handles.push(await native.addListener('error', ({ code }) => {
      if (!active) return;
      // 6 = no speech, 7 = no match: just keep listening
      if (code === 6 || code === 7) { void native.start({ lang: tag }).catch(() => onError('unavailable')); return; }
      onError(code === 9 ? 'permission' : code === 12 || code === 13 ? 'language' : 'error');
    }));
    try {
      await native.start({ lang: tag });
    } catch (e) {
      handles.forEach((h) => void h.remove());
      throw e;
    }
    return {
      stop: () => {
        active = false;
        void native.cancel();
        handles.forEach((h) => void h.remove());
      },
    };
  }

  if (!WebRecognition) throw new Error('unavailable');
  const make = () => {
    const r = new WebRecognition();
    r.lang = tag;
    r.continuous = true;
    r.interimResults = true;
    r.processLocally = true; // on the device only; the browser refuses instead of using a server
    let base = done;
    r.onresult = (e) => {
      let finals = '', interim = '';
      for (let i = 0; i < e.results.length; i++) {
        const res = e.results[i];
        if (res.isFinal) finals = join(finals, res[0].transcript.trim());
        else interim = join(interim, res[0].transcript.trim());
      }
      done = join(base, finals);
      onText(join(done, interim));
    };
    r.onerror = (e) => {
      if (!active) return;
      if (e.error === 'no-speech' || e.error === 'aborted') return;
      onError(e.error === 'not-allowed' ? 'permission' : e.error === 'language-not-supported' ? 'language' : 'error');
    };
    r.onend = () => { if (active) { base = done; try { rec = make(); rec.start(); } catch { onError('error'); } } };
    return r;
  };
  let rec = make();
  rec.start();
  return { stop: () => { active = false; try { rec.abort(); } catch { /* already stopped */ } } };
}

/* ---------- comparing what was heard with the text ---------- */

export const norm = (w: string) => w.toLocaleLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^\p{L}\p{N}·']/gu, '').replace(/·/g, '');

function close(a: string, b: string): boolean {
  if (a === b) return true;
  if (/\d/.test(a) || /\d/.test(b)) return /\d/.test(a) && /\d/.test(b);
  if (Math.min(a.length, b.length) < 4) return false;
  // one edit apart (recognisers often change a letter in long words)
  if (Math.abs(a.length - b.length) > 1) return false;
  let i = 0, j = 0, edits = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) { i++; j++; continue; }
    if (++edits > 1) return false;
    if (a.length > b.length) i++; else if (b.length > a.length) j++; else { i++; j++; }
  }
  return edits + (a.length - i) + (b.length - j) <= 1;
}

export type WordState = 'pending' | 'read' | 'missed';

/**
 * Walks through the text following what was heard. A heard word moves the position forward when it
 * matches one of the next few words of the text; text words jumped over are marked as missed.
 */
export function align(textWords: string[], heard: string): { states: WordState[]; position: number } {
  const target = textWords.map(norm);
  const states: WordState[] = textWords.map(() => 'pending');
  let pos = 0;
  for (const raw of heard.split(/\s+/)) {
    const h = norm(raw);
    if (!h) continue;
    // A number can be said in several words ("mil ochocientos sesenta y tres"): while on it, wait for the next word
    if (/\d/.test(target[pos] ?? '') && !/\d/.test(h)) {
      if (pos + 1 < target.length && close(target[pos + 1], h)) { states[pos] = 'read'; states[pos + 1] = 'read'; pos += 2; }
      continue;
    }
    for (let k = pos; k < Math.min(target.length, pos + 4); k++) {
      if (target[k] && close(target[k], h)) {
        for (let m = pos; m < k; m++) if (states[m] === 'pending') states[m] = target[m] && !/\d/.test(target[m]) ? 'missed' : 'read'; // numbers can be said in many ways
        states[k] = 'read';
        pos = k + 1;
        break;
      }
    }
  }
  return { states, position: pos };
}
