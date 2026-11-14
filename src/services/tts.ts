/**
 * Lectorix Text-to-Speech Service
 * Uses the Web Speech API (SpeechSynthesis) to read text aloud.
 * Essential for a reading/writing app — helps students hear words,
 * prompts, and passages they're working with.
 */

import { isNative, nativeHas, nativeSpeak, nativeSpeakTracked, nativeStop, nativeCheck } from './nativeTts';
import { bestVoice } from './voices';
import { playClip, stopClip, preloadClips } from './clips';

const STORAGE_KEY = 'lectorix-tts-enabled';
const RATE_KEY = 'lectorix-tts-rate';

// ── Settings ─────────────────────────────────────────────

export function isTTSEnabled(): boolean {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored !== 'false'; // enabled by default
  } catch {
    return true;
  }
}

export function setTTSEnabled(enabled: boolean) {
  try {
    localStorage.setItem(STORAGE_KEY, String(enabled));
  } catch {
    // ignore
  }
}

export function getTTSRate(): number {
  try {
    const stored = localStorage.getItem(RATE_KEY);
    return stored ? parseFloat(stored) : 0.92; // a touch slower than normal, still natural
  } catch {
    return 0.92;
  }
}

export function setTTSRate(rate: number) {
  try {
    localStorage.setItem(RATE_KEY, String(Math.max(0.5, Math.min(1.5, rate))));
  } catch {
    // ignore
  }
}

/**
 * Very slow rates make every engine sound robotic (vowels get stretched and the melody breaks).
 * Slow listening is kept, but never below this; slower help comes from pauses between pieces instead.
 */
const MIN_RATE = 0.72;
export const natural = (rate: number) => Math.max(MIN_RATE, rate);

// ── Core TTS ─────────────────────────────────────────────

/** Check if the browser supports speech synthesis */
export function isTTSAvailable(): boolean {
  return isNative || 'speechSynthesis' in window;
}

/** Stop any currently playing speech */
export function stopSpeaking() {
  stopClip();
  if (isNative) {
    void nativeStop();
    return;
  }
  if (isTTSAvailable()) {
    window.speechSynthesis.cancel();
  }
}

// ── Language of speech (follows the practice language) ───

export type SpeechLang = 'es' | 'ca' | 'en';
const BCP47: Record<SpeechLang, string> = { es: 'es-ES', ca: 'ca-ES', en: 'en-GB' };
let speechLang: SpeechLang = 'es';

export function setSpeechLang(lang: SpeechLang) {
  speechLang = lang;
  preloadClips(lang);
}

export function getSpeechLang(): SpeechLang {
  return speechLang;
}

/**
 * Best installed voice for a BCP-47 tag (es-ES, ca-ES, en-GB…).
 * Valencian prefers a voice labelled as Valencian when the device has one, then any Catalan voice;
 * English prefers British voices. null when no voice for that language is installed.
 */
export function pickVoice(tag: string): SpeechSynthesisVoice | null {
  if (!('speechSynthesis' in window)) return null;
  const best = bestVoice(tag);
  if (!best) return null;
  return window.speechSynthesis.getVoices().find((v) => (v.voiceURI || v.name) === best.id) ?? null;
}

/** Android: index of the chosen voice in the engine's list (undefined = the engine's default for the language) */
function nativeVoice(tag: string): number | undefined {
  return bestVoice(tag)?.index;
}

function getVoiceFor(lang: SpeechLang): SpeechSynthesisVoice | null {
  return pickVoice(BCP47[lang]);
}

/**
 * The device has voices, but none for this language: speaking would make another language's
 * voice read the text (a Spanish voice reading Valencian teaches the wrong sounds).
 * In that case Lectorix stays silent and tells the family once how to install the voice.
 */
const warned = new Set<string>();
function missingVoice(tag: string): boolean {
  let missing = false;
  if (isNative) missing = !nativeHas(tag);
  else if ('speechSynthesis' in window) {
    const all = window.speechSynthesis.getVoices();
    missing = all.length > 0 && pickVoice(tag) === null;
  }
  if (missing && !warned.has(tag)) {
    warned.add(tag);
    try { window.dispatchEvent(new CustomEvent('lectorix:novoice', { detail: { tag } })); } catch { /* ignore */ }
  }
  return missing;
}

