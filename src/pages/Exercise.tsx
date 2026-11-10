import { useState, useCallback, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { ModuleId, AnswerResult } from '@/types';
import { useExercises } from '@/hooks/useExercises';
import { useAppStore } from '@/stores/useAppStore';
import { buildSessionResult } from '@/services/gamification';
import {MODULE_TEXT, getModule } from '@/data/modules';
import { ExerciseCard } from '@/components/exercise/ExerciseCard';
import { DragDropExercise } from '@/components/exercise/DragDropExercise';
import { WriteExercise } from '@/components/exercise/WriteExercise';
import { useI18n } from '@/i18n';
import { recordSession } from '@/services/session';

export default function Exercise() {
  const { moduleId, levelStr } = useParams<{ moduleId: string; levelStr: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const module = moduleId as ModuleId;
  const level = parseInt(levelStr || '1', 10);
  const mod = getModule(moduleId || '');

  // Check for review mode (specific exercise IDs passed via state)
  const reviewExerciseIds: string[] | undefined = location.state?.reviewExerciseIds;
  const examMode: boolean = location.state?.examMode || false;
  const examTimeLimit: number = location.state?.examTimeLimit || 0; // ms, 0 = no limit
  const sessionMode = reviewExerciseIds ? 'review' : examMode ? 'exam' : 'normal';

  const { exercises: allExercises, loading, error } = useExercises(module, level, reviewExerciseIds ? 1000 : 10);

  // Filter exercises for review mode
  const exercises = reviewExerciseIds
    ? allExercises.filter(ex => reviewExerciseIds.includes(ex.id))
    : allExercises;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerResult[]>([]);
  const [startTime] = useState(Date.now());

  // Exam timer
  const [examTimeLeft, setExamTimeLeft] = useState(examTimeLimit);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const updateProgress = useAppStore((s) => s.updateProgress);
  const { t } = useI18n();

  // Exam timer effect
  useEffect(() => {
    if (examMode && examTimeLimit > 0 && exercises.length > 0) {
      setExamTimeLeft(examTimeLimit);
      timerRef.current = setInterval(() => {
        setExamTimeLeft(prev => {
          if (prev <= 1000) {
            // Time's up — force finish
            if (timerRef.current) clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1000;
        });
      }, 1000);

      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
  }, [examMode, examTimeLimit, exercises.length]);

  // Handle time-up
  useEffect(() => {
    if (examMode && examTimeLimit > 0 && examTimeLeft === 0 && exercises.length > 0) {
      finishSession(answers);
    }
  }, [examTimeLeft]);

  const finishSession = useCallback((finalAnswers: AnswerResult[]) => {
    if (timerRef.current) clearInterval(timerRef.current);

    const result = buildSessionResult({
      module,
      level,
      answers: finalAnswers,
      startTime,
    });

    // Add mode and avg time
    result.mode = sessionMode;
    result.avg_time_per_exercise = finalAnswers.length > 0
      ? Math.round(finalAnswers.reduce((s, a) => s + a.time_ms, 0) / finalAnswers.length)
      : 0;

    // Only update progress in normal mode
    if (sessionMode === 'normal') {
      updateProgress({
        module,
        level,
        stars: result.stars,
        best_score: result.score_percent,
        attempts: 1,
        unlocked: true,
      });
    }
    recordSession(result);

    navigate('/resultados', { state: { result, examMode }, replace: true });
  }, [module, level, startTime, sessionMode, examMode, updateProgress, navigate]);

  const handleAnswer = useCallback(
    (selectedIndex: number, isCorrect: boolean, timeMs: number) => {
      const exercise = exercises[currentIndex];
      const answer: AnswerResult = {
        exercise_id: exercise.id,
        selected: selectedIndex,
        correct: exercise.correct,
        is_correct: isCorrect,
        time_ms: timeMs,
      };

      const newAnswers = [...answers, answer];
      setAnswers(newAnswers);

      if (currentIndex + 1 < exercises.length) {
        setCurrentIndex(currentIndex + 1);
      } else {
        finishSession(newAnswers);
      }
    },
    [exercises, currentIndex, answers, finishSession]
  );

  if (loading) {
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

  if (error || exercises.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <span className="text-4xl mb-4">😕</span>
        <h2 className="font-heading font-extrabold text-lg mb-2">{t('ex_no_exercises')}</h2>
        <p className="text-sm text-fg-muted mb-4">{error || t('ex_no_exercises_desc')}</p>
        <button onClick={() => navigate(-1)} className="text-accent font-bold">← {t('back')}</button>
      </div>
    );
  }

  const formatTime = (ms: number) => {
    const mins = Math.floor(ms / 60000);
    const secs = Math.floor((ms % 60000) / 1000);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentExercise = exercises[currentIndex];

  return (
    <div className="min-h-screen">
      {/* Top bar */}
      <div className="flex items-center gap-3 px-4 py-3 bg-bg-card border-b border-border">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-accent-pale text-accent"
        >
          ✕
        </button>
        <div className="flex-1">
          <h3 className="font-heading font-extrabold text-sm">
            {sessionMode === 'review' ? t('rev_title') : sessionMode === 'exam' ? t('exam_title') : ((mod ? t(MODULE_TEXT[mod.id].name) : '') || module)}
          </h3>
          <p className="text-[10px] text-fg-muted">{t('dash_level', { level })}</p>
        </div>
        {/* Exam timer */}
        {examMode && examTimeLimit > 0 && (
          <div className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
            examTimeLeft < 60000 ? 'bg-red-pale text-red animate-pulse' : 'bg-accent-pale text-accent'
          }`}>
            ⏱ {formatTime(examTimeLeft)}
          </div>
        )}
        <span className="text-xs font-bold text-fg-muted">
          {t('ex_question', { n: currentIndex + 1, total: exercises.length })}
        </span>
      </div>

      {/* Exercise */}
      <div className="px-4 py-6 max-w-lg mx-auto">
        {currentExercise.type === 'write' ? (
          <WriteExercise
            key={currentExercise.id}
            exercise={currentExercise}
            questionNumber={currentIndex + 1}
            totalQuestions={exercises.length}
            onAnswer={handleAnswer}
            examMode={examMode}
          />
        ) : currentExercise.type === 'drag_order' || currentExercise.type === 'drag_fill' ? (
          <DragDropExercise
            key={currentExercise.id}
            exercise={currentExercise}
            questionNumber={currentIndex + 1}
            totalQuestions={exercises.length}
            onAnswer={handleAnswer}
          />
        ) : (
          <ExerciseCard
            key={currentExercise.id}
            exercise={currentExercise}
            questionNumber={currentIndex + 1}
            totalQuestions={exercises.length}
            onAnswer={handleAnswer}
            examMode={examMode}
            autoPlayAudio={module === 'fonologia'}
          />
        )}
      </div>
    </div>
  );
}
