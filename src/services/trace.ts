/**
 * Checks a stroke traced with the finger against the model stroke (data/strokes.ts).
 * The model is sampled every unit along its path; the child must start near its start, go the same way and
 * cover almost all of it without wandering off. Going backwards does not count, so the direction is learnt too.
 */
export type Pt = { x: number; y: number };

/** Points every `step` units along an SVG path (needs the DOM: an off-screen SVG path element) */
export function samplePath(d: string, step = 1): Pt[] {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('style', 'position:absolute;width:0;height:0;overflow:hidden');
  const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  p.setAttribute('d', d);
  svg.appendChild(p);
  document.body.appendChild(svg);
  try {
    const len = p.getTotalLength();
    const out: Pt[] = [];
    for (let s = 0; s <= len; s += step) { const q = p.getPointAtLength(s); out.push({ x: q.x, y: q.y }); }
    const e = p.getPointAtLength(len); out.push({ x: e.x, y: e.y });
    return out;
  } finally { svg.remove(); }
}

export const pathLength = (pts: Pt[]) => pts.reduce((s, q, i) => (i ? s + Math.hypot(q.x - pts[i - 1].x, q.y - pts[i - 1].y) : 0), 0);
const dist = (a: Pt, b: Pt) => Math.hypot(a.x - b.x, a.y - b.y);

export interface Tracker {
  /** Index of the model point reached so far */
  reached: number;
  /** Finger points that were far from the model */
  off: number;
  total: number;
}

export interface TraceRules { tol: number; startTol: number; done: number; maxOff: number }
/** Tolerance grows as the guide disappears: tracing over the letter is the strictest */
export const RULES: Record<'trace' | 'dots' | 'alone', TraceRules> = {
  trace: { tol: 9, startTol: 11, done: 0.9, maxOff: 0.25 },
  dots: { tol: 10, startTol: 12, done: 0.88, maxOff: 0.3 },
  alone: { tol: 12, startTol: 14, done: 0.85, maxOff: 0.35 },
};

/** A stroke this short is a dot (the dot of i and j): a tap near it is enough */
export const isDot = (model: Pt[]) => pathLength(model) < 3;

export function startOk(model: Pt[], p: Pt, r: TraceRules) { return dist(model[0], p) <= r.startTol; }

/** Moves the tracker with a new finger point. Only points ahead (a short window) can be reached: no shortcuts, no going back. */
export function advance(t: Tracker, model: Pt[], p: Pt, r: TraceRules): Tracker {
  const from = Math.max(0, t.reached - 4);
  const to = Math.min(model.length - 1, t.reached + 18);
  let best = -1; let bestD = Infinity;
  for (let i = from; i <= to; i++) { const d = dist(model[i], p); if (d < bestD) { bestD = d; best = i; } }
  const near = bestD <= r.tol;
  // Far from the next stretch: is it still on the stroke at all (e.g. retracing)? Only that is forgiven.
  const onStroke = near || model.some((q) => dist(q, p) <= r.tol);
  return { reached: near ? Math.max(t.reached, best) : t.reached, off: t.off + (onStroke ? 0 : 1), total: t.total + 1 };
}

export type Verdict = 'ok' | 'short' | 'off';
export function verdict(t: Tracker, model: Pt[], r: TraceRules): Verdict {
  if (t.total && t.off / t.total > r.maxOff) return 'off';
  return t.reached >= (model.length - 1) * r.done ? 'ok' : 'short';
}
