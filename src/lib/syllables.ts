/**
 * Rule-based syllable division for Spanish and Valencian (written form).
 * Used only as a visual reading aid (alternating colours), not for grading.
 * English spelling is too irregular for a reliable rule-based split, so it is
 * not supported.
 */
export type SyllableLang = 'es' | 'ca';

const INSEPARABLE = new Set(['pr', 'br', 'tr', 'dr', 'cr', 'gr', 'fr', 'pl', 'bl', 'cl', 'gl', 'fl', 'kr', 'kl']);
const VOWELS = 'aeiouáéíóúàèòïü';
const ES_STRONG = new Set([...'aeoáéíóú']);

type Unit = { s: string; v: boolean };

function units(word: string, lang: SyllableLang): Unit[] {
  const w = word.toLowerCase();
  const out: Unit[] = [];
  let i = 0;
  while (i < w.length) {
    const c = w[i];
    const two = w.slice(i, i + 2);
    const next = w[i + 2] ?? '';
    if ((two === 'qu' || two === 'gu') && 'eiéíèï'.includes(next)) {
      out.push({ s: word.slice(i, i + 2), v: false });
      i += 2;
      continue;
    }
    if (two === 'ch' || two === 'll' || (lang === 'es' && two === 'rr') || (lang === 'ca' && two === 'ny')) {
      out.push({ s: word.slice(i, i + 2), v: false });
      i += 2;
      continue;
    }
    if (lang === 'ca' && two === 'l·') {
      out.push({ s: word.slice(i, i + 2), v: false });
      i += 2;
      continue;
    }
    if (c === 'y') {
      // vowel at the end of a syllable (rey, hoy), consonant before a vowel (yate)
      const nv = i + 1 < w.length && VOWELS.includes(w[i + 1]);
      out.push({ s: word[i], v: lang === 'es' && !nv });
      i += 1;
      continue;
    }
    out.push({ s: word[i], v: VOWELS.includes(c) });
    i += 1;
  }
  // Valencian: i/u between vowels sound as consonants (no-ia, ve-ua)
  if (lang === 'ca') {
    for (let k = 1; k < out.length - 1; k++) {
      const u = out[k].s.toLowerCase();
      if ((u === 'i' || u === 'u') && out[k - 1].v && out[k + 1].v) out[k] = { ...out[k], v: false };
    }
  }
  return out;
}

/** true when two adjacent vowels belong to the same syllable */
function sameSyllable(a: string, b: string, prev: string | undefined, lang: SyllableLang): boolean {
  a = a.toLowerCase();
  b = b.toLowerCase();
  if (lang === 'es') {
    if (ES_STRONG.has(a) && ES_STRONG.has(b)) return false;
    if ((a === 'í' || a === 'ú') || (b === 'í' || b === 'ú')) return false;
    if (a === b) return false;
    return true;
  }
  // Valencian: rising diphthongs only after g/q (aigua, qüestió, pingüí)
  if ((a === 'u' || a === 'ü') && prev && /^[gq]$/i.test(prev)) return true;
  // falling diphthongs: vowel + unstressed i/u
  if ((b === 'i' || b === 'u') && a !== b) return true;
  return false;
}

export function syllabify(word: string, lang: SyllableLang): string[] {
  if (!/[a-záéíóúàèòïüñç]/i.test(word)) return [word];
  const u = units(word, lang);
  // nuclei: groups of vowels that stay together
  const groups: number[][] = [];
  for (let k = 0; k < u.length; k++) {
    if (!u[k].v) continue;
    const last = groups[groups.length - 1];
    if (last && last[last.length - 1] === k - 1 && sameSyllable(u[k - 1].s, u[k].s, u[k - 2]?.s, lang)) last.push(k);
    else groups.push([k]);
  }
  if (groups.length <= 1) return [word];
  const cuts: number[] = []; // unit index where a new syllable starts
  for (let g = 1; g < groups.length; g++) {
    const end = groups[g - 1][groups[g - 1].length - 1];
    const start = groups[g][0];
    const cons = start - end - 1;
    const pairOk = (k: number) => INSEPARABLE.has((u[k].s + u[k + 1].s).toLowerCase());
    let cut: number;
    if (cons === 0) cut = start;
    else if (cons === 1) cut = start - 1;
    else if (cons === 2) cut = pairOk(end + 1) ? end + 1 : end + 2;
    else if (cons === 3) cut = pairOk(end + 2) ? end + 2 : end + 3;
    else cut = start - 2;
    cuts.push(cut);
  }
  const out: string[] = [];
  let from = 0;
  for (const c of [...cuts, u.length]) {
    out.push(u.slice(from, c).map((x) => x.s).join(''));
    from = c;
  }
  return out.filter(Boolean);
}

/** Splits a text token into [leading punctuation, word, trailing punctuation] */
export function splitPunct(token: string): [string, string, string] {
  const m = token.match(/^([^\p{L}]*)(.*?)([^\p{L}]*)$/u);
  return m ? [m[1], m[2], m[3]] : ['', token, ''];
}
