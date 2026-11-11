/** Weekly summary for families, computed on the device from the session history */
import type { SessionResult, ModuleId } from '@/types';

export type Area = ModuleId;
const AREA_RE = /(fonologia|memoria_visual|comprension_lectora|escritura|retos_rapidos)/;

export function areaOfAnswer(exerciseId: string, session: SessionResult): Area {
  const m = exerciseId.match(AREA_RE);
  if (m) return m[1] as Area;
  if (/^(lectura|reading)_/.test(exerciseId) || session.mode === 'reading') return 'comprension_lectora';
  if (session.mode === 'dictation') return 'escritura';
  return session.module;
}

export interface AreaStat { area: Area; answered: number; correct: number; pct: number }
export interface WeekStats {
  from: Date;
  to: Date;
  daysPractised: number;
  minutes: number;
  sessions: number;
  answered: number;
  correct: number;
  pct: number;
  areas: AreaStat[];
  best?: AreaStat;
  weakest?: AreaStat;
  readings: number;
  dictations: number;
}

const DAY = 86400000;
const MIN_ANSWERS = 5; // an area needs some answers before we say anything about it

export function weekStats(history: SessionResult[], weeksAgo = 0, now = Date.now()): WeekStats {
  const end = new Date(now - weeksAgo * 7 * DAY);
  end.setHours(23, 59, 59, 999);
  const start = new Date(end.getTime() - 7 * DAY + 1);
  const inWeek = history.filter((s) => {
    const t = new Date(s.completed_at).getTime();
    return t >= start.getTime() && t <= end.getTime();
  });
  const days = new Set(inWeek.map((s) => new Date(s.completed_at).toDateString()));
  const per = new Map<Area, AreaStat>();
  let answered = 0, correct = 0;
  for (const s of inWeek) {
    for (const a of s.answers || []) {
      const area = areaOfAnswer(a.exercise_id, s);
      const st = per.get(area) ?? { area, answered: 0, correct: 0, pct: 0 };
      st.answered++;
      if (a.is_correct) st.correct++;
      per.set(area, st);
      answered++;
      if (a.is_correct) correct++;
    }
  }
  const areas = [...per.values()].map((a) => ({ ...a, pct: Math.round((a.correct / a.answered) * 100) }));
  const enough = areas.filter((a) => a.answered >= MIN_ANSWERS);
  const best = enough.length > 1 ? [...enough].sort((a, b) => b.pct - a.pct)[0] : undefined;
  const weakestCand = enough.length > 0 ? [...enough].sort((a, b) => a.pct - b.pct)[0] : undefined;
  const weakest = weakestCand && weakestCand.pct < 85 && weakestCand !== best ? weakestCand : undefined;
  return {
    from: start,
    to: end,
    daysPractised: days.size,
    minutes: Math.round(inWeek.reduce((m, s) => m + (s.time_ms || 0), 0) / 60000),
    sessions: inWeek.length,
    answered,
    correct,
    pct: answered ? Math.round((correct / answered) * 100) : 0,
    areas,
    best,
    weakest,
    readings: inWeek.filter((s) => s.mode === 'reading').length,
    dictations: inWeek.filter((s) => s.mode === 'dictation').length,
  };
}

type T = (key: never, vars?: Record<string, string | number>) => string;

/** Plain-language sentences for families, in the UI language */
export function weeklySummaryLines(
  tr: unknown,
  name: string,
  history: SessionResult[],
  words: string[],
  areaName: (a: Area) => string,
  fluency: { wcpm: number; date: string }[] = [],
  paper: { minutes: number; days: Set<string>; finished: string[] } = { minutes: 0, days: new Set(), finished: [] },
): string[] {
  const t = tr as T;
  const k = (key: string, vars?: Record<string, string | number>) => t(key as never, vars);
  const w = weekStats(history, 0);
  const prev = weekStats(history, 1);
  const lines: string[] = [];
  const paperLines = () => {
    if (paper.minutes > 0) lines.push(k('wk_paper', { min: paper.minutes }));
    if (paper.finished.length > 0) lines.push(k('wk_paper_done', { titles: paper.finished.join(', ') }));
  };
  // Days with practice in the app or reading a paper book
  const appDays = new Set(history.filter((s) => { const t = new Date(s.completed_at).getTime(); return t >= w.from.getTime() && t <= w.to.getTime(); })
    .map((s) => new Date(s.completed_at).toDateString()));
  const days = new Set([...appDays, ...paper.days]).size;
  if (w.sessions === 0 && paper.minutes === 0) {
    lines.push(k('wk_none', { name }));
    if (prev.daysPractised > 0) lines.push(k('wk_less', { prev: prev.daysPractised, now: 0 }));
    return lines;
  }
  lines.push(k('wk_days', { name, days, min: Math.max(1, w.minutes + paper.minutes) }));
  if (w.sessions === 0) { paperLines(); return lines; }
  if (w.answered > 0) lines.push(k('wk_accuracy', { n: w.answered, pct: w.pct }));
  if (prev.sessions > 0) {
    if (w.daysPractised > prev.daysPractised) lines.push(k('wk_more', { prev: prev.daysPractised, now: w.daysPractised }));
    else if (w.daysPractised < prev.daysPractised) lines.push(k('wk_less', { prev: prev.daysPractised, now: w.daysPractised }));
    else lines.push(k('wk_same'));
  }
  if (w.best) lines.push(k('wk_best', { area: areaName(w.best.area), pct: w.best.pct }));
  if (w.weakest) lines.push(k('wk_weak', { area: areaName(w.weakest.area), pct: w.weakest.pct }));
  if (w.readings + w.dictations > 0) lines.push(k('wk_extra', { r: w.readings, d: w.dictations }));
  paperLines();
  if (fluency.length > 0) {
    const last = fluency[fluency.length - 1];
    const prevF = fluency.length > 1 ? fluency[fluency.length - 2] : null;
    if (Date.now() - new Date(last.date).getTime() < 7 * DAY) {
      lines.push(prevF ? k('wk_fluency', { now: last.wcpm, prev: prevF.wcpm }) : k('wk_fluency_first', { now: last.wcpm }));
    }
  }
  if (words.length > 0) lines.push(k('wk_words', { words: words.join(', ') }));
  return lines;
}
