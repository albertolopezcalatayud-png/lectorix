/**
 * Letter tracing ("Trazo"): models of how each letter is written, stroke by stroke, in the order and direction
 * taught at school (print letters). Own data, drawn for Lectorix: no font is copied.
 *
 * Coordinates: a box 100 units high. Guide lines (four-line pauta): ascender/capital top 10, x-height 40,
 * baseline 70, descender 95. Each glyph has its width and its strokes as SVG path data; the start of each path
 * is where the child starts, and the path runs in the direction the stroke is written.
 */
export type Lang = 'es' | 'ca' | 'en';

export const LINES = { top: 10, mid: 40, base: 70, desc: 95 } as const;

export interface Glyph { id: string; char: string; w: number; strokes: string[] }

const f = (n: number) => Math.round(n * 100) / 100;
const pt = (cx: number, cy: number, rx: number, ry: number, deg: number) => {
  const a = (deg * Math.PI) / 180;
  return [f(cx + rx * Math.cos(a)), f(cy - ry * Math.sin(a))] as const;
};
/** Arc of an ellipse from one angle to another (degrees, 0 = right, 90 = top). Rising angle = anticlockwise. */
function arc(cx: number, cy: number, rx: number, ry: number, from: number, to: number, move = true) {
  const steps = Math.max(1, Math.ceil(Math.abs(to - from) / 90));
  const sweep = to > from ? 0 : 1; // SVG sweep 1 = clockwise on screen
  let d = '';
  if (move) { const [x, y] = pt(cx, cy, rx, ry, from); d += `M${x} ${y}`; }
  for (let i = 1; i <= steps; i++) {
    const [x, y] = pt(cx, cy, rx, ry, from + ((to - from) * i) / steps);
    d += ` A${rx} ${ry} 0 0 ${sweep} ${x} ${y}`;
  }
  return d;
}
/** Straight lines through the points */
const line = (...p: number[]) => {
  let d = `M${p[0]} ${p[1]}`;
  for (let i = 2; i < p.length; i += 2) d += ` L${p[i]} ${p[i + 1]}`;
  return d;
};
/** Continue a path (drops the leading M of the next part) */
const then = (...parts: string[]) => parts.map((s, i) => (i ? s.replace(/^M[\d.-]+ [\d.-]+/, '') : s)).join(' ').replace(/\s+/g, ' ').trim();
const dot = (x: number, y: number) => `M${x} ${y} L${x} ${y + 0.5}`;

const LOWER: Record<string, [number, string[]]> = {
  a: [40, [arc(20, 55, 15, 15, 45, 405), line(35, 40, 35, 70)]],
  b: [40, [line(5, 10, 5, 70), arc(20, 55, 15, 15, 180, -180)]],
  c: [36, [arc(20, 55, 15, 15, 45, 315)]],
  d: [40, [arc(20, 55, 15, 15, 45, 405), line(35, 10, 35, 70)]],
  e: [40, [then(line(5, 55, 35, 55), arc(20, 55, 15, 15, 0, 315))]],
  f: [34, [then(arc(26, 20, 9, 9, 30, 180), line(17, 20, 17, 70)), line(7, 40, 29, 40)]],
  g: [40, [arc(20, 55, 15, 15, 45, 405), then(line(35, 40, 35, 85), arc(25, 85, 10, 10, 0, -170))]],
  h: [40, [line(5, 10, 5, 70), then(arc(20, 52, 15, 15, 180, 0), line(35, 52, 35, 70))]],
  i: [24, [line(12, 40, 12, 70), dot(12, 28)]],
  j: [28, [then(line(20, 40, 20, 85), arc(10, 85, 10, 10, 0, -170)), dot(20, 28)]],
  k: [38, [line(5, 10, 5, 70), line(32, 40, 6, 58, 33, 70)]],
  l: [20, [line(10, 10, 10, 70)]],
  m: [46, [line(5, 40, 5, 70), then(arc(14, 52, 9, 9, 180, 0), line(23, 52, 23, 70)), then(arc(32, 52, 9, 9, 180, 0), line(41, 52, 41, 70))]],
  n: [40, [line(5, 40, 5, 70), then(arc(20, 52, 15, 15, 180, 0), line(35, 52, 35, 70))]],
  ñ: [40, [line(5, 40, 5, 70), then(arc(20, 52, 15, 15, 180, 0), line(35, 52, 35, 70)), 'M8 31 Q14 24 20 29 T32 27']],
  o: [40, [arc(20, 55, 15, 15, 90, 450)]],
  p: [40, [line(5, 40, 5, 95), arc(20, 55, 15, 15, 180, -180)]],
  q: [40, [arc(20, 55, 15, 15, 45, 405), line(35, 40, 35, 95)]],
  r: [32, [line(5, 40, 5, 70), arc(17, 52, 12, 12, 180, 45)]],
  s: [40, [then(arc(20, 47.5, 12, 7.5, 20, 270), arc(20, 62.5, 12, 7.5, 90, -160))]],
  t: [36, [then(line(17, 22, 17, 62), arc(25, 62, 8, 8, 180, 330)), line(7, 40, 29, 40)]],
  u: [40, [then(line(5, 40, 5, 55), arc(20, 55, 15, 15, 180, 360)), line(35, 40, 35, 70)]],
  v: [40, [line(5, 40, 20, 70, 35, 40)]],
  w: [48, [line(4, 40, 14, 70, 24, 45, 34, 70, 44, 40)]],
  x: [40, [line(7, 40, 33, 70), line(33, 40, 7, 70)]],
  y: [40, [line(5, 40, 20, 70), line(35, 40, 12, 95)]],
  z: [40, [line(6, 40, 34, 40, 6, 70, 34, 70)]],
  ç: [36, [arc(20, 55, 15, 15, 45, 315), 'M20 70 L22 76 Q28 78 24 83 L16 84']],
};

