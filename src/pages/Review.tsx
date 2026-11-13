import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Exercise, AnswerResult, ModuleId } from '@/types';
import { loadModule } from '@/data/content';
import { usePracticeLang } from '@/stores/useAppStore';
import { useReviewStore, dueItems, pendingItems, customExercise } from '@/services/review';
import { buildSessionResult } from '@/services/gamification';
import { recordSession } from '@/services/session';
import { ExerciseCard } from '@/components/exercise/ExerciseCard';
import { DragDropExercise } from '@/components/exercise/DragDropExercise';
import { WriteExercise } from '@/components/exercise/WriteExercise';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LapiNote } from '@/components/mascot/LapiNote';
import { useI18n } from '@/i18n';

const MAX_PER_SESSION = 12;

/** Spaced-repetition review: the exercises due today (or, from the notebook, any pending ones) */
export default function Review() {
  const navigate = useNavigate();
  const location = useLocation();
  const lang = usePracticeLang();
  const { t } = useI18n();
  const anyPending: boolean = location.state?.all || false;
  const onlyKeys: string[] | undefined = location.state?.keys;

  const [exercises, setExercises] = useState<Exercise[] | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerResult[]>([]);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const store = useReviewStore.getState();
      let list = anyPending ? pendingItems(store.items, lang) : dueItems(store.items, lang);
      if (onlyKeys) list = list.filter((i) => onlyKeys.includes(i.key));
      list = list.slice(0, MAX_PER_SESSION);
      const modules = [...new Set(list.filter((i) => !i.id.startsWith('custom:')).map((i) => i.module))] as ModuleId[];
      const banks = await Promise.all(modules.map((m) => loadModule(lang, m).catch(() => [] as Exercise[])));
      const byId = new Map(banks.flat().map((e) => [e.id, e]));
      const found: Exercise[] = [];
      for (const it of list) {
        const ex = byId.get(it.id) ?? customExercise(it);
        if (ex) found.push(ex);
        else store.forget(it.key); // the exercise no longer exists in the bank
      }
      if (!cancelled) setExercises(found);
    })();
    return () => { cancelled = true; };
  }, [lang, anyPending]);

  const handleAnswer = useCallback(
    (selected: number, isCorrect: boolean, timeMs: number) => {
      if (!exercises) return;
      const ex = exercises[currentIndex];
      const next = [...answers, { exercise_id: ex.id, selected, correct: ex.correct, is_correct: isCorrect, time_ms: timeMs }];
      setAnswers(next);
      if (currentIndex + 1 < exercises.length) {
        setCurrentIndex(currentIndex + 1);
        return;
      }
      // Items reviewed from the notebook ahead of time count as due today
      if (anyPending) {
        const store = useReviewStore.getState();
        const items = { ...store.items };
        for (const e of exercises) {
          const k = `${lang}:${e.id}`;
          if (items[k] && items[k].due > Date.now()) items[k] = { ...items[k], due: Date.now() };
        }
        useReviewStore.setState({ items });
      }
      const srs = useReviewStore.getState().track(exercises, next, lang);
      const result = buildSessionResult({ module: ex.module, level: ex.level, answers: next, startTime });
      result.mode = 'srs';
      recordSession(result);
      navigate('/resultados', { state: { result, srs }, replace: true });
    },
    [exercises, currentIndex, answers, startTime, navigate, lang, anyPending],
  );

  if (!exercises) {
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

  if (exercises.length === 0) {
    return (
      <div className="min-h-screen pb-24">
        <Header title={t('srs_title')} showBack />
        <div className="px-4 py-8 max-w-lg mx-auto space-y-4">
          <LapiNote title={t('srs_none_title')}>{t('srs_none_desc')}</LapiNote>
          <Button fullWidth onClick={() => navigate('/', { replace: true })}>{t('res_home')}</Button>
        </div>
      </div>
    );
  }

  const ex = exercises[currentIndex];
  return (
    <div className="min-h-screen">
      <div className="flex items-center gap-3 px-4 py-3 bg-bg-card border-b border-border">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-accent-pale text-accent"
          aria-label={t('back')}
        >
          ✕
        </button>
        <div className="flex-1">
          <h3 className="font-heading font-extrabold text-sm">{t('srs_title')}</h3>
          <p className="text-[10px] text-fg-muted">{t('srs_session_desc')}</p>
        </div>
        <span className="text-xs font-bold text-fg-muted">
          {t('ex_question', { n: currentIndex + 1, total: exercises.length })}
        </span>
      </div>
      <div className="px-4 py-6 max-w-lg mx-auto">
        {ex.type === 'write' ? (
          <WriteExercise key={ex.id} exercise={ex} questionNumber={currentIndex + 1} totalQuestions={exercises.length} onAnswer={handleAnswer} />
        ) : ex.type === 'drag_order' || ex.type === 'drag_fill' ? (
          <DragDropExercise key={ex.id} exercise={ex} questionNumber={currentIndex + 1} totalQuestions={exercises.length} onAnswer={handleAnswer} />
        ) : (
          <ExerciseCard key={ex.id} exercise={ex} questionNumber={currentIndex + 1} totalQuestions={exercises.length} onAnswer={handleAnswer}
            autoPlayAudio={ex.module === 'fonologia'} />
        )}
      </div>
      {currentIndex === 0 && (
        <div className="px-4 max-w-lg mx-auto">
          <Card className="text-xs text-fg-muted">💡 {t('srs_how')}</Card>
        </div>
      )}
    </div>
  );
}
