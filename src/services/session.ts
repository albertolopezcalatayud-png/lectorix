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
