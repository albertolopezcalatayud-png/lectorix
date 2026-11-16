/**
 * Several students on one device (asked for by a school counsellor: one tablet, a space for each student).
 * No accounts and no server: every profile is a complete, separate set of the app's data, kept on this device.
 *
 * How it works: the app stores everything a student does in localStorage under "lectorix-…" keys. The active
 * profile simply lives there, as always. The other profiles are kept aside (IndexedDB, which has room for
 * dozens of students) and swapped in when chosen; the app then reloads so every screen starts from the new data.
 * What belongs to the device and not to the student (downloaded voices and recogniser, notification
 * permission…) is shared.
 * With a single profile nothing changes: there is no registry and no picker.
 */
const REG = 'lectorix-profiles';
const CHOSEN = 'lectorix-profile-chosen';      // sessionStorage: the picker was already answered in this run
const FALLBACK = 'lectorix-profile-data-';     // localStorage copy when IndexedDB is not available
const DEVICE_KEYS = new Set(['lectorix-voice-prefs', 'lectorix-natural-voice', 'lectorix-natural-voice-choice', 'lectorix-ra-probe', 'lectorix-ra-probing',
  'lectorix-push-key', 'lectorix-notifications-enabled', 'lectorix-reminder-hour', 'lectorix-readaloud', 'lectorix-errors', 'lectorix-asr', 'lectorix-mode']);
const isProfileKey = (k: string) => k.startsWith('lectorix-') && k !== REG && !k.startsWith(FALLBACK) && !k.startsWith('lectorix-asr-') && !DEVICE_KEYS.has(k);

export interface ProfileSummary { xp: number; streak: number; last: string | null; wcpm: number | null; sessions: number }
export interface Profile { id: string; name: string; avatar: string; created: string; summary?: ProfileSummary }
interface Registry { v: 1; active: string; pin?: { salt: string; hash: string }; list: Profile[] }
export type Data = Record<string, string>;
/**
 * How this device is used. 'solo': one student (or a family with one child): the app is theirs.
 * 'group': an adult lends it to several students (school support, a classroom, brothers and sisters):
 * the app opens on "Who is going to practise?" and the adult has no profile of their own.
 * null: not answered yet; the app asks once, to everyone (also after updating).
 */
export type Mode = 'solo' | 'group';
const MODE = 'lectorix-mode';
export const mode = (): Mode | null => { const m = localStorage.getItem(MODE); return m === 'solo' || m === 'group' ? m : null; };
/** Nobody has used this data yet (no welcome done, no student): typical of an adult who has just installed the app */
const untouched = (data: Data) => { try { const st = (JSON.parse(data['lectorix-store'] || '{}') as { state?: { user?: unknown; onboardingDone?: boolean } }).state; return !st?.user && !st?.onboardingDone; } catch { return true; } };
export function setMode(m: Mode | null) {
  if (!m) { localStorage.removeItem(MODE); return; }
  localStorage.setItem(MODE, m);
  // Changing to "several students" with a student already on the device: that student becomes the first profile
  if (m === 'group' && !registry() && !untouched(snapshot())) ensure();
}
export const AVATARS = ['🦊', '🐼', '🦁', '🐸', '🐙', '🦉', '🐢', '🦄', '🐝', '🐬', '🦖', '🐨', '🚀', '⚽', '🎨', '🎸'];

