/**
 * Natural-voice clips: audio generated in advance with neural voices for the fixed texts of the app
 * (readings, dictations, exercises). When a clip exists for exactly the text that is about to be read,
 * it is played; otherwise the device's voice reads it as before.
 * Clips are downloaded only when needed and kept for offline use.
 */
import { Capacitor } from '@capacitor/core';
import { clipKey } from './clipKey';

type Lang = 'es' | 'ca' | 'en';
const REMOTE = 'https://albertolopezcalatayud-png.github.io/lectorix/audio/';
const base = () => (Capacitor.isNativePlatform() ? REMOTE : `${import.meta.env.BASE_URL}audio/`);
const CACHE = 'lectorix-audio-v1';
const PREF = 'lectorix-natural-voice';
/** The clips are recorded at a natural pace: this app rate plays them at their own speed */
const NATURAL_RATE = 0.92;

export const naturalVoiceEnabled = () => { try { return localStorage.getItem(PREF) !== 'off'; } catch { return true; } };
export const setNaturalVoiceEnabled = (on: boolean) => { try { localStorage.setItem(PREF, on ? 'on' : 'off'); } catch { /* ignore */ } };

const CHOICE = 'lectorix-natural-voice-choice';
export interface NaturalVoice { id: string; name: string; license: string; credit: string }
let voicesIndex: Promise<Partial<Record<Lang, NaturalVoice[]>>> | null = null;
/** The natural voices available for each language (published with the audio) */
export function naturalVoices(): Promise<Partial<Record<Lang, NaturalVoice[]>>> {
  if (!voicesIndex) voicesIndex = cachedFetch(`${base()}voices.json`).then(async (r) => (r ? await r.json() : {})).catch(() => ({}));
  return voicesIndex;
}
export function chosenNaturalVoice(lang: string): string | null {
  try { return (JSON.parse(localStorage.getItem(CHOICE) || '{}') as Record<string, string>)[lang] ?? null; } catch { return null; }
}
export function setChosenNaturalVoice(lang: string, id: string) {
  try { const c = JSON.parse(localStorage.getItem(CHOICE) || '{}'); c[lang] = id; localStorage.setItem(CHOICE, JSON.stringify(c)); } catch { /* ignore */ }
  delete manifests[lang as Lang]; delete known[lang as Lang];
}
/** Listen to a natural voice before choosing it */
export async function playVoiceSample(lang: string, id: string): Promise<void> {
  stopClip();
  const r = await cachedFetch(`${base()}${lang}/${id}/sample.mp3`);
  if (!r) return;
  const url = URL.createObjectURL(await r.blob());
  await new Promise<void>((resolve) => {
    const audio = new Audio(url);
    current = { audio, url, done: () => resolve() };
    audio.onended = () => { if (current?.audio === audio) current = null; URL.revokeObjectURL(url); resolve(); };
    audio.play().catch(() => resolve());
  });
}

/** The voice to use for a language: the family's choice if it exists, else the first one */
async function voiceFor(lang: Lang): Promise<string | null> {
  const list = (await naturalVoices())[lang] ?? [];
  const chosen = chosenNaturalVoice(lang);
  return list.find((v) => v.id === chosen)?.id ?? list[0]?.id ?? null;
}

const manifests: Partial<Record<Lang, Promise<{ voice: string | null; items: Set<string> }>>> = {};
async function cachedFetch(url: string): Promise<Response | null> {
  try {
    const cache = 'caches' in window ? await caches.open(CACHE) : null;
    const hit = cache ? await cache.match(url) : undefined;
    if (hit && !url.endsWith('manifest.json')) return hit;
    try {
      const res = await fetch(url, { cache: 'no-cache' });
      if (res.ok) { if (cache) await cache.put(url, res.clone()); return res; }
    } catch { /* offline */ }
    return hit ?? null;
  } catch { return null; }
}
function manifest(lang: Lang): Promise<{ voice: string | null; items: Set<string> }> {
  if (!manifests[lang]) {
    manifests[lang] = voiceFor(lang).then(async (voice) => {
      if (!voice) return { voice: null, items: new Set<string>() };
      const r = await cachedFetch(`${base()}${lang}/${voice}/manifest.json`);
      const items = new Set(Object.keys(((r ? await r.json() : {}) as { items?: Record<string, 1> }).items ?? {}));
      return { voice, items };
    }).catch(() => ({ voice: null, items: new Set<string>() }));
  }
  return manifests[lang]!;
}
/** Start loading the list of clips for a language (cheap; called when the language is chosen) */
export function preloadClips(lang: string) { if (lang === 'es' || lang === 'ca' || lang === 'en') void manifest(lang); }

const known: Partial<Record<Lang, Set<string>>> = {};
/** Synchronous check (after the list has loaded): is there a clip for this text? */
export function hasClipSync(lang: string, text: string): boolean {
  const set = known[lang as Lang];
  return !!set && set.has(clipKey(lang, text));
}
export async function hasClip(lang: string, text: string): Promise<boolean> {
  if (!naturalVoiceEnabled() || !(lang === 'es' || lang === 'ca' || lang === 'en')) return false;
  const m = await manifest(lang);
  known[lang] = m.items;
  return m.items.has(clipKey(lang, text));
}

let current: { audio: HTMLAudioElement; url: string; done: (interrupted: boolean) => void } | null = null;
export function stopClip() {
  if (!current) return;
  const c = current; current = null;
  try { c.audio.pause(); } catch { /* ignore */ }
  URL.revokeObjectURL(c.url);
  c.done(true);
}

