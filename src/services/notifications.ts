import { getTranslator } from '@/i18n';
import { useAppStore } from '@/stores/useAppStore';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

/** In the Android app, reminders are local notifications scheduled on the device (no server) */
const NATIVE = Capacitor.isNativePlatform();
const NATIVE_IDS = Array.from({ length: 14 }, (_, i) => 1000 + i);
const PRACTICED_KEY = 'lectorix-last-practiced';

async function nativeReschedule() {
  try {
    await LocalNotifications.cancel({ notifications: NATIVE_IDS.map((id) => ({ id })) });
    if (!isNotificationEnabled()) return;
    const t = getTranslator(useAppStore.getState().language);
    const hour = getReminderHour();
    let practicedToday = false;
    try { practicedToday = localStorage.getItem(PRACTICED_KEY) === localDate(); } catch { /* ignore */ }
    const now = new Date();
    const list = [];
    for (let d = 0; d < NATIVE_IDS.length; d++) {
      const at = new Date(now);
      at.setDate(now.getDate() + d);
      at.setHours(hour, 0, 0, 0);
      if (at.getTime() <= now.getTime()) continue;
      if (d === 0 && practicedToday) continue;
      list.push({ id: NATIVE_IDS[d], title: t('notif_reminder_title'), body: t('notif_reminder_body'), schedule: { at, allowWhileIdle: true }, smallIcon: 'ic_stat_lectorix' });
    }
    if (list.length) await LocalNotifications.schedule({ notifications: list });
  } catch {
    // notifications not available
  }
}
/**
 * Lectorix reminder service
 *
 * Two layers:
 *  1. Real Web Push (works with the app closed): the browser subscribes and the
 *     Lectorix push server sends an empty push at the chosen hour if the student
 *     hasn't practised that day. Needs VITE_PUSH_API (the server hands out its public key).
 *  2. Fallback: an in-page timer, used only when push isn't available
 *     (e.g. iOS Safari outside an installed app, or the server not configured).
 */

const PERMISSION_KEY = 'lectorix-notifications-enabled';
const REMINDER_HOUR_KEY = 'lectorix-reminder-hour';
const META_CACHE = 'lectorix-meta';
const META_URL = 'meta.json';

// Server URL: build-time env var, or push-config.json (written by the deploy workflow)
const BUILD_API = (import.meta.env.VITE_PUSH_API as string | undefined)?.replace(/\/$/, '') || '';
let PUSH_API = BUILD_API;
let apiLoaded: Promise<string> | null = null;

function loadApi(): Promise<string> {
  if (!apiLoaded) {
    apiLoaded = BUILD_API
      ? Promise.resolve(BUILD_API)
      : fetch(`${import.meta.env.BASE_URL}push-config.json`, { cache: 'no-store' })
          .then((r) => (r.ok ? r.json() : {}))
          .then((c: { api?: string }) => (PUSH_API = (c.api || '').replace(/\/$/, '')))
          .catch(() => '');
  }
  return apiLoaded;
}
const KEY_CACHE = 'lectorix-push-key';
const ICON = `${import.meta.env.BASE_URL}icons/icon-192.png`;
const BADGE = `${import.meta.env.BASE_URL}icons/maskable-192.png`;

export function isNotificationSupported(): boolean {
  if (NATIVE) return true;
  return typeof window !== 'undefined' && 'Notification' in window;
}

function pushSupported(): boolean {
  return typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window;
}

/** True once the server URL is known and the browser supports Web Push */
export function isPushAvailable(): boolean {
  return !!PUSH_API && pushSupported();
}

export function isNotificationEnabled(): boolean {
  try {
    return localStorage.getItem(PERMISSION_KEY) === 'true';
  } catch {
    return false;
  }
}

let nativePermission: NotificationPermission = 'default';
if (NATIVE) {
  void LocalNotifications.checkPermissions().then((p) => {
    nativePermission = p.display === 'granted' ? 'granted' : p.display === 'denied' ? 'denied' : 'default';
    if (nativePermission === 'granted' && isNotificationEnabled()) void nativeReschedule();
  }).catch(() => undefined);
}

