/**
 * Optional read-aloud check. The family turns it on; it is off by default.
 * Speech recognition runs ONLY on the device: with Lectorix's own recogniser (Vosk in WebAssembly,
 * voskEngine.ts) wherever the device can run it; otherwise the Android on-device recognizer
 * (OnDeviceSpeechPlugin.java) or the Web Speech API with processLocally = true.
 * If on-device recognition is not available, the feature is not offered (never an online fallback).
 * No audio is recorded or stored: the recognizer returns text, which is compared with the reading
 * and discarded when the page closes.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Capacitor, registerPlugin, type PluginListenerHandle } from '@capacitor/core';
import { voskState, voskInstall, voskListen, voskSecondListen, voskReady, clean, type Recording } from './voskEngine';
export type { Recording };
import { rivalsFor, type Rivals } from './rivals';
export type { Rivals };

/** Lectorix's own recogniser is used when the device can run it and its models are published */
const own = async (lang: string) => (await voskReady()) && voskState(lang) !== 'unavailable';

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
  // Lectorix's own recogniser (Vosk, inside the app) is used wherever the device can run it
  if (await own(lang)) return voskState(lang);
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
  if (await own(lang)) return voskInstall(lang);
  try {
    if (native) return (await native.install({ lang: tag })).ok;
    if (!WebRecognition?.install) return false;
    return await WebRecognition.install({ langs: [tag], processLocally: true, quality: 'dictation' });
  } catch {
    return false;
  }
}

/** `rivals`: close words the recogniser was also listening for (only Lectorix's own recogniser); pass them to align() */
export interface Listening {
  stop: () => void; rivals?: Rivals; finish?: () => Promise<void>; recording?: () => Recording | null;
  /** Second listen to the recording, with no list of words (see confirm()) */
  secondListen?: (rec: Recording) => Promise<string | null>;
}

/**
 * Languages where the second listen is used. Measured with synthetic readings (scripts/asr/eval3.py):
 * in Spanish it lets through far fewer close made-up words (1 letter: 87% -> 67%; 2 letters: 62% -> 36%)
 * at no cost for correct readings (93.8% -> 93.7%). In Valencian and English it still costs too many
 * correct words (89 -> 80% and 93 -> 86%), so it stays off there for now.
 */
export const SECOND_LISTEN = new Set(['es']);

/**
 * Words the first listen took as read but the second listen did not hear as that word become doubtful.
 * The second transcript is matched against the text as a whole (longest common sequence), so one word
 * heard differently does not throw the rest out of step; two words said together count for both.
 * Names (capitalised in the middle of a sentence, like «Tom») and numbers are not doubted: the second
 * listen spells them in its own way.
 */
