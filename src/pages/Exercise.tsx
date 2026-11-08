import { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { ModuleId, AnswerResult } from '@/types';
import { useExercises } from '@/hooks/useExercises';
import { useAppStore } from '@/stores/useAppStore';
import { buildSessionResult } from '@/services/gamification';
import { getModule } from '@/data/modules';
import { ExerciseCard } from '@/components/exercise/ExerciseCard';
import { DragDropExercise } from '@/components/exercise/DragDropExercise';

export default function Exercise() {
  const { moduleId, levelStr } = useParams<{ moduleId: string; levelStr: string }>();
  const navigate = useNavigate();
  const module = moduleId as ModuleId;
  const level = parseInt(levelStr || '1', 10);
  const mod = getModule(moduleId || '');

  const { exercises, loading, error } = useExercises(module, level);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerResult[]>([]);
  const [startTime] = useState(Date.now());

  const updateProgress = useAppStore((s) => s.updateProgress);
  const addXP = useAppStore((s) => s.addXP);
  const updateStreak = useAppStore((s) => s.updateStreak);
  const addSession = useAppStore((s) => s.addSession);

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
        // Session complete
        const result = buildSessionResult({
          module,
          level,
          answers: newAnswers,
          startTime,
        });

        // Update store
        updateProgress({
          module,
          level,
          stars: result.stars,
          best_score: result.score_percent,
          attempts: 1,
          unlocked: true,
        });
        addXP(result.xp_earned);
        updateStreak();
        addSession(result);

        // Navigate to results
        navigate('/resultados', { state: { result }, replace: true });
      }
    },
    [exercises, currentIndex, answers, module, level, startTime, updateProgress, addXP, updateStreak, navigate]
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
        <h2 className="font-heading font-extrabold text-lg mb-2">No hay ejercicios</h2>
        <p className="text-sm text-fg-muted mb-4">{error || 'No se encontraron ejercicios para este nivel.'}</p>
        <button onClick={() => navigate(-1)} className="text-accent font-bold">← Volver</button>
      </div>
    );
  }

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
          <h3 className="font-heading font-extrabold text-sm">{mod?.name || module}</h3>
          <p className="text-[10px] text-fg-muted">Nivel {level}</p>
        </div>
        <span className="text-xs font-bold text-fg-muted">
          {currentIndex + 1} / {exercises.length}
        </span>
      </div>

      {/* Exercise */}
      <div className="px-4 py-6 max-w-lg mx-auto">
        {exercises[currentIndex].type === 'drag_order' || exercises[currentIndex].type === 'drag_fill' ? (
          <DragDropExercise
            exercise={exercises[currentIndex]}
            questionNumber={currentIndex + 1}
            totalQuestions={exercises.length}
            onAnswer={handleAnswer}
          />
        ) : (
          <ExerciseCard
            exercise={exercises[currentIndex]}
            questionNumber={currentIndex + 1}
            totalQuestions={exercises.length}
            onAnswer={handleAnswer}
          />
        )}
      </div>
    </div>
  );
}
