/**
 * Reading challenges of the week, for the family or a group of friends.
 * No accounts, no server, no chat and no personal data: a challenge is a short code
 * (type + goal + week). Family members are only a nickname and an emoji on this device;
 * friends enter the same code on their own devices and each one keeps their own progress.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SessionResult } from '@/types';
import type { Book, ReadLog } from '@/services/shelf';

export type ChallengeKind = 'minutes' | 'days' | 'book';
export interface Member { id: string; emoji: string; nick: string }
export interface MemberLog { id: string; member: string; minutes: number; date: string }
export interface Challenge {
  code: string;
  kind: ChallengeKind;
  goal: number;          // minutes for the whole team, reading days each, or books for the team
  week: string;          // Monday of the week, YYYY-MM-DD
  mode: 'family' | 'friends';
  members: Member[];     // family mode: other people reading at home (the student is always "me")
  logs: MemberLog[];
  done?: string;         // when it was completed
}

export const GOALS: Record<ChallengeKind, number[]> = { minutes: [60, 120, 200, 300], days: [3, 4, 5, 7], book: [1, 2, 3] };
export const EMOJIS = ['🦊', '🐼', '🦉', '🐢', '🦄', '🐯', '🐸', '🐙', '🦁', '🐨'];

const pad = (n: number) => String(n).padStart(2, '0');
const ymd = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/** Monday of the week of a date */
export function weekOf(date = new Date()): string {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - day);
  return ymd(d);
}
export function weekEnd(week: string): Date {
  const [y, m, d] = week.split('-').map(Number);
  return new Date(y, m - 1, d + 6, 23, 59, 59, 999);
}
const inWeek = (iso: string, week: string) => {
  const t = new Date(iso).getTime();
  const [y, m, d] = week.split('-').map(Number);
  return t >= new Date(y, m - 1, d).getTime() && t <= weekEnd(week).getTime();
};

/* Code: LX-<kind letter><goal>-<yymmdd of Monday>, e.g. LX-M120-261109 */
const K: Record<ChallengeKind, string> = { minutes: 'M', days: 'D', book: 'B' };
export function makeCode(kind: ChallengeKind, goal: number, week: string) {
  return `LX-${K[kind]}${goal}-${week.slice(2).replace(/-/g, '')}`;
}
export function parseCode(raw: string): { kind: ChallengeKind; goal: number; week: string } | null {
  const m = raw.trim().toUpperCase().replace(/\s+/g, '').match(/^LX-?([MDB])(\d{1,3})-?(\d{6})$/);
  if (!m) return null;
  const kind = (Object.keys(K) as ChallengeKind[]).find((k) => K[k] === m[1])!;
  const goal = Number(m[2]);
  if (!GOALS[kind].includes(goal)) return null;
  const week = `20${m[3].slice(0, 2)}-${m[3].slice(2, 4)}-${m[3].slice(4, 6)}`;
  const [y, mo, d] = week.split('-').map(Number);
  const dt = new Date(y, mo - 1, d);
  if (dt.getFullYear() !== y || dt.getMonth() !== mo - 1 || dt.getDay() !== 1) return null; // must be a real Monday
  return { kind, goal, week };
}

/** The student's own reading this week: paper books + reading done in the app */
export function myReading(week: string, history: SessionResult[], books: Book[], logs: ReadLog[]) {
  const paper = logs.filter((l) => inWeek(l.date, week));
  const app = history.filter((s) => (s.mode === 'reading' || s.module === 'comprension_lectora') && inWeek(s.completed_at, week));
  const minutes = paper.reduce((m, l) => m + l.minutes, 0) + Math.round(app.reduce((m, s) => m + (s.time_ms || 0), 0) / 60000);
  const days = new Set([...paper.map((l) => new Date(l.date).toDateString()), ...app.map((s) => new Date(s.completed_at).toDateString())]).size;
  const finished = books.filter((b) => b.finished && inWeek(b.finished, week)).length;
  return { minutes, days, finished };
}

export function progressOf(c: Challenge, mine: { minutes: number; days: number; finished: number }) {
  const others = c.logs.filter((l) => inWeek(l.date, c.week));
  const byMember = c.members.map((m) => {
    const ls = others.filter((l) => l.member === m.id);
    return { member: m, minutes: ls.reduce((s, l) => s + l.minutes, 0), days: new Set(ls.map((l) => new Date(l.date).toDateString())).size };
  });
  let value: number;
  if (c.kind === 'minutes') value = mine.minutes + byMember.reduce((s, b) => s + b.minutes, 0);
  else if (c.kind === 'days') value = mine.days; // each one their own days; the challenge counts the student's
  else value = mine.finished;
  return { value, goal: c.goal, pct: Math.min(100, Math.round((value / c.goal) * 100)), byMember };
}

const uid = () => Math.random().toString(36).slice(2, 9);

interface ChallengeState {
  current: Challenge | null;
  medals: { code: string; kind: ChallengeKind; goal: number; week: string; date: string }[];
  start: (kind: ChallengeKind, goal: number, mode: Challenge['mode'], week?: string) => void;
  addMember: (nick: string, emoji: string) => void;
  removeMember: (id: string) => void;
  logMember: (member: string, minutes: number) => void;
  complete: () => void;
  leave: () => void;
}

export const useChallenge = create<ChallengeState>()(
  persist(
    (set, get) => ({
      current: null,
      medals: [],
      start: (kind, goal, mode, week = weekOf()) => set({ current: { code: makeCode(kind, goal, week), kind, goal, week, mode, members: [], logs: [] } }),
      addMember: (nick, emoji) => set((s) => s.current ? { current: { ...s.current, members: [...s.current.members, { id: uid(), nick: nick.trim().slice(0, 16), emoji }].slice(0, 6) } } : s),
      removeMember: (id) => set((s) => s.current ? { current: { ...s.current, members: s.current.members.filter((m) => m.id !== id), logs: s.current.logs.filter((l) => l.member !== id) } } : s),
      logMember: (member, minutes) => set((s) => s.current ? { current: { ...s.current, logs: [...s.current.logs, { id: uid(), member, minutes: Math.max(1, Math.min(240, Math.round(minutes))), date: new Date().toISOString() }] } } : s),
      complete: () => {
        const c = get().current;
        if (!c || c.done) return;
        set((s) => ({ current: { ...c, done: new Date().toISOString() }, medals: [{ code: c.code, kind: c.kind, goal: c.goal, week: c.week, date: new Date().toISOString() }, ...s.medals].slice(0, 52) }));
      },
      leave: () => set({ current: null }),
    }),
    { name: 'lectorix-challenge' },
  ),
);