const UPPER: Record<string, [number, string[]]> = {
  A: [50, [line(5, 70, 25, 10, 45, 70), line(12, 48, 38, 48)]],
  B: [44, [line(5, 10, 5, 70), then(line(5, 10, 20, 10), arc(20, 24, 14, 14, 90, -90), line(20, 38, 5, 38)), then(line(5, 38, 22, 38), arc(22, 54, 16, 16, 90, -90), line(22, 70, 5, 70))]],
  C: [52, [arc(30, 40, 25, 30, 45, 315)]],
  D: [48, [line(5, 10, 5, 70), then(line(5, 10, 15, 10), arc(15, 40, 28, 30, 90, -90), line(15, 70, 5, 70))]],
  E: [42, [line(5, 10, 5, 70), line(5, 10, 38, 10), line(5, 40, 32, 40), line(5, 70, 38, 70)]],
  F: [40, [line(5, 10, 5, 70), line(5, 10, 36, 10), line(5, 40, 30, 40)]],
  G: [56, [then(arc(30, 40, 25, 30, 45, 330), line(51.65, 55, 51.65, 44, 34, 44))]],
  H: [46, [line(5, 10, 5, 70), line(40, 10, 40, 70), line(5, 40, 40, 40)]],
  I: [20, [line(10, 10, 10, 70)]],
  J: [36, [then(line(30, 10, 30, 55), arc(17, 55, 13, 13, 0, -180))]],
  K: [44, [line(5, 10, 5, 70), line(38, 10, 6, 42, 40, 70)]],
  L: [40, [line(5, 10, 5, 70, 35, 70)]],
  M: [54, [line(5, 70, 5, 10, 27, 50, 49, 10, 49, 70)]],
  N: [46, [line(5, 70, 5, 10, 40, 70, 40, 10)]],
  Ñ: [46, [line(5, 70, 5, 10, 40, 70, 40, 10), 'M10 5 Q16 -1 22 4 T34 2']],
  O: [60, [arc(30, 40, 25, 30, 90, 450)]],
  P: [42, [line(5, 10, 5, 70), then(line(5, 10, 20, 10), arc(20, 25, 15, 15, 90, -90), line(20, 40, 5, 40))]],
  Q: [60, [arc(30, 40, 25, 30, 90, 450), line(34, 52, 52, 72)]],
  R: [44, [line(5, 10, 5, 70), then(line(5, 10, 20, 10), arc(20, 25, 15, 15, 90, -90), line(20, 40, 5, 40)), line(18, 40, 40, 70)]],
  S: [50, [then(arc(25, 25, 18, 15, 30, 270), arc(25, 55, 18, 15, 90, -150))]],
  T: [50, [line(5, 10, 45, 10), line(25, 10, 25, 70)]],
  U: [46, [then(line(5, 10, 5, 48), arc(22.5, 48, 17.5, 22, 180, 360), line(40, 48, 40, 10))]],
  V: [50, [line(5, 10, 25, 70, 45, 10)]],
  W: [58, [line(4, 10, 16, 70, 29, 25, 42, 70, 54, 10)]],
  X: [48, [line(5, 10, 42, 70), line(42, 10, 5, 70)]],
  Y: [46, [line(5, 10, 23, 40, 23, 70), line(41, 10, 23, 40)]],
  Z: [46, [line(5, 10, 40, 10, 5, 70, 40, 70)]],
  Ç: [52, [arc(30, 40, 25, 30, 45, 315), 'M30 70 L32 76 Q38 78 34 83 L26 84']],
};

