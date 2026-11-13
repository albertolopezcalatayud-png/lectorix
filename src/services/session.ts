import type { SessionResult } from '@/types';
import { useAppStore } from '@/stores/useAppStore';
import notifications from '@/services/notifications';

const STREAK_MILESTONES = [3, 7, 14, 30, 60, 100];

/**
 * Records a finished session: XP, streak, history, reminder server.
 * Level progress (stars/unlocks) is handled by the caller, since only normal
 * module sessions change it.
 */
export function recordSession(result: SessionResult) {
  const store = useAppStore.getState();
  const prevStreak = store.user?.streak_days || 0;

  store.addXP(result.xp_earned);
  store.updateStreak();
  store.addSession(result);

  const after = useAppStore.getState();
  const newStreak = after.user?.streak_days || 0;

  // Tell the reminder server today is done + save streak for the push text
  void notifications.markPracticed(newStreak, after.language);

  if (newStreak > prevStreak && STREAK_MILESTONES.includes(newStreak) && notifications.isEnabled()) {
    notifications.showStreak(newStreak);
  }
}

/**
 * XP for activities that are not a scored session (paper reading, fluency test, read aloud,
 * family games). Counts as practice for the streak too. Returns the XP given.
 */
export function awardXP(amount: number) {
  const store = useAppStore.getState();
  if (amount <= 0) return 0;
  const prevStreak = store.user?.streak_days || 0;
  store.addXP(amount);
  store.updateStreak();
  const after = useAppStore.getState();
  const newStreak = after.user?.streak_days || 0;
  void notifications.markPracticed(newStreak, after.language);
  if (newStreak > prevStreak && STREAK_MILESTONES.includes(newStreak) && notifications.isEnabled()) {
    notifications.showStreak(newStreak);
  }
  return amount;
}

/** Same as awardXP, but at most `perDay` times a day for this activity, so it cannot be farmed */
export function awardActivityXP(key: string, amount: number, perDay: number) {
  const today = new Date().toDateString();
  let counts: Record<string, number> = {};
  try {
    const raw = JSON.parse(localStorage.getItem('lectorix-xp-daily') || '{}');
    if (raw.day === today) counts = raw.counts || {};
  } catch { /* ignore */ }
  if ((counts[key] || 0) >= perDay) return 0;
  const given = awardXP(amount);
  if (given) {
    counts[key] = (counts[key] || 0) + 1;
    try { localStorage.setItem('lectorix-xp-daily', JSON.stringify({ day: today, counts })); } catch { /* ignore */ }
  }
  return given;
}
