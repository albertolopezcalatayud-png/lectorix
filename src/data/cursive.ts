/**
 * Joined handwriting (letra ligada / lletra lligada / joined-up): lowercase letters that link into words in one
 * stroke, as taught in Primary. Own drawings for Lectorix, in the same box as data/strokes.ts
 * (x-height 40-70, ascender 10, descender 95).
 *
 * Each letter has a "core" path that starts where the joining stroke from the previous letter arrives (its first
 * point) and ends at its exit point, low (on the way up from the baseline) or high (o, b, v, w leave from the top).
 * A word is one continuous stroke: lead-in from the baseline, then each core joined to the next by a short curve.
 * Dots, crosses and accents are extra strokes made after the word, as at school.
 */
import type { Glyph } from './strokes';

interface CLetter { w: number; core: string; extras?: string[] }

const r = (n: number) => Math.round(n * 100) / 100;
/** Ellipse arc as SVG (degrees, 0 = right, 90 = top; rising = anticlockwise), without the leading move */
function arcTo(cx: number, cy: number, rx: number, ry: number, from: number, to: number) {
  const steps = Math.max(1, Math.ceil(Math.abs(to - from) / 90)); const sweep = to > from ? 0 : 1; let d = '';
  for (let i = 1; i <= steps; i++) {
    const a = ((from + ((to - from) * i) / steps) * Math.PI) / 180;
    d += ` A${rx} ${ry} 0 0 ${sweep} ${r(cx + rx * Math.cos(a))} ${r(cy - ry * Math.sin(a))}`;
  }
  return d;
}
const at = (cx: number, cy: number, rx: number, ry: number, deg: number) => { const a = (deg * Math.PI) / 180; return `${r(cx + rx * Math.cos(a))} ${r(cy - ry * Math.sin(a))}`; };
/** The oval of a, d, g, q: starts at its top right and goes round anticlockwise */
const oval = (cx = 15, rx = 10) => `M${at(cx, 55, rx, 14, 50)}${arcTo(cx, 55, rx, 14, 50, 410)}`;
const LOW = (x: number) => ` Q${x - 8} 71 ${x} 62`;           // from the bottom of a stem, up to the exit
const LOOP_UP = 'C14 46 19 24 15 13 C12 6 5 11 6 24';           // the loop of l, b, h, k, f going up and back down

const LETTERS: Record<string, CLetter> = {
  a: { w: 34, core: `${oval()} L25.5 41 L25.5 63${LOW(34)}` },
  b: { w: 30, core: `M3 56 ${LOOP_UP} L6 62 C7 72 22 72 21 55 C20 45 12 44 13 49 C15 50 22 45 30 44` },
  // c: up to the top, a small hook, then round to the left and down (without the hook it reads as an e)
  c: { w: 28, core: 'M8 48 C10 42 17 39 19 43 C21 47 15 47 15 43 C10 41 4 46 4 56 C4 68 15 73 28 62' },
  d: { w: 34, core: `${oval()} L25.5 10 L25.5 63${LOW(34)}` },
  e: { w: 28, core: 'M3 59 C12 58 21 52 18 45 C15 38 4 42 4 55 C4 68 15 73 28 62' },
  f: { w: 26, core: `M3 56 ${LOOP_UP} L6 88 C6 98 -2 96 2 86 C6 75 15 67 26 62` },
  g: { w: 34, core: `${oval()} L25.5 41 L25.5 86 C25.5 98 12 98 14 87 C16 76 25 67 34 62` },
  h: { w: 32, core: `M3 56 ${LOOP_UP} L6 70 L6 57 C8 45 23 40 23 54 L23 63${LOW(32)}` },
  i: { w: 18, core: `M7 41 L7 63${LOW(18)}`, extras: ['M7 28 L7 28.5'] },
  j: { w: 24, core: 'M9 41 L9 86 C9 98 -3 98 0 87 C3 76 13 67 24 62', extras: ['M9 28 L9 28.5'] },
  k: { w: 32, core: `M3 56 ${LOOP_UP} L6 70 L6 58 C10 44 24 42 21 52 C19 57 12 58 9 57 C17 58 19 70 32 62` },
  l: { w: 22, core: `M3 56 ${LOOP_UP} L6 63${LOW(22)}` },
  m: { w: 48, core: `M3 52 C5 45 10 41 10 48 L10 70 L10 58 C12 45 24 41 24 52 L24 70 L24 58 C26 45 38 41 38 54 L38 63${LOW(48)}` },
  n: { w: 34, core: `M3 52 C5 45 10 41 10 48 L10 70 L10 58 C12 45 25 41 25 54 L25 63${LOW(34)}` },
  o: { w: 28, core: `M${at(14, 55, 10, 14, 75)}${arcTo(14, 55, 10, 14, 75, 435)} C17 46 22 44 28 44` },
  p: { w: 32, core: 'M6 41 L6 94 L6 57 C8 45 23 40 23 55 C23 68 12 72 8 66 C14 68 22 66 32 62' },
  q: { w: 34, core: `${oval()} L25.5 41 L25.5 92 C25.5 99 32 96 31 88 C30 78 28 68 34 62` },
  r: { w: 28, core: 'M3 50 L9 41 C10 47 12 47 19 43 C17 50 17 56 17 63 Q18 70 28 62' },
  s: { w: 26, core: 'M3 60 L12 41 C19 50 22 60 17 67 C13 72 5 70 6 66 C12 68 18 68 26 62' },
  t: { w: 22, core: `M8 16 L8 63${LOW(22)}`, extras: ['M2 38 L17 38'] },
  u: { w: 32, core: 'M5 41 L5 60 C5 72 22 72 22 56 L22 41 L22 63 Q24 71 32 62' },
  v: { w: 28, core: 'M3 48 C5 42 9 40 9 46 L13 70 L21 41 C23 45 25 44 28 44' },
  w: { w: 40, core: 'M3 48 C5 42 9 40 9 46 L12 70 L19 47 L26 70 L31 41 C33 45 36 44 40 44' },
  x: { w: 30, core: 'M3 48 C5 42 11 40 13 46 L18 63 Q20 71 30 62', extras: ['M23 42 L9 69'] },
  y: { w: 32, core: 'M5 41 L5 60 C5 72 22 72 22 56 L22 41 L22 86 C22 98 9 98 11 87 C13 76 22 67 32 62' },
  z: { w: 28, core: 'M3 45 C8 40 16 40 21 42 L7 67 C12 63 19 63 20 70 C21 74 24 66 28 62' },
};
LETTERS.ñ = { ...LETTERS.n, extras: ['M9 31 Q15 25 20 29 T31 27'] };
LETTERS.ç = { ...LETTERS.c, extras: ['M12 71 L14 76 Q20 78 16 83 L9 84'] };