/* ---------- registry ---------- */
export function registry(): Registry | null {
  try { const r = JSON.parse(localStorage.getItem(REG) || 'null') as Registry | null; return r && r.v === 1 && Array.isArray(r.list) && r.list.length ? r : null; } catch { return null; }
}
const save = (r: Registry) => localStorage.setItem(REG, JSON.stringify(r));
export const profiles = (): Profile[] => registry()?.list ?? [];
export const activeProfile = (): Profile | null => { const r = registry(); return r?.list.find((p) => p.id === r.active) ?? null; };
const newId = () => `p${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

/* ---------- the data of a profile ---------- */
export function snapshot(): Data {
  const out: Data = {};
  for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i)!; if (isProfileKey(k)) out[k] = localStorage.getItem(k) ?? ''; }
  return out;
}
function load(data: Data) {
  for (const k of Object.keys(snapshot())) localStorage.removeItem(k);
  for (const [k, v] of Object.entries(data)) if (isProfileKey(k)) localStorage.setItem(k, v);
}
export function summarise(data: Data): ProfileSummary {
  const out: ProfileSummary = { xp: 0, streak: 0, last: null, wcpm: null, sessions: 0 };
  try {
    const st = (JSON.parse(data['lectorix-store'] || '{}') as { state?: { user?: { total_xp?: number; streak_days?: number; last_session?: string }; sessionHistory?: unknown[] } }).state;
    out.xp = st?.user?.total_xp ?? 0; out.streak = st?.user?.streak_days ?? 0; out.last = st?.user?.last_session ?? null; out.sessions = st?.sessionHistory?.length ?? 0;
  } catch { /* unreadable: empty summary */ }
  try {
    const fl = (JSON.parse(data['lectorix-fluency'] || '{}') as { state?: { results?: { wcpm?: number; date?: string }[] } }).state?.results;
    if (fl?.length) out.wcpm = [...fl].sort((a, b) => String(a.date).localeCompare(String(b.date))).pop()?.wcpm ?? null;
  } catch { /* ignore */ }
  return out;
}

/* ---------- where the profiles that are not in use are kept ---------- */
function db(): Promise<IDBDatabase> {
  return new Promise((res, rej) => {
    const rq = indexedDB.open('lectorix-profiles', 1);
    rq.onupgradeneeded = () => rq.result.createObjectStore('data');
    rq.onsuccess = () => res(rq.result); rq.onerror = () => rej(rq.error); rq.onblocked = () => rej(new Error('blocked'));
  });
}
async function idb<T>(mode: IDBTransactionMode, run: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const d = await db();
  try {
    return await new Promise<T>((res, rej) => { const tx = d.transaction('data', mode); const rq = run(tx.objectStore('data')); let v: T; rq.onsuccess = () => { v = rq.result; }; tx.oncomplete = () => res(v); tx.onerror = () => rej(tx.error); tx.onabort = () => rej(tx.error); });
  } finally { d.close(); }
}
async function put(id: string, data: Data): Promise<void> {
  try {
    await idb('readwrite', (s) => s.put(data, id));
    const back = await idb<Data | undefined>('readonly', (s) => s.get(id) as IDBRequest<Data | undefined>);
    if (!back || Object.keys(back).length !== Object.keys(data).length) throw new Error('not stored');
    localStorage.removeItem(FALLBACK + id);
  } catch {
    localStorage.setItem(FALLBACK + id, JSON.stringify(data)); // throws if there is no room: the caller stops before touching anything
  }
}
async function get(id: string): Promise<Data> {
  const fb = localStorage.getItem(FALLBACK + id);
  if (fb) { try { return JSON.parse(fb) as Data; } catch { /* fall through */ } }
  try { return (await idb<Data | undefined>('readonly', (s) => s.get(id) as IDBRequest<Data | undefined>)) ?? {}; } catch { return {}; }
}
async function drop(id: string) { localStorage.removeItem(FALLBACK + id); try { await idb('readwrite', (s) => s.delete(id)); } catch { /* ignore */ } }

/* ---------- actions ---------- */
/** First use of profiles: what is on the device becomes the first profile */
function ensure(): Registry {
  const r = registry(); if (r) return r;
  let name = '';
  try { name = (JSON.parse(localStorage.getItem('lectorix-store') || '{}') as { state?: { user?: { display_name?: string } } }).state?.user?.display_name ?? ''; } catch { /* ignore */ }
  const first: Profile = { id: newId(), name, avatar: AVATARS[0], created: new Date().toISOString() };
  const reg: Registry = { v: 1, active: first.id, list: [first] };
  save(reg);
  try { void navigator.storage?.persist?.(); } catch { /* ignore */ }
  return reg;
}
const reload = (path = '/') => { sessionStorage.setItem(CHOSEN, '1'); window.location.hash = `#${path}`; window.location.reload(); };

/** The language the app is in right now, so a new student starts in the language the adult chose */
function currentLanguage(): string | null {
  try { return (JSON.parse(localStorage.getItem('lectorix-store') || '{}') as { state?: { language?: string } }).state?.language ?? null; } catch { return null; }
}
export async function addProfile(name: string, avatar: string, given: Data = {}): Promise<Profile> {
  const lang = currentLanguage();
  const data: Data = given['lectorix-store'] || !lang ? given : { ...given, 'lectorix-store': JSON.stringify({ state: { language: lang }, version: 0 }) };
  const p: Profile = { id: newId(), name: name.trim().slice(0, 30), avatar, created: new Date().toISOString(), summary: summarise(data) };
  // An adult setting the device up for students: there is nobody on it yet, so the first student takes the
  // (empty) working space instead of leaving a profile that belongs to no one
  if (!registry() && mode() === 'group' && untouched(snapshot())) {
    load({ ...snapshot(), ...data });
    save({ v: 1, active: p.id, list: [p] });
    patchName(p.name);
    try { void navigator.storage?.persist?.(); } catch { /* ignore */ }
    return p;
  }
  const reg = ensure();
  await put(p.id, data);
  reg.list.push(p); save(reg);
  return p;
}
export function renameProfile(id: string, name: string, avatar?: string) {
  const reg = registry(); const p = reg?.list.find((x) => x.id === id); if (!reg || !p) return;
  p.name = name.trim().slice(0, 30); if (avatar) p.avatar = avatar; save(reg);
  if (reg.active === id) patchName(p.name);
}
/** Puts the profile's name where the app greets the student from */
function patchName(name: string) {
  try {
    const raw = JSON.parse(localStorage.getItem('lectorix-store') || 'null') as { state?: { user?: { display_name?: string } | null } } | null;
    if (raw?.state?.user && name && raw.state.user.display_name !== name) { raw.state.user.display_name = name; localStorage.setItem('lectorix-store', JSON.stringify(raw)); }
  } catch { /* ignore */ }
}
/** Saves the current student, brings in the chosen one and restarts the app. Nothing is touched if saving fails. */
export async function switchTo(id: string, then: 'reload' | 'stay' = 'reload', path = '/'): Promise<void> {
  const reg = ensure();
  const target = reg.list.find((p) => p.id === id); if (!target) throw new Error('unknown profile');
  if (reg.active !== id) {
    const current = snapshot();
    await put(reg.active, current);
    const cur = reg.list.find((p) => p.id === reg.active); if (cur) cur.summary = summarise(current);
    const incoming = await get(id);
    load(incoming);
    reg.active = id; save(reg);
  }
  patchName(target.name);
  if (then === 'reload') reload(path);
}
export async function removeProfile(id: string): Promise<void> {
  const reg = registry(); if (!reg || reg.list.length < 2) return;
  if (reg.active === id) { const other = reg.list.find((p) => p.id !== id)!; await switchTo(other.id, 'stay'); }
  const r2 = registry()!; r2.list = r2.list.filter((p) => p.id !== id); save(r2);
  await drop(id);
  if (reg.active === id) reload();
}
/** Refreshes the summary of the profile in use (the others were summarised when they were put aside) */
export function refreshActiveSummary() { const reg = registry(); const p = reg?.list.find((x) => x.id === reg.active); if (reg && p) { p.summary = summarise(snapshot()); save(reg); } }

