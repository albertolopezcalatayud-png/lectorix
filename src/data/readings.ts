import data from '@/data/lecturas.json';
import type { Exercise } from '@/types';

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
  text: string;
  questions: ReadingQuestion[];
}

export const READINGS: Reading[] = (data as { readings: Reading[] }).readings;

export const getReading = (id: string) => READINGS.find((r) => r.id === id);

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
