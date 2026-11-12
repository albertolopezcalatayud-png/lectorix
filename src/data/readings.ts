import { useEffect, useState } from 'react';
import type { Exercise } from '@/types';
import { loadReadings } from './content';
import { usePracticeLang } from '@/stores/useAppStore';

export interface ReadingQuestion {
  id: string;
  prompt: string;
  options: string[];
  correct: number;
  explanation: string;
}

export interface Reading {
  id: string;
  level: number;
  title: string;
  emoji: string;
  /** Interests the reading is about (see src/data/topics.ts) */
  topics?: string[];
  text: string;
  questions: ReadingQuestion[];
  /** Readings of other school subjects (Secondary) */
  subject?: 'bio' | 'fyq' | 'geohist';
  /** Key words of a subject reading: [term, meaning] */
  glossary?: [string, string][];
}

export const SUBJECTS = [
  { id: 'bio', emoji: '🧬' },
  { id: 'fyq', emoji: '⚗️' },
  { id: 'geohist', emoji: '🗺️' },
] as const;

/** Voice of a reading, from its id */
export const readingVoice = (id: string) => (id.startsWith('reading_en') ? 'en-GB' : id.startsWith('lectura_ca') ? 'ca-ES' : 'es-ES');

/** Readings of the current practice language (null while loading) */
export function useReadings(): Reading[] | null {
  const lang = usePracticeLang();
  const [list, setList] = useState<{ lang: string; items: Reading[] } | null>(null);
  useEffect(() => {
    let cancelled = false;
    loadReadings(lang).then((items) => { if (!cancelled) setList({ lang, items }); }).catch(() => { if (!cancelled) setList({ lang, items: [] }); });
    return () => { cancelled = true; };
  }, [lang]);
  return list && list.lang === lang ? list.items : null;
}

/** A reading by id from any language bank (ids are unique across languages) */
export function useReading(id: string | undefined): Reading | undefined | null {
  const [found, setFound] = useState<Reading | undefined | null>(null);
  useEffect(() => {
    let cancelled = false;
    if (!id) { setFound(undefined); return; }
    Promise.all((['es', 'ca', 'en'] as const).map((l) => loadReadings(l).catch(() => [] as Reading[])))
      .then((banks) => { if (!cancelled) setFound(banks.flat().find((r) => r.id === id)); });
    return () => { cancelled = true; };
  }, [id]);
  return found;
}

export const wordCount = (r: Reading) => r.text.split(/\s+/).filter(Boolean).length;

/** Minutes for a young / struggling reader (~60 words per minute) */
export const readingMinutes = (r: Reading) => Math.max(1, Math.round(wordCount(r) / 60));

/** Comprehension questions as regular multiple-choice exercises */
export const questionsAsExercises = (r: Reading): Exercise[] =>
  r.questions.map((q) => ({
    id: q.id,
    module: 'comprension_lectora',
    level: r.level,
    type: 'multiple_choice',
    prompt: q.prompt,
    options: q.options,
    correct: q.correct,
    explanation: q.explanation,
  })) as Exercise[];
