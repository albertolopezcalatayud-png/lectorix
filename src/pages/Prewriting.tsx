import { useEffect, useMemo, useRef, useState, type PointerEvent as RPointerEvent, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { usePracticeLang } from '@/stores/useAppStore';
import { useI18n, getTranslator, type TranslationKey } from '@/i18n';
import { arc, line, type Glyph, type Lang } from '@/data/strokes';
import { samplePath, advance, verdict, type Pt, type Tracker } from '@/services/trace';
import { printHtml } from '@/services/printDoc';
import { Practice } from '@/pages/Trace';
import sounds from '@/services/sounds';
import tts from '@/services/tts';

/**
 * Before writing ("Antes de escribir"): the groundwork that comes before letters, in the order classrooms follow.
 *  1. Eye and hand: touch targets that get smaller, and follow paths that get narrower (precision).
 *  2. Series: dot, dot… / dot, no dot… / dot, dash… continued on a line, left to right (rhythm and control).
 *  3. Shapes: sticks, lines, cross, circle, square, triangle, traced stroke by stroke (the tracing of Trace.tsx).
 *  4. Grid: copy a drawing by joining the points of a grid (spatial organisation, the step before the notebook).
 * Each activity has three steps (from more help to less) and up to three stars, kept on the device.
 */

const STORE = 'lectorix-prewrite';
type Stars = Record<string, number>;
const readStars = (): Stars => { try { return JSON.parse(localStorage.getItem(STORE) || '{}') as Stars; } catch { return {}; } };
const writeStars = (s: Stars) => { try { localStorage.setItem(STORE, JSON.stringify(s)); } catch { /* storage unavailable */ } };
const dist = (a: Pt, b: Pt) => Math.hypot(a.x - b.x, a.y - b.y);
const poly = (pts: Pt[]) => pts.map((q, i) => `${i ? 'L' : 'M'}${q.x.toFixed(1)} ${q.y.toFixed(1)}`).join(' ');
const starsText = (n: number) => [1, 2, 3].map((k) => (n >= k ? '★' : '☆')).join('');

type Section = 'eye' | 'series' | 'shapes' | 'grid';
const SECTIONS: { id: Section; icon: string }[] = [
  { id: 'eye', icon: '👁️' }, { id: 'series', icon: '•—' }, { id: 'shapes', icon: '△' }, { id: 'grid', icon: '▦' },
];

/* ───────────── data ───────────── */

/** Paths to follow between two edges, start (bee) to end (flower). Viewbox 100 × 100. */
const PATHS: { id: string; d: string }[] = [
  { id: 'straight', d: line(10, 50, 90, 50) },
  { id: 'down', d: line(50, 10, 50, 90) },
  { id: 'slope', d: line(12, 15, 88, 85) },
  { id: 'wave', d: 'M8 50 Q20 22 32 50 T56 50 T80 50 T92 50' },
  { id: 'zigzag', d: line(8, 70, 24, 30, 40, 70, 56, 30, 72, 70, 90, 30) },
  { id: 'turns', d: line(10, 18, 84, 18, 84, 50, 18, 50, 18, 82, 90, 82) },
  { id: 'snail', d: 'M50 50 C50 42 62 42 62 50 C62 62 40 64 38 50 C36 32 70 30 74 50 C78 74 30 80 24 50 C20 26 50 14 80 18' },
];
const PATH_HALF = [10, 6.5, 4.2];       // half the width of the path in each step: wide, medium, narrow
const TAP_R = [11, 7.5, 5];             // radius of the targets in each step
const TAPS = 10;

type El = 'dot' | 'gap' | 'dash' | 'stick' | 'ring';
const SERIES: { id: string; seq: El[] }[] = [
  { id: 'dot', seq: ['dot'] },
  { id: 'dotgap', seq: ['dot', 'gap'] },
  { id: 'stick', seq: ['stick'] },
  { id: 'dash', seq: ['dash'] },
  { id: 'dotdash', seq: ['dot', 'dash'] },
  { id: 'stickdot', seq: ['stick', 'dot'] },
  { id: 'dotdotdash', seq: ['dot', 'dot', 'dash'] },
  { id: 'stickstickgap', seq: ['stick', 'stick', 'gap'] },
  { id: 'ringdot', seq: ['ring', 'dot'] },
  { id: 'ringstick', seq: ['ring', 'stick'] },
];
const SLOT = 14; const PER_ROW = 8; const ROWS = 2; const X0 = 5; const ROW_Y = [40, 92];
const SER_W = X0 * 2 + SLOT * PER_ROW; const SER_H = 104;

/** Shapes traced stroke by stroke (start and direction as taught: down, left to right, anticlockwise from the top) */
const sh = (id: string, strokes: string[]): Glyph => ({ id: `pw-${id}`, char: '', w: 100, strokes });
const SHAPES: Glyph[] = [
  sh('sticks', [20, 40, 60, 80].map((x) => line(x, 22, x, 72))),
  sh('lines', [28, 50, 72].map((y) => line(10, y, 90, y))),
  sh('cross', [line(50, 18, 50, 82), line(18, 50, 82, 50)]),
  sh('circle', [arc(50, 50, 28, 28, 90, 450)]),
  sh('square', [line(25, 22, 25, 78), line(25, 22, 75, 22), line(75, 22, 75, 78), line(25, 78, 75, 78)]),
  sh('triangle', [line(50, 18, 20, 78, 80, 78, 50, 18)]),
  sh('rhombus', [line(50, 14, 22, 50, 50, 86, 78, 50, 50, 14)]),
  sh('rect', [line(12, 30, 12, 70), line(12, 30, 88, 30), line(88, 30, 88, 70), line(12, 70, 88, 70)]),
];

/** Grid drawings, as lines through grid points (x, y in squares) */
type Fig = { id: string; lines: number[][][] };
const FIGS: Fig[] = [
  { id: 'across', lines: [[[0, 0], [3, 0]]] },
  { id: 'down', lines: [[[0, 0], [0, 3]]] },
  { id: 'ell', lines: [[[0, 0], [0, 3], [2, 3]]] },
  { id: 'square', lines: [[[0, 0], [2, 0], [2, 2], [0, 2], [0, 0]]] },
  { id: 'stairs', lines: [[[0, 0], [1, 0], [1, 1], [2, 1], [2, 2], [3, 2], [3, 3]]] },
  { id: 'plus', lines: [[[1, 0], [1, 2]], [[0, 1], [2, 1]]] },
  { id: 'slant', lines: [[[0, 0], [3, 3]]] },
  { id: 'zigzag', lines: [[[0, 1], [1, 0], [2, 1], [3, 0], [4, 1]]] },
  { id: 'triangle', lines: [[[0, 2], [2, 0], [4, 2], [0, 2]]] },
  { id: 'rect', lines: [[[0, 0], [4, 0], [4, 2], [0, 2], [0, 0]]] },
  { id: 'house', lines: [[[0, 4], [0, 2], [2, 0], [4, 2], [4, 4], [0, 4]], [[1, 4], [1, 3], [2, 3], [2, 4]]] },
  { id: 'arrow', lines: [[[0, 2], [4, 2]], [[2, 0], [4, 2], [2, 4]]] },
];
const CELLS = 6; const G0 = 8; const GS = (100 - G0 * 2) / CELLS; // 7 × 7 points
const gx = (i: number) => G0 + i * GS;

/** Unit edges of a figure (between neighbouring points, also diagonal), moved by (dx, dy) */
function figEdges(f: Fig, dx: number, dy: number): Set<string> {
  const out = new Set<string>();
  for (const l of f.lines) for (let k = 1; k < l.length; k++) for (const e of unitEdges(l[k - 1][0] + dx, l[k - 1][1] + dy, l[k][0] + dx, l[k][1] + dy) ?? []) out.add(e);
  return out;
}
const key = (a: number, b: number, c: number, d: number) => (a < c || (a === c && b < d) ? `${a},${b}-${c},${d}` : `${c},${d}-${a},${b}`);
/** A straight line from point to point cut into unit steps; null if it is not horizontal, vertical or at 45° */
function unitEdges(x1: number, y1: number, x2: number, y2: number): string[] | null {
  const dx = x2 - x1; const dy = y2 - y1;
  if (!dx && !dy) return null;
  if (dx && dy && Math.abs(dx) !== Math.abs(dy)) return null;
  const n = Math.max(Math.abs(dx), Math.abs(dy)); const sx = Math.sign(dx); const sy = Math.sign(dy);
  return Array.from({ length: n }, (_, i) => key(x1 + sx * i, y1 + sy * i, x1 + sx * (i + 1), y1 + sy * (i + 1)));
}
const figSize = (f: Fig) => { const pts = f.lines.flat(); return [Math.max(...pts.map((p) => p[0])), Math.max(...pts.map((p) => p[1]))]; };

/* ───────────── shared bits ───────────── */

const STEP_KEYS: TranslationKey[][] = [
  ['pw_eye_s1', 'pw_eye_s2', 'pw_eye_s3'],      // targets: big, medium, small
  ['pw_ser_s1', 'pw_ser_s2', 'pw_ser_s3'],      // series: with help, half, on your own
  ['pw_grid_s1', 'pw_grid_s2', 'pw_grid_s3'],   // grid: go over it, copy it, copy it somewhere else
  ['pw_path_s1', 'pw_path_s2', 'pw_path_s3'],   // paths: wide, medium, narrow
];
function Steps({ which, step, setStep, kind }: { which: number; step: number; setStep: (n: number) => void; kind: number }) {
  const { t } = useI18n();
  return (
    <div className="flex gap-1.5 justify-center flex-wrap" role="tablist">
      {STEP_KEYS[kind].map((k, i) => (
        <button key={k} role="tab" aria-selected={step === i} onClick={() => setStep(i)}
          className={`px-2.5 py-1 rounded-full text-xs font-bold ${step === i ? '' : 'bg-surface-alt text-fg-muted'}`}
          style={step === i ? { background: 'var(--color-mint)', color: '#1f2a44' } : undefined}>{i + 1} · {t(k)}</button>
      ))}
      <span className="sr-only">{which}</span>
    </div>
  );
}

/** Converts pointer positions into viewBox units and reports how many screen pixels one unit is */
function usePad() {
  const svg = useRef<SVGSVGElement>(null);
  const [scale, setScale] = useState(3);
  useEffect(() => {
    const measure = () => { const m = svg.current?.getScreenCTM(); if (m?.a) setScale(m.a); };
    measure(); window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);
  const toSvg = (e: RPointerEvent): Pt | null => {
    const m = svg.current?.getScreenCTM(); if (!m) return null;
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
    return { x: p.x, y: p.y };
  };
  return { svg, scale, toSvg };
}

function Top({ title, stars, onList, say }: { title: string; stars: number; onList: () => void; say: string }) {
  const { t } = useI18n();
  return (
    <>
      <div className="flex items-center justify-between gap-2">
        <button onClick={onList} className="text-sm font-bold text-accent">{t('tr_back_list')}</button>
        <h2 className="font-heading font-extrabold text-lg text-center">{title}</h2>
        <span className="text-sm" aria-label={t('tr_stars', { n: stars })}>{starsText(stars)}</span>
      </div>
      <button onClick={() => void tts.speak(say)} className="w-full rounded-2xl bg-surface-alt px-3 py-2 text-sm text-left flex gap-2 items-start">
        <span aria-hidden>🔊</span><span>{say}</span>
      </button>
    </>
  );
}

function Pad({ children, h = 100, w = 100, svgRef, onDown, onMove, onUp, testid }: {
  children: ReactNode; h?: number; w?: number; svgRef: React.RefObject<SVGSVGElement | null>; testid: string;
  onDown?: (e: RPointerEvent<SVGSVGElement>) => void; onMove?: (e: RPointerEvent<SVGSVGElement>) => void; onUp?: () => void;
}) {
  return (
    <div className="rounded-3xl bg-surface border border-border p-2 select-none">
      <svg ref={svgRef} viewBox={`0 0 ${w} ${h}`} className="w-full text-fg" data-testid={testid}
        style={{ aspectRatio: `${w} / ${h}`, maxHeight: 'min(60vh, 560px)', touchAction: 'none' }}
        onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}>
        {children}
      </svg>
    </div>
  );
}

/* ───────────── 1a. touch the targets ───────────── */

function TapGame({ stars, onStars, onList }: { stars: number; onStars: (n: number) => void; onList: () => void }) {
  const { t } = useI18n();
  const { svg, toSvg } = usePad();
  const [step, setStep] = useState(Math.min(stars, 2));
  const [n, setN] = useState(0); const [miss, setMiss] = useState(0);
  const [at, setAt] = useState<Pt>({ x: 50, y: 60 });
  const [msg, setMsg] = useState('');
  const [done, setDone] = useState(false);
  const r = TAP_R[step];
  const place = () => setAt({ x: r + 6 + Math.random() * (100 - 2 * (r + 6)), y: r + 6 + Math.random() * (130 - 2 * (r + 6)) });
  useEffect(() => { setN(0); setMiss(0); setDone(false); setMsg(''); place(); }, [step]); // eslint-disable-line react-hooks/exhaustive-deps
  const onDown = (e: RPointerEvent<SVGSVGElement>) => {
    if (done) return;
    const p = toSvg(e); if (!p) return;
    if (dist(p, at) <= r + 1.2) {
      sounds.click();
      const k = n + 1; setN(k);
      if (k >= TAPS) {
        if (miss <= 2) {
          setDone(true); onStars(step + 1); sounds.correct();
          setMsg(step < 2 ? t('pw_good_next') : t('tr_done_all'));
          if (step < 2) window.setTimeout(() => setStep(step + 1), 1600); else sounds.star();
        } else { setMsg(t('pw_tap_again', { n: miss })); setN(0); setMiss(0); place(); }
        return;
      }
      setMsg(''); place();
    } else { setMiss(miss + 1); setMsg(t('pw_tap_miss')); }
  };
  return (
    <div className="space-y-3">
      <Top title={t('pw_a_tap')} stars={stars} onList={onList} say={t('pw_say_tap')} />
      <Steps which={0} kind={0} step={step} setStep={setStep} />
      <Pad svgRef={svg} h={130} onDown={onDown} testid="pw-tap">
        <rect x={0} y={0} width={100} height={130} fill="var(--color-sky)" opacity={0.08} />
        {!done && (
          <g data-testid="pw-target" data-x={at.x.toFixed(2)} data-y={at.y.toFixed(2)}>
            <circle cx={at.x} cy={at.y} r={r} fill="var(--color-mint)" stroke="#3BB273" strokeWidth={1} />
            <circle cx={at.x} cy={at.y} r={r * 0.35} fill="#3BB273" />
          </g>
        )}
      </Pad>
      <p className="text-center text-sm font-bold">{Math.min(n, TAPS)} / {TAPS}</p>
      <p className="text-center font-bold min-h-[1.5rem]" aria-live="polite">{msg}</p>
    </div>
  );
}

/* ───────────── 1b. follow the path ───────────── */

function PathGame({ path, stars, onStars, onList, title }: { path: (typeof PATHS)[number]; stars: number; onStars: (n: number) => void; onList: () => void; title: string }) {
  const { t } = useI18n();
  const { svg, toSvg } = usePad();
  const model = useMemo(() => samplePath(path.d), [path]);
  const [step, setStep] = useState(Math.min(stars, 2));
  const [ink, setInk] = useState<Pt[]>([]);
  const [msg, setMsg] = useState(''); const [done, setDone] = useState(false);
  const track = useRef<Tracker | null>(null); const last = useRef<Pt | null>(null);
  const half = PATH_HALF[step];
  const rules = { tol: half + 1, startTol: half + 4, done: 0.96, maxOff: 0.04 };
  useEffect(() => { setInk([]); setDone(false); setMsg(''); track.current = null; }, [step]);
  const fail = (k: TranslationKey) => { track.current = null; last.current = null; setInk([]); setMsg(t(k)); sounds.incorrect(); };
  const onDown = (e: RPointerEvent<SVGSVGElement>) => {
    if (done) return;
    const p = toSvg(e); if (!p) return;
    if (dist(p, model[0]) > rules.startTol) { setMsg(t('pw_path_start')); return; }
    e.currentTarget.setPointerCapture(e.pointerId);
    track.current = advance({ reached: 0, off: 0, total: 0 }, model, p, rules); last.current = p; setInk([p]); setMsg('');
  };
  const onMove = (e: RPointerEvent<SVGSVGElement>) => {
    if (!track.current) return;
    const p = toSvg(e); const prev = last.current; if (!p || !prev) return;
    const n = Math.max(1, Math.ceil(dist(p, prev) / 1.5));
    let tr = track.current;
    for (let k = 1; k <= n; k++) tr = advance(tr, model, { x: prev.x + ((p.x - prev.x) * k) / n, y: prev.y + ((p.y - prev.y) * k) / n }, rules);
    // Leaving the path stops the try straight away: the point of the game is to stay inside
    if (!model.some((q) => dist(q, p) <= rules.tol + 0.6)) { fail('pw_path_out'); return; }
    track.current = tr; last.current = p; setInk((s) => [...s, p]);
  };
  const onUp = () => {
    const tr = track.current; if (!tr) return;
    track.current = null; last.current = null;
    if (verdict(tr, model, rules) !== 'ok') { fail('pw_path_short'); return; }
    setDone(true); onStars(step + 1); sounds.correct();
    setMsg(step < 2 ? t('pw_good_next') : t('tr_done_all'));
    if (step < 2) window.setTimeout(() => setStep(step + 1), 1600); else sounds.star();
  };
  const end = model[model.length - 1];
  return (
    <div className="space-y-3">
      <Top title={title} stars={stars} onList={onList} say={t('pw_say_path')} />
      <Steps which={0} kind={3} step={step} setStep={setStep} />
      <Pad svgRef={svg} onDown={onDown} onMove={onMove} onUp={onUp} testid="pw-path">
        <path d={path.d} fill="none" stroke="var(--color-sky)" strokeOpacity={0.35} strokeWidth={half * 2} strokeLinecap="round" strokeLinejoin="round" />
        <path d={path.d} fill="none" stroke="currentColor" strokeOpacity={0.25} strokeWidth={0.6} strokeDasharray="2 2" />
        {ink.length > 0 && <path d={poly(ink)} fill="none" stroke="var(--color-accent)" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />}
        <text x={model[0].x} y={model[0].y + 3.2} textAnchor="middle" fontSize={9} aria-hidden>🐝</text>
        <text x={end.x} y={end.y + 3.2} textAnchor="middle" fontSize={9} aria-hidden>🌼</text>
      </Pad>
      <p className="text-center font-bold min-h-[1.5rem]" aria-live="polite">{msg}</p>
      <Button variant="secondary" size="sm" fullWidth onClick={() => { setInk([]); setDone(false); setMsg(''); }}>{t('tr_clear')}</Button>
    </div>
  );
}

/* ───────────── 2. series ───────────── */

const slotX = (i: number) => X0 + (i % PER_ROW) * SLOT + SLOT / 2;
const slotY = (i: number) => ROW_Y[Math.floor(i / PER_ROW)];
/** The drawing of one element, centred on its slot (baseline y) */
function elPath(el: El, cx: number, y: number): string {
  if (el === 'dot') return `M${cx} ${y - 6} L${cx} ${y - 5.6}`;
  if (el === 'dash') return line(cx - 4.5, y - 6, cx + 4.5, y - 6);
  if (el === 'stick') return line(cx, y - 15, cx, y);
  if (el === 'ring') return arc(cx, y - 6, 4.2, 4.2, 90, 450);
  return '';
}
/** What a stroke looks like: dot, dash (across), stick (up and down) or ring (closed round); null if none */
export function classify(pts: Pt[]): Exclude<El, 'gap'> | null {
  const xs = pts.map((p) => p.x); const ys = pts.map((p) => p.y);
  const w = Math.max(...xs) - Math.min(...xs); const h = Math.max(...ys) - Math.min(...ys);
  const len = pts.reduce((s, q, i) => (i ? s + dist(q, pts[i - 1]) : 0), 0);
  const big = Math.max(w, h);
  if (big < 3.2) return 'dot';
  if (dist(pts[0], pts[pts.length - 1]) < 0.5 * big && len > 2.2 * big && Math.min(w, h) > 0.45 * big) return 'ring';
  if (w >= 1.6 * h) return 'dash';
  if (h >= 1.6 * w) return 'stick';
  return null;
}

function SeriesGame({ ser, stars, onStars, onList, title }: { ser: (typeof SERIES)[number]; stars: number; onStars: (n: number) => void; onList: () => void; title: string }) {
  const { t } = useI18n();
  const { svg, toSvg } = usePad();
  const total = PER_ROW * ROWS;
  const seq = useMemo(() => Array.from({ length: total }, (_, i) => ser.seq[i % ser.seq.length]), [ser, total]);
  const shown = Math.max(4, ser.seq.length * 2);              // the model at the start of the line
  const todo = useMemo(() => seq.map((e, i) => (i >= shown && e !== 'gap' ? i : -1)).filter((i) => i >= 0), [seq, shown]);
  const [step, setStep] = useState(Math.min(stars, 2));
  const [drawn, setDrawn] = useState<Record<number, Pt[]>>({});
  const [ink, setInk] = useState<Pt[]>([]); const [bad, setBad] = useState<number | null>(null);
  const [msg, setMsg] = useState(''); const [done, setDone] = useState(false);
  const live = useRef(false);
  useEffect(() => { setDrawn({}); setInk([]); setDone(false); setMsg(''); setBad(null); }, [step]);
  const next = todo.find((i) => !drawn[i]);
  const name = (el: El) => t(`pw_el_${el}` as TranslationKey);
  const onDown = (e: RPointerEvent<SVGSVGElement>) => {
    if (done) return;
    const p = toSvg(e); if (!p) return;
    e.currentTarget.setPointerCapture(e.pointerId); live.current = true; setInk([p]); setBad(null);
  };
  const onMove = (e: RPointerEvent<SVGSVGElement>) => { if (!live.current) return; const p = toSvg(e); if (p) setInk((s) => [...s, p]); };
  const onUp = () => {
    if (!live.current) return; live.current = false;
    const pts = ink; setInk([]);
    if (!pts.length || next === undefined) return;
    const c = { x: pts.reduce((s, p) => s + p.x, 0) / pts.length, y: pts.reduce((s, p) => s + p.y, 0) / pts.length };
    const row = ROW_Y.findIndex((y) => c.y > y - 22 && c.y < y + 6);
    const col = Math.floor((c.x - X0) / SLOT);
    const slot = row < 0 || col < 0 || col >= PER_ROW ? -1 : row * PER_ROW + col;
    const wrong = (k: TranslationKey, vars?: Record<string, string>) => { setMsg(t(k, vars)); sounds.incorrect(); if (slot >= 0) setBad(slot); };
    if (slot < 0) return wrong('pw_ser_line');
    if (slot < shown) return wrong('pw_ser_model');
    if (seq[slot] === 'gap') return wrong('pw_ser_gap');
    if (slot !== next) return wrong('pw_ser_order');
    const kind = classify(pts);
    if (kind !== seq[slot]) return wrong('pw_ser_wrong', { el: name(seq[slot]) });
    const nd = { ...drawn, [slot]: pts }; setDrawn(nd); setMsg(''); sounds.click();
    if (todo.every((i) => nd[i])) {
      setDone(true); onStars(step + 1); sounds.correct();
      setMsg(step < 2 ? t('pw_good_next') : t('tr_done_all'));
      if (step < 2) window.setTimeout(() => setStep(step + 1), 1600); else sounds.star();
    }
  };
  // Help: every element to do in light grey (step 1), only the first half (step 2), none (step 3: only the marks)
  const ghost = (i: number) => step === 0 || (step === 1 && todo.indexOf(i) < todo.length / 2);
  return (
    <div className="space-y-3">
      <Top title={title} stars={stars} onList={onList} say={t('pw_say_series', { s: ser.seq.map(name).join(', ') })} />
      <Steps which={1} kind={1} step={step} setStep={setStep} />
      <Pad svgRef={svg} w={SER_W} h={SER_H} onDown={onDown} onMove={onMove} onUp={onUp} testid="pw-series">
        {ROW_Y.map((y) => <line key={y} x1={2} x2={SER_W - 2} y1={y} y2={y} stroke="currentColor" strokeOpacity={0.45} strokeWidth={0.7} />)}
        {ROW_Y.map((y) => <line key={`m${y}`} x1={2} x2={SER_W - 2} y1={y - 12} y2={y - 12} stroke="currentColor" strokeOpacity={0.15} strokeWidth={0.5} strokeDasharray="2 2" />)}
        {seq.map((el, i) => (
          <g key={i} data-slot={i} data-el={el} data-x={slotX(i)} data-y={slotY(i)}>
            {i >= shown && <line x1={slotX(i)} x2={slotX(i)} y1={slotY(i) + 1.5} y2={slotY(i) + 3.5} stroke="currentColor" strokeOpacity={0.35} strokeWidth={0.6} />}
            {bad === i && <rect x={slotX(i) - SLOT / 2 + 0.5} y={slotY(i) - 21} width={SLOT - 1} height={24} rx={3} fill="var(--color-coral)" opacity={0.18} />}
            {i < shown && el !== 'gap' && <path d={elPath(el, slotX(i), slotY(i))} fill="none" stroke="currentColor" strokeWidth={el === 'dot' ? 3.4 : 2} strokeLinecap="round" />}
            {i >= shown && el !== 'gap' && !drawn[i] && ghost(i) && <path d={elPath(el, slotX(i), slotY(i))} fill="none" stroke="currentColor" strokeOpacity={0.16} strokeWidth={el === 'dot' ? 3.4 : 2.4} strokeLinecap="round" />}
            {drawn[i] && <path d={drawn[i].length > 1 ? poly(drawn[i]) : `M${drawn[i][0].x} ${drawn[i][0].y} L${drawn[i][0].x} ${drawn[i][0].y + 0.4}`} fill="none" stroke="var(--color-accent)" strokeWidth={drawn[i].length > 1 ? 2 : 3.4} strokeLinecap="round" strokeLinejoin="round" />}
          </g>
        ))}
        {next !== undefined && !done && <circle cx={slotX(next)} cy={slotY(next) + 6} r={1.4} fill="#3BB273" />}
        {ink.length > 0 && <path d={ink.length > 1 ? poly(ink) : `M${ink[0].x} ${ink[0].y} L${ink[0].x} ${ink[0].y + 0.4}`} fill="none" stroke="var(--color-accent)" strokeWidth={2} strokeLinecap="round" />}
      </Pad>
      <p className="text-center font-bold min-h-[1.5rem]" aria-live="polite">{msg}</p>
      <Button variant="secondary" size="sm" fullWidth onClick={() => { setDrawn({}); setDone(false); setMsg(''); setBad(null); }}>{t('tr_clear')}</Button>
    </div>
  );
}

/* ───────────── 4. grid ───────────── */

function GridDots({ marks }: { marks?: [number, number] | null }) {
  return (
    <g aria-hidden>
      {Array.from({ length: CELLS + 1 }, (_, i) => (
        <g key={i}>
          <line x1={gx(0)} x2={gx(CELLS)} y1={gx(i)} y2={gx(i)} stroke="currentColor" strokeOpacity={0.12} strokeWidth={0.4} />
          <line y1={gx(0)} y2={gx(CELLS)} x1={gx(i)} x2={gx(i)} stroke="currentColor" strokeOpacity={0.12} strokeWidth={0.4} />
        </g>
      ))}
      {Array.from({ length: (CELLS + 1) ** 2 }, (_, k) => <circle key={k} cx={gx(k % (CELLS + 1))} cy={gx(Math.floor(k / (CELLS + 1)))} r={1.1} fill="currentColor" opacity={0.55} />)}
      {marks && <circle cx={gx(marks[0])} cy={gx(marks[1])} r={3} fill="#3BB273" />}
    </g>
  );
}
const figPath = (f: Fig, dx: number, dy: number) => f.lines.map((l) => l.map(([x, y], i) => `${i ? 'L' : 'M'}${gx(x + dx)} ${gx(y + dy)}`).join(' ')).join(' ');
const edgePath = (e: string) => { const [a, b] = e.split('-').map((s) => s.split(',').map(Number)); return `M${gx(a[0])} ${gx(a[1])} L${gx(b[0])} ${gx(b[1])}`; };

function GridGame({ fig, stars, onStars, onList, title }: { fig: Fig; stars: number; onStars: (n: number) => void; onList: () => void; title: string }) {
  const { t } = useI18n();
  const { svg, toSvg, scale } = usePad();
  const [step, setStep] = useState(Math.min(stars, 2));
  // Steps 1 and 2 put the drawing one square in; step 3 somewhere else, marked by its first point
  const [fw, fh] = figSize(fig);
  const off = useMemo<[number, number]>(() => {
    if (step < 2) return [1, 1];
    const opts: [number, number][] = [];
    for (let x = 0; x <= CELLS - fw; x++) for (let y = 0; y <= CELLS - fh; y++) if (x !== 1 || y !== 1) opts.push([x, y]);
    return opts[Math.floor(Math.random() * opts.length)] ?? [0, 0];
  }, [step, fw, fh]);
  const target = useMemo(() => figEdges(fig, off[0], off[1]), [fig, off]);
  const [have, setHave] = useState<Set<string>>(new Set());
  const [ink, setInk] = useState<Pt[]>([]); const [flash, setFlash] = useState<string[]>([]);
  const [msg, setMsg] = useState(''); const [done, setDone] = useState(false);
  const live = useRef(false);
  useEffect(() => { setHave(new Set()); setInk([]); setDone(false); setMsg(''); setFlash([]); }, [step, off]);
  const snapTol = Math.max(GS * 0.42, 22 / scale);
  const node = (p: Pt) => {
    const i = Math.round((p.x - G0) / GS); const j = Math.round((p.y - G0) / GS);
    if (i < 0 || j < 0 || i > CELLS || j > CELLS) return null;
    return dist(p, { x: gx(i), y: gx(j) }) <= snapTol ? [i, j] as const : null;
  };
  const onDown = (e: RPointerEvent<SVGSVGElement>) => {
    if (done) return; const p = toSvg(e); if (!p) return;
    e.currentTarget.setPointerCapture(e.pointerId); live.current = true; setInk([p]); setFlash([]);
  };
  const onMove = (e: RPointerEvent<SVGSVGElement>) => { if (!live.current) return; const p = toSvg(e); if (p) setInk((s) => [...s, p]); };
  const onUp = () => {
    if (!live.current) return; live.current = false;
    const pts = ink; setInk([]);
    if (pts.length < 2) return;
    const a = node(pts[0]); const b = node(pts[pts.length - 1]);
    const no = (k: TranslationKey) => { setMsg(t(k)); sounds.incorrect(); };
    if (!a || !b) return no('pw_grid_points');
    const A = { x: gx(a[0]), y: gx(a[1]) }; const B = { x: gx(b[0]), y: gx(b[1]) };
    const L = dist(A, B) || 1;
    const offLine = pts.some((p) => Math.abs((B.x - A.x) * (A.y - p.y) - (A.x - p.x) * (B.y - A.y)) / L > Math.max(GS * 0.35, 18 / scale));
    const edges = unitEdges(a[0], a[1], b[0], b[1]);
    if (!edges || offLine) return no('pw_grid_straight');
    const wrongE = edges.filter((e) => !target.has(e));
    if (wrongE.length) { setFlash(wrongE); return no('pw_grid_wrong'); }
    if (edges.every((e) => have.has(e))) { setMsg(t('pw_grid_already')); return; }
    const nh = new Set([...have, ...edges]); setHave(nh); setMsg(''); sounds.click();
    if ([...target].every((e) => nh.has(e))) {
      setDone(true); onStars(step + 1); sounds.correct();
      setMsg(step < 2 ? t('pw_good_next') : t('tr_done_all'));
      if (step < 2) window.setTimeout(() => setStep(step + 1), 1600); else sounds.star();
    }
  };
  const first = fig.lines[0][0];
  return (
    <div className="space-y-3">
      <Top title={title} stars={stars} onList={onList} say={t(step === 0 ? 'pw_say_grid1' : 'pw_say_grid2')} />
      <Steps which={3} kind={2} step={step} setStep={setStep} />
      {step > 0 && (
        <div className="rounded-2xl border border-border bg-surface-alt p-1 mx-auto" style={{ width: '46%' }} data-testid="pw-grid-model">
          <svg viewBox="0 0 100 100" className="w-full text-fg" aria-label={t('pw_grid_model')}>
            <GridDots marks={step === 2 ? [first[0] + 1, first[1] + 1] : null} />
            <path d={figPath(fig, 1, 1)} fill="none" stroke="var(--color-coral)" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      )}
      <Pad svgRef={svg} onDown={onDown} onMove={onMove} onUp={onUp} testid="pw-grid">
        <GridDots marks={step === 2 ? [first[0] + off[0], first[1] + off[1]] : null} />
        {step === 0 && <path d={figPath(fig, off[0], off[1])} fill="none" stroke="currentColor" strokeOpacity={0.18} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />}
        {[...have].map((e) => <path key={e} d={edgePath(e)} stroke="var(--color-accent)" strokeWidth={2.6} strokeLinecap="round" />)}
        {flash.map((e) => <path key={`f${e}`} d={edgePath(e)} stroke="var(--color-coral)" strokeWidth={2} strokeDasharray="2 2" />)}
        {ink.length > 1 && <path d={poly(ink)} fill="none" stroke="var(--color-accent)" strokeWidth={2} strokeLinecap="round" opacity={0.7} />}
      </Pad>
      <p className="text-center font-bold min-h-[1.5rem]" aria-live="polite" data-off={off.join(',')}>{msg}</p>
      <Button variant="secondary" size="sm" fullWidth onClick={() => { setHave(new Set()); setDone(false); setMsg(''); setFlash([]); }}>{t('tr_clear')}</Button>
    </div>
  );
}

/* ───────────── the page ───────────── */

type Item = { id: string; title: string; preview: ReactNode };

export default function Prewriting() {
  const { t } = useI18n();
  const lang = usePracticeLang() as Lang;
  const navigate = useNavigate();
  const [stars, setStars] = useState<Stars>(readStars);
  const [section, setSection] = useState<Section | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const give = (id: string) => (n: number) => setStars((s) => { const nx = { ...s, [id]: Math.max(s[id] ?? 0, n) }; writeStars(nx); return nx; });
  const back = () => setOpen(null);

  const items: Record<Section, Item[]> = {
    eye: [
      { id: 'tap', title: t('pw_a_tap'), preview: <svg viewBox="0 0 100 60" className="w-full h-10" aria-hidden>{[[20, 30, 11], [52, 22, 7.5], [80, 38, 5]].map(([x, y, r]) => <circle key={x} cx={x} cy={y} r={r} fill="var(--color-mint)" stroke="#3BB273" />)}</svg> },
      ...PATHS.map((p) => ({ id: `path-${p.id}`, title: t(`pw_path_${p.id}` as TranslationKey), preview: <svg viewBox="0 0 100 100" className="w-full h-10" aria-hidden><path d={p.d} fill="none" stroke="var(--color-sky)" strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" opacity={0.6} /></svg> })),
    ],
    series: SERIES.map((s) => ({ id: `ser-${s.id}`, title: s.seq.map((e) => t(`pw_el_${e}` as TranslationKey)).join(', '), preview: (
      <svg viewBox={`0 0 ${SLOT * 6 + 4} 22`} className="w-full h-8 text-fg" aria-hidden>
        <line x1={0} x2={SLOT * 6 + 4} y1={19} y2={19} stroke="currentColor" strokeOpacity={0.3} strokeWidth={0.6} />
        {Array.from({ length: 6 }, (_, i) => { const el = s.seq[i % s.seq.length]; return el === 'gap' ? null : <path key={i} d={elPath(el, 2 + SLOT * i + SLOT / 2, 19)} fill="none" stroke="currentColor" strokeWidth={el === 'dot' ? 3.4 : 1.8} strokeLinecap="round" />; })}
      </svg>) })),
    shapes: SHAPES.map((g) => ({ id: g.id, title: t(`pw_sh_${g.id.slice(3)}` as TranslationKey), preview: <svg viewBox="0 0 100 100" className="w-full h-10 text-fg" aria-hidden>{g.strokes.map((d, k) => <path key={k} d={d} fill="none" stroke="currentColor" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" opacity={0.6} />)}</svg> })),
    grid: FIGS.map((f) => ({ id: `grid-${f.id}`, title: t(`pw_fig_${f.id}` as TranslationKey), preview: <svg viewBox="0 0 100 100" className="w-full h-10 text-fg" aria-hidden><GridDots /><path d={figPath(f, 1, 1)} fill="none" stroke="var(--color-coral)" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" /></svg> })),
  };
  const sectionStars = (s: Section) => { const it = items[s]; return [it.reduce((n, i) => n + (stars[i.id] ?? 0), 0), it.length * 3]; };

  // One activity open
  if (section && open) {
    const list = items[section]; const idx = list.findIndex((i) => i.id === open); const item = list[idx];
    const st = stars[open] ?? 0; const on = give(open);
    const nextBtn = idx < list.length - 1 && (
      <Button size="sm" fullWidth onClick={() => setOpen(list[idx + 1].id)}>{t('tr_next')}</Button>
    );
    let body: ReactNode = null;
    if (open === 'tap') body = <TapGame key={open} stars={st} onStars={on} onList={back} />;
    else if (open.startsWith('path-')) body = <PathGame key={open} path={PATHS.find((p) => `path-${p.id}` === open)!} stars={st} onStars={on} onList={back} title={item.title} />;
    else if (open.startsWith('ser-')) body = <SeriesGame key={open} ser={SERIES.find((s) => `ser-${s.id}` === open)!} stars={st} onStars={on} onList={back} title={item.title} />;
    else if (open.startsWith('grid-')) body = <GridGame key={open} fig={FIGS.find((f) => `grid-${f.id}` === open)!} stars={st} onStars={on} onList={back} title={item.title} />;
    else {
      const g = SHAPES.find((s) => s.id === open)!;
      body = <Practice key={open} glyph={g} lang={lang} label={item.title} stars={st} onStars={on} onList={back} onNext={idx < list.length - 1 ? () => setOpen(list[idx + 1].id) : undefined} />;
    }
    return (
      <div className="pb-28">
        <Header title={t(`pw_sec_${section}` as TranslationKey)} showBack />
        <div className="max-w-2xl mx-auto px-4 space-y-3">{body}{section !== 'shapes' && nextBtn}</div>
      </div>
    );
  }

  // One section: its activities
  if (section) {
    return (
      <div className="pb-28">
        <Header title={t('pw_title')} showBack />
        <div className="max-w-2xl mx-auto px-4 space-y-4">
          <div className="flex items-center justify-between">
            <button onClick={() => setSection(null)} className="text-sm font-bold text-accent">{t('pw_back_sections')}</button>
            <h2 className="font-heading font-extrabold text-lg">{t(`pw_sec_${section}` as TranslationKey)}</h2>
            <span />
          </div>
          <Card className="!p-3"><p className="text-sm">{t(`pw_sec_${section}_how` as TranslationKey)}</p></Card>
          <div className="grid gap-2 grid-cols-2 sm:grid-cols-3">
            {items[section].map((it) => (
              <button key={it.id} onClick={() => setOpen(it.id)} data-testid={`pw-item-${it.id}`}
                aria-label={`${it.title}, ${t('tr_stars', { n: stars[it.id] ?? 0 })}`}
                className="rounded-2xl bg-surface border border-border p-2 flex flex-col items-center gap-1 hover:border-accent">
                {it.preview}
                <span className="text-[12px] font-bold text-center leading-tight">{it.title}</span>
                <span className="text-xs" aria-hidden>{starsText(stars[it.id] ?? 0)}</span>
              </button>
            ))}
          </div>
          {(section === 'series' || section === 'grid' || section === 'eye') && (
            <Button variant="secondary" fullWidth onClick={() => printSheet(section, lang)}>{t('tr_print')}</Button>
          )}
        </div>
      </div>
    );
  }

  // The four sections, in order
  return (
    <div className="pb-28">
      <Header title={t('pw_title')} showBack />
      <div className="max-w-2xl mx-auto px-4 space-y-3">
        <Card className="!p-3">
          <p className="text-sm">{t('pw_intro')}</p>
          <p className="text-xs text-fg-muted mt-1">{t('tr_tip')}</p>
        </Card>
        {SECTIONS.map((s, i) => {
          const [got, max] = sectionStars(s.id);
          return (
            <button key={s.id} onClick={() => setSection(s.id)} data-testid={`pw-sec-${s.id}`}
              className="w-full rounded-2xl bg-surface border border-border p-3 flex items-center gap-3 text-left hover:border-accent">
              <span className="w-11 h-11 rounded-2xl flex items-center justify-center font-extrabold text-lg shrink-0" style={{ background: 'var(--color-mint)', color: '#1f2a44' }} aria-hidden>{i + 1}</span>
              <span className="flex-1 min-w-0">
                <span className="block font-heading font-extrabold">{s.icon} {t(`pw_sec_${s.id}` as TranslationKey)}</span>
                <span className="block text-xs text-fg-muted">{t(`pw_sec_${s.id}_d` as TranslationKey)}</span>
              </span>
              <span className="text-xs font-bold shrink-0">★ {got}/{max}</span>
            </button>
          );
        })}
        <button onClick={() => navigate('/trazo')} className="w-full rounded-2xl border-2 border-dashed border-border p-3 text-sm font-bold">
          ✏️ {t('pw_then_letters')}
        </button>
      </div>
    </div>
  );
}

/* ───────────── paper sheets ───────────── */

function printSheet(section: Section, lang: Lang) {
  const tl = getTranslator(lang);
  const svgOpen = (w: number, h: number, mm: number) => `<svg viewBox="0 0 ${w} ${h}" width="${mm}mm" height="${(mm * h) / w}mm" xmlns="http://www.w3.org/2000/svg">`;
  let body = '';
  if (section === 'series') {
    body = SERIES.map((s) => {
      const n = 14; const W = n * SLOT + 4;
      const els = Array.from({ length: n }, (_, i) => {
        const el = s.seq[i % s.seq.length]; const cx = 2 + SLOT * i + SLOT / 2;
        if (i < Math.max(4, s.seq.length * 2)) return el === 'gap' ? '' : `<path d="${elPath(el, cx, 24)}" fill="none" stroke="#2b2b3a" stroke-width="${el === 'dot' ? 3.4 : 1.8}" stroke-linecap="round"/>`;
        return el === 'gap' ? '' : `<path d="${elPath(el, cx, 24)}" fill="none" stroke="#9aa" stroke-width="${el === 'dot' ? 3 : 1.4}" stroke-dasharray="${el === 'dot' ? '' : '0.1 2.6'}" stroke-linecap="round"/>`;
      }).join('');
      const plain = `<line x1="0" x2="${W}" y1="54" y2="54" stroke="#888" stroke-width="0.6"/><line x1="0" x2="${W}" y1="42" y2="42" stroke="#ccc" stroke-width="0.4" stroke-dasharray="2 2"/>` +
        Array.from({ length: Math.max(4, s.seq.length * 2) }, (_, i) => { const el = s.seq[i % s.seq.length]; return el === 'gap' ? '' : `<path d="${elPath(el, 2 + SLOT * i + SLOT / 2, 54)}" fill="none" stroke="#2b2b3a" stroke-width="${el === 'dot' ? 3.4 : 1.8}" stroke-linecap="round"/>`; }).join('');
      return `<div class="g"><b>${s.seq.map((e) => tl(`pw_el_${e}` as TranslationKey)).join(', ')}</b><br>${svgOpen(W, 60, 180)}<line x1="0" x2="${W}" y1="24" y2="24" stroke="#888" stroke-width="0.6"/><line x1="0" x2="${W}" y1="12" y2="12" stroke="#ccc" stroke-width="0.4" stroke-dasharray="2 2"/>${els}${plain}</svg></div>`;
    }).join('');
  } else if (section === 'grid') {
    const dots = (start?: number[]) => Array.from({ length: (CELLS + 1) ** 2 }, (_, k) => `<circle cx="${gx(k % (CELLS + 1))}" cy="${gx(Math.floor(k / (CELLS + 1)))}" r="0.9" fill="#555"/>`).join('') +
      (start ? `<circle cx="${gx(start[0])}" cy="${gx(start[1])}" r="2.4" fill="#3BB273"/>` : '');
    body = FIGS.map((f) => {
      const first = f.lines[0][0];
      return `<div class="g row"><div>${svgOpen(100, 100, 70)}${dots()}<path d="${figPath(f, 1, 1)}" fill="none" stroke="#e07a5f" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg></div><div>${svgOpen(100, 100, 70)}${dots([first[0] + 1, first[1] + 1])}</svg></div></div>`;
    }).join('');
  } else {
    body = PATHS.map((p) => `<div class="g half">${svgOpen(100, 100, 85)}<path d="${p.d}" fill="none" stroke="#bcd8ee" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/><path d="${p.d}" fill="none" stroke="#999" stroke-width="0.5" stroke-dasharray="2 2"/><circle cx="${samplePath(p.d)[0].x}" cy="${samplePath(p.d)[0].y}" r="3" fill="#3BB273"/></svg></div>`).join('');
  }
  const html = `<!doctype html><html lang="${lang === 'ca' ? 'ca-ES-valencia' : lang === 'en' ? 'en-GB' : 'es'}"><head><meta charset="utf-8"><title>${tl('pw_sheet_title')}</title>
<style>@page{size:A4;margin:12mm}body{font-family:system-ui,sans-serif;color:#2b2b3a}h1{font-size:18pt;margin:0 0 2mm}.meta{display:flex;gap:10mm;font-size:11pt;margin-bottom:3mm}.meta span{flex:1;border-bottom:1px solid #999}p{font-size:11pt;margin:0 0 4mm}.g{break-inside:avoid;margin-bottom:5mm;font-size:11pt}.row{display:flex;gap:10mm}.half{display:inline-block;width:48%}</style></head>
<body><h1>✋ ${tl('pw_sheet_title')} · ${tl(`pw_sec_${section}` as TranslationKey)}</h1><div class="meta"><span>${tl('ws_name')}:</span><span>${tl('ws_date')}:</span></div><p>${tl(`pw_sheet_${section}` as TranslationKey)}</p>${body}</body></html>`;
  void printHtml(html, tl('pw_sheet_title'));
}
