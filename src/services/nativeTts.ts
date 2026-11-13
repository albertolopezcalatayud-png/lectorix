/**
 * Native text-to-speech for the Android app (Capacitor).
 * The Android WebView has no Web Speech API, so the app uses the device's
 * TTS engine through a plugin. On the web this module is never used.
 */
import { Capacitor } from '@capacitor/core';
import { TextToSpeech, QueueStrategy } from '@capacitor-community/text-to-speech';

export const isNative = Capacitor.isNativePlatform();

const support = new Map<string, boolean>();
let generation = 0;

/** Ask the engine once whether it can speak a language; cached */
export async function nativeCheck(tag: string): Promise<boolean> {
  if (support.has(tag)) return support.get(tag)!;
  try {
    const { supported } = await TextToSpeech.isLanguageSupported({ lang: tag });
    support.set(tag, supported);
    return supported;
  } catch {
    support.set(tag, false);
    return false;
  }
}

/** Last known answer (optimistic until checked) */
export function nativeHas(tag: string): boolean {
  return support.get(tag) ?? true;
}

export async function nativeStop() {
  generation++;
  try {
    await TextToSpeech.stop();
  } catch {
    // ignore
  }
}

/** Speaks and resolves when finished. ok=false on engine error. */
export async function nativeSpeak(text: string, tag: string, rate = 1, pitch = 1, voice?: number): Promise<{ ok: boolean; interrupted: boolean }> {
  const my = ++generation;
  // Safety net: if the device's voice engine stops answering, never leave the app waiting
  const limit = Math.max(8000, (text.length * 180) / Math.max(0.5, rate));
  try {
    const finished = await Promise.race([
      TextToSpeech.speak({ text, lang: tag, rate, pitch, volume: 1, category: 'playback', queueStrategy: QueueStrategy.Flush, ...(voice != null ? { voice } : {}) }).then(() => true),
      new Promise<boolean>((r) => setTimeout(() => r(false), limit)),
    ]);
    if (!finished) return { ok: false, interrupted: false };
    return { ok: true, interrupted: my !== generation };
  } catch {
    // A chosen voice that cannot speak now (e.g. an online voice without internet): try the engine's default
    if (voice != null && my === generation) return nativeSpeak(text, tag, rate, pitch);
    return { ok: my !== generation, interrupted: my !== generation };
  }
}

export async function nativeSpeakTracked(
  text: string,
  tag: string,
  rate: number,
  onStart?: () => void,
  onWord?: (charIndex: number) => void,
  voice?: number,
): Promise<{ ok: boolean; boundaries: boolean; interrupted: boolean }> {
  let boundaries = false;
  const handle = await TextToSpeech.addListener('onRangeStart', (info) => {
    boundaries = true;
    onWord?.(info.start);
  }).catch(() => null);
  onStart?.();
  const r = await nativeSpeak(text, tag, rate, 1, voice);
  await handle?.remove();
  return { ...r, boundaries };
}

// Warm up the checks for the practice languages
if (isNative) {
  for (const tag of ['es-ES', 'ca-ES', 'en-GB']) void nativeCheck(tag);
}

/** Forget the cached answer (after the family installs a voice) and ask again */
export async function nativeRecheck(tag: string): Promise<boolean> {
  support.delete(tag);
  return nativeCheck(tag);
}

/** Opens Android's screen to download voice data (the TTS engine's own installer) */
export async function nativeOpenInstall(): Promise<boolean> {
  try { await TextToSpeech.openInstall(); return true; } catch { return false; }
}
