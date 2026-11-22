/**
 * Words to trace (the child's name, example words, words the family adds), in print or joined handwriting.
 * Print: each letter keeps its own strokes, one after another. Joined: the lowercase letters are one stroke
 * (data/cursive.ts); a capital at the start is written in print and the joined part starts after it.
 */
import { printChar, type Glyph } from './strokes';
import { cursiveWord, hasCursive, shiftPath } from './cursive';

export type HandStyle = 'print' | 'cursive';
const GAP = 3;

export function wordGlyph(word: string, style: HandStyle): Glyph | null {
  const w = word.trim();
  if (!w || /\s/.test(w)) return null;
  if (style === 'cursive') {
    const first = w[0];
    const capital = first !== first.toLowerCase() ? printChar(first) : null;
    const rest = capital ? w.slice(1) : w;
    if (capital && !rest) return { ...capital, id: `wc-${w}`, char: w };
    if ([...rest].some((c) => c !== c.toLowerCase() || !hasCursive(c))) return null;
    const joined = cursiveWord(rest);
    if (!joined) return null;
    if (!capital) return { ...joined, id: `wc-${w}`, char: w };
    const dx = capital.w + GAP;
    return { id: `wc-${w}`, char: w, w: dx + joined.w, strokes: [...capital.strokes, ...joined.strokes.map((d) => shiftPath(d, dx))] };
  }
  let x = 0; const strokes: string[] = [];
  for (const c of w) {
    const g = printChar(c);
    if (!g) return null;
    strokes.push(...g.strokes.map((d) => shiftPath(d, x)));
    x += g.w + GAP;
  }
  return { id: `wp-${w}`, char: w, w: x - GAP, strokes };
}