/**
 * Plays the clip for a text. Resolves to null when there is no clip (the caller then uses the device voice),
 * otherwise to { interrupted }. onWord gets the character index of each word as it is spoken.
 */
export async function playClip(
  lang: string, text: string, rate: number,
  hooks: { onStart?: () => void; onWord?: (charIndex: number) => void } = {},
): Promise<{ interrupted: boolean } | null> {
  if (!(await hasClip(lang, text))) return null;
  const key = clipKey(lang, text);
  const voice = (await manifest(lang as Lang)).voice;
  const dir = `${base()}${lang}/${voice}/`;
  const [audioRes, timingRes] = await Promise.all([
    cachedFetch(`${dir}${key}.mp3`),
    hooks.onWord ? cachedFetch(`${dir}${key}.json`) : Promise.resolve(null),
  ]);
  if (!audioRes) return null;
  const blob = await audioRes.blob();
  const timing = timingRes ? ((await timingRes.json().catch(() => null)) as { w: [number, number][] } | null) : null;
  stopClip();
  return new Promise<{ interrupted: boolean } | null>((resolve) => {
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    audio.playbackRate = Math.min(1.4, Math.max(0.7, rate / NATURAL_RATE));
    (audio as HTMLAudioElement & { preservesPitch?: boolean }).preservesPitch = true;
    let raf = 0, next = 0;
    const words = timing?.w ?? [];
    const tick = () => {
      const ms = audio.currentTime * 1000;
      while (next < words.length && words[next][1] <= ms) { hooks.onWord?.(words[next][0]); next++; }
      if (!audio.paused) raf = requestAnimationFrame(tick);
    };
    const finish = (interrupted: boolean) => {
      cancelAnimationFrame(raf);
      if (current?.audio === audio) { current = null; URL.revokeObjectURL(url); }
      resolve({ interrupted });
    };
    current = { audio, url, done: finish };
    audio.onplay = () => { hooks.onStart?.(); if (hooks.onWord && words.length) raf = requestAnimationFrame(tick); };
    audio.onended = () => finish(false);
    audio.onerror = () => { if (current?.audio === audio) { current = null; URL.revokeObjectURL(url); } resolve(null); };
    audio.play().catch(() => { if (current?.audio === audio) { current = null; URL.revokeObjectURL(url); } resolve(null); });
  });
}

// ── Dictation, recorded slow by the voice itself ─────
// Slowing a normal clip down in the phone smears the sounds; for dictation each voice also records the
// text slowly ('slow' for the normal button, 'slower' for 🐢), played as it is.
export type DictationPace = 'slow' | 'slower';
/**
 * Dictation alternates between the voices the teachers chose (Spanish: Davefx and Sharvard; Valencian: Pol,
 * Mar and Pau), so the children get used to more than one voice. The same text always gets the same voice (repeating it does
 * not change the voice). Other languages use the family's chosen voice.
 */
const DICTATION_VOICES: Partial<Record<Lang, string[]>> = { es: ['davefx', 'sharvard'], ca: ['mx-pol', 'mx-mar', 'mx-pau'] };
const slowManifests = new Map<string, Promise<Set<string>>>();
function slowManifest(lang: Lang, voice: string, pace: DictationPace): Promise<Set<string>> {
  const k = `${lang}/${voice}/${pace}`;
  if (!slowManifests.has(k)) {
    slowManifests.set(k, cachedFetch(`${base()}${k}/manifest.json`)
      .then(async (r) => new Set(Object.keys(((r ? await r.json() : {}) as { items?: Record<string, 1> }).items ?? {})))
      .catch(() => new Set<string>()));
  }
  return slowManifests.get(k)!;
}
function hash(s: string): number { let h = 0; for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h; }
export async function dictationVoice(lang: string, text: string): Promise<string | null> {
  const l = lang as Lang;
  const list = ((await naturalVoices())[l] ?? []).map((v) => v.id);
  const mix = (DICTATION_VOICES[l] ?? []).filter((id) => list.includes(id));
  if (mix.length > 1) return mix[hash(clipKey(lang, text)) % mix.length];
  return voiceFor(l);
}
/** Plays the slow dictation clip for a text; null when there is none (the caller then uses the normal clip) */
export async function playDictationClip(lang: string, text: string, pace: DictationPace): Promise<{ interrupted: boolean } | null> {
  if (!naturalVoiceEnabled() || !(lang === 'es' || lang === 'ca' || lang === 'en')) return null;
  const voice = await dictationVoice(lang, text);
  if (!voice) return null;
  const key = clipKey(lang, text);
  if (!(await slowManifest(lang, voice, pace)).has(key)) return null;
  const res = await cachedFetch(`${base()}${lang}/${voice}/${pace}/${key}.mp3`);
  if (!res) return null;
  const blob = await res.blob();
  stopClip();
  return new Promise((resolve) => {
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    const finish = (interrupted: boolean) => { if (current?.audio === audio) { current = null; URL.revokeObjectURL(url); } resolve({ interrupted }); };
    current = { audio, url, done: finish };
    audio.onended = () => finish(false);
    audio.onerror = () => { if (current?.audio === audio) { current = null; URL.revokeObjectURL(url); } resolve(null); };
    audio.play().catch(() => { if (current?.audio === audio) { current = null; URL.revokeObjectURL(url); } resolve(null); });
  });
}
