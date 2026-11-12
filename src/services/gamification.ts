import type { AnswerResult, ModuleId, SessionResult } from '@/types';

// XP multipliers per level
const LEVEL_MULTIPLIERS: Record<number, number> = {
  1: 1.0,
  2: 1.5,
  3: 2.0,
  4: 2.5,
  5: 3.0,
};

const BASE_XP = 10;
const STREAK_BONUS = 5;
const STREAK_THRESHOLD = 3;

// ─── XP Calculation ───
export function calculateSessionXP(args: {
  level: number;
  answers: { correct: boolean }[];
}): number {
  const multiplier = LEVEL_MULTIPLIERS[args.level] ?? 1;
  let xp = 0;
  let streak = 0;

  for (const answer of args.answers) {
    if (answer.correct) {
      xp += BASE_XP * multiplier;
      streak++;
      if (streak > 0 && streak % STREAK_THRESHOLD === 0) {
        xp += STREAK_BONUS;
      }
    } else {
      streak = 0;
    }
  }

  return Math.round(xp);
}

// ─── Stars (1-3) ───
export function calculateStars(correct: number, total: number): number {
  if (total === 0) return 0;
  const pct = (correct / total) * 100;
  if (pct >= 90) return 3;
  if (pct >= 80) return 2;
  if (pct >= 70) return 1;
  return 0;
}

// ─── Level Unlock (≥70%) ───
export function shouldUnlockNextLevel(correct: number, total: number): boolean {
  if (total === 0) return false;
  return (correct / total) * 100 >= 70;
}

// ─── XP → Level (100 XP per level, exponential) ───
export function calculateXPLevel(totalXP: number): {
  level: number;
  currentXP: number;
  nextLevelXP: number;
  progress: number;
} {
  let level = 1;
  let xpNeeded = 100;
  let remaining = totalXP;

  while (remaining >= xpNeeded) {
    remaining -= xpNeeded;
    level++;
    xpNeeded = Math.floor(100 * Math.pow(1.2, level - 1));
  }

  return {
    level,
    currentXP: remaining,
    nextLevelXP: xpNeeded,
    progress: remaining / xpNeeded,
  };
}

// ─── Score percentage ───
export function calculateScore(correct: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((correct / total) * 100);
}

// ─── Session summary ───
export function buildSessionResult(args: {
  module: ModuleId;
  level: number;
  answers: AnswerResult[];
  startTime: number;
}): SessionResult {
  const correct = args.answers.filter((a) => a.is_correct).length;
  const total = args.answers.length;
  const score = calculateScore(correct, total);
  const stars = calculateStars(correct, total);
  const xp = calculateSessionXP({
    level: args.level,
    answers: args.answers.map((a) => ({ correct: a.is_correct })),
  });

  const totalTimeMs = Date.now() - args.startTime;
  const avgTime = total > 0
    ? Math.round(args.answers.reduce((s, a) => s + a.time_ms, 0) / total)
    : 0;

  return {
    id: `${args.module}_l${args.level}_${Date.now()}`,
    module: args.module as ModuleId,
    level: args.level,
    total_questions: total,
    correct_answers: correct,
    score_percent: score,
    stars,
    xp_earned: xp,
    time_ms: totalTimeMs,
    answers: args.answers,
    completed_at: new Date().toISOString(),
    avg_time_per_exercise: avgTime,
  };
}

/** The daily challenge gives this extra XP the first time it is completed each day */
export const DAILY_BONUS_XP = 50;

export function dailyDoneToday(history: { mode?: string; completed_at: string }[], now = new Date()): boolean {
  const today = now.toDateString();
  return history.some((s) => s.mode === 'daily' && new Date(s.completed_at).toDateString() === today);
}
