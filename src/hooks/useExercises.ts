import { useState, useEffect } from 'react';
import type { Exercise, ModuleId } from '@/types';
import { loadModule } from '@/data/content';
import { useAppStore, usePracticeLang } from '@/stores/useAppStore';
import { useReviewStore, startOfDay } from '@/services/review';
import { currentStep, type Step } from '@/services/steps';

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
 * - up to 3 exercises of this level that are due for review today;
 * - most of the session at the student's step inside the level (easy, middle or challenge),
 *   a couple from easier steps to warm up and one or two from the step above;
 * - on the top step, two easy exercises of the next level as a preview (the "ramp");
 * - within each group: never seen first, then failed recently, then already right;
 * - ordered from easier to harder, so the session itself is a gentle slope.
 */
export function pickAdaptive(levelExercises: Exercise[], count: number, lang: string, nextLevel: Exercise[] = []): Exercise[] {
  const st = useAppStore.getState();
  const history = st.sessionHistory;
  const items = useReviewStore.getState().items;
  const seen = new Set<string>();
  const failed = new Set<string>();
  for (const s of history) {
    for (const a of s.answers || []) {
      seen.add(a.exercise_id);
      if (!a.is_correct) failed.add(a.exercise_id);
    }
  }
  const sample = levelExercises[0];
  const step: Step = sample ? currentStep(history, lang, sample.module, sample.level) : 1;

  const today = startOfDay() + 86400000 - 1;
  const due = shuffle(levelExercises.filter((e) => {
    const it = items[`${lang}:${e.id}`];
    return it && !it.mastered && it.due <= today;
  })).slice(0, 3);
  const used = new Set(due.map((e) => e.id));

  // Priority inside any group: never seen, then failed, then already right
  const take = (pool: Exercise[], n: number): Exercise[] => {
    const rest = pool.filter((e) => !used.has(e.id));
    const ordered = [
      ...shuffle(rest.filter((e) => !seen.has(e.id))),
      ...shuffle(rest.filter((e) => seen.has(e.id) && failed.has(e.id))),
      ...shuffle(rest.filter((e) => seen.has(e.id) && !failed.has(e.id))),
    ].slice(0, Math.max(0, n));
    ordered.forEach((e) => used.add(e.id));
    return ordered;
  };

  const stepOf = (e: Exercise) => e.step ?? 2;
  const room = Math.max(0, count - due.length);
  const ramp = step === 3 && nextLevel.length > 0 ? Math.min(2, room) : 0;
  const above = step < 3 ? Math.min(2, room) : 0;
  const below = step > 1 ? Math.min(2, room - above - ramp) : 0;

  const picked: Exercise[] = [
    ...take(levelExercises.filter((e) => stepOf(e) < step), below),
    ...take(levelExercises.filter((e) => stepOf(e) > step), above),
    ...take(nextLevel.filter((e) => stepOf(e) === 1 && e.type === 'multiple_choice'), ramp).map((e) => ({ ...e, preview: true })),
  ];
  picked.push(...take(levelExercises.filter((e) => stepOf(e) === step), room - picked.length));
  if (picked.length < room) picked.push(...take(levelExercises, room - picked.length)); // small banks

  // Gentle slope: review first, then by step (and previews last), shuffled inside each step
  const rank = (e: Exercise) => (e.preview ? 4 : stepOf(e));
  const body = shuffle(picked).sort((a, b) => rank(a) - rank(b));
  return [...shuffle(due), ...body];
}

export function useExercises(module: ModuleId, level: number, count: number = 10, ramp: boolean = true) {
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

        const nextLevel = ramp ? allExercises.filter((ex: Exercise) => ex.level === level + 1) : [];
        const selected = count >= levelExercises.length ? levelExercises : pickAdaptive(levelExercises, count, lang, nextLevel);

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
  }, [module, level, count, lang, ramp]);

  return { exercises, loading, error };
}
