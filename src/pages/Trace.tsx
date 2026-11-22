import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent as RPointerEvent } from 'react';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { usePracticeLang } from '@/stores/useAppStore';
import { useI18n, getTranslator, type TranslationKey } from '@/i18n';
import { traceSet, EXAMPLES, LINES, type Glyph, type TraceSet, type Lang } from '@/data/strokes';
import { samplePath, advance, verdict, startOk, isDot, RULES, type Pt, type Tracker } from '@/services/trace';
import { printHtml } from '@/services/printDoc';
import sounds from '@/services/sounds';
import tts from '@/services/tts';

const STORE = 'lectorix-trace';
type Stars = Record<string, number>;
const readStars = (): Stars => { try { return JSON.parse(localStorage.getItem(STORE) || '{}') as Stars; } catch { return {}; } };
const writeStars = (s: Stars) => { try { localStorage.setItem(STORE, JSON.stringify(s)); } catch { /* storage unavailable */ } };

// Short labels a child who cannot read yet still recognises; the full name is for screen readers
const SETS: { id: TraceSet; key: TranslationKey; short?: string }[] = [
  { id: 'patterns', key: 'tr_set_patterns' }, { id: 'lower', key: 'tr_set_lower', short: 'abc' },
  { id: 'upper', key: 'tr_set_upper', short: 'ABC' }, { id: 'digits', key: 'tr_set_digits', short: '123' },
];
const STEPS = ['trace', 'dots', 'alone'] as const;
type Step = (typeof STEPS)[number];
const STEP_KEY: Record<Step, TranslationKey> = { trace: 'tr_step_trace', dots: 'tr_step_dots', alone: 'tr_step_alone' };
const patternKey = (g: Glyph) => `tr_p_${g.id.slice(2)}` as TranslationKey;
const PAD = 8;
const viewBox = (g: Glyph) => `${-PAD} -6 ${g.w + PAD * 2} 108`;

/** The four guide lines of the school notebook, with the x-height band shaded */
function Pauta({ w }: { w: number }) {
  const x1 = -PAD; const x2 = w + PAD;
  return (
    <g aria-hidden>
      <rect x={x1} y={LINES.mid} width={x2 - x1} height={LINES.base - LINES.mid} fill="var(--color-sky)" opacity={0.12} />
      {[LINES.top, LINES.mid, LINES.desc].map((y) => <line key={y} x1={x1} x2={x2} y1={y} y2={y} stroke="currentColor" strokeOpacity={0.18} strokeWidth={0.5} strokeDasharray="2 2" />)}
      <line x1={x1} x2={x2} y1={LINES.base} y2={LINES.base} stroke="currentColor" strokeOpacity={0.45} strokeWidth={0.8} />
    </g>
  );
}

/** Small arrow a few units into the stroke, pointing the way to go */
function Arrow({ pts }: { pts: Pt[] }) {
  if (pts.length < 10) return null;
  const a = pts[Math.min(7, pts.length - 1)]; const b = pts[Math.min(11, pts.length - 1)];
  const ang = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;
  return <path d="M-3 -2.6 L2.6 0 L-3 2.6 Z" transform={`translate(${b.x} ${b.y}) rotate(${ang})`} fill="var(--color-coral)" />;
}