const DIGITS: Record<string, [number, string[]]> = {
  '0': [44, [arc(22, 40, 17, 30, 90, 450)]],
  '1': [32, [line(8, 22, 22, 10, 22, 70)]],
  '2': [44, [then(arc(22, 26, 16, 16, 160, -40), line(34.26, 36.28, 5, 70, 40, 70))]],
  '3': [42, [then(arc(20, 25, 14, 14, 150, -90), arc(20, 55, 16, 16, 90, -150))]],
  '4': [46, [line(30, 10, 5, 50, 42, 50), line(32, 30, 32, 70)]],
  '5': [44, [then(line(36, 10, 10, 10, 8.27, 39.27), arc(21, 52, 18, 18, 135, -150))]],
  '6': [44, [then('M34 10 Q10 26 6 52', arc(23, 52, 17, 17, 180, 540))]],
  '7': [44, [line(5, 10, 40, 10, 16, 70)]],
  '8': [44, [then(arc(22, 25, 14, 14, 30, 270), arc(22, 55, 16, 16, 90, -270), arc(22, 25, 14, 14, 270, 390))]],
  '9': [44, [then(arc(22, 28, 16, 16, 0, 360), line(38, 28, 36, 70))]],
};

/** Pre-writing patterns (grafismo): lines, waves, bridges, loops… across a wide box */
function patterns(): Glyph[] {
  const g = (id: string, strokes: string[]): Glyph => ({ id: `g-${id}`, char: '', w: 100, strokes });
  const waves = 'M6 50 Q16 32 26 50 T46 50 T66 50 T86 50';
  let bridges = 'M6 64'; for (let x = 6; x < 86; x += 20) bridges += ` A10 14 0 0 1 ${x + 20} 64`;
  let cups = 'M6 38'; for (let x = 6; x < 86; x += 20) cups += ` A10 14 0 0 0 ${x + 20} 38`;
  let loops = 'M4 66'; for (let x = 4; x < 80; x += 18) loops += ` C${x + 22} 66 ${x + 22} 30 ${x + 12} 30 C${x + 2} 30 ${x + 4} 66 ${x + 18} 66`;
  const zig = line(6, 64, 16, 36, 26, 64, 36, 36, 46, 64, 56, 36, 66, 64, 76, 36, 86, 64);
  const spiral = (() => { let d = ''; for (let i = 0; i <= 3 * 24; i++) { const a = (i / 24) * 2 * Math.PI; const r = 4 + (i / 72) * 26; const [x, y] = [f(50 + r * Math.cos(a)), f(50 - r * Math.sin(a))]; d += (i ? ' L' : 'M') + `${x} ${y}`; } return d; })();
  return [
    g('down', [16, 36, 56, 76].map((x) => line(x, 20, x, 75))),
    g('across', [25, 45, 65].map((y) => line(8, y, 92, y))),
    g('slant', [10, 30, 50, 70].map((x) => line(x, 20, x + 18, 75))),
    g('zigzag', [zig]),
    g('waves', [waves]),
    g('bridges', [bridges]),
    g('cups', [cups]),
    g('circles', [arc(20, 50, 12, 12, 90, 450), arc(50, 50, 12, 12, 90, 450), arc(80, 50, 12, 12, 90, 450)]),
    g('loops', [loops]),
    g('spiral', [spiral]),
  ];
}

