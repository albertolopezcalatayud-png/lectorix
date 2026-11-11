import { useEffect, useState } from 'react';
import type { Exercise, ModuleId, SessionResult } from '@/types';
import { MODULES } from '@/data/modules';
import { SKILL_BY_ID } from '@/data/skills';
import { loadModule, type PracticeLang } from '@/data/content';

/** Exercise id → exercise, for one practice language (the banks are cached by loadModule) */
export type ExerciseIndex = Map<string, Exercise>;

export async function loadIndex(lang: string): Promise<ExerciseIndex> {
  const banks = await Promise.all(MODULES.map((m) => loadModule(lang as PracticeLang, m.id).catch(() => [] as Exercise[])));
  return new Map(banks.flat().map((e) => [e.id, e]));
}

export function useExerciseIndex(lang: string): ExerciseIndex | null {
  const [index, setIndex] = useState<ExerciseIndex | null>(null);
  useEffect(() => {
    let off = false;
    setIndex(null);
    loadIndex(lang).then((i) => { if (!off) setIndex(i); });
    return () => { off = true; };
  }, [lang]);
  return index;
}

export interface SkillStat {
  id: string;
  right: number;
  total: number;
  pct: number;
  status: 'strong' | 'ok' | 'weak';
}

const WINDOW = 30;      // recent answers per skill that count
export const MIN_ANSWERS = 5;

/** Accuracy per skill over the most recent answers (only skills with enough answers) */
export function skillStats(history: SessionResult[], index: ExerciseIndex): SkillStat[] {
  const recent = [...history].sort((a, b) => b.completed_at.localeCompare(a.completed_at));
  const acc: Record<string, { right: number; total: number }> = {};
  for (const s of recent) {
    for (const a of s.answers || []) {
      const ex = index.get(a.exercise_id);
      const sk = ex?.skill;
      if (!sk || !SKILL_BY_ID[sk]) continue;
      const v = (acc[sk] ??= { right: 0, total: 0 });
      if (v.total >= WINDOW) continue;
      v.total++;
      if (a.is_correct) v.right++;
    }
  }
  return Object.entries(acc)
    .filter(([, v]) => v.total >= MIN_ANSWERS)
    .map(([id, v]) => {
      const pct = Math.round((v.right / v.total) * 100);
      return { id, ...v, pct, status: pct >= 85 ? 'strong' : pct >= 70 ? 'ok' : 'weak' } as SkillStat;
    })
    .sort((a, b) => a.pct - b.pct);
}

/** The skill most worth training now (lowest accuracy under 70 %), if any */
export function weakestSkill(history: SessionResult[], index: ExerciseIndex): SkillStat | null {
  return skillStats(history, index).find((s) => s.status === 'weak') ?? null;
}

/**
 * Exercises to train one skill: around the level the student is working on in each area
 * (that level and the one below), failed first, then new, then already right; easier first.
 */
export function pickSkillSession(
  index: ExerciseIndex, skill: string, history: SessionResult[], levelOf: (m: ModuleId) => number, count = 10,
): Exercise[] {
  const seen = new Set<string>(), failed = new Set<string>();
  for (const s of history) for (const a of s.answers || []) { seen.add(a.exercise_id); if (!a.is_correct) failed.add(a.exercise_id); }
  const all = [...index.values()].filter((e) => e.skill === skill);
  const near = (e: Exercise) => { const l = levelOf(e.module); return e.level <= l && e.level >= l - 1; };
  let pool = all.filter(near);
  if (pool.length < count) pool = all.filter((e) => e.level <= levelOf(e.module) + 1);
  if (pool.length < count) pool = all;
  const shuffle = <T,>(a: T[]) => { const r = [...a]; for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; } return r; };
  const picked = [
    ...shuffle(pool.filter((e) => failed.has(e.id))),
    ...shuffle(pool.filter((e) => !seen.has(e.id))),
    ...shuffle(pool.filter((e) => seen.has(e.id) && !failed.has(e.id))),
  ].slice(0, count);
  return picked.sort((a, b) => a.level - b.level || (a.step ?? 2) - (b.step ?? 2));
}