/** Accents and dots added over a vowel: acute, grave, diaeresis */
const ACCENT: Record<string, [string, string[]]> = {
  á: ['a', ['M15 35 L21 28']], é: ['e', ['M10 35 L16 28']], í: ['i', ['M5 35 L11 28']], ó: ['o', ['M12 35 L18 28']], ú: ['u', ['M12 35 L18 28']],
  à: ['a', ['M13 28 L19 35']], è: ['e', ['M8 28 L14 35']], ò: ['o', ['M10 28 L16 35']],
  ü: ['u', ['M9 31 L9 31.5', 'M18 31 L18 31.5']], ï: ['i', ['M4 31 L4 31.5', 'M10 31 L10 31.5']],
};

export const CURSIVE_CHARS = Object.keys(LETTERS).concat(Object.keys(ACCENT));
export const hasCursive = (ch: string) => ch in LETTERS || ch in ACCENT;

/** Moves an absolute SVG path (M L Q T C A only, as written here) dx units to the right */
export function shiftPath(d: string, dx: number): string {
  if (!dx) return d;
  const out: string[] = [];
  for (const m of d.matchAll(/([MLQTCA])([^MLQTCA]*)/g)) {
    const n = m[2].trim().split(/[\s,]+/).filter(Boolean).map(Number);
    if (m[1] === 'A') { for (let i = 0; i < n.length; i += 7) n[i + 5] = r(n[i + 5] + dx); }
    else for (let i = 0; i < n.length; i += 2) n[i] = r(n[i] + dx);
    out.push(m[1] + n.join(' '));
  }
  return out.join(' ');
}
const firstPoint = (d: string) => { const m = /^M\s*([\d.-]+)[\s,]+([\d.-]+)/.exec(d)!; return [Number(m[1]), Number(m[2])] as const; };
const lastPoint = (d: string) => { const n = d.trim().split(/[\sA-Z,]+/).filter(Boolean).map(Number); return [n[n.length - 2], n[n.length - 1]] as const; };

/**
 * A word (lowercase letters this file knows) in joined handwriting: the first stroke is the whole word, then
 * the extras. Letters it does not know end the joined stroke there (the word goes on after a small gap).
 */
export function cursiveWord(word: string): Glyph | null {
  const chars = [...word.toLowerCase()].filter((c) => c.trim());
  if (!chars.length || !chars.every(hasCursive)) return null;
  let x = 6; let main = ''; let prev: readonly [number, number] = [0, 70];
  const extras: string[] = [];
  for (const ch of chars) {
    const [base, acc] = ch in ACCENT ? ACCENT[ch] : [ch, []];
    const L = LETTERS[base];
    const core = shiftPath(L.core, x);
    const [px, py] = firstPoint(core);
    // joining stroke: leaves the exit going right, arrives at the start of the next letter
    const join = ` C${r(prev[0] + (px - prev[0]) * 0.5)} ${prev[1]} ${r(px - (px - prev[0]) * 0.25)} ${r(py + (prev[1] - py) * 0.35)} ${px} ${py}`;
    main += (main ? '' : `M${prev[0]} ${prev[1]}`) + join + core.replace(/^M[\d.-]+ [\d.-]+/, '');
    prev = lastPoint(core);
    // an accent on i replaces its dot
    for (const e of [...(acc.length && base === 'i' ? [] : L.extras ?? []), ...acc]) extras.push(shiftPath(e, x));
    x += L.w;
  }
  return { id: `c-${chars.join('')}`, char: chars.join(''), w: x + 2, strokes: [main.replace(/\s+/g, ' ').trim(), ...extras] };
}