const build = (src: Record<string, [number, string[]]>, prefix: string): Record<string, Glyph> =>
  Object.fromEntries(Object.entries(src).map(([c, [w, strokes]]) => [c, { id: `${prefix}-${c}`, char: c, w, strokes }]));
const L = build(LOWER, 'l'); const U = build(UPPER, 'u'); const D = build(DIGITS, 'd');

/** Letters grouped by the movement they share, the order schools usually follow */
const GROUPS_LOWER = ['litj', 'ocadgqe', 'nmhrub', 'p', 'vwxyzk', 'fs'];
const EXTRA: Partial<Record<Lang, string>> = { es: 'ñ', ca: 'ç' };

export type TraceSet = 'patterns' | 'lower' | 'upper' | 'digits';
export function traceSet(set: TraceSet, lang: Lang): Glyph[] {
  const extra = EXTRA[lang] ?? '';
  if (set === 'patterns') return patterns();
  if (set === 'digits') return Object.values(D);
  const order = GROUPS_LOWER.join('') + extra;
  if (set === 'lower') return [...order].map((c) => L[c]);
  return [...order].map((c) => U[c.toUpperCase()]);
}

/** A word that starts with (or contains) the letter, with a picture, to say when the letter is done */
export const EXAMPLES: Record<Lang, Record<string, [string, string]>> = {
  es: { a: ['abeja', '🐝'], b: ['barco', '⛵'], c: ['casa', '🏠'], d: ['dado', '🎲'], e: ['estrella', '⭐'], f: ['foca', '🦭'], g: ['gato', '🐱'], h: ['helado', '🍦'], i: ['isla', '🏝️'], j: ['jirafa', '🦒'], k: ['koala', '🐨'], l: ['luna', '🌙'], m: ['mano', '✋'], n: ['nube', '☁️'], ñ: ['piña', '🍍'], o: ['oso', '🐻'], p: ['pato', '🦆'], q: ['queso', '🧀'], r: ['ratón', '🐭'], s: ['sol', '☀️'], t: ['tomate', '🍅'], u: ['uva', '🍇'], v: ['vaca', '🐄'], w: ['kiwi', '🥝'], x: ['taxi', '🚕'], y: ['yoyó', '🪀'], z: ['zapato', '👟'] },
  ca: { a: ['abella', '🐝'], b: ['barca', '⛵'], c: ['casa', '🏠'], ç: ['braç', '💪'], d: ['dau', '🎲'], e: ['estrela', '⭐'], f: ['foca', '🦭'], g: ['gat', '🐱'], h: ['hipopòtam', '🦛'], i: ['illa', '🏝️'], j: ['joguet', '🧸'], k: ['kiwi', '🥝'], l: ['lluna', '🌙'], m: ['mà', '✋'], n: ['núvol', '☁️'], o: ['ós', '🐻'], p: ['poma', '🍎'], q: ['quadern', '📓'], r: ['ratolí', '🐭'], s: ['sol', '☀️'], t: ['tomaca', '🍅'], u: ['ull', '👁️'], v: ['vaca', '🐄'], w: ['wifi', '📶'], x: ['xocolate', '🍫'], y: ['ioió', '🪀'], z: ['zebra', '🦓'] },
  en: { a: ['apple', '🍎'], b: ['ball', '⚽'], c: ['cat', '🐱'], d: ['dog', '🐶'], e: ['egg', '🥚'], f: ['fish', '🐟'], g: ['goat', '🐐'], h: ['hat', '🎩'], i: ['insect', '🐞'], j: ['juice', '🧃'], k: ['kite', '🪁'], l: ['lion', '🦁'], m: ['moon', '🌙'], n: ['nose', '👃'], o: ['octopus', '🐙'], p: ['pig', '🐷'], q: ['queen', '👑'], r: ['rabbit', '🐰'], s: ['sun', '☀️'], t: ['tree', '🌳'], u: ['umbrella', '☂️'], v: ['van', '🚐'], w: ['whale', '🐳'], x: ['fox', '🦊'], y: ['yo-yo', '🪀'], z: ['zebra', '🦓'] },
};
