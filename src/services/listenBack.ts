/**
 * Listening back to how a word was read (fluency test). Uses the audio kept in memory during the test
 * (voskEngine Recording); nothing is saved or sent anywhere, and it is dropped when the test is left.
 */
import type { Recording } from './voskEngine';

export interface Span { start: number; end: number }

/**
 * Time span of each word of the text, from the matches found by align() (`from`: index of the heard word).
 * Words that were not heard (skipped) get the gap between their neighbours, so the adult can hear what
 * was said there instead (or the neighbours with it, when there is no gap).
 */
export function wordSpans(rec: Recording, from: number[]): (Span | null)[] {
  const own = from.map((k) => (k >= 0 && rec.words[k] ? { start: rec.words[k].start, end: rec.words[k].end } : null));
  return own.map((s, i) => {
    if (s) return s;
    let a = -1, b = -1;
    for (let j = i - 1; j >= 0; j--) if (own[j]) { a = j; break; }
    for (let j = i + 1; j < own.length; j++) if (own[j]) { b = j; break; }
    if (a < 0 || b < 0) return null;
    const start = own[a]!.end, end = own[b]!.start;
    // no room between them (a short word said quickly, or found only by the second listen): play the
    // neighbours too, so it can still be heard in context
    return end - start > 0.15 ? { start, end } : { start: own[a]!.start, end: own[b]!.end };
  });
}

let ctx: AudioContext | null = null;
let playing: AudioBufferSourceNode | null = null;
/** Plays a stretch of the recording (with a little margin so the word is not cut) */
export async function playSpan(rec: Recording, span: Span, margin = 0.12): Promise<void> {
  const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  ctx = ctx ?? new Ctx();
  if (ctx.state === 'suspended') await ctx.resume();
  try { playing?.stop(); } catch { /* already stopped */ }
  const a = Math.max(0, Math.floor((span.start - margin) * rec.rate));
  const b = Math.min(rec.samples.length, Math.ceil((span.end + margin) * rec.rate));
  if (b <= a) return;
  const buf = ctx.createBuffer(1, b - a, rec.rate);
  buf.copyToChannel(rec.samples.slice(a, b), 0);
  const src = ctx.createBufferSource(); src.buffer = buf; src.connect(ctx.destination);
  playing = src;
  await new Promise<void>((res) => { src.onended = () => res(); src.start(); });
}
