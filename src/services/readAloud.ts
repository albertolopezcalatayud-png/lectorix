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
 * The second listen runs in every language. How much a word it does not confirm counts depends on the
 * language, as measured with synthetic readings (scripts/asr/eval3.py, 60 sentences x 2 voices):
 * - Spanish: any word it does not confirm counts as an error (doubtful, can be unmarked). Made-up words
 *   one letter away let through 82% -> 65%, two letters 67% -> 34%, real close words 25% -> 9%; correct
 *   words kept 95.3% -> 91.8%.
 * - Valencian and English: the same would cost too many correct words (88 -> 78%, 92 -> 82%), so only a
 *   word where the second listen heard a *different, close* word in its place counts as an error; words it
 *   simply did not hear are shown for the adult to listen to and decide, without counting. Measured: made-up
 *   words one letter away counted as read 79% -> 64% (Valencian) and 66% -> 59% (English); correct words
 *   kept 87.9% -> 82.5% and 92.1% -> 88.0%. The rest of the gain is in the words left to review.
 */
export type SecondMode = 'strict' | 'close' | 'review';
/**
 * Spanish: strict. Valencian: only a close different word heard in its place counts. English: nothing the
 * second listen hears counts on its own, it is only shown to review: the free English model is American
 * and hears British vowels as other words («mum» as «mom»), which would mark good readings.
 * In every language, a word the first listen missed but the second heard exactly is counted as read.
 */
export const SECOND_MODE: Record<string, SecondMode> = { es: 'strict', ca: 'close', en: 'review' };

/** For each text word, whether the first listen heard one of its rivals (a real close word) in its place */
export function rivalHeard(heard: string, from: number[], rivals?: Rivals): boolean[] {
  const h = heard.split(/\s+/).filter(Boolean).map(norm);
  const all = new Set<string>(); rivals?.forEach((set) => set.forEach((r) => all.add(norm(r))));
  return from.map((k) => k >= 0 && all.has(h[k] ?? ''));
}

/**
 * Spelling folded to how it sounds, so the second listen is not doubted for writing a word that sounds the
 * same («bola» for «vola» in Valencian, «aya» for «haya»): b/v, silent h, qu/c/k, ll/y (Spanish only).
 */
export function soundKey(lang: string, w: string): string {
  if (lang !== 'es' && lang !== 'ca') return w;
  let x = w.replace(/v/g, 'b').replace(/(^|[^c])h/g, '$1').replace(/qu(?=[ei])/g, 'k').replace(/c(?=[aou]|$|[^eihaou])/g, 'k');
  if (lang === 'es') x = x.replace(/ll/g, 'y');
  return x;
}

/** Letters apart (insertions, deletions, changes) */
function distance(a: string, b: string): number {
  const d = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    let prev = d[0]; d[0] = i;
    for (let j = 1; j <= b.length; j++) { const tmp = d[j]; d[j] = Math.min(d[j] + 1, d[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1)); prev = tmp; }
  }
  return d[b.length];
}

/**
 * Checks the first listen against the second. The second transcript is matched against the text as a whole
 * (longest common sequence), so one word heard differently does not throw the rest out of step; two words
 * said together count for both. Names (capitalised in the middle of a sentence, like «Tom») and numbers are
 * never doubted: the second listen spells them in its own way.
 * Returns the new states (doubtful = counts as an error) and the words to review (not counted).
 */
export function confirm(textWords: string[], states: WordState[], second: string, mode: SecondMode = 'strict', lang = '', rivalHeard: boolean[] = []): { states: WordState[]; review: Set<number> } {
  const t = textWords.map((w) => soundKey(lang, norm(w)));
  const h = second.split(/\s+/).map((w) => soundKey(lang, norm(w))).filter(Boolean);
  const names = new Set<string>();
  textWords.forEach((w, i) => { if (i > 0 && /^\p{Lu}/u.test(w) && !/[.!?…:»"]$/.test(textWords[i - 1])) names.add(t[i]); });
  // also a word that comes more than once and is always capitalised («Pau» starting every sentence)
  const caps = new Map<string, number>(); const lower = new Set<string>();
  textWords.forEach((w, i) => { if (/^\p{Lu}/u.test(w)) caps.set(t[i], (caps.get(t[i]) ?? 0) + 1); else lower.add(t[i]); });
  caps.forEach((k, w) => { if (k > 1 && !lower.has(w)) names.add(w); });
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
  const at = new Map<number, number>(); // text word -> heard word
  for (let i = 0, j = 0; i < n && j < m;) {
    if (t[i] && t[i] === h[j] && dp[i][j] === dp[i + 1][j + 1] + 1) { at.set(i, j); i++; j++; }
    else if (pair(i, j) && dp[i][j] === dp[i + 2][j + 1] + 2) { at.set(i, j); at.set(i + 1, j); i += 2; j++; }
    else if (dp[i + 1][j] >= dp[i][j + 1]) i++;
    else j++;
  }
  /** a different word, close to the text word, heard in its place (between the neighbours that were heard) */
  const contradicted = (i: number) => {
    let a = -1, b = m;
    for (let k = i - 1; k >= 0; k--) if (at.has(k)) { a = at.get(k)!; break; }
    for (let k = i + 1; k < n; k++) if (at.has(k)) { b = at.get(k)!; break; }
    return h.slice(a + 1, b).some((x) => { const d = distance(x, t[i]); return d >= 1 && d <= 2 && Math.min(x.length, t[i].length) >= 3; });
  };
  const review = new Set<number>();
  const out = states.map((st, i) => {
    // only close in the first listen, or a short word it missed («a», «en», «un»: it often drops them), heard
    // exactly by the second (alone or said together with the next word): read. A longer word the first
    // listen could not fit at all stays missed: the second listen also turns made-up words into real ones.
    if (((st === 'missed' && t[i].length <= 3) || st === 'doubt') && at.has(i) && !rivalHeard[i]) return 'read' as WordState;
    if (st !== 'read' || at.has(i) || /\d/.test(t[i]) || names.has(t[i])) return st;
    if (mode === 'strict' || (mode === 'close' && contradicted(i))) return 'doubt' as WordState;
    review.add(i); return st;
  });
  return { states: out, review };
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
    return { ...session, rivals, secondListen: (rec) => voskSecondListen(lang, rec) };
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
