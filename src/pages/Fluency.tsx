import { useState, useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { usePracticeLang } from '@/stores/useAppStore';
import { useReadings, type Reading } from '@/data/readings';
import { useFluencyStore, type FluencyResult } from '@/services/fluency';
import { levelNameKey } from '@/data/modules';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SyllableWord, useSyllableColoring } from '@/components/reading/SyllableText';
import { useI18n } from '@/i18n';
import { awardActivityXP } from '@/services/session';

const TEST_SECONDS = 60;
type Phase = 'setup' | 'ready' | 'reading' | 'mark' | 'done';

/** Small line chart of words-correct-per-minute over time */
export function FluencyChart({ results }: { results: FluencyResult[] }) {
  const pts = results.slice(-12);
  if (pts.length < 2) return null;
  const max = Math.max(...pts.map((p) => p.wcpm), 10);
  const W = 300, H = 110, P = 18;
  const x = (i: number) => P + (i * (W - 2 * P)) / (pts.length - 1);
  const y = (v: number) => H - P - (v / max) * (H - 2 * P);
  const d = pts.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p.wcpm).toFixed(1)}`).join(' ');
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label="wcpm">
      <line x1={P} y1={H - P} x2={W - P} y2={H - P} stroke="currentColor" opacity="0.15" />
      <path d={d} fill="none" stroke="var(--color-accent, #7C5CFC)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => (
        <g key={p.id}>
          <circle cx={x(i)} cy={y(p.wcpm)} r="3.5" fill="var(--color-accent, #7C5CFC)" />
          <text x={x(i)} y={y(p.wcpm) - 7} textAnchor="middle" fontSize="9" fill="currentColor" opacity="0.7">{p.wcpm}</text>
        </g>
      ))}
    </svg>
  );
}

export default function Fluency() {
  const { t } = useI18n();
  const lang = usePracticeLang();
  const readings = useReadings();
  const results = useFluencyStore((s) => s.results);
  const add = useFluencyStore((s) => s.add);
  const sylLang = useSyllableColoring();

  const mine = useMemo(() => results.filter((r) => r.lang === lang), [results, lang]);
  const [level, setLevel] = useState<number>(() => mine[mine.length - 1]?.level ?? 1);
  const [reading, setReading] = useState<Reading | null>(null);
  const [phase, setPhase] = useState<Phase>('setup');
  const [left, setLeft] = useState(TEST_SECONDS);
  const [elapsed, setElapsed] = useState(0);
  const [lastWord, setLastWord] = useState<number | null>(null);
  const [errors, setErrors] = useState<Set<number>>(new Set());
  const [markErrors, setMarkErrors] = useState(false);
  const [result, setResult] = useState<FluencyResult | null>(null);
  const [prevBefore, setPrevBefore] = useState<FluencyResult | null>(null);
  const [xp, setXp] = useState(0);
  const startRef = useRef(0);

  const words = useMemo(() => (reading ? reading.text.split(/\s+/).filter(Boolean) : []), [reading]);

  // Pick a text of the level, preferring one not used recently
  const pick = () => {
    if (!readings) return;
    const pool = readings.filter((r) => r.level === level);
    const used = new Set(mine.slice(-6).map((r) => r.readingId));
    const fresh = pool.filter((r) => !used.has(r.id));
    const list = fresh.length ? fresh : pool;
    setReading(list[Math.floor(Math.random() * list.length)] ?? null);
    setPhase('ready');
    setLastWord(null);
    setErrors(new Set());
    setLeft(TEST_SECONDS);
    setResult(null);
  };

  useEffect(() => {
    if (phase !== 'reading') return;
    const id = setInterval(() => {
      const e = Math.min(TEST_SECONDS, Math.round((Date.now() - startRef.current) / 1000));
      setLeft(TEST_SECONDS - e);
      if (e >= TEST_SECONDS) {
        setElapsed(TEST_SECONDS);
        setPhase('mark');
      }
    }, 250);
    return () => clearInterval(id);
  }, [phase]);

  const start = () => {
    startRef.current = Date.now();
    setPhase('reading');
  };
  const finishedEarly = () => {
    setElapsed(Math.max(5, Math.round((Date.now() - startRef.current) / 1000)));
    setLastWord(words.length - 1);
    setPhase('mark');
  };

  const tapWord = (i: number) => {
    if (phase !== 'mark') return;
    if (markErrors) {
      if (lastWord !== null && i > lastWord) return;
      const n = new Set(errors);
      n.has(i) ? n.delete(i) : n.add(i);
      setErrors(n);
    } else {
      setLastWord(i);
      setErrors(new Set([...errors].filter((e) => e <= i)));
    }
  };

  const save = () => {
    if (!reading || lastWord === null) return;
    setPrevBefore(mine.length ? mine[mine.length - 1] : null);
    const r = add({ lang, level, readingId: reading.id, wordsRead: lastWord + 1, errors: errors.size, seconds: elapsed });
    setResult(r);
    setXp(awardActivityXP('fluency', 20, 2));
    setPhase('done');
  };

  const prev = mine.length > 0 ? mine[mine.length - 1] : null;
  const best = mine.length ? Math.max(...mine.map((r) => r.wcpm)) : 0;

  return (
    <div className="min-h-screen pb-24">
      <Header title={t('flu_title')} showBack />
      <div className="px-4 py-5 max-w-lg mx-auto space-y-4">
        {phase === 'setup' && (
          <>
            <p className="text-sm text-fg-muted">{t('flu_desc')}</p>
            <Card>
              <h3 className="font-heading font-extrabold text-sm mb-2">{t('flu_how_title')}</h3>
              <ol className="text-sm space-y-1.5 list-decimal pl-5">
                <li>{t('flu_step1')}</li>
                <li>{t('flu_step2')}</li>
                <li>{t('flu_step3')}</li>
                <li>{t('flu_step4')}</li>
              </ol>
              <p className="text-[11px] text-fg-muted mt-3">🔒 {t('flu_privacy')}</p>
            </Card>
            <Card>
              <span className="text-xs text-fg-muted block mb-2">{t('flu_choose_level')}</span>
              <div className="flex gap-1.5">
                {(readings ? [...new Set(readings.map((r) => r.level))].sort((a, b) => a - b) : [1, 2, 3, 4, 5]).map((l) => (
                  <button key={l} onClick={() => setLevel(l)}
                    className={`flex-1 py-2 rounded-xl font-bold text-sm ${level === l ? 'bg-accent text-white' : 'bg-bg border border-border'}`}>
                    {l}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-fg-muted mt-2">{t(levelNameKey(level))}</p>
            </Card>
            <Button fullWidth onClick={pick} disabled={!readings}>{t('flu_prepare')}</Button>

            {mine.length > 0 && (
              <Card>
                <h3 className="font-heading font-extrabold text-sm mb-1">{t('flu_progress')}</h3>
                <p className="text-xs text-fg-muted mb-2">{t('flu_last_best', { last: prev!.wcpm, best })}</p>
                <FluencyChart results={mine} />
                <p className="text-[10px] text-fg-muted mt-2">{t('flu_compare_note')}</p>
              </Card>
            )}
          </>
        )}

        {phase !== 'setup' && reading && (
          <>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-heading font-extrabold">{reading.emoji} {reading.title}</h2>
                <p className="text-[11px] text-fg-muted">{t('dash_level', { level })}</p>
              </div>
              {(phase === 'reading' || phase === 'ready') && (
                <div className={`text-3xl font-heading font-black tabular-nums ${left <= 10 ? 'text-red' : 'text-accent'}`}>
                  0:{String(left).padStart(2, '0')}
                </div>
              )}
            </div>

            {phase === 'ready' && (
              <Card className="text-center space-y-3">
                <p className="text-sm">{t('flu_ready')}</p>
                <Button fullWidth onClick={start}>▶ {t('flu_start')}</Button>
                <button onClick={pick} className="text-xs font-bold text-accent">{t('flu_other_text')}</button>
              </Card>
            )}

            {phase === 'mark' && (
              <Card className="border-yellow/50 bg-yellow-pale/30 text-sm space-y-2">
                <p className="font-bold">{markErrors ? t('flu_mark_errors') : t('flu_mark_last')}</p>
                <div className="flex gap-1.5">
                  <button onClick={() => setMarkErrors(false)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold ${!markErrors ? 'bg-accent text-white' : 'bg-bg border border-border'}`}>
                    🏁 {t('flu_tab_last')}
                  </button>
                  <button onClick={() => setMarkErrors(true)} disabled={lastWord === null}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold disabled:opacity-40 ${markErrors ? 'bg-red text-white' : 'bg-bg border border-border'}`}>
                    ✗ {t('flu_tab_errors')} ({errors.size})
                  </button>
                </div>
                <p className="text-[11px] text-fg-muted">{t('flu_errors_optional')}</p>
              </Card>
            )}

            {phase !== 'ready' && (
              <Card>
                <div className="text-xl reading-text" style={{ lineHeight: 'calc(var(--reading-leading) + 0.5)' }}
                  lang={lang === 'ca' ? 'ca-ES-valencia' : lang === 'en' ? 'en-GB' : 'es'}>
                  {words.map((w, i) => {
                    const after = lastWord !== null && i > lastWord;
                    const err = errors.has(i);
                    const last = i === lastWord;
                    return (
                      <span key={i}>
                        <span
                          onClick={() => tapWord(i)}
                          className={`rounded px-0.5 ${phase === 'mark' ? 'cursor-pointer' : ''} ${after ? 'opacity-35' : ''} ${err ? 'bg-red/25 line-through decoration-red' : ''} ${last ? 'ring-2 ring-accent bg-accent-pale' : ''}`}
                        >
                          {sylLang ? <SyllableWord word={w} lang={sylLang} /> : w}
                        </span>{' '}
                      </span>
                    );
                  })}
                </div>
              </Card>
            )}

            {phase === 'reading' && (
              <Button fullWidth variant="secondary" onClick={finishedEarly}>{t('flu_finished_early')}</Button>
            )}
            {phase === 'mark' && (
              <Button fullWidth onClick={save} disabled={lastWord === null}>{t('flu_save')}</Button>
            )}

            {phase === 'done' && result && (
              <motion.div ref={(el) => el?.scrollIntoView({ behavior: 'smooth', block: 'center' })} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                <Card className="text-center space-y-2">
                  <div className="text-5xl font-heading font-black text-accent">{result.wcpm}</div>
                  <p className="font-bold">{t('flu_wcpm')}</p>
                  {xp > 0 && <p className="font-heading font-black text-mint">+{xp} XP</p>}
                  <p className="text-xs text-fg-muted">
                    {t('flu_detail', { words: result.wordsRead, errors: result.errors, s: result.seconds })}
                  </p>
                  {prevBefore && (
                    <p className="text-sm">
                      {result.wcpm > prevBefore.wcpm ? t('flu_better', { n: result.wcpm - prevBefore.wcpm }) : result.wcpm === prevBefore.wcpm ? t('flu_same') : t('flu_lower')}
                    </p>
                  )}
                  <p className="text-[11px] text-fg-muted">{t('flu_compare_note')}</p>
                  <Button fullWidth onClick={() => setPhase('setup')}>{t('flu_back')}</Button>
                </Card>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