export function confirm(textWords: string[], states: WordState[], second: string): WordState[] {
  const t = textWords.map(norm);
  const h = second.split(/\s+/).map(norm).filter(Boolean);
  const names = new Set<string>();
  textWords.forEach((w, i) => { if (i > 0 && /^\p{Lu}/u.test(w) && !/[.!?…:»"]$/.test(textWords[i - 1])) names.add(t[i]); });
  const n = t.length, m = h.length;
  // dp[i][j]: most text words matched from t[i..] and h[j..]
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array<number>(m + 1).fill(0));
  const pair = (i: number, j: number) => i + 1 < n && !!t[i] && !!t[i + 1] && joined(t[i], t[i + 1]).has(h[j]);
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      let best = Math.max(dp[i + 1][j], dp[i][j + 1]);
      if (t[i] && t[i] === h[j]) best = Math.max(best, dp[i + 1][j + 1] + 1);
      if (pair(i, j)) best = Math.max(best, dp[i + 2][j + 1] + 2);
      dp[i][j] = best;
    }
  }
  const heard = new Set<number>();
  for (let i = 0, j = 0; i < n && j < m;) {
    if (t[i] && t[i] === h[j] && dp[i][j] === dp[i + 1][j + 1] + 1) { heard.add(i); i++; j++; }
    else if (pair(i, j) && dp[i][j] === dp[i + 2][j + 1] + 2) { heard.add(i); heard.add(i + 1); i += 2; j++; }
    else if (dp[i + 1][j] >= dp[i][j + 1]) i++;
    else j++;
  }
  return states.map((st, i) => (st === 'read' && !heard.has(i) && !/\d/.test(t[i]) && !names.has(t[i]) ? 'doubt' : st));
}

/**
 * Listens until stop() is called. onText receives the whole transcript so far (finished parts + the
 * part being recognised). Android stops after a pause, so it is restarted while the session is on.
 */
/** `capture`: keep the audio in memory while the test is on screen, so an adult can listen back (Lectorix's own recogniser only) */
export async function listen(lang: string, onText: (text: string) => void, onError: (code: string) => void, words?: string[], capture = false): Promise<Listening> {
  if (await own(lang)) {
    const rivals = words?.length ? await rivalsFor(lang, [...new Set(words.map(clean).filter(Boolean))]) : undefined;
    const session = await voskListen(lang, onText, onError, words, rivals ? [...new Set([...rivals.values()].flatMap((r) => [...r]))] : undefined, capture);
    return { ...session, rivals, secondListen: SECOND_LISTEN.has(lang) ? (rec) => voskSecondListen(lang, rec) : undefined };
  }
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

/** 'doubt': a close word was heard instead ("pato" for "gato"); shown for review, neither right nor wrong */
export type WordState = 'pending' | 'read' | 'missed' | 'doubt';

/**
 * Walks through the text following what was heard. A heard word moves the position forward when it
 * matches one of the next few words of the text; text words jumped over are marked as missed.
 * Only an exact match counts as read. Something close but different ("gatos" or "gado" for "gato", which
 * some recognisers write) marks the word as doubtful: it is never accepted silently.
 * With `rivals` (Lectorix's own recogniser), a rival heard where its word was expected also marks that word
 * as doubtful, and rivals never count as the word itself.
 */
/** How two neighbouring words can sound when said together: "vive"+"en" -> "viven", "de"+"el" -> "del". */
function joined(a: string, b: string): Set<string> {
  const out = new Set<string>();
  if (/\d/.test(a + b) || a.length + b.length < 4) return out;
  out.add(a + b);
  const v = /[aeiou]/;
  if (a.at(-1) === b[0]) out.add(a + b.slice(1));
  if (v.test(a.at(-1) ?? '') && v.test(b[0])) { out.add(a.slice(0, -1) + b); out.add(a + b.slice(1)); }
  return out;
}

export function align(textWords: string[], heard: string, rivals?: Rivals): { states: WordState[]; position: number; from: number[] } {
  const target = textWords.map(norm);
  const states: WordState[] = textWords.map(() => 'pending');
  const from: number[] = textWords.map(() => -1); // index of the heard word that matched each text word
  let hi = -1;
  // rivals by the normalised form of their word
  const rivalOf = new Map<string, Set<string>>();
  const anyRival = new Set<string>();
  rivals?.forEach((set, w) => {
    const k = norm(w); const mine = rivalOf.get(k) ?? new Set<string>();
    set.forEach((r) => { const n = norm(r); if (n && n !== k) { mine.add(n); anyRival.add(n); } });
    rivalOf.set(k, mine);
  });
  const isWord = (t: string, h: string) => t === h || (!anyRival.has(h) && close(t, h));
  let pos = 0;
  for (const raw of heard.split(/\s+/)) {
    const h = norm(raw);
    if (!raw) continue;
    hi++;
    if (!h) continue;
    // A number can be said in several words ("mil ochocientos sesenta y tres"): while on it, wait for the next word
    if (/\d/.test(target[pos] ?? '') && !/\d/.test(h)) {
      if (pos + 1 < target.length && isWord(target[pos + 1], h)) { states[pos] = 'read'; states[pos + 1] = 'read'; from[pos + 1] = hi; pos += 2; }
      continue;
    }
    const end = Math.min(target.length, pos + 4);
    let at = -1; let state: WordState = 'read';
    for (let k = pos; k < end && at < 0; k++) if (target[k] && target[k] === h) at = k;
    // Two words said together, as everyone does when reading fluently ("vive en" heard as "viven",
    // "duerme en" as "duermen"): both were read. Checked before near matches, which would wrongly doubt the first.
    if (at < 0) {
      let k2 = -1;
      for (let k = pos; k + 1 < end && k2 < 0; k++) if (target[k] && target[k + 1] && joined(target[k], target[k + 1]).has(h)) k2 = k;
      if (k2 >= 0) {
        for (let m = pos; m < k2; m++) if (states[m] === 'pending') states[m] = target[m] && !/\d/.test(target[m]) ? 'missed' : 'read';
        states[k2] = 'read'; states[k2 + 1] = 'read'; from[k2] = hi; from[k2 + 1] = hi;
        pos = k2 + 2;
        continue;
      }
    }
    if (at < 0) for (let k = pos; k < end && at < 0; k++) if (target[k] && isWord(target[k], h)) { at = k; state = /\d/.test(target[k]) ? 'read' : 'doubt'; }
    if (at < 0 && anyRival.has(h)) {
      for (let k = pos; k < end && at < 0; k++) if (rivalOf.get(target[k])?.has(h)) { at = k; state = 'doubt'; }
    }
    if (at >= 0) {
      for (let m = pos; m < at; m++) if (states[m] === 'pending') states[m] = target[m] && !/\d/.test(target[m]) ? 'missed' : 'read'; // numbers can be said in many ways
      states[at] = state;
      from[at] = hi;
      pos = at + 1;
    }
  }
  return { states, position: pos, from };
}
