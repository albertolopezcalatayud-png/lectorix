import { useState, useEffect } from 'react';
import type { Exercise, ModuleId } from '@/types';

// Import all exercise JSON data
// In production these would come from Supabase, but for now we load from static JSON
const exerciseModules: Record<string, () => Promise<{ default: { exercises: Exercise[] } }>> = {
  fonologia: () => import('@/data/exercises/fonologia.json').then(m => ({ default: { exercises: m.default.exercises as unknown as Exercise[] } })),
  memoria_visual: () => import('@/data/exercises/memoria_visual.json').then(m => ({ default: { exercises: m.default.exercises as unknown as Exercise[] } })),
  comprension_lectora: () => import('@/data/exercises/comprension_lectora.json').then(m => ({ default: { exercises: m.default.exercises as unknown as Exercise[] } })),
  escritura: () => import('@/data/exercises/escritura.json').then(m => ({ default: { exercises: m.default.exercises as unknown as Exercise[] } })),
  retos_rapidos: () => import('@/data/exercises/retos_rapidos.json').then(m => ({ default: { exercises: m.default.exercises as unknown as Exercise[] } })),
};

export function useExercises(module: ModuleId, level: number, count: number = 10) {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const loader = exerciseModules[module];
        if (!loader) {
          throw new Error(`Module ${module} not found`);
        }

        const data = await loader();
        const allExercises = data.default.exercises || [];

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
          setError(err instanceof Error ? err.message : 'Error cargando ejercicios');
          setLoading(false);
        }
      }
    }

    load();
    return () => { cancelled = true; };
  }, [module, level, count]);

  return { exercises, loading, error };
}
