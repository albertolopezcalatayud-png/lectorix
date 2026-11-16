/**
 * "Rival" words for the reading recogniser.
 * The recogniser only listens for the words of the text. On its own that makes it too generous: if the
 * child reads «pato» where the text says «gato», the closest thing it knows is «gato» and it accepts it.
 * So, for each word of the text, it is also given a few real words that are one letter away («pato»,
 * «gata», «gasto»). A near miss then has somewhere else to go. When a rival is heard where the word was
 * expected, the word is shown as doubtful (to be looked at again), never silently accepted.
 * Measured in scripts/asr/eval2.py.
 */
import { loadFrequent, type SpellLang } from './spell';

/** For each word of the text (lower case, as the recogniser hears it): its rivals */
export type Rivals = Map<string, Set<string>>;

const ABC: Record<SpellLang, string> = {
  es: 'abcdefghijlmnñopqrstuvzáéíóú',
  ca: 'abcçdefghijlmnopqrstuvxzàèéíòóú',
  en: 'abcdefghijklmnopqrstuvwxyz',
};
// Settings chosen with the comparison (scripts/asr/eval2.py)
export const RIVALS_PER_WORD = 4;
export const RIVALS_MIN_LENGTH = 4;   // shorter words get no rivals
export const RIVALS_SKIP_TOP = 150;   // nor do the most frequent words (el, la, de, que…): they are rarely the problem
const POOL = 40000;                   // rivals come from the most frequent words of the language

const plain = (w: string) => w.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/·/g, '');
const ranks = new Map<SpellLang, Promise<Map<string, number>>>();
function rankOf(lang: SpellLang) {
  let p = ranks.get(lang);
  if (!p) {
    p = loadFrequent(lang).then(({ words }) => { const m = new Map<string, number>(); words.slice(0, POOL).forEach((w, i) => { if (w && !m.has(w)) m.set(w, i); }); return m; });
    p.catch(() => ranks.delete(lang));
    ranks.set(lang, p);
  }
  return p;
}

/** Real words one letter away from `w` (one changed, added or removed), most frequent first */
export function neighbours(w: string, rank: Map<string, number>, abc: string, limit: number): string[] {
  const out = new Set<string>();
  for (let i = 0; i <= w.length; i++) {
    if (i < w.length) {
      out.add(w.slice(0, i) + w.slice(i + 1));
      for (const ch of abc) out.add(w.slice(0, i) + ch + w.slice(i + 1));
    }
    for (const ch of abc) out.add(w.slice(0, i) + ch + w.slice(i));
  }
  out.delete(w);
  return [...out].filter((x) => rank.has(x)).sort((a, b) => rank.get(a)! - rank.get(b)!).slice(0, limit);
}

/**
 * Rivals for the words of a text. `words` must already be clean (lower case, no punctuation).
 * Never a word of the text itself, nor one that only differs from its word in an accent.
 * If the word list cannot be loaded (offline the first time), there are simply no rivals.
 */
export async function rivalsFor(lang: string, words: string[]): Promise<Rivals> {
  const out: Rivals = new Map();
  if (lang !== 'es' && lang !== 'ca' && lang !== 'en') return out;
  let rank: Map<string, number>;
  try { rank = await rankOf(lang); } catch { return out; }
  const text = new Set(words);
  const textPlain = new Set(words.map(plain));
  for (const w of text) {
    if (w.length < RIVALS_MIN_LENGTH || /\d/.test(w) || (rank.get(w) ?? Infinity) < RIVALS_SKIP_TOP) continue;
    const r = neighbours(w, rank, ABC[lang], RIVALS_PER_WORD + 4).filter((x) => !text.has(x) && !textPlain.has(plain(x))).slice(0, RIVALS_PER_WORD);
    if (r.length) out.set(w, new Set(r));
  }
  return out;
}
