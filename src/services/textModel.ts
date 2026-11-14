/** Pure text model shared by the guided reader and the audio generator (no browser APIs here) */
export interface Token { text: string; start: number; index: number }
export interface Sentence { text: string; tokens: Token[]; index: number }
export interface Paragraph { sentences: Sentence[] }

/** Splits a text into paragraphs → sentences → words (with char offsets per sentence) */
export function parseText(text: string): { paragraphs: Paragraph[]; sentences: Sentence[]; wordCount: number } {
  const sentences: Sentence[] = [];
  let wordIndex = 0;
  const paragraphs = text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => {
      const parts = p.match(/[^.!?…]+(?:[.!?…]+[»"”]?|$)/g) || [p];
      const ps: Sentence[] = parts
        .map((s) => s.trim())
        .filter(Boolean)
        .map((s) => {
          const tokens: Token[] = [];
          const re = /\S+/g;
          let m: RegExpExecArray | null;
          while ((m = re.exec(s))) tokens.push({ text: m[0], start: m.index, index: wordIndex++ });
          const sentence = { text: s, tokens, index: sentences.length };
          sentences.push(sentence);
          return sentence;
        });
      return { sentences: ps };
    });
  return { paragraphs, sentences, wordCount: wordIndex };
}

