/**
 * Letters and their simple syllables (sílabas directas / síl·labes directes), in the order Primary usually
 * teaches them. Each family keeps the spelling the child must learn: ca que qui co cu, ga gue gui go gu,
 * za ce ci zo zu (Spanish), ça ce ci ço çu (Valencian)…
 * English has no syllable families here: its letters show the example word (phonics comes separately).
 */
import { EXAMPLES, type Lang } from './strokes';

export interface Family { id: string; letter: string; syllables: string[]; word: [string, string] }

const V_ES = ['a', 'e', 'i', 'o', 'u'];
const fam = (letter: string, syllables: string[] | string, word: [string, string]): Family =>
  ({ id: letter, letter, syllables: typeof syllables === 'string' ? V_ES.map((v) => syllables + v) : syllables, word });

const ES: Family[] = [
  fam('a', ['a'], EXAMPLES.es.a), fam('e', ['e'], EXAMPLES.es.e), fam('i', ['i'], EXAMPLES.es.i), fam('o', ['o'], EXAMPLES.es.o), fam('u', ['u'], EXAMPLES.es.u),
  fam('m', 'm', EXAMPLES.es.m), fam('p', 'p', EXAMPLES.es.p), fam('l', 'l', EXAMPLES.es.l), fam('s', 's', EXAMPLES.es.s),
  fam('t', 't', EXAMPLES.es.t), fam('n', 'n', EXAMPLES.es.n), fam('d', 'd', EXAMPLES.es.d), fam('f', 'f', EXAMPLES.es.f),
  fam('r', 'r', EXAMPLES.es.r), fam('c', ['ca', 'que', 'qui', 'co', 'cu'], EXAMPLES.es.c), fam('b', 'b', EXAMPLES.es.b),
  fam('v', 'v', EXAMPLES.es.v), fam('g', ['ga', 'gue', 'gui', 'go', 'gu'], EXAMPLES.es.g), fam('j', 'j', EXAMPLES.es.j),
  fam('ñ', 'ñ', EXAMPLES.es.ñ), fam('ll', 'll', ['llave', '🔑']), fam('y', 'y', EXAMPLES.es.y), fam('ch', 'ch', ['chocolate', '🍫']),
  fam('z', ['za', 'ce', 'ci', 'zo', 'zu'], EXAMPLES.es.z), fam('h', 'h', EXAMPLES.es.h), fam('k', 'k', EXAMPLES.es.k),
];

const CA: Family[] = [
  fam('a', ['a'], EXAMPLES.ca.a), fam('e', ['e'], EXAMPLES.ca.e), fam('i', ['i'], EXAMPLES.ca.i), fam('o', ['o'], EXAMPLES.ca.o), fam('u', ['u'], EXAMPLES.ca.u),
  fam('m', 'm', EXAMPLES.ca.m), fam('p', 'p', EXAMPLES.ca.p), fam('l', 'l', ['lupa', '🔍']), fam('s', 's', EXAMPLES.ca.s),
  fam('t', 't', EXAMPLES.ca.t), fam('n', 'n', EXAMPLES.ca.n), fam('d', 'd', EXAMPLES.ca.d), fam('f', 'f', EXAMPLES.ca.f),
  fam('r', 'r', EXAMPLES.ca.r), fam('c', ['ca', 'que', 'qui', 'co', 'cu'], EXAMPLES.ca.c), fam('b', 'b', EXAMPLES.ca.b),
  fam('v', 'v', EXAMPLES.ca.v), fam('g', ['ga', 'gue', 'gui', 'go', 'gu'], EXAMPLES.ca.g), fam('j', ['ja', 'ge', 'gi', 'jo', 'ju'], EXAMPLES.ca.j),
  fam('ç', ['ça', 'ce', 'ci', 'ço', 'çu'], EXAMPLES.ca.ç), fam('x', 'x', EXAMPLES.ca.x), fam('ny', 'ny', ['pinya', '🍍']),
  fam('ll', 'll', ['lluna', '🌙']), fam('z', 'z', EXAMPLES.ca.z),
];

const EN: Family[] = 'abcdefghijklmnopqrstuvwxyz'.split('').map((c) => fam(c, [], EXAMPLES.en[c]));

export const FAMILIES: Record<Lang, Family[]> = { es: ES, ca: CA, en: EN };

/** Every syllable and example word, for the natural voices (scripts/audio/collect.ts) */
export function syllableTexts(lang: Lang): string[] {
  return [...new Set(FAMILIES[lang].flatMap((f) => [...f.syllables, f.word[0]]))];
}

