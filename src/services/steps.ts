import type { ModuleId, SessionResult } from '@/types';

/**
 * Steps inside a level: every level is split into three steps (1 easy, 2 middle, 3 challenge)
 * using the difficulty of each exercise. The student climbs one step after a session of 80 % or more
 * and goes back one after a session under 50 %. On step 3, a few easy exercises of the next level
 * start to appear, so moving up a level is never a jump.
 */
export type Step = 1 | 2 | 3;

const sessionLang = (s: SessionResult) => s.answers?.[0]?.exercise_id.split('_')[0];

/** Step reached in a level, replaying that level's normal sessions in order */
export function currentStep(history: SessionResult[], lang: string, module: ModuleId, level: number, upTo?: number): Step {
  let step: Step = 1;
  const list = history
    .filter((s) => s.module === module && s.level === level && (s.mode ?? 'normal') === 'normal' && sessionLang(s) === lang)
    .sort((a, b) => a.completed_at.localeCompare(b.completed_at));
  const n = upTo ?? list.length;
  for (const s of list.slice(0, n)) {
    if (s.score_percent >= 80) step = Math.min(3, step + 1) as Step;
    else if (s.score_percent < 50) step = Math.max(1, step - 1) as Step;
  }
  return step;
}

/** Step before and after the last session of that level (for the results screen) */
export function stepChange(history: SessionResult[], lang: string, module: ModuleId, level: number): { before: Step; after: Step } {
  const count = history.filter((s) => s.module === module && s.level === level && (s.mode ?? 'normal') === 'normal' && sessionLang(s) === lang).length;
  return {
    before: currentStep(history, lang, module, level, Math.max(0, count - 1)),
    after: currentStep(history, lang, module, level),
  };
}
