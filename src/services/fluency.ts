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