/** What a syllable sounds like, so the game never asks to tell apart two that sound the same (ba/va, ge/je…) */
export function soundOf(lang: Lang, syl: string): string {
  let s = syl.toLowerCase();
  // Capital letters are markers for a sound, so one rule's result is not taken up by the next (gue ≠ ge, que ≠ ce)
  if (lang === 'es') {
    s = s.replace(/^h/, '').replace(/^ch/, 'Ĉ').replace(/^v/, 'b').replace(/^ll/, 'y').replace(/^(qu|k)/, 'K')
      .replace(/^gu(?=[ei])/, 'G').replace(/^g(?=[ei])/, 'J').replace(/^j/, 'J').replace(/^c(?=[ei])/, 'Θ').replace(/^z/, 'Θ')
      .replace(/^c/, 'K').replace(/^g/, 'G');
  } else if (lang === 'ca') {
    s = s.replace(/^v/, 'b').replace(/^qu/, 'K').replace(/^gu(?=[ei])/, 'G').replace(/^g(?=[ei])/, 'J').replace(/^j/, 'J')
      .replace(/^c(?=[ei])/, 'S').replace(/^ç/, 'S').replace(/^s/, 'S').replace(/^c/, 'K').replace(/^g/, 'G');
  }
  return s;
}

const shuffle = <T,>(a: T[]) => { const r = [...a]; for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; } return r; };
export const ROUNDS = 10;

export interface Round { answer: string; say: string; options: string[] }

/** Ten rounds. Distractors share the vowel (pa / ba / da / ta) and never sound like the answer. */
export function makeRounds(lang: Lang, fams: Family[]): Round[] {
  if (lang === 'en') {
    const usable = fams.filter((f) => f.word[0].startsWith(f.letter));
    return shuffle(usable).slice(0, ROUNDS).map((f) => ({
      answer: f.letter, say: f.word[0],
      options: shuffle([f.letter, ...shuffle(usable.filter((g) => g.letter !== f.letter)).slice(0, 3).map((g) => g.letter)]),
    }));
  }
  const all = fams.flatMap((f) => (f.syllables.length > 1 ? f.syllables : []));
  return shuffle(all).slice(0, ROUNDS).map((answer) => {
    const vowel = answer.slice(-1);
    const target = soundOf(lang, answer);
    const pool = [...new Set(all.filter((s) => s.slice(-1) === vowel && soundOf(lang, s) !== target))];
    const picked: string[] = [];
    for (const s of shuffle(pool)) if (picked.length < 3 && !picked.some((p) => soundOf(lang, p) === soundOf(lang, s))) picked.push(s);
    return { answer, say: answer, options: shuffle([answer, ...picked]) };
  });
}

/** Words that start with b, d, p or q, with a picture, for "which letter is missing?" (mirror letters) */
export const MIRROR_WORDS: Record<Lang, [string, string][]> = {
  es: [['barco', '⛵'], ['bota', '👢'], ['ballena', '🐋'], ['búho', '🦉'], ['dado', '🎲'], ['dedo', '☝️'], ['delfín', '🐬'], ['diente', '🦷'], ['pato', '🦆'], ['pera', '🍐'], ['pez', '🐟'], ['perro', '🐶'], ['queso', '🧀']],
  ca: [['barca', '⛵'], ['bota', '👢'], ['balena', '🐋'], ['dau', '🎲'], ['dofí', '🐬'], ['dent', '🦷'], ['poma', '🍎'], ['peix', '🐟'], ['pera', '🍐'], ['quadern', '📓'], ['quatre', '4️⃣']],
  en: [['ball', '⚽'], ['bed', '🛏️'], ['bus', '🚌'], ['bee', '🐝'], ['dog', '🐶'], ['duck', '🦆'], ['door', '🚪'], ['pig', '🐷'], ['pen', '🖊️'], ['pear', '🍐'], ['queen', '👑']],
};
export const MIRROR = ['b', 'd', 'p', 'q'] as const;

/**
 * "Build the word": the child hears a word, sees its picture and puts its pieces in order.
 * English: graphemes as UK phonics teaches them (Phase 2 CVC, then digraphs and trigraphs of Phase 3: sh, ck, ee, igh…).
 * Spanish and Valencian: syllables.
 */
