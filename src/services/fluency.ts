/** Timed-reading results (words correct per minute), stored on the device only */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PracticeLang } from '@/data/content';

export interface FluencyResult {
  id: string;
  date: string;        // ISO
  lang: PracticeLang;
  level: number;
  readingId: string;
  wordsRead: number;
  errors: number;
  seconds: number;
  wcpm: number;        // words correct per minute
  /** How the errors were found: by the microphone, or by an adult listening (older results: unknown) */
  checked?: 'mic' | 'adult';
  /**
   * Only when an adult reviewed the microphone's marks (tapped words or listened to them): how the marks
   * changed. No audio is kept. Used to see how often the checker gets it wrong with real children.
   */
  review?: { words: number; marked: number; unmarked: number; added: number };
}

/** Totals of the adult reviews of the microphone's marks, for one language (or all) */
export function checkerAccuracy(results: FluencyResult[], lang?: string) {
  const r = results.filter((x) => x.review && (!lang || x.lang === lang));
  const sum = (k: 'words' | 'marked' | 'unmarked' | 'added') => r.reduce((a, x) => a + x.review![k], 0);
  return { readings: r.length, words: sum('words'), marked: sum('marked'), unmarked: sum('unmarked'), added: sum('added') };
}

interface FluencyState {
  results: FluencyResult[];
  add: (r: Omit<FluencyResult, 'id' | 'date' | 'wcpm'>) => FluencyResult;
  remove: (id: string) => void;
}

export const useFluencyStore = create<FluencyState>()(
  persist(
    (set) => ({
      results: [],
      add: (r) => {
        const correct = Math.max(0, r.wordsRead - r.errors);
        const wcpm = r.seconds > 0 ? Math.round((correct * 60) / r.seconds) : 0;
        const res: FluencyResult = { ...r, id: `${Date.now()}`, date: new Date().toISOString(), wcpm };
        set((s) => ({ results: [...s.results, res].slice(-200) }));
        return res;
      },
      remove: (id) => set((s) => ({ results: s.results.filter((x) => x.id !== id) })),
    }),
    { name: 'lectorix-fluency' }
  )
);
