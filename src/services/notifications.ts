/**
 * Lectorix Push Notification Service
 * Uses the Notification API to remind students to practice daily.
 * Streak notifications motivate consistent practice.
 */

const PERMISSION_KEY = 'lectorix-notifications-enabled';
const REMINDER_HOUR_KEY = 'lectorix-reminder-hour';

export function isNotificationSupported(): boolean {
  return 'Notification' in window;
}

export function isNotificationEnabled(): boolean {
  try {
    return localStorage.getItem(PERMISSION_KEY) === 'true';
  } catch {
    return false;
  }
}

export function getPermissionStatus(): NotificationPermission | 'unsupported' {
  if (!isNotificationSupported()) return 'unsupported';
  return Notification.permission;
}

export function getReminderHour(): number {
  try {
    const stored = localStorage.getItem(REMINDER_HOUR_KEY);
    return stored ? parseInt(stored, 10) : 17; // default 5 PM
  } catch {
    return 17;
  }
}

export function setReminderHour(hour: number) {
  try {
    localStorage.setItem(REMINDER_HOUR_KEY, String(hour));
  } catch {
    // ignore
  }
  // Reschedule
  if (isNotificationEnabled()) {
    scheduleReminder();
  }
}

export async function requestPermission(): Promise<boolean> {
  if (!isNotificationSupported()) return false;

  try {
    const permission = await Notification.requestPermission();
    const granted = permission === 'granted';
    localStorage.setItem(PERMISSION_KEY, String(granted));
    if (granted) {
      scheduleReminder();
    }
    return granted;
  } catch {
    return false;
  }
}

export function disableNotifications() {
  try {
    localStorage.setItem(PERMISSION_KEY, 'false');
  } catch {
    // ignore
  }
  clearScheduledReminders();
}

/** Show a streak notification immediately */
export function showStreakNotification(streakDays: number) {
  if (!isNotificationSupported() || Notification.permission !== 'granted') return;

  try {
    new Notification('🔥 ¡Racha de ' + streakDays + ' días!', {
      body: 'Sigue así, estás mejorando día a día.',
      icon: '/lectorix/icons/icon-192x192.png',
      badge: '/lectorix/icons/icon-72x72.png',
      tag: 'streak',
      requireInteraction: false,
    });
  } catch {
    // Notifications may fail on some platforms
  }
}

/** Show a practice reminder notification */
export function showReminderNotification() {
  if (!isNotificationSupported() || Notification.permission !== 'granted' || !isNotificationEnabled()) return;

  try {
    new Notification('📚 ¡Hora de practicar!', {
      body: 'Solo 10 minutos al día marcan la diferencia. ¡Vamos!',
      icon: '/lectorix/icons/icon-192x192.png',
      badge: '/lectorix/icons/icon-72x72.png',
      tag: 'reminder',
      requireInteraction: false,
    });
  } catch {
    // ignore
  }
}

// ── Scheduling ──────────────────────────────────────────
// Simple browser-based scheduling using setTimeout
// (Full push requires a server; this works while the app/tab is open)

let reminderTimer: ReturnType<typeof setTimeout> | null = null;

function clearScheduledReminders() {
  if (reminderTimer) {
    clearTimeout(reminderTimer);
    reminderTimer = null;
  }
}

export function scheduleReminder() {
  clearScheduledReminders();

  if (!isNotificationEnabled()) return;

  const now = new Date();
  const targetHour = getReminderHour();
  const target = new Date(now);
  target.setHours(targetHour, 0, 0, 0);

  // If target time has passed today, schedule for tomorrow
  if (target.getTime() <= now.getTime()) {
    target.setDate(target.getDate() + 1);
  }

  const msUntilReminder = target.getTime() - now.getTime();

  reminderTimer = setTimeout(() => {
    showReminderNotification();
    // Reschedule for tomorrow
    scheduleReminder();
  }, msUntilReminder);
}

// Initialize on load
if (isNotificationEnabled()) {
  scheduleReminder();
}

const notifications = {
  isSupported: isNotificationSupported,
  isEnabled: isNotificationEnabled,
  getPermission: getPermissionStatus,
  request: requestPermission,
  disable: disableNotifications,
  showStreak: showStreakNotification,
  showReminder: showReminderNotification,
  getReminderHour,
  setReminderHour,
  schedule: scheduleReminder,
};

export default notifications;
