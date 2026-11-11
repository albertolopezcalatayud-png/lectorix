/**
 * Offline spelling check for "Write and listen".
 * The word lists (public/dict/*.fcz, built by scripts/spell/build.py from the Hunspell
 * dictionaries) hold every accepted word form, sorted and front-coded. They are loaded on
 * demand, kept as one string plus an offsets table (light on memory) and searched by bisection.
 * It finds words that are not in the dictionary; it does not check grammar, and words that exist
 * with and without an accent («esta» / «está») are not flagged.
 */
export type SpellLang = 'es' | 'ca' | 'en';

interface Dict { text: string; starts: Uint32Array; ends: Uint32Array; size: number }
const cache = new Map<SpellLang, Promise<Dict>>();

async function gunzip(buf: ArrayBuffer): Promise<string> {
  const bytes = new Uint8Array(buf);
  // Some servers already decompress (Content-Encoding); only inflate real gzip data
  if (bytes[0] !== 0x1f || bytes[1] !== 0x8b) return new TextDecoder().decode(bytes);
  const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
  return new Response(stream).text();
}

function decode(fc: string): Dict {
  const lines = fc.split('\n');
  const parts: string[] = [];
  const starts = new Uint32Array(lines.length);
  const ends = new Uint32Array(lines.length);
  let prev = '';
  let pos = 0;
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    const k = l.charCodeAt(0) - 48;
    const w = prev.slice(0, k) + l.slice(1);
    starts[i] = pos;
    pos += w.length;
    ends[i] = pos;
    parts.push(w);
    prev = w;
  }
  return { text: parts.join(''), starts, ends, size: lines.length };
}

export function loadDict(lang: SpellLang): Promise<Dict> {
  let p = cache.get(lang);
  if (!p) {
    p = fetch(`${import.meta.env.BASE_URL}dict/${lang}.fcz`)
      .then((r) => { if (!r.ok) throw new Error(`dict ${lang} ${r.status}`); return r.arrayBuffer(); })
      .then(gunzip)
      .then(decode);
    p.catch(() => cache.delete(lang));
    cache.set(lang, p);
  }
  return p;
}

function inDict(d: Dict, w: string): boolean {
  let lo = 0, hi = d.size - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    const x = d.text.slice(d.starts[mid], d.ends[mid]);
    if (x === w) return true;
    if (x < w) lo = mid + 1; else hi = mid - 1;
  }
  return false;
}

const capFirst = (w: string) => w.charAt(0).toLocaleUpperCase() + w.slice(1);

/** A word is fine as written, in lower case (start of a sentence), or capitalised (written in capitals) */
export function known(d: Dict, w: string): boolean {
  if (inDict(d, w)) return true;
  const low = w.toLocaleLowerCase();
  if (low !== w && inDict(d, low)) return true;
  if (w === w.toLocaleUpperCase() && inDict(d, capFirst(low))) return true;
  return false;
}

export interface Token { text: string; start: number; word: boolean }

/** Splits a text into words and the rest. Apostrophes and hyphens split words (l’home, dir-te, don't) */
export function tokenize(text: string): Token[] {
  const out: Token[] = [];
  const rx = /[\p{L}·]+/gu;
  let last = 0;
  for (const m of text.matchAll(rx)) {
    const i = m.index ?? 0;
    if (i > last) out.push({ text: text.slice(last, i), start: last, word: false });
    out.push({ text: m[0], start: i, word: true });
    last = i + m[0].length;
  }
  if (last < text.length) out.push({ text: text.slice(last), start: last, word: false });
  return out;
}

/** Pieces left by apostrophes and hyphens that are fine on their own */
const PIECES: Record<SpellLang, Set<string>> = {
  es: new Set([]),
  ca: new Set(['l', 'd', 's', 'm', 'n', 't', 'ls', 'ns', 'ts', 'hi', 'ho', 'li', 'lo', 'los', 'la', 'les', 'me', 'te', 'se', 'ne', 'nos', 'vos', 'us']),
  en: new Set(['s', 't', 'll', 're', 've', 'd', 'm', 'didn', 'doesn', 'don', 'isn', 'wasn', 'aren', 'weren', 'couldn', 'wouldn', 'shouldn', 'hasn', 'haven', 'hadn', 'mustn', 'needn', 'o']),
};

/** Words of the text that are not in the dictionary */
export function unknownWords(d: Dict, lang: SpellLang, text: string, ignore: Set<string> = new Set()): Token[] {
  return tokenize(text).filter((t) => {
    if (!t.word) return false;
    const low = t.text.toLocaleLowerCase();
    if (t.text.length === 1 || PIECES[lang].has(low) || ignore.has(low)) return false;
    return !known(d, t.text);
  });
}

