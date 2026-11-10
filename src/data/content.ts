/**
 * Practice content per language.
 * Each language has its own bank (not a translation): the exercises target the
 * spelling and reading difficulties of that language.
 */
import type { Exercise, ModuleId } from '@/types';
import type { Reading } from './readings';

export type PracticeLang = 'es' | 'ca' | 'en';

type Loader = () => Promise<{ default: { exercises: unknown[] } }>;

const BANKS: Record<PracticeLang, Record<ModuleId, Loader>> = {
  es: {
    fonologia: () => import('@/data/exercises/fonologia.json'),
    memoria_visual: () => import('@/data/exercises/memoria_visual.json'),
    comprension_lectora: () => import('@/data/exercises/comprension_lectora.json'),
    escritura: () => import('@/data/exercises/escritura.json'),
    retos_rapidos: () => import('@/data/exercises/retos_rapidos.json'),
  },
  ca: {
    fonologia: () => import('@/data/exercises/ca/fonologia.json'),
    memoria_visual: () => import('@/data/exercises/ca/memoria_visual.json'),
    comprension_lectora: () => import('@/data/exercises/ca/comprension_lectora.json'),
    escritura: () => import('@/data/exercises/ca/escritura.json'),
    retos_rapidos: () => import('@/data/exercises/ca/retos_rapidos.json'),
  },
  en: {
    fonologia: () => import('@/data/exercises/en/fonologia.json'),
    memoria_visual: () => import('@/data/exercises/en/memoria_visual.json'),
    comprension_lectora: () => import('@/data/exercises/en/comprension_lectora.json'),
    escritura: () => import('@/data/exercises/en/escritura.json'),
    retos_rapidos: () => import('@/data/exercises/en/retos_rapidos.json'),
  },
};

const READING_BANKS: Record<PracticeLang, () => Promise<{ default: { readings: unknown[] } }>> = {
  es: () => import('@/data/lecturas.json'),
  ca: () => import('@/data/lectures.ca.json'),
  en: () => import('@/data/readings.en.json'),
};

export async function loadModule(lang: PracticeLang, module: ModuleId): Promise<Exercise[]> {
  const loader = BANKS[lang]?.[module] ?? BANKS.es[module];
  const m = await loader();
  return (m.default.exercises || []) as Exercise[];
}

export async function loadReadings(lang: PracticeLang): Promise<Reading[]> {
  const m = await (READING_BANKS[lang] ?? READING_BANKS.es)();
  return (m.default.readings || []) as Reading[];
}

/** A dictation is a write exercise where the word/sentence is heard, not shown */
export function isDictationExercise(e: Exercise): boolean {
  return e.type === 'write' && !!e.word && (e.dictation === true || /^(escucha|escolta|listen)/i.test(e.prompt));
}