/** true when the device has a voice for the language (false while voices are still loading) */
export function hasVoiceFor(lang: SpeechLang): boolean {
  if (isNative) return nativeHas(BCP47[lang]);
  if (!isTTSAvailable()) return false;
  return getVoiceFor(lang) !== null;
}

/**
 * Speak text aloud in the current practice language.
 * Returns a promise that resolves when speaking finishes.
 */
function deviceSpeak(text: string, options?: { rate?: number; pitch?: number }): Promise<void> {
  return new Promise((resolve) => {
    if (!isTTSAvailable() || !isTTSEnabled()) {
      resolve();
      return;
    }

    if (missingVoice(BCP47[speechLang])) {
      resolve();
      return;
    }

    if (isNative) {
      void nativeSpeak(text, BCP47[speechLang], natural(options?.rate ?? getTTSRate()), options?.pitch ?? 1, nativeVoice(BCP47[speechLang])).then(() => resolve());
      return;
    }

    // Cancel any ongoing speech
    stopSpeaking();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = BCP47[speechLang];
    utterance.rate = natural(options?.rate ?? getTTSRate());
    utterance.pitch = options?.pitch ?? 1.0;
    utterance.volume = 1.0;

    const voice = getVoiceFor(speechLang);
    if (voice) {
      utterance.voice = voice;
    }

    utterance.onend = () => resolve();
    utterance.onerror = (e) => {
      // Don't reject on "interrupted" — it just means new speech started
      // Never break the exercise because of a voice problem (e.g. no voices installed)
      void e;
      resolve();
    };

    window.speechSynthesis.speak(utterance);
  });
}

// Keep a reference so the utterance isn't garbage-collected mid-speech (Chrome bug)
let trackedUtterance: SpeechSynthesisUtterance | null = null;

export interface TrackedResult {
  /** false when the voice failed (no voices installed, engine error) */
  ok: boolean;
  /** true when the engine reported word boundaries for this utterance */
  boundaries: boolean;
  /** true when it was stopped on purpose (pause, new speech) */
  interrupted: boolean;
}

/**
 * Speak text and report the character index of each word as it is spoken.
 * Not every engine fires word boundaries (e.g. Chrome's online Google voices),
 * so callers must be ready to estimate timing when `boundaries` stays false.
 */
function deviceSpeakTracked(
  text: string,
  options: { rate?: number; onStart?: () => void; onWord?: (charIndex: number) => void } = {},
): Promise<TrackedResult> {
  return new Promise((resolve) => {
    if (!isTTSAvailable() || !isTTSEnabled()) {
      resolve({ ok: false, boundaries: false, interrupted: false });
      return;
    }
    if (missingVoice(BCP47[speechLang])) {
      resolve({ ok: false, boundaries: false, interrupted: false });
      return;
    }
    if (isNative) {
      void nativeSpeakTracked(text, BCP47[speechLang], natural(options.rate ?? getTTSRate()), options.onStart, options.onWord, nativeVoice(BCP47[speechLang])).then(resolve);
      return;
    }
    stopSpeaking();

    let boundaries = false;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = BCP47[speechLang];
    u.rate = natural(options.rate ?? getTTSRate());
    const voice = getVoiceFor(speechLang);
    if (voice) u.voice = voice;

    u.onstart = () => options.onStart?.();
    u.onboundary = (e) => {
      if (e.name && e.name !== 'word') return;
      boundaries = true;
      options.onWord?.(e.charIndex);
    };
    u.onend = () => {
      if (trackedUtterance === u) trackedUtterance = null;
      resolve({ ok: true, boundaries, interrupted: false });
    };
    u.onerror = (e) => {
      if (trackedUtterance === u) trackedUtterance = null;
      const interrupted = e.error === 'interrupted' || e.error === 'canceled';
      resolve({ ok: interrupted, boundaries, interrupted });
    };

    trackedUtterance = u;
    window.speechSynthesis.speak(u);
  });
}

/** Rough syllable count (vowel groups), used to estimate speech timing */
export function estimateSyllables(word: string): number {
  const groups = word.toLowerCase().match(/[aeiouáéíóúàèòïüy]+/g);
  return Math.max(1, groups ? groups.length : 1);
}

/**
 * Speak a word slowly, syllable by syllable.
 * Useful for phonology exercises.
 */