const LETTERS: Record<SpellLang, string> = {
  es: 'abcdefghijklmnñopqrstuvwxyzáéíóúü',
  ca: 'abcdefghijlmnopqrstuvxyzàèéíòóúïüç·',
  en: 'abcdefghijklmnopqrstuvwxyz',
};

/** Typical confusions for students with reading and writing difficulties (sound alike, look alike) */
const SWAPS: Record<SpellLang, [string, string][]> = {
  es: [['b', 'v'], ['v', 'b'], ['ll', 'y'], ['y', 'll'], ['g', 'j'], ['j', 'g'], ['c', 'z'], ['z', 'c'], ['s', 'c'], ['c', 's'], ['qu', 'c'], ['c', 'qu'], ['q', 'qu'], ['k', 'c'], ['rr', 'r'], ['r', 'rr'], ['gu', 'g'], ['g', 'gu'], ['gu', 'gü'], ['x', 's'], ['b', 'd'], ['d', 'b'], ['p', 'q'], ['m', 'n'], ['n', 'm']],
  ca: [['b', 'v'], ['v', 'b'], ['g', 'j'], ['j', 'g'], ['ç', 's'], ['s', 'ç'], ['ss', 's'], ['s', 'ss'], ['c', 's'], ['s', 'c'], ['z', 's'], ['s', 'z'], ['x', 'ix'], ['ix', 'x'], ['tx', 'ig'], ['ig', 'tx'], ['ny', 'n'], ['l·l', 'l'], ['l', 'l·l'], ['ll', 'l·l'], ['qu', 'c'], ['c', 'qu'], ['gu', 'g'], ['g', 'gu'], ['b', 'd'], ['d', 'b'], ['m', 'n'], ['n', 'm']],
  en: [['ie', 'ei'], ['ei', 'ie'], ['f', 'ph'], ['ph', 'f'], ['c', 'k'], ['k', 'c'], ['ck', 'k'], ['s', 'c'], ['c', 's'], ['ee', 'ea'], ['ea', 'ee'], ['b', 'd'], ['d', 'b'], ['p', 'q'], ['ou', 'ow'], ['er', 'or'], ['or', 'er'], ['ai', 'ay'], ['ay', 'ai'], ['tion', 'sion'], ['sion', 'tion'], ['wh', 'w'], ['w', 'wh'], ['gh', ''], ['kn', 'n'], ['n', 'kn'], ['wr', 'r'], ['r', 'wr']],
};

function edits1(w: string, letters: string): Set<string> {
  const out = new Set<string>();
  for (let i = 0; i <= w.length; i++) {
    const a = w.slice(0, i), b = w.slice(i);
    if (b) out.add(a + b.slice(1)); // delete
    if (b.length > 1) out.add(a + b[1] + b[0] + b.slice(2)); // swap neighbours
    for (const c of letters) {
      if (b) out.add(a + c + b.slice(1)); // replace
      out.add(a + c + b); // insert
    }
  }
  return out;
}

function swaps(w: string, lang: SpellLang): Set<string> {
  const out = new Set<string>();
  const one = (s: string) => {
    const r = new Set<string>();
    for (const [x, y] of SWAPS[lang]) {
      let i = s.indexOf(x);
      while (i >= 0) { r.add(s.slice(0, i) + y + s.slice(i + x.length)); i = s.indexOf(x, i + 1); }
    }
    if (lang !== 'en') { // silent h
      for (let i = 0; i <= s.length; i++) r.add(s.slice(0, i) + 'h' + s.slice(i));
      let i = s.indexOf('h');
      while (i >= 0) { r.add(s.slice(0, i) + s.slice(i + 1)); i = s.indexOf('h', i + 1); }
    }
    return r;
  };
  for (const a of one(w)) { out.add(a); for (const b of one(a)) out.add(b); }
  return out;
}

const plain = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '');

/**
 * Up to `max` suggestions: first the words reached through typical confusions (b/v, h, ll/y, accents...),
 * then single typing slips (one letter missing, extra, changed or swapped), then two words written together.
 * Words the student already uses in the app (`common`) go first.
 */
