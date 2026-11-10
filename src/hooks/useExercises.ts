import { useState, useEffect } from 'react';
import type { Exercise, ModuleId } from '@/types';
import { loadModule } from '@/data/content';
import { useAppStore, usePracticeLang } from '@/stores/useAppStore';
import { useReviewStore, startOfDay } from '@/services/review';

const shuffle = <T,>(a: T[]) => {
  const r = [...a];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
};

/**
 * Picks the exercises for a level session, adapted to the student:
 * 1. up to 3 exercises of this level that are due for review today,
 * 2. exercises never seen before,
 * 3. exercises failed recently,
 * 4. everything else (already answered correctly).
 */
export function pickAdaptive(levelExercises: Exercise[], count: number, lang: string): Exercise[] {
  const history = useAppStore.getState().sessionHistory;
  const items = useReviewStore.getState().items;
  const seen = new Set<string>();
  const failed = new Set<string>();
  for (const s of history) {
    for (const a of s.answers || []) {
      seen.add(a.exercise_id);
      if (!a.is_correct) failed.add(a.exercise_id);
    }
  }
  const today = startOfDay() + 86400000 - 1;
  const due = shuffle(levelExercises.filter((e) => {
    const it = items[`${lang}:${e.id}`];
    return it && !it.mastered && it.due <= today;
  })).slice(0, 3);
  const dueIds = new Set(due.map((e) => e.id));
  const rest = levelExercises.filter((e) => !dueIds.has(e.id));
  const fresh = shuffle(rest.filter((e) => !seen.has(e.id)));
  const wrong = shuffle(rest.filter((e) => seen.has(e.id) && failed.has(e.id)));
  const known = shuffle(rest.filter((e) => seen.has(e.id) && !failed.has(e.id)));
  return shuffle([...due, ...[...fresh, ...wrong, ...known].slice(0, Math.max(0, count - due.length))]);
}

export function useExercises(module: ModuleId, level: number, count: number = 10) {
  const lang = usePracticeLang();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const allExercises = await loadModule(lang, module);
        const levelExercises = allExercises.filter((ex: Exercise) => ex.level === level);

        if (levelExercises.length === 0) {
          throw new Error(`No exercises found for ${module} level ${level}`);
        }

        const selected = count >= levelExercises.length ? levelExercises : pickAdaptive(levelExercises, count, lang);

        if (!cancelled) {
          setExercises(selected);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Error');
          setLoading(false);
        }
      }
    }

    load();
    return () => { cancelled = true; };
  }, [module, level, count, lang]);

  return { exercises, loading, error };
}
