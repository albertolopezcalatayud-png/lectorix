/**
 * Spaced repetition (Leitner boxes) + personal notebook of difficult words.
 *
 * Every exercise the student gets wrong goes to box 1 and comes back the next
 * day. Each correct answer in a review moves it up: box 1 → 3 days → box 2 →
 * 7 days → box 3 → mastered. A mistake sends it back to box 1.
 * Everything stays on the device (localStorage), per practice language.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Exercise, AnswerResult, ModuleId } from '@/types';
import type { PracticeLang } from '@/data/content';

export interface ReviewItem {
  key: string;          // `${lang}:${id}`
  id: string;           // exercise id
  lang: PracticeLang;
  module: ModuleId;
  level: number;
  box: 1 | 2 | 3;
  due: number;          // epoch ms (start of the day it is due)
  misses: number;
  lastMiss: number;
  word?: string;        // word for the notebook, when the exercise is about one word
  mastered?: boolean;
  masteredAt?: number;
}

const DAY = 86400000;
const INTERVAL_DAYS: Record<1 | 2 | 3, number> = { 1: 1, 2: 3, 3: 7 };

export function startOfDay(t = Date.now()) {
  const d = new Date(t);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

const WORD_RE = /^[\p{L}·'’-]{3,}$/u;
const WORD_MODULES: ModuleId[] = ['fonologia', 'memoria_visual', 'escritura'];

/** The single word an exercise is about (for the notebook), if there is one */
export function wordOf(ex: Exercise): string | undefined {
  if (!WORD_MODULES.includes(ex.module)) return undefined;
  if (ex.type === 'write' && ex.answer) {
    const a = ex.answer.trim();
    if (a.split(/\s+/).length <= 2 && /\p{L}{3,}/u.test(a)) return a.replace(/[.!?]$/, '');
  }
  if (ex.word && WORD_RE.test(ex.word)) return ex.word;
  if (ex.type === 'multiple_choice') {
    const c = ex.options[ex.correct]?.trim();
    if (c && WORD_RE.test(c) && ex.module !== 'fonologia') return c;
  }
  return undefined;
}

interface ReviewState {
  items: Record<string, ReviewItem>;
  /** Update the boxes with the answers of any finished session */
  track: (exercises: Exercise[], answers: AnswerResult[], lang: PracticeLang) => { added: number; promoted: number; mastered: number };
  /** Add a word the student chose (e.g. from an adapted text); id is `custom:<word>` */
  addWord: (word: string, lang: PracticeLang) => boolean;
  markMastered: (key: string) => void;
  forget: (key: string) => void;
}

export const useReviewStore = create<ReviewState>()(
  persist(
    (set, get) => ({
      items: {},
      track: (exercises, answers, lang) => {
        const items = { ...get().items };
        const byId = new Map(exercises.map((e) => [e.id, e]));
        const today = startOfDay();
        let added = 0, promoted = 0, mastered = 0;
        for (const a of answers) {
          const ex = byId.get(a.exercise_id);
          if (!ex) continue;
          const key = `${lang}:${ex.id}`;
          const cur = items[key];
          if (!a.is_correct) {
            added++;
            items[key] = {
              key, id: ex.id, lang, module: ex.module, level: ex.level,
              box: 1, due: today + DAY, misses: (cur?.misses ?? 0) + 1, lastMiss: Date.now(),
              word: wordOf(ex),
            };
          } else if (cur && !cur.mastered && cur.due <= today) {
            if (cur.box === 3) {
              items[key] = { ...cur, mastered: true, masteredAt: Date.now() };
              mastered++;
            } else {
              const box = (cur.box + 1) as 2 | 3;
              items[key] = { ...cur, box, due: today + INTERVAL_DAYS[box] * DAY };
              promoted++;
            }
          }
        }
        set({ items });
        return { added, promoted, mastered };
      },
      addWord: (word, lang) => {
        const w = word.trim();
        if (!w) return false;
        const id = `custom:${w.toLowerCase()}`;
        const key = `${lang}:${id}`;
        const cur = get().items[key];
        if (cur && !cur.mastered) return false;
        set((s) => ({
          items: {
            ...s.items,
            [key]: { key, id, lang, module: 'escritura', level: 1, box: 1, due: startOfDay(), misses: 0, lastMiss: Date.now(), word: w },
          },
        }));
        return true;
      },
      markMastered: (key) =>
        set((s) => (s.items[key] ? { items: { ...s.items, [key]: { ...s.items[key], mastered: true, masteredAt: Date.now() } } } : {})),
      forget: (key) =>
        set((s) => {
          const items = { ...s.items };
          delete items[key];
          return { items };
        }),
    }),
    { name: 'lectorix-review' }
  )
);

const DICTATE_PROMPT: Record<PracticeLang, string> = {
  es: 'Escucha y escribe la palabra',
  ca: 'Escolta i escriu la paraula',
  en: 'Listen and write the word',
};

/** A dictation exercise for a word the student added by hand */
export function customExercise(item: ReviewItem): Exercise | null {
  if (!item.id.startsWith('custom:') || !item.word) return null;
  return {
    id: item.id, module: 'escritura', level: 1, type: 'write', prompt: DICTATE_PROMPT[item.lang],
    options: [], correct: 0, explanation: item.word, word: item.word, answer: item.word, dictation: true,
  };
}

export function dueItems(items: Record<string, ReviewItem>, lang: PracticeLang, now = Date.now()) {
  return Object.values(items)
    .filter((i) => i.lang === lang && !i.mastered && i.due <= now)
    .sort((a, b) => a.due - b.due || b.misses - a.misses);
}

export function pendingItems(items: Record<string, ReviewItem>, lang: PracticeLang) {
  return Object.values(items)
    .filter((i) => i.lang === lang && !i.mastered)
    .sort((a, b) => a.due - b.due || b.misses - a.misses);
}

export function notebookWords(items: Record<string, ReviewItem>, lang: PracticeLang) {
  const seen = new Map<string, ReviewItem>();
  for (const i of Object.values(items)) {
    if (i.lang !== lang || !i.word) continue;
    const k = i.word.toLowerCase();
    const prev = seen.get(k);
    // keep one entry per word: the least advanced one
    if (!prev || (prev.mastered && !i.mastered) || (!!prev.mastered === !!i.mastered && i.misses > prev.misses)) seen.set(k, i);
  }
  return [...seen.values()];
}

/**
 * Recommended level for a module: the lowest unlocked level that is not yet
 * secure (best score under 80 %). If every unlocked level is secure, the
 * highest unlocked one.
 */
export function recommendedLevel(
  progress: { module: ModuleId; level: number; best_score: number; stars: number }[],
  module: ModuleId,
  levels: number,
  isUnlocked: (m: ModuleId, l: number) => boolean,
): number {
  let highest = 1;
  for (let l = 1; l <= levels; l++) {
    if (!isUnlocked(module, l)) break;
    highest = l;
    const p = progress.find((x) => x.module === module && x.level === l);
    if (!p || p.best_score < 80) return l;
  }
  return highest;
}