export function suggest(d: Dict, lang: SpellLang, word: string, common: Set<string> = new Set(), max = 4): string[] {
  const capital = /^\p{Lu}/u.test(word);
  const w = word.toLocaleLowerCase();
  const scored = new Map<string, number>();
  const add = (cand: string, score: number) => {
    let c = cand;
    if (c === w || c.length === 0) return;
    if (!known(d, c)) {
      if (!inDict(d, capFirst(c))) return;
      c = capFirst(c); // a name: Wednesday, Valencia
    }
    let s = score;
    if (common.has(c)) s -= 3;
    if (plain(c) === plain(w)) s -= 4; // only the accent was missing or wrong
    if (c[0] === w[0]) s -= 0.5;
    const prev = scored.get(c);
    if (prev === undefined || s < prev) scored.set(c, s);
  };
  for (const c of swaps(w, lang)) add(c, 1);
  const e1 = edits1(w, LETTERS[lang]);
  for (const c of e1) add(c, 2);
  if (scored.size < max && w.length <= 12) {
    // two slips: only through a confusion + a slip, to keep it fast
    for (const a of swaps(w, lang)) for (const c of edits1(a, LETTERS[lang])) add(c, 4);
  }
  // Two words written together ("aver" → "a ver")
  for (let i = 1; i <= w.length - 2 && !w.includes('·'); i++) {
    const a = w.slice(0, i), b = w.slice(i);
    if ((a.length > 1 || (lang === 'es' ? 'aoy' : lang === 'ca' ? 'aoi' : 'a').includes(a)) && known(d, a) && known(d, b) && b.length > 1) {
      const c = `${a} ${b}`;
      let s = 2.5 + (common.has(a) && common.has(b) ? -2 : 0);
      if (a.length === 1) s -= 2.5; // "aver" → "a ver", "osea" → "o sea"
      if (b.length < 3) s += 1;
      if (!scored.has(c) || scored.get(c)! > s) scored.set(c, s);
    }
  }
  const ranked = [...scored.entries()]
    .sort((x, y) => x[1] - y[1] || Math.abs(x[0].length - w.length) - Math.abs(y[0].length - w.length) || x[0].localeCompare(y[0]));
  const best = ranked.length ? ranked[0][1] : 0;
  return ranked
    .filter(([, s]) => s <= best + 2) // leave out far-fetched ideas when there is a clear one
    .slice(0, max)
    .map(([c]) => (capital ? capFirst(c) : c));
}

/* ---------- word prediction ---------- */

const freqCache = new Map<SpellLang, Promise<{ words: string[]; plain: string[] }>>();

/** The most frequent words of the language, most frequent first (public/dict/*.frz, scripts/spell/build_freq.py) */
export function loadFrequent(lang: SpellLang) {
  let p = freqCache.get(lang);
  if (!p) {
    p = fetch(`${import.meta.env.BASE_URL}dict/${lang}.frz`)
      .then((r) => { if (!r.ok) throw new Error(`freq ${lang} ${r.status}`); return r.arrayBuffer(); })
      .then(gunzip)
      .then((txt) => { const words = txt.split('\n'); return { words, plain: words.map((w) => plain(w.toLocaleLowerCase())) }; });
    p.catch(() => freqCache.delete(lang));
    freqCache.set(lang, p);
  }
  return p;
}

/**
 * Up to `max` words that start like what the student is writing (accents ignored, so "cancio" finds
 * "canción"). The student's own words (`mine`) come first, then by frequency. When nothing starts that way,
 * spelling suggestions for the piece written so far are used.
 */
export function predict(freq: { words: string[]; plain: string[] }, d: Dict | null, lang: SpellLang, partial: string, mine: string[] = [], max = 3): string[] {
  const low = partial.toLocaleLowerCase();
  const p = plain(low);
  if (p.length < 2) return [];
  const capital = /^\p{Lu}/u.test(partial);
  const out: string[] = [];
  const push = (w: string) => { if (!out.includes(w) && w.toLocaleLowerCase() !== low) out.push(w); };
  for (const w of mine) if (plain(w.toLocaleLowerCase()).startsWith(p) && w.length > p.length) push(w);
  for (let i = 0; i < freq.words.length && out.length < max; i++) {
    if (freq.plain[i].startsWith(p) && freq.words[i].length > low.length) push(freq.words[i]);
  }
  if (out.length === 0 && d && p.length >= 3) {
    // maybe the beginning is misspelled ("pinguin" → "pingüino")
    const fixed = [...new Set(suggest(d, lang, low, new Set(mine), 2))];
    for (const f of fixed) {
      const fp = plain(f.toLocaleLowerCase());
      for (let i = 0; i < freq.words.length && out.length < max; i++) if (freq.plain[i].startsWith(fp)) { push(freq.words[i]); break; }
      if (out.length < max && !f.includes(' ')) push(f);
    }
  }
  return out.slice(0, max).map((w) => (capital ? capFirst(w) : w));
}
