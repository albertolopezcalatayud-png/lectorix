import type { Exercise } from '@/types';

/**
 * "Study your notes": turns any text (a page of the school book, notes...) into practice,
 * on the device and without internet. It finds the key words of the text and builds
 * fill-the-gap questions, sentences to put in order and dictations of the key words.
 */

const STOP: Record<string, Set<string>> = {
  es: new Set('a al algo algunas algunos ante antes aquel aquella aquellas aquellos aqui así aun bajo bien cada como con contra cual cuales cuando de del desde donde dos durante el ella ellas ellos en entre era eran es esa esas ese eso esos esta estaba estaban estado estan estar este esto estos fue fueron gran ha habia han hasta hay hoy la las le les lo los mas me mientras mismo mucho muchos muy nada ni no nos nosotros o otra otras otro otros para pero poco por porque que quien se ser si sin sobre son su sus también tambien tan tanto te tiene tienen todo todos tras tu un una unas uno unos y ya además entonces aunque siempre donde cuál cómo qué también través forma parte puede pueden según gracias mediante'.split(' ')),
  ca: new Set('a al als algun alguna alguns algunes amb ara així aquell aquella aquells aquelles aquest aquesta això bé cada com contra de del dels des després dins dos durant el ell ella elles ells els en entre era eren es és esta este estos estes està estan fa fins fou gran ha han hi ho i la les li lo més mentre molt molts molta moltes no nosaltres o on per però poc perquè que qui se sense ser si sobre són seu seua seus seues també tan tant té tenen tot tots tres un una unes uns va van ja a través forma part pot poden segons sempre encara aleshores'.split(' ')),
  en: new Set('a about after all also an and any are as at be because been before being but by can could did do does during each for from had has have he her his how if in into is it its many more most much my no not of on one only or other our out over she so some such than that the their them then there these they this those through to under up very was we were what when where which while who will with would you your also however therefore known called used'.split(' ')),
};

const clean = (w: string) => w.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}·'’-]+$/gu, '');
const norm = (w: string) => clean(w).toLowerCase();

export function sentencesOf(text: string): string[] {
  return text
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?…])\s+(?=[«"“¿¡(\p{Lu}])/u)
    .map((s) => s.trim())
    .filter((s) => s.split(' ').length >= 4);
}

/** Key words: longer, repeated, or names that appear in the middle of a sentence */
export function keyWords(text: string, lang: string, max = 12): string[] {
  const stop = STOP[lang] ?? STOP.es;
  const minLen = 5;
  const score = new Map<string, { w: string; s: number }>();
  for (const sentence of sentencesOf(text)) {
    sentence.split(' ').forEach((raw, i) => {
      const w = clean(raw);
      const n = w.toLowerCase();
      if (n.length < minLen || stop.has(n) || /\d/.test(n)) return;
      const cur = score.get(n) ?? { w, s: 0 };
      cur.s += 2 + Math.min(n.length, 12) / 4;
      if (i > 0 && /^\p{Lu}/u.test(w)) cur.s += 2; // a name in the middle of a sentence
      score.set(n, cur);
    });
  }
  return [...score.values()].sort((a, b) => b.s - a.s).slice(0, max).map((x) => x.w);
}

export interface StudyLabels {
  cloze: string;      // "Complete the sentence"
  order: string;      // "Put the words in order"
  dictation: string;  // "Listen and write the word"
  letters: (n: number) => string; // hint: "It has 7 letters"
}

const shuffle = <T,>(a: T[]) => { const r = [...a]; for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; } return r; };

/** About ten practice questions from a text: 5 gaps, 2 sentences to order, 3 dictations */
export function buildStudy(text: string, lang: string, labels: StudyLabels): { words: string[]; exercises: Exercise[]; targets: Record<string, string> } {
  const words = keyWords(text, lang);
  const sentences = sentencesOf(text);
  const exercises: Exercise[] = [];
  const targets: Record<string, string> = {}; // exercise id → key word it practises (never shown as the 'word' of a gap question)
  const base = { level: 1, options: [] as string[], correct: 0 };
  let n = 0;
  const id = () => `study_${lang}_${Date.now()}_${n++}`;

  // 1) Gaps with key words (distractors: other key words of similar length)
  const usedSentences = new Set<string>();
  for (const w of shuffle(words)) {
    if (exercises.length >= 5) break;
    const rx = new RegExp(`(^|[^\\p{L}])(${w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})(?=$|[^\\p{L}])`, 'iu');
    const s = sentences.find((x) => rx.test(x) && !usedSentences.has(x));
    if (!s) continue;
    // Distractors: other key words that are not in this sentence and do not share the start of the answer
    // (so "Roman" / "Romans" never appear together and only one option fits)
    const inSentence = new Set(s.split(' ').map(norm));
    const stem = (x: string) => norm(x).slice(0, 4);
    const others = words
      .filter((x) => norm(x) !== norm(w) && !inSentence.has(norm(x)) && stem(x) !== stem(w))
      .sort((a, b) => Math.abs(a.length - w.length) - Math.abs(b.length - w.length))
      .slice(0, 3);
    if (others.length < 2) continue;
    usedSentences.add(s);
    const options = shuffle([w, ...others]);
    const qid = id();
    targets[qid] = w;
    exercises.push({ ...base, id: qid, module: 'comprension_lectora', type: 'multiple_choice', prompt: labels.cloze,
      passage: s.replace(rx, '$1_____'), options, correct: options.indexOf(w), explanation: s });
  }

  // 2) Sentences to put in order (short ones from the text)
  const short = sentences.filter((x) => { const k = x.split(' ').length; return k >= 4 && k <= 9; });
  const orderable = short.length >= 2 ? short : [...sentences].sort((a, b) => a.split(' ').length - b.split(' ').length).filter((x) => x.split(' ').length <= 14);
  for (const s of shuffle(orderable).slice(0, 2)) {
    const pieces = s.split(' ');
    exercises.push({ ...base, id: id(), module: 'escritura', type: 'drag_order', prompt: labels.order, pieces, correctOrder: pieces, explanation: s });
  }

  // 3) Dictation of key words
  for (const w of shuffle(words).slice(0, 3)) {
    const did = id();
    targets[did] = w;
    exercises.push({ ...base, id: did, module: 'escritura', type: 'write', prompt: labels.dictation, answer: w, word: w, dictation: true,
      hint: labels.letters([...w].length), explanation: w });
  }
  return { words, exercises, targets };
}