export async function speakSyllables(syllables: string[], delayMs = 550): Promise<void> {
  if (!isTTSAvailable() || !isTTSEnabled()) return;

  for (let i = 0; i < syllables.length; i++) {
    await speak(syllables[i], { rate: 0.8 });
    if (i < syllables.length - 1) {
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
}

/**
 * Read a passage aloud at a comfortable pace.
 */
export function speakPassage(text: string): Promise<void> {
  return speak(text, { rate: getTTSRate() });
}

/**
 * Read a prompt/question aloud.
 */
export function speakPrompt(text: string): Promise<void> {
  return speak(text, { rate: getTTSRate() });
}

/**
 * Spell out a word letter by letter.
 */
export async function spellWord(word: string, delayMs = 350): Promise<void> {
  if (!isTTSAvailable() || !isTTSEnabled()) return;

  for (let i = 0; i < word.length; i++) {
    await speak(word[i], { rate: 0.85 });
    if (i < word.length - 1) {
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
}

/** Speak in any language tag (used by the family panel). Resolves when finished. */
function deviceSpeakIn(text: string, tag: string, rate = 0.9): Promise<void> {
  if (missingVoice(tag)) return Promise.resolve();
  if (isNative) return nativeSpeak(text, tag, natural(rate), 1, nativeVoice(tag)).then(() => undefined);
  return new Promise((resolve) => {
    if (!('speechSynthesis' in window)) return resolve();
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = tag;
    const v = pickVoice(tag);
    if (v) u.voice = v;
    u.rate = natural(rate);
    u.onend = () => resolve();
    u.onerror = () => resolve();
    window.speechSynthesis.speak(u);
  });
}

// ── Natural-voice clips first, then the device's voice ─────
// A clip generated in advance with a neural voice is used when it exists for exactly this text.

export async function speak(text: string, options?: { rate?: number; pitch?: number }): Promise<void> {
  if (!isTTSEnabled()) return;
  stopSpeaking();
  const r = await playClip(speechLang, text, options?.rate ?? getTTSRate());
  if (r) return;
  return deviceSpeak(text, options);
}

export async function speakTracked(
  text: string,
  options: { rate?: number; onStart?: () => void; onWord?: (charIndex: number) => void } = {},
): Promise<TrackedResult> {
  if (isTTSEnabled()) {
    stopSpeaking();
    const r = await playClip(speechLang, text, options.rate ?? getTTSRate(), { onStart: options.onStart, onWord: options.onWord });
    if (r) return { ok: true, boundaries: true, interrupted: r.interrupted };
  }
  return deviceSpeakTracked(text, options);
}

/** Speak in any language tag (used by the family panel and pages with their own language). Resolves when finished. */
export async function speakIn(text: string, tag: string, rate = 0.9): Promise<void> {
  stopSpeaking();
  const r = await playClip(tag.split('-')[0].toLowerCase(), text, rate);
  if (r) return;
  return deviceSpeakIn(text, tag, rate);
}

/** Whether a language tag can be spoken on this device (async, waits for voices) */
export async function canSpeak(tag: string): Promise<boolean> {
  if (isNative) return nativeCheck(tag);
  if (!('speechSynthesis' in window)) return false;
  const base = tag.split('-')[0].toLowerCase();
  const find = () => window.speechSynthesis.getVoices().some((v) => v.lang.toLowerCase().replace('_', '-').startsWith(base));
  if (window.speechSynthesis.getVoices().length) return find();
  await new Promise((r) => setTimeout(r, 1200));
  return find();
}

// ── Initialize voices ────────────────────────────────────
// Voices load asynchronously in some browsers
if (!isNative && isTTSAvailable()) {
  window.speechSynthesis.getVoices();
  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.getVoices();
    };
  }
}

const tts = {
  speak,
  speakTracked,
  speakSyllables,
  speakPassage,
  speakPrompt,
  spellWord,
  stop: stopSpeaking,
  isAvailable: isTTSAvailable,
  isEnabled: isTTSEnabled,
  setEnabled: setTTSEnabled,
  getRate: getTTSRate,
  setRate: setTTSRate,
  setLang: setSpeechLang,
  hasVoiceFor,
  speakIn,
  canSpeak,
};

export default tts;