export const BUILD_WORDS: Record<Lang, [string[], string][]> = {
  en: [
    [['c', 'a', 't'], '🐱'], [['d', 'o', 'g'], '🐶'], [['p', 'i', 'g'], '🐷'], [['s', 'u', 'n'], '☀️'], [['b', 'u', 's'], '🚌'], [['h', 'a', 't'], '🎩'],
    [['m', 'a', 'p'], '🗺️'], [['p', 'i', 'n'], '📌'], [['b', 'e', 'd'], '🛏️'], [['c', 'u', 'p'], '☕'], [['b', 'o', 'x'], '📦'], [['f', 'o', 'x'], '🦊'],
    [['h', 'e', 'n'], '🐔'], [['v', 'a', 'n'], '🚐'], [['w', 'e', 'b'], '🕸️'], [['t', 'e', 'n'], '🔟'],
    [['sh', 'i', 'p'], '🚢'], [['f', 'i', 'sh'], '🐟'], [['sh', 'e', 'll'], '🐚'], [['ch', 'i', 'ck'], '🐥'], [['d', 'u', 'ck'], '🦆'], [['s', 'o', 'ck'], '🧦'],
    [['r', 'i', 'ng'], '💍'], [['k', 'i', 'ng'], '🤴'], [['b', 'a', 'th'], '🛁'], [['r', 'ai', 'n'], '🌧️'], [['t', 'r', 'ee'], '🌳'], [['b', 'ee'], '🐝'],
    [['b', 'oa', 't'], '⛵'], [['g', 'oa', 't'], '🐐'], [['m', 'oo', 'n'], '🌙'], [['b', 'oo', 'k'], '📖'], [['c', 'ar'], '🚗'], [['s', 't', 'ar'], '⭐'],
    [['f', 'or', 'k'], '🍴'], [['n', 'igh', 't'], '🌃'], [['l', 'igh', 't'], '💡'], [['c', 'ow'], '🐄'], [['c', 'oi', 'n'], '🪙'], [['ch', 'air'], '🪑'],
    [['qu', 'ee', 'n'], '👑'], [['f', 'r', 'o', 'g'], '🐸'], [['c', 'r', 'a', 'b'], '🦀'], [['d', 'r', 'u', 'm'], '🥁'], [['t', 'e', 'n', 't'], '⛺'], [['h', 'a', 'n', 'd'], '✋'],
  ],
  es: [
    [['ma', 'no'], '✋'], [['ga', 'to'], '🐱'], [['pa', 'to'], '🦆'], [['ca', 'sa'], '🏠'], [['lu', 'na'], '🌙'], [['so', 'pa'], '🍲'], [['pe', 'rro'], '🐶'],
    [['pi', 'ña'], '🍍'], [['va', 'ca'], '🐄'], [['fo', 'ca'], '🦭'], [['mo', 'no'], '🐒'], [['ve', 'la'], '🕯️'], [['bar', 'co'], '⛵'], [['ra', 'tón'], '🐭'],
    [['to', 'ma', 'te'], '🍅'], [['za', 'pa', 'to'], '👟'], [['pe', 'lo', 'ta'], '⚽'], [['ca', 'ba', 'llo'], '🐴'], [['co', 'ne', 'jo'], '🐰'], [['ga', 'lle', 'ta'], '🍪'],
    [['pa', 'ta', 'ta'], '🥔'], [['he', 'la', 'do'], '🍦'], [['ji', 'ra', 'fa'], '🦒'], [['a', 'be', 'ja'], '🐝'], [['ca', 'ra', 'col'], '🐌'],
  ],
  ca: [
    [['ca', 'sa'], '🏠'], [['po', 'ma'], '🍎'], [['va', 'ca'], '🐄'], [['fo', 'ca'], '🦭'], [['mo', 'na'], '🐒'], [['ve', 'la'], '🕯️'], [['bar', 'ca'], '⛵'],
    [['llu', 'na'], '🌙'], [['pi', 'nya'], '🍍'], [['ca', 'ball'], '🐴'], [['co', 'nill'], '🐰'], [['ge', 'lat'], '🍦'],
    [['pa', 'ta', 'ta'], '🥔'], [['to', 'ma', 'ca'], '🍅'], [['sa', 'ba', 'ta'], '👟'], [['pi', 'lo', 'ta'], '⚽'], [['ra', 'to', 'lí'], '🐭'], [['ga', 'le', 'ta'], '🍪'],
    [['gi', 'ra', 'fa'], '🦒'], [['a', 'be', 'lla'], '🐝'], [['ca', 'ra', 'gol'], '🐌'], [['ca', 'ra', 'bas', 'sa'], '🎃'],
  ],
};
/** Pieces that look or sound close, offered as extra tiles (English: the graphemes children mix up) */
const NEAR_EN: Record<string, string[]> = {
  b: ['d', 'p'], d: ['b', 'p'], p: ['b', 'q'], m: ['n', 'w'], n: ['m', 'h'], e: ['a', 'i'], a: ['e', 'u'], i: ['e', 'y'], o: ['u', 'a'], u: ['o', 'a'],
  sh: ['ch', 's'], ch: ['sh', 'th'], th: ['f', 'sh'], ck: ['k', 'c'], ng: ['n', 'nk'], ee: ['ea', 'e'], ai: ['ay', 'a'], oa: ['ow', 'o'], igh: ['ie', 'i'],
  oo: ['o', 'u'], ar: ['a', 'or'], or: ['ar', 'o'], ow: ['oa', 'o'], oi: ['oy', 'o'], air: ['ear', 'ar'], qu: ['kw', 'q'], ll: ['l', 'il'],
};
export function buildTiles(lang: Lang, pieces: string[], others: string[][]): string[] {
  const extra: string[] = [];
  const pool = lang === 'en'
    ? pieces.flatMap((p) => NEAR_EN[p] ?? [])
    : others.flat();
  for (const x of shuffle(pool)) if (extra.length < 2 && !pieces.includes(x) && !extra.includes(x)) extra.push(x);
  return shuffle([...pieces, ...extra]);
}
