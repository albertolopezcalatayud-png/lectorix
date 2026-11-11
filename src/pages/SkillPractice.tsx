import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Exercise, AnswerResult, ModuleId } from '@/types';
import { useAppStore, usePracticeLang, resolvePracticeLang } from '@/stores/useAppStore';
import { useReviewStore, recommendedLevel } from '@/services/review';
import { buildSessionResult } from '@/services/gamification';
import { recordSession } from '@/services/session';
import { loadIndex, pickSkillSession } from '@/services/skills';
import { SKILL_BY_ID, skillNameKey, skillTipKey } from '@/data/skills';
import { LEVEL_COUNT } from '@/data/modules';
import { ExerciseCard } from '@/components/exercise/ExerciseCard';
import { DragDropExercise } from '@/components/exercise/DragDropExercise';
import { WriteExercise } from '@/components/exercise/WriteExercise';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useI18n } from '@/i18n';

/** A short session that trains one specific skill (from the skill map or the dashboard) */
export default function SkillPractice() {
  const { skill = '' } = useParams<{ skill: string }>();
  const navigate = useNavigate();
  const lang = usePracticeLang();
  const { t } = useI18n();
  const info = SKILL_BY_ID[skill];

  const [exercises, setExercises] = useState<Exercise[] | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerResult[]>([]);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    if (!info) { setExercises([]); return; }
    let off = false;
    loadIndex(lang).then((index) => {
      const st = useAppStore.getState();
      const max = LEVEL_COUNT[resolvePracticeLang(st)];
      const levelOf = (m: ModuleId) => recommendedLevel(st.progress, m, max, st.isLevelUnlocked, st.startLevel(m));
      if (!off) setExercises(pickSkillSession(index, skill, st.sessionHistory, levelOf));
    });
    return () => { off = true; };
  }, [lang, skill, info]);

  const handleAnswer = useCallback((selected: number, isCorrect: boolean, timeMs: number) => {
    if (!exercises) return;
    const ex = exercises[currentIndex];
    const next = [...answers, { exercise_id: ex.id, selected, correct: ex.correct, is_correct: isCorrect, time_ms: timeMs }];
    setAnswers(next);
    if (currentIndex + 1 < exercises.length) { setCurrentIndex(currentIndex + 1); return; }
    const srs = useReviewStore.getState().track(exercises, next, lang);
    const result = buildSessionResult({ module: ex.module, level: ex.level, answers: next, startTime });
    result.mode = 'skill';
    result.skill_id = skill;
    recordSession(result);
    navigate('/resultados', { state: { result, srs }, replace: true });
  }, [exercises, currentIndex, answers, startTime, navigate, lang, skill]);

  if (!exercises) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          className="w-10 h-10 border-3 border-accent border-t-transparent rounded-full" />
      </div>
    );
  }
  if (exercises.length === 0 || !info) {
    return (
      <div className="min-h-screen pb-24">
        <Header title={t('skill_train_title')} showBack />
        <div className="px-4 py-10 max-w-lg mx-auto text-center space-y-4">
          <div className="text-5xl">🤔</div>
          <p className="text-sm text-fg-muted">{t('skill_train_none')}</p>
          <Button fullWidth onClick={() => navigate('/', { replace: true })}>{t('res_home')}</Button>
        </div>
      </div>
    );
  }

  const ex = exercises[currentIndex];
  return (
    <div className="min-h-screen">
      <div className="flex items-center gap-3 px-4 py-3 bg-bg-card border-b border-border">
        <button onClick={() => navigate(-1)} aria-label={t('back')}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-accent-pale text-accent">✕</button>
        <div className="flex-1">
          <h3 className="font-heading font-extrabold text-sm">{info.emoji} {t(skillNameKey(skill))}</h3>
          <p className="text-[10px] text-fg-muted">{t('skill_train_title')}</p>
        </div>
        <span className="text-xs font-bold text-fg-muted">{t('ex_question', { n: currentIndex + 1, total: exercises.length })}</span>
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
          <Card className="text-xs text-fg-muted">🏡 {t(skillTipKey(skill))}</Card>
        </div>
      )}
    </div>
  );
}