export function getPermissionStatus(): NotificationPermission | 'unsupported' {
  if (NATIVE) return isNotificationEnabled() ? 'granted' : nativePermission;
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

function localDate(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function timeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/Madrid';
  } catch {
    return 'Europe/Madrid';
  }
}

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const raw = atob((base64 + padding).replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

async function api(path: string, body: unknown): Promise<boolean> {
  try {
    const res = await fetch(`${PUSH_API}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      keepalive: true,
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function getServerKey(): Promise<string | null> {
  try {
    const cached = localStorage.getItem(KEY_CACHE);
    if (cached) return cached;
  } catch {
    // ignore
  }
  try {
    const res = await fetch(`${PUSH_API}/key`);
    const data = await res.json();
    if (typeof data.publicKey === 'string') {
      try { localStorage.setItem(KEY_CACHE, data.publicKey); } catch { /* ignore */ }
      return data.publicKey;
    }
  } catch {
    // server unreachable
  }
  return null;
}

async function getSubscription(create: boolean): Promise<PushSubscription | null> {
  if (!pushSupported()) return null;
  await loadApi();
  if (!PUSH_API) return null;
  try {
    const reg = await navigator.serviceWorker.ready;
    const existing = await reg.pushManager.getSubscription();
    if (existing || !create) return existing;
    const key = await getServerKey();
    if (!key) return null;
    return await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(key) as BufferSource,
    });
  } catch {
    return null;
  }
}

/** Saves streak + language where the service worker can read them (Cache Storage). */
export async function saveMeta(meta: { streak?: number; lang?: string }) {
  if (!('caches' in window)) return;
  try {
    const cache = await caches.open(META_CACHE);
    const prev = await cache.match(META_URL).then((r) => (r ? r.json() : {})).catch(() => ({}));
    const next = { ...prev, ...meta };
    await cache.put(META_URL, new Response(JSON.stringify(next), { headers: { 'Content-Type': 'application/json' } }));
  } catch {
    // ignore
  }
}

async function registerPush(): Promise<boolean> {
  const sub = await getSubscription(true);
  if (!sub) return false;
  return api('/subscribe', { subscription: sub.toJSON(), hour: getReminderHour(), tz: timeZone() });
}

export async function requestPermission(): Promise<boolean> {
  if (NATIVE) {
    try {
      const p = await LocalNotifications.requestPermissions();
      const granted = p.display === 'granted';
      nativePermission = granted ? 'granted' : 'denied';
      localStorage.setItem(PERMISSION_KEY, String(granted));
      if (granted) await nativeReschedule();
      return granted;
    } catch {
      return false;
    }
  }
  if (!isNotificationSupported()) return false;
  try {
    const permission = await Notification.requestPermission();
    const granted = permission === 'granted';
    localStorage.setItem(PERMISSION_KEY, String(granted));
    if (granted) {
      const pushed = await registerPush();
      if (!pushed) scheduleReminder(); // fallback while the app is open
    }
    return granted;
  } catch {
    return false;
  }
}

export async function disableNotifications() {
  try {
    localStorage.setItem(PERMISSION_KEY, 'false');
  } catch {
    // ignore
  }
  clearScheduledReminders();
  if (NATIVE) {
    await nativeReschedule();
    return;
  }
  const sub = await getSubscription(false);
  if (sub) {
    await api('/unsubscribe', { endpoint: sub.endpoint });
    await sub.unsubscribe().catch(() => undefined);
  }
}

export function setReminderHour(hour: number) {
  try {
    localStorage.setItem(REMINDER_HOUR_KEY, String(hour));
  } catch {
    // ignore
  }
  if (!isNotificationEnabled()) return;
  if (NATIVE) {
    void nativeReschedule();
    return;
  }
  void registerPush().then((pushed) => {
    if (!pushed) scheduleReminder();
  });
}

/** Call after every finished session: the server skips today's reminder. */
export async function markPracticed(streak: number, lang: string) {
  if (NATIVE) {
    try { localStorage.setItem(PRACTICED_KEY, localDate()); } catch { /* ignore */ }
    if (isNotificationEnabled()) await nativeReschedule();
    return;
  }
  await saveMeta({ streak, lang });
  if (!isNotificationEnabled()) return;
  const sub = await getSubscription(false);
  if (sub) await api('/practiced', { endpoint: sub.endpoint, date: localDate() });
}

async function show(title: string, body: string, tag: string) {
  if (NATIVE) {
    try {
      await LocalNotifications.schedule({ notifications: [{ id: tag === 'streak' ? 2000 : 2001, title, body, smallIcon: 'ic_stat_lectorix' }] });
    } catch { /* ignore */ }
    return;
  }
  if (!isNotificationSupported() || Notification.permission !== 'granted') return;
  try {
    // Prefer the service worker: required on Android, where `new Notification` throws
    const reg = 'serviceWorker' in navigator ? await navigator.serviceWorker.getRegistration() : undefined;
    if (reg) await reg.showNotification(title, { body, icon: ICON, badge: BADGE, tag });
    else new Notification(title, { body, icon: ICON, tag });
  } catch {
    // Notifications may fail on some platforms
  }
}

/** Translator for the current menu language (works outside React) */
function uiT() {
  return getTranslator(useAppStore.getState().language);
}

/** Streak milestone, shown right after finishing a session */
export function showStreakNotification(streakDays: number) {
  const t = uiT();
  void show(t('notif_streak_title', { n: streakDays }), t('notif_streak_body'), 'streak');
}

export function showReminderNotification() {
  if (!isNotificationEnabled()) return;
  const t = uiT();
  void show(t('notif_reminder_title'), t('notif_reminder_body'), 'reminder');
}

// ── Fallback scheduling (only while the app is open) ─────
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
  const target = new Date(now);
  target.setHours(getReminderHour(), 0, 0, 0);
  if (target.getTime() <= now.getTime()) target.setDate(target.getDate() + 1);

  reminderTimer = setTimeout(() => {
    showReminderNotification();
    scheduleReminder();
  }, target.getTime() - now.getTime());
}

// On load: keep the server subscription fresh, or fall back to the in-page timer
if (!NATIVE && isNotificationEnabled() && getPermissionStatus() === 'granted') {
  void registerPush().then((pushed) => {
    if (!pushed) scheduleReminder();
  });
}

const notifications = {
  isSupported: isNotificationSupported,
  isPushAvailable,
  isEnabled: isNotificationEnabled,
  getPermission: getPermissionStatus,
  request: requestPermission,
  disable: disableNotifications,
  showStreak: showStreakNotification,
  showReminder: showReminderNotification,
  markPracticed,
  saveMeta,
  getReminderHour,
  setReminderHour,
  schedule: scheduleReminder,
};

export default notifications;
