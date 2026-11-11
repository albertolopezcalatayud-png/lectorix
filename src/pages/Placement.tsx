import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Exercise, ModuleId } from '@/types';
import { MODULES, MODULE_TEXT, LEVEL_COUNT, STAGE_START, SCHOOL_STAGES, levelNameKey, levelTag, type SchoolStage } from '@/data/modules';
import { loadModule } from '@/data/content';
import { useAppStore, usePracticeLang } from '@/stores/useAppStore';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ExerciseCard } from '@/components/exercise/ExerciseCard';
import { useI18n, type TranslationKey } from '@/i18n';

/**
 * Placement test: a few questions per area, moving up while the student does well
 * and down when it is too hard, to find a comfortable starting level in each area.
 * Quick challenges (retos) take the average of the other areas.
 */
const TESTED: ModuleId[] = ['comprension_lectora', 'escritura', 'memoria_visual', 'fonologia'];
const PER_STEP = 3;      // questions at each level
const TO_PASS = 2;       // right answers needed to pass a level
const MAX_STEPS = 4;     // levels tried per area at most

type Phase = 'intro' | 'test' | 'done';

interface AreaState {
  level: number;          // level being tried now
  passed: number;         // highest level passed so far (0 = none)
  failedAbove: number;    // lowest level failed (Infinity = none)
  steps: number;
  questions: Exercise[];
  index: number;
  right: number;
  asked: number;
}

const shuffle = <T,>(a: T[]) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };

/** Three questions of a level; comprehension uses one passage so there is only one text to read */
function pickQuestions(pool: Exercise[], level: number): Exercise[] {
  const mc = pool.filter((e) => e.type === 'multiple_choice' && e.level === level && e.options.length >= 2);
  const withPassage = mc.filter((e) => e.passage);
  if (withPassage.length >= PER_STEP) {
    const passages = [...new Set(withPassage.map((e) => e.passage))];
    const p = passages[Math.floor(Math.random() * passages.length)];
    const same = shuffle(withPassage.filter((e) => e.passage === p));
    if (same.length >= PER_STEP) return same.slice(0, PER_STEP);
  }
  return shuffle(mc).slice(0, PER_STEP);
}