export default function Trace() {
  const { t } = useI18n();
  const lang = usePracticeLang() as Lang;
  const [set, setSet] = useState<TraceSet>('patterns');
  const glyphs = useMemo(() => traceSet(set, lang), [set, lang]);
  const [stars, setStars] = useState<Stars>(readStars);
  const [idx, setIdx] = useState<number | null>(null);
  const glyph = idx === null ? null : glyphs[idx];

  const label = (g: Glyph) => (g.char ? g.char : t(patternKey(g)));

  return (
    <div className="pb-28">
      <Header title={t('tr_title')} showBack />
      <div className="max-w-2xl mx-auto px-4 space-y-4">
        <div className="grid grid-cols-[1.7fr_1fr_1fr_1fr] gap-1" role="tablist">
          {SETS.map((s) => (
            <button key={s.id} role="tab" aria-selected={set === s.id} aria-label={t(s.key)} onClick={() => { setSet(s.id); setIdx(null); }}
              className={`px-1 py-1.5 rounded-full text-sm font-bold whitespace-nowrap ${set === s.id ? 'bg-accent text-white' : 'bg-surface-alt text-fg'}`}>
              {s.short ?? t(s.key)}
            </button>
          ))}
        </div>

        {glyph ? (
          <Practice key={`${glyph.id}-${lang}`} glyph={glyph} lang={lang} label={label(glyph)} stars={stars[glyph.id] ?? 0}
            onStars={(n) => setStars((s) => { const next = { ...s, [glyph.id]: Math.max(s[glyph.id] ?? 0, n) }; writeStars(next); return next; })}
            onList={() => setIdx(null)}
            onNext={idx! < glyphs.length - 1 ? () => setIdx(idx! + 1) : undefined} />
        ) : (
          <>
            <Card className="!p-3">
              <p className="text-sm">{t('tr_intro')}</p>
              <p className="text-xs text-fg-muted mt-1">{t('tr_tip')}</p>
            </Card>
            <div className={`grid gap-2 ${set === 'patterns' ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-4 sm:grid-cols-6'}`}>
              {glyphs.map((g, i) => (
                <button key={g.id} onClick={() => setIdx(i)} aria-label={`${label(g)}, ${t('tr_stars', { n: stars[g.id] ?? 0 })}`}
                  className="rounded-2xl bg-surface border border-border p-2 flex flex-col items-center hover:border-accent">
                  {g.char ? (
                    <span className="font-heading font-extrabold text-3xl leading-none py-1">{g.char}</span>
                  ) : (
                    <>
                      <svg viewBox={viewBox(g)} className="w-full h-12 text-fg" aria-hidden>
                        {g.strokes.map((d, k) => <path key={k} d={d} fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" opacity={0.6} />)}
                      </svg>
                      <span className="text-[11px] font-bold">{label(g)}</span>
                    </>
                  )}
                  <span className="text-xs tracking-tight" aria-hidden>{[1, 2, 3].map((n) => ((stars[g.id] ?? 0) >= n ? '★' : '☆')).join('')}</span>
                </button>
              ))}
            </div>
            <Button variant="secondary" fullWidth onClick={() => printSheet(glyphs, lang)}>{t('tr_print')}</Button>
          </>
        )}
      </div>
    </div>
  );
}

function Practice({ glyph, lang, label, stars, onStars, onList, onNext }: {
  glyph: Glyph; lang: Lang; label: string; stars: number; onStars: (n: number) => void; onList: () => void; onNext?: () => void;
}) {
  const { t } = useI18n();
  const models = useMemo(() => glyph.strokes.map((d) => samplePath(d)), [glyph]);
  const [step, setStep] = useState<Step>(() => STEPS[Math.min(stars, 2)]);
  const [stroke, setStroke] = useState(0);          // stroke being traced
  const [done, setDone] = useState<Pt[][]>([]);     // ink of the strokes already right
  const [ink, setInk] = useState<Pt[]>([]);         // the finger now
  const [msg, setMsg] = useState('');
  const [finished, setFinished] = useState(false);
  const [demo, setDemo] = useState<{ s: number; i: number } | null>(null);
  const svg = useRef<SVGSVGElement>(null);
  const track = useRef<Tracker | null>(null);
  const last = useRef<Pt | null>(null);
  const timer = useRef<number>(0);
  const rules = RULES[step];
  const example = glyph.char ? EXAMPLES[lang][glyph.char.toLowerCase()] : undefined;

  useEffect(() => () => { cancelAnimationFrame(timer.current); window.clearTimeout(timer.current); tts.stop(); }, []);

  const reset = useCallback(() => { setStroke(0); setDone([]); setInk([]); setFinished(false); setMsg(''); track.current = null; }, []);
  useEffect(reset, [step, reset]);

  const toSvg = (e: RPointerEvent): Pt | null => {
    const el = svg.current; const m = el?.getScreenCTM();
    if (!el || !m) return null;
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
    return { x: p.x, y: p.y };
  };

  const finishStroke = (ok: boolean, pts: Pt[]) => {
    if (!ok) { setInk([]); return; }
    const nextDone = [...done, pts.length > 1 ? pts : models[stroke]];
    setDone(nextDone); setInk([]);
    if (stroke + 1 < models.length) {
      sounds.click();
      setStroke(stroke + 1);
      setMsg(t('tr_stroke_ok', { n: stroke + 2 }));
      return;
    }
    // The whole letter is right
    const n = STEPS.indexOf(step) + 1;
    onStars(n);
    setFinished(true);
    sounds.correct();
    if (example) void tts.speak(example[0]);
    if (n < 3) {
      const nextStep = STEPS[n];
      setMsg(t('tr_done_step', { step: t(STEP_KEY[nextStep]).replace(/^\d · /, '') }));
      timer.current = window.setTimeout(() => setStep(nextStep), 1600);
    } else {
      setMsg(t('tr_done_all'));
      sounds.star();
    }
  };

  const onDown = (e: RPointerEvent<SVGSVGElement>) => {
    if (finished || demo) return;
    const p = toSvg(e); if (!p) return;
    const model = models[stroke];
    if (!startOk(model, p, rules)) { setMsg(t('tr_start_here')); return; }
    if (isDot(model)) { finishStroke(true, [p]); return; }
    e.currentTarget.setPointerCapture(e.pointerId);
    track.current = advance({ reached: 0, off: 0, total: 0 }, model, p, rules);
    last.current = p; setInk([p]); setMsg('');
  };
  const onMove = (e: RPointerEvent<SVGSVGElement>) => {
    if (!track.current) return;
    const p = toSvg(e); const prev = last.current; if (!p || !prev) return;
    // Fill the gap between two finger events so a quick stroke is not cut into jumps
    const steps = Math.max(1, Math.ceil(Math.hypot(p.x - prev.x, p.y - prev.y) / 2));
    let tr = track.current;
    for (let k = 1; k <= steps; k++) tr = advance(tr, models[stroke], { x: prev.x + ((p.x - prev.x) * k) / steps, y: prev.y + ((p.y - prev.y) * k) / steps }, rules);
    track.current = tr; last.current = p;
    setInk((s) => [...s, p]);
  };
  const onUp = () => {
    const tr = track.current; if (!tr) return;
    track.current = null; last.current = null;
    const v = verdict(tr, models[stroke], rules);
    if (v === 'ok') finishStroke(true, ink);
    else { setMsg(t(v === 'off' ? 'tr_off' : 'tr_short')); sounds.incorrect(); finishStroke(false, ink); }
  };

  /** Shows the strokes being written, one after another, with a moving dot */
  const watch = () => {
    reset();
    let s = 0; let i = 0;
    const tick = () => {
      i += 1.4;
      if (i >= models[s].length) { s += 1; i = 0; }
      if (s >= models.length) { setDemo(null); return; }
      setDemo({ s, i: Math.floor(i) });
      timer.current = requestAnimationFrame(tick);
    };
    setDemo({ s: 0, i: 0 });
    timer.current = requestAnimationFrame(tick);
  };

  const poly = (pts: Pt[]) => pts.map((q, i) => `${i ? 'L' : 'M'}${q.x.toFixed(1)} ${q.y.toFixed(1)}`).join(' ');
  const guide = (d: string, k: number) => step === 'trace'
    ? <path key={k} d={d} fill="none" stroke="currentColor" strokeOpacity={0.16} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" />
    : step === 'dots'
      ? <path key={k} d={d} fill="none" stroke="currentColor" strokeOpacity={0.45} strokeWidth={2.2} strokeLinecap="round" strokeDasharray="0.1 4.5" />
      : null;
  const cur = models[stroke];
  const showStart = !finished && !demo && cur;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <button onClick={onList} className="text-sm font-bold text-accent">{t('tr_back_list')}</button>
        <h2 className="font-heading font-extrabold text-lg">{label}</h2>
        <span className="text-sm" aria-label={t('tr_stars', { n: stars })}>{[1, 2, 3].map((n) => (stars >= n ? '★' : '☆')).join('')}</span>
      </div>

      <div className="flex gap-1.5 justify-center" role="tablist">
        {STEPS.map((s) => (
          <button key={s} role="tab" aria-selected={step === s} onClick={() => setStep(s)}
            className={`px-2.5 py-1 rounded-full text-xs font-bold ${step === s ? '' : 'bg-surface-alt text-fg-muted'}`}
            style={step === s ? { background: 'var(--color-mint)', color: '#1f2a44' } : undefined}>
            {t(STEP_KEY[s])}
          </button>
        ))}
      </div>

      <div className="rounded-3xl bg-surface border border-border p-2 select-none">
        <svg ref={svg} viewBox={viewBox(glyph)} className="w-full text-fg" style={{ height: 'min(58vh, 520px)', touchAction: 'none' }}
          onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp} data-testid="trace-pad">
          <Pauta w={glyph.w} />
          {glyph.strokes.map(guide)}
          {done.map((pts, k) => <path key={k} d={poly(pts)} fill="none" stroke="var(--color-accent)" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />)}
          {ink.length > 0 && <path d={poly(ink)} fill="none" stroke="var(--color-accent)" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" opacity={0.85} />}
          {demo && (
            <g>
              {models.slice(0, demo.s).map((m, k) => <path key={k} d={poly(m)} fill="none" stroke="var(--color-coral)" strokeWidth={4} strokeLinecap="round" />)}
              <path d={poly(models[demo.s].slice(0, demo.i + 1))} fill="none" stroke="var(--color-coral)" strokeWidth={4} strokeLinecap="round" />
              <circle cx={models[demo.s][demo.i].x} cy={models[demo.s][demo.i].y} r={3.2} fill="var(--color-coral)" />
            </g>
          )}
          {showStart && (
            <g>
              {step !== 'alone' && <Arrow pts={cur} />}
              <circle cx={cur[0].x} cy={cur[0].y} r={4} fill="#3BB273" />
              <text x={cur[0].x} y={cur[0].y + 1.6} textAnchor="middle" fontSize={4.6} fontWeight={800} fill="#fff">{stroke + 1}</text>
            </g>
          )}
        </svg>
      </div>

      <p className="text-center font-bold min-h-[1.5rem]" aria-live="polite">{msg}</p>

      {finished && example && (
        <button onClick={() => void tts.speak(example[0])} className="mx-auto flex items-center gap-2 rounded-2xl bg-surface-alt px-4 py-2 text-lg font-bold">
          <span className="text-3xl" aria-hidden>{example[1]}</span>{highlight(example[0], glyph.char)}
        </button>
      )}

      <div className="grid grid-cols-3 gap-2">
        <Button variant="secondary" size="sm" onClick={watch} disabled={!!demo}>{t('tr_watch')}</Button>
        <Button variant="secondary" size="sm" onClick={reset} disabled={!!demo}>{t('tr_clear')}</Button>
        <Button size="sm" onClick={onNext ?? onList}>{onNext ? t('tr_next') : t('tr_back_list')}</Button>
      </div>
    </div>
  );
}

/** The example word with the letter in colour */
function highlight(word: string, ch: string) {
  const i = word.toLowerCase().indexOf(ch.toLowerCase());
  const w = ch === ch.toUpperCase() && ch !== ch.toLowerCase() ? word[0].toUpperCase() + word.slice(1) : word;
  if (i < 0) return <span>{w}</span>;
  return <span>{w.slice(0, i)}<span className="text-accent">{w.slice(i, i + ch.length)}</span>{w.slice(i + ch.length)}</span>;
}

/** Printable sheet: each model, then rows of dotted copies to trace on paper, with the start of each stroke */
function printSheet(glyphs: Glyph[], lang: Lang) {
  const tl = getTranslator(lang);
  const rowW = 600; // about 27 mm per 100 units on A4
  const row = (g: Glyph, first: boolean) => {
    const n = Math.max(1, Math.floor(rowW / (g.w + 12)));
    let body = '';
    for (let k = 0; k < n; k++) {
      const x = k * (g.w + 12);
      body += `<g transform="translate(${x} 0)">${g.strokes.map((d) => `<path d="${d}" fill="none" stroke="${first && k === 0 ? '#34437A' : '#6f7899'}" stroke-width="${first && k === 0 ? 3 : 2}" stroke-linecap="round" ${first && k === 0 ? '' : 'stroke-dasharray="0.1 2.6"'}/>`).join('')}`;
      if (first && k === 0) {
        g.strokes.forEach((d, i) => {
          const m = /^M([\d.-]+) ([\d.-]+)/.exec(d);
          if (m) body += `<circle cx="${m[1]}" cy="${m[2]}" r="4.2" fill="#3BB273"/><text x="${m[1]}" y="${+m[2] + 1.8}" font-size="5.2" text-anchor="middle" fill="#fff" font-weight="700">${i + 1}</text>`;
        });
      }
      body += '</g>';
    }
    const lines = [LINES.top, LINES.mid, LINES.base, LINES.desc].map((y) => `<line x1="-6" x2="${rowW}" y1="${y}" y2="${y}" stroke="#c9cfe0" stroke-width="${y === LINES.base ? 0.8 : 0.4}"/>`).join('');
    return `<svg viewBox="-8 -4 ${rowW + 12} 104" width="100%" style="display:block;margin:0 0 2mm">${lines}${body}</svg>`;
  };
  const items = glyphs.map((g) => `<div class="g">${row(g, true)}${row(g, false)}</div>`).join('');
  const html = `<!doctype html><html lang="${lang === 'ca' ? 'ca-ES-valencia' : lang === 'en' ? 'en-GB' : 'es'}"><head><meta charset="utf-8"><title>${tl('tr_sheet_title')}</title>
<style>@page{size:A4;margin:12mm}body{font-family:system-ui,sans-serif;color:#2b2b3a}h1{font-size:18pt;margin:0 0 2mm}.meta{display:flex;gap:10mm;font-size:11pt;margin-bottom:3mm}.meta span{flex:1;border-bottom:1px solid #999}p{font-size:11pt;margin:0 0 4mm}.g{break-inside:avoid;margin-bottom:4mm}</style></head>
<body><h1>✏️ ${tl('tr_sheet_title')}</h1><div class="meta"><span>${tl('ws_name')}:</span><span>${tl('ws_date')}:</span></div><p>${tl('tr_sheet_hint')}</p>${items}</body></html>`;
  void printHtml(html, tl('tr_sheet_title'));
}
