/**
 * Lectorix Text-to-Speech Service
 * Uses the Web Speech API (SpeechSynthesis) to read text aloud.
 * Essential for a reading/writing app — helps students hear words,
 * prompts, and passages they're working with.
 */

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
    return stored ? parseFloat(stored) : 0.85; // slightly slower than default for kids
  } catch {
    return 0.85;
  }
}

export function setTTSRate(rate: number) {
  try {
    localStorage.setItem(RATE_KEY, String(Math.max(0.5, Math.min(1.5, rate))));
  } catch {
    // ignore
  }
}

// ── Core TTS ─────────────────────────────────────────────

/** Check if the browser supports speech synthesis */
export function isTTSAvailable(): boolean {
  return 'speechSynthesis' in window;
}

/** Stop any currently playing speech */
export function stopSpeaking() {
  if (isTTSAvailable()) {
    window.speechSynthesis.cancel();
  }
}

/** Get the best Spanish voice available */
function getSpanishVoice(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();

  // Prefer es-ES voices, then any es- variant
  const esES = voices.find(
    (v) => v.lang === 'es-ES' && (v.localService || v.name.toLowerCase().includes('google'))
  );
  if (esES) return esES;

  const anySpanish = voices.find((v) => v.lang.startsWith('es'));
  if (anySpanish) return anySpanish;

  return null;
}

/**
 * Speak text aloud in Spanish.
 * Returns a promise that resolves when speaking finishes.
 */
export function speak(text: string, options?: { rate?: number; pitch?: number }): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!isTTSAvailable() || !isTTSEnabled()) {
      resolve();
      return;
    }

    // Cancel any ongoing speech
    stopSpeaking();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES';
    utterance.rate = options?.rate ?? getTTSRate();
    utterance.pitch = options?.pitch ?? 1.0;
    utterance.volume = 1.0;

    const voice = getSpanishVoice();
    if (voice) {
      utterance.voice = voice;
    }

    utterance.onend = () => resolve();
    utterance.onerror = (e) => {
      // Don't reject on "interrupted" — it just means new speech started
      if (e.error === 'interrupted' || e.error === 'canceled') {
        resolve();
      } else {
        reject(e);
      }
    };

    window.speechSynthesis.speak(utterance);
  });
}

/**
 * Speak a word slowly, syllable by syllable.
 * Useful for phonology exercises.
 */
export async function speakSyllables(syllables: string[], delayMs = 400): Promise<void> {
  if (!isTTSAvailable() || !isTTSEnabled()) return;

  for (let i = 0; i < syllables.length; i++) {
    await speak(syllables[i], { rate: 0.6 });
    if (i < syllables.length - 1) {
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
}

/**
 * Read a passage aloud at a comfortable pace.
 */
export function speakPassage(text: string): Promise<void> {
  return speak(text, { rate: getTTSRate() * 0.9 }); // slightly slower for passages
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
    await speak(word[i], { rate: 0.7 });
    if (i < word.length - 1) {
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
}

// ── Initialize voices ────────────────────────────────────
// Voices load asynchronously in some browsers
if (isTTSAvailable()) {
  window.speechSynthesis.getVoices();
  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.getVoices();
    };
  }
}

const tts = {
  speak,
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
};

export default tts;
