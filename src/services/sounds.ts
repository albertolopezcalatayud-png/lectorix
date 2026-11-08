/**
 * Lectorix Sound Effects Service
 * Uses Web Audio API to generate synthesized sounds — no external files needed.
 * All sounds are short, friendly, and kid-appropriate.
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx || audioCtx.state === 'closed') {
    audioCtx = new AudioContext();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// ── Helpers ──────────────────────────────────────────────

function playTone(
  freq: number,
  duration: number,
  type: OscillatorType = 'sine',
  volume = 0.3,
  delay = 0,
) {
  const ctx = getAudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
  gain.gain.setValueAtTime(volume, ctx.currentTime + delay);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(ctx.currentTime + delay);
  osc.stop(ctx.currentTime + delay + duration);
}

function playNoise(duration: number, volume = 0.08, delay = 0) {
  const ctx = getAudioContext();
  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
  }
  const source = ctx.createBufferSource();
  source.buffer = buffer;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(volume, ctx.currentTime + delay);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(800, ctx.currentTime + delay);

  source.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  source.start(ctx.currentTime + delay);
  source.stop(ctx.currentTime + delay + duration);
}

// ── Sound Effects ────────────────────────────────────────

/** Happy chime for correct answers – two ascending notes */
export function playCorrect() {
  playTone(523.25, 0.15, 'sine', 0.25, 0);    // C5
  playTone(659.25, 0.2, 'sine', 0.25, 0.1);    // E5
  playTone(783.99, 0.3, 'sine', 0.2, 0.2);     // G5
}

/** Soft buzz for incorrect answers – gentle descending tone */
export function playIncorrect() {
  playTone(330, 0.15, 'triangle', 0.15, 0);     // E4
  playTone(262, 0.25, 'triangle', 0.12, 0.12);  // C4
}

/** Click sound for button/option selection */
export function playClick() {
  playTone(800, 0.05, 'sine', 0.1, 0);
}

/** Streak sound – quick ascending arpeggio */
export function playStreak() {
  const notes = [523.25, 659.25, 783.99, 1046.5]; // C5 E5 G5 C6
  notes.forEach((freq, i) => {
    playTone(freq, 0.12, 'sine', 0.2, i * 0.07);
  });
}

/** Level up fanfare – triumphant ascending melody */
export function playLevelUp() {
  const melody = [
    { freq: 523.25, dur: 0.12 }, // C5
    { freq: 659.25, dur: 0.12 }, // E5
    { freq: 783.99, dur: 0.12 }, // G5
    { freq: 1046.5, dur: 0.25 }, // C6
    { freq: 783.99, dur: 0.1 },  // G5
    { freq: 1046.5, dur: 0.35 }, // C6
  ];
  let t = 0;
  melody.forEach(({ freq, dur }) => {
    playTone(freq, dur, 'sine', 0.22, t);
    t += dur * 0.75;
  });
}

/** Session complete celebration – warm chord */
export function playComplete() {
  // Play a major chord
  playTone(523.25, 0.5, 'sine', 0.15, 0);   // C5
  playTone(659.25, 0.5, 'sine', 0.12, 0);   // E5
  playTone(783.99, 0.5, 'sine', 0.12, 0);   // G5
  // Add sparkle
  playTone(1046.5, 0.3, 'sine', 0.1, 0.15); // C6
  playTone(1318.5, 0.4, 'sine', 0.08, 0.3); // E6
}

/** Star earned – twinkling sound */
export function playStar() {
  playTone(1318.5, 0.08, 'sine', 0.15, 0);    // E6
  playTone(1568, 0.08, 'sine', 0.15, 0.08);   // G6
  playTone(2093, 0.15, 'sine', 0.12, 0.16);   // C7
  playNoise(0.1, 0.04, 0.16); // sparkle
}

/** XP gained – quick upward sweep */
export function playXP() {
  const ctx = getAudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(400, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.15);
  gain.gain.setValueAtTime(0.12, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.2);
}

/** Navigation / transition whoosh */
export function playWhoosh() {
  playNoise(0.2, 0.06, 0);
}

/** Daily challenge start – energetic intro */
export function playChallengeStart() {
  const notes = [392, 523.25, 659.25, 783.99]; // G4 C5 E5 G5
  notes.forEach((freq, i) => {
    playTone(freq, 0.1, 'square', 0.1, i * 0.06);
  });
  playTone(1046.5, 0.3, 'sine', 0.15, 0.28); // C6 final
}

// ── Settings ─────────────────────────────────────────────

const STORAGE_KEY = 'lectorix-sounds-enabled';

export function isSoundEnabled(): boolean {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored !== 'false'; // enabled by default
  } catch {
    return true;
  }
}

export function setSoundEnabled(enabled: boolean) {
  try {
    localStorage.setItem(STORAGE_KEY, String(enabled));
  } catch {
    // ignore
  }
}

// ── Guarded play functions (respect user setting) ────────

export const sounds = {
  correct: () => isSoundEnabled() && playCorrect(),
  incorrect: () => isSoundEnabled() && playIncorrect(),
  click: () => isSoundEnabled() && playClick(),
  streak: () => isSoundEnabled() && playStreak(),
  levelUp: () => isSoundEnabled() && playLevelUp(),
  complete: () => isSoundEnabled() && playComplete(),
  star: () => isSoundEnabled() && playStar(),
  xp: () => isSoundEnabled() && playXP(),
  whoosh: () => isSoundEnabled() && playWhoosh(),
  challengeStart: () => isSoundEnabled() && playChallengeStart(),
};

export default sounds;
