import { useState, useEffect } from 'react';
import type { Exercise, ModuleId } from '@/types';
import { loadModule } from '@/data/content';
import { usePracticeLang } from '@/stores/useAppStore';

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

        // Filter by level
        const levelExercises = allExercises.filter((ex: Exercise) => ex.level === level);

        if (levelExercises.length === 0) {
          throw new Error(`No exercises found for ${module} level ${level}`);
        }

        // Shuffle and pick `count` exercises
        const shuffled = [...levelExercises].sort(() => Math.random() - 0.5);
        const selected = shuffled.slice(0, count);

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
