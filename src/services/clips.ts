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

const manifests: Partial<Record<Lang, Promise<Set<string>>>> = {};
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
function manifest(lang: Lang): Promise<Set<string>> {
  if (!manifests[lang]) {
    manifests[lang] = cachedFetch(`${base()}${lang}/manifest.json`)
      .then(async (r) => new Set(Object.keys(((r ? await r.json() : {}) as { items?: Record<string, 1> }).items ?? {})))
      .catch(() => new Set<string>());
  }
  return manifests[lang]!;
}
/** Start loading the list of clips for a language (cheap; called when the language is chosen) */
export function preloadClips(lang: string) { if (lang === 'es' || lang === 'ca' || lang === 'en') void manifest(lang); }

let known: Partial<Record<Lang, Set<string>>> = {};
/** Synchronous check (after the list has loaded): is there a clip for this text? */
export function hasClipSync(lang: string, text: string): boolean {
  const set = known[lang as Lang];
  return !!set && set.has(clipKey(lang, text));
}
export async function hasClip(lang: string, text: string): Promise<boolean> {
  if (!naturalVoiceEnabled() || !(lang === 'es' || lang === 'ca' || lang === 'en')) return false;
  const set = await manifest(lang);
  known[lang] = set;
  return set.has(clipKey(lang, text));
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
  const [audioRes, timingRes] = await Promise.all([
    cachedFetch(`${base()}${lang}/${key}.mp3`),
    hooks.onWord ? cachedFetch(`${base()}${lang}/${key}.json`) : Promise.resolve(null),
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
