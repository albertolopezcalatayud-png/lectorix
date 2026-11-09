import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Exercise, AnswerResult, ModuleId } from '@/types';
import { buildSessionResult } from '@/services/gamification';
import { recordSession } from '@/services/session';
import { LEVEL_NAMES } from '@/data/modules';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { WriteExercise } from '@/components/exercise/WriteExercise';
import tts from '@/services/tts';
import { useI18n } from '@/i18n';

const WORDS_PER_SESSION = 6;
const SENTENCES_PER_SESSION = 4;

export function isDictationExercise(e: Exercise) {
  return e.type === 'write' && !!e.word && /^escucha/i.test(e.prompt);
}

async function loadDictations(): Promise<Exercise[]> {
  const [fon, esc] = await Promise.all([
    import('@/data/exercises/fonologia.json'),
    import('@/data/exercises/escritura.json'),
  ]);
  const all = [
    ...(fon.default.exercises as unknown as Exercise[]),
    ...(esc.default.exercises as unknown as Exercise[]),
  ];
  return all.filter(isDictationExercise);
}

const shuffle = <T,>(arr: T[]) => [...arr].sort(() => Math.random() - 0.5);
const isSentence = (e: Exercise) => (e.answer || '').trim().includes(' ');

export default function Dictation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useI18n();

  const reviewIds: string[] | undefined = location.state?.reviewIds;
  const initialLevel: number | undefined = location.state?.level;

  const [pool, setPool] = useState<Exercise[] | null>(null);
  const [level, setLevel] = useState<number | null>(initialLevel ?? null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerResult[]>([]);
  const [startTime, setStartTime] = useState(Date.now());

  useEffect(() => {
    loadDictations().then(setPool).catch(() => setPool([]));
  }, []);

  // Build the session once a level is chosen (or for a review of mistakes)
  useEffect(() => {
    if (!pool || level == null) return;
    let list: Exercise[];
    if (reviewIds) {
      list = pool.filter((e) => reviewIds.includes(e.id));
    } else {
      const ofLevel = pool.filter((e) => e.level === level);
      // Words first, then sentences: from easier to harder
      list = [
        ...shuffle(ofLevel.filter((e) => !isSentence(e))).slice(0, WORDS_PER_SESSION),
        ...shuffle(ofLevel.filter(isSentence)).slice(0, SENTENCES_PER_SESSION),
      ];
    }
    setExercises(list);
    setCurrentIndex(0);
    setAnswers([]);
    setStartTime(Date.now());
  }, [pool, level, reviewIds]);

  const handleAnswer = useCallback(
    (selected: number, isCorrect: boolean, timeMs: number) => {
      const ex = exercises[currentIndex];
      const next = [...answers, { exercise_id: ex.id, selected, correct: ex.correct, is_correct: isCorrect, time_ms: timeMs }];
      setAnswers(next);
      if (currentIndex + 1 < exercises.length) {
        setCurrentIndex(currentIndex + 1);
        return;
      }
      const result = buildSessionResult({ module: 'escritura' as ModuleId, level: level ?? 1, answers: next, startTime });
      result.mode = 'dictation';
      recordSession(result);
      navigate('/resultados', { state: { result }, replace: true });
    },
    [exercises, currentIndex, answers, level, startTime, navigate],
  );

  if (!pool) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          className="w-10 h-10 border-3 border-accent border-t-transparent rounded-full"
        />
      </div>
    );
  }

  // ── Level picker ──────────────────────────────────────
  if (level == null || exercises.length === 0) {
    return (
      <div className="min-h-screen pb-24">
        <Header title={t('dict_title')} showBack />
        <div className="px-4 py-5 max-w-lg mx-auto space-y-3">
          <p className="text-sm text-fg-muted">{t('dict_tip')}</p>
          {!tts.isAvailable() && (
            <Card className="border-red/30 bg-red-pale/30 text-sm">⚠️ {t('dict_no_voice')}</Card>
          )}
          <h3 className="font-heading font-extrabold text-sm pt-1">{t('dict_choose')}</h3>
          {[1, 2, 3, 4, 5].map((l, i) => {
            const count = pool.filter((e) => e.level === l).length;
            return (
              <motion.div key={l} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card hover onClick={() => setLevel(l)}>
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-[12px] bg-accent-pale text-accent font-heading font-black flex items-center justify-center">
                      {l}
                    </span>
                    <div className="flex-1">
                      <h4 className="font-heading font-extrabold text-sm">{LEVEL_NAMES[l]}</h4>
                      <p className="text-xs text-fg-muted">{t('dict_level_desc', { n: count })}</p>
                    </div>
                    <span className="text-accent font-extrabold text-sm">→</span>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  }

  // ── Session ───────────────────────────────────────────
  return (
    <div className="min-h-screen">
      <div className="flex items-center gap-3 px-4 py-3 bg-bg-card border-b border-border">
        <button
          onClick={() => { tts.stop(); navigate(-1); }}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-accent-pale text-accent"
          aria-label={t('back')}
        >
          ✕
        </button>
        <div className="flex-1">
          <h3 className="font-heading font-extrabold text-sm">{reviewIds ? t('rev_title') : t('dict_title')}</h3>
          <p className="text-[10px] text-fg-muted">{t('dash_level', { level })} · {LEVEL_NAMES[level]}</p>
        </div>
        <span className="text-xs font-bold text-fg-muted">
          {t('ex_question', { n: currentIndex + 1, total: exercises.length })}
        </span>
      </div>
      <div className="px-4 py-6 max-w-lg mx-auto">
        <WriteExercise
          key={exercises[currentIndex].id}
          exercise={exercises[currentIndex]}
          questionNumber={currentIndex + 1}
          totalQuestions={exercises.length}
          onAnswer={handleAnswer}
        />
      </div>
    </div>
  );
}
