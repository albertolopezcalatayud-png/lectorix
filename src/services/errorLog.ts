/**
 * Keeps the last errors on the device (never sent anywhere), so a tester can copy them
 * from Settings and send them to us if something goes wrong.
 */
const KEY = 'lectorix-errors';
const MAX = 20;

export interface ErrorEntry { at: string; route: string; message: string; stack?: string; version: string }

export const APP_VERSION: string = __APP_VERSION__;

export function logError(message: string, stack?: string) {
  try {
    const list: ErrorEntry[] = JSON.parse(localStorage.getItem(KEY) || '[]');
    list.unshift({ at: new Date().toISOString(), route: location.hash || '/', message: String(message).slice(0, 500), stack: stack?.slice(0, 1500), version: APP_VERSION });
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX)));
  } catch {
    // storage can be full or unavailable: never break the app because of the log
  }
}

export function readErrors(): ErrorEntry[] {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
}

export function clearErrors() {
  try { localStorage.removeItem(KEY); } catch { /* ignore */ }
}

export function errorReport(): string {
  const list = readErrors();
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  return [`Lectorix ${APP_VERSION}`, ua, '', ...list.map((e) => `[${e.at}] ${e.route} (${e.version})\n${e.message}\n${(e.stack || '').split('\n').slice(0, 6).join('\n')}`)].join('\n');
}

let installed = false;
/** Records uncaught errors and rejected promises */
export function installErrorLog() {
  if (installed || typeof window === 'undefined') return;
  installed = true;
  window.addEventListener('error', (ev) => logError(ev.message || 'error', ev.error?.stack));
  window.addEventListener('unhandledrejection', (ev) => {
    const r = ev.reason;
    logError(r?.message || String(r), r?.stack);
  });
}