export default function Placement() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const lang = usePracticeLang();
  const max = LEVEL_COUNT[lang];
  const schoolStage = useAppStore((s) => s.schoolStage);
  const setSchoolStage = useAppStore((s) => s.setSchoolStage);
  const setStartLevels = useAppStore((s) => s.setStartLevels);
  const setPlacementDone = useAppStore((s) => s.setPlacementDone);

  const [phase, setPhase] = useState<Phase>('intro');
  const [stage, setStage] = useState<SchoolStage | null>(schoolStage);
  const [pools, setPools] = useState<Record<string, Exercise[]> | null>(null);
  const [areaIdx, setAreaIdx] = useState(0);
  const [area, setArea] = useState<AreaState | null>(null);
  const [results, setResults] = useState<Partial<Record<ModuleId, number>>>({});
  const [qKey, setQKey] = useState(0);

  useEffect(() => {
    let off = false;
    Promise.all(TESTED.map((m) => loadModule(lang, m).then((d) => [m, d] as const)))
      .then((pairs) => { if (!off) setPools(Object.fromEntries(pairs)); })
      .catch(() => { if (!off) setPools({}); });
    return () => { off = true; };
  }, [lang]);

  const firstLevel = stage ? STAGE_START[lang][stage] : Math.min(2, max);

  const startArea = useCallback((idx: number) => {
    const m = TESTED[idx];
    const level = firstLevel;
    setAreaIdx(idx);
    setArea({ level, passed: 0, failedAbove: Infinity, steps: 0, questions: pickQuestions(pools?.[m] ?? [], level), index: 0, right: 0, asked: 0 });
    setQKey((k) => k + 1);
  }, [firstLevel, pools]);

  const finish = useCallback((res: Partial<Record<ModuleId, number>>) => {
    const vals = TESTED.map((m) => res[m] ?? 1);
    const avg = Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
    const all = { ...res, retos_rapidos: Math.max(1, avg) };
    setResults(all);
    setStartLevels(lang, all);
    setPlacementDone(lang);
    if (stage) setSchoolStage(stage);
    setPhase('done');
  }, [lang, setStartLevels, setPlacementDone, setSchoolStage, stage]);

  const endArea = useCallback((startAt: number) => {
    const m = TESTED[areaIdx];
    const res = { ...results, [m]: Math.max(1, Math.min(max, startAt)) };
    setResults(res);
    if (areaIdx + 1 < TESTED.length) startArea(areaIdx + 1);
    else finish(res);
  }, [areaIdx, results, max, startArea, finish]);

  const onAnswer = useCallback((_sel: number, ok: boolean) => {
    if (!area) return;
    {
      const right = area.right + (ok ? 1 : 0);
      const index = area.index + 1;
      if (index < area.questions.length) {
        setArea({ ...area, right, index, asked: area.asked + 1 });
        setQKey((k) => k + 1);
        return;
      }
      // Level finished
      const steps = area.steps + 1;
      const pool = pools?.[TESTED[areaIdx]] ?? [];
      const passedNow = right >= Math.min(TO_PASS, area.questions.length);
      let { passed, failedAbove } = area;
      if (passedNow) passed = Math.max(passed, area.level); else failedAbove = Math.min(failedAbove, area.level);
      let next: number | null = null;
      if (passedNow && area.level < max && area.level + 1 < failedAbove) next = area.level + 1;
      if (!passedNow && passed === 0 && area.level > 1) next = area.level - 1;
      if (next != null && steps < MAX_STEPS) {
        const qs = pickQuestions(pool, next);
        if (qs.length) {
          setArea({ level: next, passed, failedAbove, steps, questions: qs, index: 0, right: 0, asked: area.asked + 1 });
          setQKey((k) => k + 1);
          return;
        }
      }
      endArea(passed || 1);
    }
  }, [area, pools, areaIdx, max, endArea]);

  const stageKey = (s: SchoolStage) => `plc_stage_${s}` as TranslationKey;

  // ── Intro ───────────────────────────────────────────
  if (phase === 'intro') {
    return (
      <div className="min-h-screen pb-24">
        <Header title={t('plc_title')} showBack />
        <div className="px-4 py-5 max-w-lg mx-auto space-y-4">
          <div className="text-center">
            <span className="text-5xl block mb-2">🧭</span>
            <p className="text-sm text-fg-muted">{t('plc_desc')}</p>
          </div>
          <Card>
            <h3 className="font-heading font-extrabold text-sm mb-1">{t('plc_stage_q')}</h3>
            <p className="text-[11px] text-fg-muted mb-3">{t('plc_stage_hint')}</p>
            <div className="grid grid-cols-2 gap-2">
              {SCHOOL_STAGES.map((s) => (
                <button key={s} onClick={() => setStage(s)}
                  className={`py-2.5 px-2 rounded-xl text-sm font-bold border transition-colors ${stage === s ? 'bg-accent text-white border-accent' : 'bg-bg border-border'}`}>
                  {t(stageKey(s))}
                </button>
              ))}
              <button onClick={() => setStage(null)}
                className={`py-2.5 px-2 rounded-xl text-sm font-bold border transition-colors ${stage === null ? 'bg-accent text-white border-accent' : 'bg-bg border-border'}`}>
                {t('plc_stage_none')}
              </button>
            </div>
          </Card>
          <Card className="text-xs text-fg-muted space-y-1">
            <p>⏱️ {t('plc_note_time')}</p>
            <p>🙂 {t('plc_note_calm')}</p>
            <p>🔓 {t('plc_note_change')}</p>
            {lang === 'en' && <p>🇬🇧 {t('cefr_note')}</p>}
          </Card>
          <Button fullWidth disabled={!pools} onClick={() => { setPhase('test'); startArea(0); }}>{t('plc_start')}</Button>
        </div>
      </div>
    );
  }

  // ── Results ─────────────────────────────────────────
  if (phase === 'done') {
    return (
      <div className="min-h-screen pb-24">
        <Header title={t('plc_title')} />
        <div className="px-4 py-5 max-w-lg mx-auto space-y-4">
          <div className="text-center">
            <span className="text-5xl block mb-2">🎉</span>
            <h2 className="font-heading font-black text-xl">{t('plc_done_title')}</h2>
            <p className="text-sm text-fg-muted mt-1">{t('plc_done_desc')}</p>
          </div>
          <div className="space-y-2.5">
            {MODULES.map((m, i) => {
              const lvl = results[m.id] ?? 1;
              return (
                <motion.div key={m.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                  <Card hover onClick={() => navigate(`/modulos/${m.id}`)}>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl w-11 h-11 rounded-[12px] flex items-center justify-center" style={{ backgroundColor: m.colorPale }}>{m.icon}</span>
                      <div className="flex-1">
                        <h4 className="font-heading font-extrabold text-sm">{t(MODULE_TEXT[m.id].name)}</h4>
                        <p className="text-xs text-fg-muted">{t('dash_level', { level: lvl })} · {t(levelNameKey(lvl))}{levelTag(lang, lvl)}</p>
                      </div>
                      <span className="text-accent font-extrabold text-sm">→</span>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
          <p className="text-[11px] text-fg-muted text-center">{t('plc_done_note')}</p>
          <Button fullWidth onClick={() => navigate('/', { replace: true })}>{t('plc_go')}</Button>
        </div>
      </div>
    );
  }

  // ── Test ────────────────────────────────────────────
  const m = TESTED[areaIdx];
  const q = area?.questions[area.index];
  return (
    <div className="min-h-screen pb-24">
      <div className="flex items-center gap-3 px-4 py-3 bg-bg-card border-b border-border">
        <button onClick={() => navigate(-1)} aria-label={t('plc_exit')}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-accent-pale text-accent">✕</button>
        <div className="flex-1">
          <h3 className="font-heading font-extrabold text-sm">{t('plc_title')}</h3>
          <p className="text-[10px] text-fg-muted">{t('plc_area', { n: areaIdx + 1, total: TESTED.length })} · {t(MODULE_TEXT[m].name)}</p>
        </div>
      </div>
      <div className="px-4 py-5 max-w-lg mx-auto">
        {q ? (
          <ExerciseCard key={qKey} exercise={q} questionNumber={area!.asked + 1} totalQuestions={Math.max(area!.asked + 1, PER_STEP * 3)}
            onAnswer={onAnswer} examMode />
        ) : (
          <Card className="text-center text-sm">
            <p className="mb-3">{t('plc_no_questions')}</p>
            <Button onClick={() => endArea(firstLevel)}>{t('onb_next')}</Button>
          </Card>
        )}
      </div>
    </div>
  );
}
