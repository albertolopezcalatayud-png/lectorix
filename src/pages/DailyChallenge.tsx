import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Exercise, AnswerResult, ModuleId } from '@/types';
import { recordSession } from '@/services/session';
import { buildSessionResult } from '@/services/gamification';
import { MODULES } from '@/data/modules';
import { ExerciseCard } from '@/components/exercise/ExerciseCard';
import { useI18n } from '@/i18n';

const DAILY_COUNT = 5;

export default function DailyChallenge() {
  const navigate = useNavigate();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerResult[]>([]);
  const [startTime] = useState(Date.now());
  const [loading, setLoading] = useState(true);

  const { t } = useI18n();

  useEffect(() => {
    async function loadDailyExercises() {
      try {
        // Pick 1 random exercise from each module (5 total)
        const allExercises: Exercise[] = [];

        for (const mod of MODULES) {
          try {
            const data = await import(`@/data/exercises/${mod.id}.json`);
            // The daily challenge renders multiple-choice cards only
            const modExercises = (data.default?.exercises || data.exercises || [])
              .filter((e: Exercise) => e.type === 'multiple_choice');
            if (modExercises.length > 0) {
              const randomIndex = Math.floor(Math.random() * modExercises.length);
              allExercises.push(modExercises[randomIndex]);
            }
          } catch {
            // Module exercises not found, skip
          }
        }

        // Shuffle
        const shuffled = allExercises.sort(() => Math.random() - 0.5).slice(0, DAILY_COUNT);
        setExercises(shuffled);
      } catch (err) {
        console.error('Error loading daily challenge:', err);
      } finally {
        setLoading(false);
      }
    }

    loadDailyExercises();
  }, []);

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
        const result = buildSessionResult({
          module: 'retos_rapidos' as ModuleId,
          level: 1,
          answers: newAnswers,
          startTime,
        });

        result.mode = 'daily';
        recordSession(result);

        navigate('/resultados', { state: { result }, replace: true });
      }
    },
    [exercises, currentIndex, answers, startTime, navigate]
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

  if (exercises.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <span className="text-4xl mb-4">😕</span>
        <h2 className="font-heading font-extrabold text-lg mb-2">{t('daily_no_exercises')}</h2>
        <p className="text-sm text-fg-muted mb-4">{t('daily_no_exercises_desc')}</p>
        <button onClick={() => navigate('/')} className="text-accent font-bold">{t('daily_back')}</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Top bar */}
      <div className="flex items-center gap-3 px-4 py-3 bg-bg-card border-b border-border">
        <button
          onClick={() => navigate('/')}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-accent-pale text-accent"
        >
          ✕
        </button>
        <div className="flex-1">
          <h3 className="font-heading font-extrabold text-sm">{t('daily_title')}</h3>
          <p className="text-[10px] text-fg-muted">{t('daily_subtitle')}</p>
        </div>
        <span className="text-xs font-bold text-fg-muted">
          {currentIndex + 1} / {exercises.length}
        </span>
      </div>

      <div className="px-4 py-6 max-w-lg mx-auto">
        <ExerciseCard
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
