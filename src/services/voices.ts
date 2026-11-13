/**
 * Choosing the most natural voice the device has.
 * Devices often have several voices per language: old "desktop" voices that sound robotic, and newer
 * neural / online / enhanced voices that sound human. Lectorix ranks them, picks the best one, and
 * lets the family choose another one in "Voces para leer en voz alta".
 */
import { TextToSpeech } from '@capacitor-community/text-to-speech';
import { isNative } from './nativeTts';

export interface VoiceInfo {
  id: string;          // voiceURI (web) or engine voice name (Android)
  name: string;
  lang: string;        // BCP-47, normalised to lower case with dashes
  online: boolean;     // needs an internet connection
  score: number;
  index: number;       // position in the native list (Android plugin selects voices by index)
}

const PREF_KEY = 'lectorix-voice-prefs';
const norm = (l: string) => l.replace(/_/g, '-').toLowerCase();

/** Higher is better: language match first, then how natural the voice sounds */
export function scoreVoice(v: { name: string; lang: string; localService: boolean; voiceURI?: string }, tag: string): number {
  const lang = norm(v.lang); const want = tag.toLowerCase(); const base = want.split('-')[0];
  if (!(lang === want || lang.startsWith(base + '-') || lang === base)) return -1;
  const n = `${v.name} ${v.voiceURI ?? ''}`.toLowerCase();
  let s = lang === want ? 100 : 80;
  if (base === 'ca' && (lang.includes('valencia') || /valenci/.test(n))) s += 30;
  if (/natural|neural|premium|enhanced|mejorada|millorada|wavenet|studio|siri/.test(n)) s += 60;   // neural / enhanced voices
  if (/\bonline\b/.test(n)) s += 25;                                                                  // Edge / Windows online voices
  if (/google/.test(n)) s += 30;                                                                      // Chrome's Google voices
  if (/-network\b/.test(n)) s += 25;                                                                  // Android Google TTS: higher quality, needs internet
  if (/-local\b/.test(n)) s += 15;
  if (/compact|espeak|e-speak|pico|eloquence/.test(n)) s -= 70;                                       // known robotic engines
  if (/microsoft/.test(n) && !/online|natural/.test(n)) s -= 15;                                      // old Windows desktop voices
  return s;
}

function prefs(): Record<string, string> {
  try { return JSON.parse(localStorage.getItem(PREF_KEY) || '{}'); } catch { return {}; }
}
export function getPreferredVoice(tag: string): string | null {
  return prefs()[tag.toLowerCase()] ?? null;
}
export function setPreferredVoice(tag: string, id: string | null) {
  try {
    const p = prefs(); if (id) p[tag.toLowerCase()] = id; else delete p[tag.toLowerCase()];
    localStorage.setItem(PREF_KEY, JSON.stringify(p));
  } catch { /* ignore */ }
}

// ── Android voice list (cached) ──
let nativeList: { voiceURI: string; name: string; lang: string; localService: boolean }[] | null = null;
export async function loadNativeVoices(force = false) {
  if (!isNative) return [];
  if (nativeList && !force) return nativeList;
  try { nativeList = (await TextToSpeech.getSupportedVoices()).voices as typeof nativeList; } catch { nativeList = []; }
  return nativeList!;
}
if (isNative) void loadNativeVoices();

/** Voices for a language, best first */
export function voicesFor(tag: string): VoiceInfo[] {
  const raw = isNative
    ? (nativeList ?? []).map((v, i) => ({ ...v, index: i }))
    : ('speechSynthesis' in window ? window.speechSynthesis.getVoices() : []).map((v, i) => ({ voiceURI: v.voiceURI, name: v.name, lang: v.lang, localService: v.localService, index: i }));
  return raw
    .map((v) => ({ id: v.voiceURI || v.name, name: v.name, lang: norm(v.lang), online: !v.localService, index: v.index, score: scoreVoice(v, tag) }))
    .filter((v) => v.score >= 0)
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
}

/** The voice to use: the family's choice if it is still installed, else the most natural one available now */
export function bestVoice(tag: string): VoiceInfo | null {
  const list = voicesFor(tag);
  if (!list.length) return null;
  const chosen = getPreferredVoice(tag);
  const pick = chosen ? list.find((v) => v.id === chosen) : undefined;
  if (pick) return pick;
  const offline = typeof navigator !== 'undefined' && navigator.onLine === false;
  return (offline ? list.find((v) => !v.online) : undefined) ?? list[0];
}

/** Friendlier label for a voice name: "Microsoft Elvira Online (Natural) - Spanish (Spain)" → "Elvira (Natural)" */
export function voiceLabel(v: VoiceInfo): string {
  let n = v.name;
  if (isNative) {
    // Android names look like "es-es-x-eed-network": show the code and the type
    const m = v.id.match(/-x-([a-z]+)-(network|local)/);
    if (m) return `${m[1].toUpperCase()}`;
  }
  n = n.replace(/^(Microsoft|Google|Apple)\s+/i, '').replace(/\s+-\s+.*$/, '').replace(/\bOnline\b\s*/i, '').trim();
  return n || v.name;
}