/** Shown when the app opens and there is more than one profile */
export const needsPicker = () => (mode() === 'group' || profiles().length > 1) && sessionStorage.getItem(CHOSEN) !== '1';
/** Back to "Who is going to practise?" (the next student's turn) */
export const backToPicker = () => { sessionStorage.removeItem(CHOSEN); window.location.hash = '#/'; window.location.reload(); };
export const pickerAnswered = () => sessionStorage.setItem(CHOSEN, '1');

/* ---------- adult PIN (a child lock, not strong security: everything is on the device anyway) ---------- */
async function digest(salt: string, pin: string) {
  const text = `${salt}:${pin}`;
  if (crypto?.subtle) { const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)); return [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, '0')).join(''); }
  let h = 5381; for (const ch of text) h = ((h << 5) + h + ch.charCodeAt(0)) | 0; return `x${h}`;
}
export const hasPin = () => !!registry()?.pin;
export async function setPin(pin: string | null) {
  const reg = ensure();
  if (!pin) delete reg.pin; else { const salt = Math.random().toString(36).slice(2); reg.pin = { salt, hash: await digest(salt, pin) }; }
  save(reg);
}
export async function checkPin(pin: string) { const p = registry()?.pin; return !p || (await digest(p.salt, pin)) === p.hash; }

/* ---------- copy of a profile, to take it to another device or keep it safe ---------- */
interface ProfileFile { app: 'lectorix'; kind: 'profile'; v: 1; exported: string; name: string; avatar: string; data: Data }
export async function exportProfile(id: string): Promise<string> {
  const reg = ensure(); const p = reg.list.find((x) => x.id === id); if (!p) throw new Error('unknown profile');
  const data = reg.active === id ? snapshot() : await get(id);
  const file: ProfileFile = { app: 'lectorix', kind: 'profile', v: 1, exported: new Date().toISOString(), name: p.name, avatar: p.avatar, data };
  return JSON.stringify(file);
}
export async function exportAll(): Promise<string> {
  const reg = ensure();
  const all = await Promise.all(reg.list.map(async (p) => JSON.parse(await exportProfile(p.id)) as ProfileFile));
  return JSON.stringify({ app: 'lectorix', kind: 'profiles', v: 1, exported: new Date().toISOString(), profiles: all });
}
/** Reads a copy (one profile or all of them). Returns the profiles found, or null if it is not a Lectorix copy. */
export function readCopy(text: string): { name: string; avatar: string; data: Data; exported: string }[] | null {
  try {
    const f = JSON.parse(text) as { app?: string; kind?: string; profiles?: ProfileFile[] };
    if (f.app !== 'lectorix') return null;
    const list = f.kind === 'profiles' ? f.profiles ?? [] : f.kind === 'profile' ? [f as unknown as ProfileFile] : [];
    const ok = list.filter((p) => p && typeof p.data === 'object' && p.data !== null && Object.entries(p.data).every(([k, v]) => typeof k === 'string' && typeof v === 'string'));
    return ok.length ? ok.map((p) => ({ name: String(p.name ?? '').slice(0, 30), avatar: AVATARS.includes(p.avatar) ? p.avatar : AVATARS[0], exported: String(p.exported ?? ''), data: Object.fromEntries(Object.entries(p.data).filter(([k]) => isProfileKey(k))) })) : null;
  } catch { return null; }
}
/** Replaces the data of an existing profile with a copy (the caller has warned that the current data is lost) */
export async function replaceProfile(id: string, data: Data): Promise<void> {
  const reg = ensure(); const p = reg.list.find((x) => x.id === id); if (!p) throw new Error('unknown profile');
  p.summary = summarise(data); save(reg);
  if (reg.active === id) { load(data); patchName(p.name); reload(); } else await put(id, data);
}
