import { useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { AnswerResult, ModuleId } from '@/types';
import { useReading, questionsAsExercises } from '@/data/readings';
import { buildSessionResult } from '@/services/gamification';
import { recordSession } from '@/services/session';
import { GuidedReader } from '@/components/reading/GuidedReader';
import { ExerciseCard } from '@/components/exercise/ExerciseCard';
import tts from '@/services/tts';
import { useI18n } from '@/i18n';

export default function Reading() {
  const { readingId } = useParams<{ readingId: string }>();
  const navigate = useNavigate();
  const { t } = useI18n();
  const reading = useReading(readingId);
  const questions = useMemo(() => (reading ? questionsAsExercises(reading) : []), [reading]);

  const [phase, setPhase] = useState<'reading' | 'questions'>('reading');
  const [listened, setListened] = useState(false);
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerResult[]>([]);
  const [startTime] = useState(Date.now());

  const onFinishedListening = useCallback(() => setListened(true), []);

  const handleAnswer = useCallback(
    (selected: number, isCorrect: boolean, timeMs: number) => {
      if (!reading) return;
      const q = questions[qIndex];
      const next = [...answers, { exercise_id: q.id, selected, correct: q.correct, is_correct: isCorrect, time_ms: timeMs }];
      setAnswers(next);
      if (qIndex + 1 < questions.length) {
        setQIndex(qIndex + 1);
        return;
      }
      const result = buildSessionResult({
        module: 'comprension_lectora' as ModuleId,
        level: reading.level,
        answers: next,
        startTime,
      });
      result.mode = 'reading';
      result.reading_id = reading.id;
      recordSession(result);
      navigate('/resultados', { state: { result }, replace: true });
    },
    [reading, questions, qIndex, answers, startTime, navigate],
  );

  if (reading === null) {
    return <div className="min-h-screen flex items-center justify-center"><span className="text-3xl animate-pulse">📖</span></div>;
  }

  if (!reading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <span className="text-4xl mb-4">😕</span>
        <button onClick={() => navigate('/lectura')} className="text-accent font-bold">← {t('back')}</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-10">
      {/* Top bar */}
      <div className="flex items-center gap-3 px-4 py-3 bg-bg-card border-b border-border">
        <button
          onClick={() => { tts.stop(); navigate('/lectura'); }}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-accent-pale text-accent"
          aria-label={t('back')}
        >
          ✕
        </button>
        <div className="flex-1 min-w-0">
          <h3 className="font-heading font-extrabold text-sm truncate">{reading.emoji} {reading.title}</h3>
          <p className="text-[10px] text-fg-muted">
            {phase === 'reading' ? t('read_title') : t('read_questions')} · {t('dash_level', { level: reading.level })}
          </p>
        </div>
        {phase === 'questions' && (
          <span className="text-xs font-bold text-fg-muted">
            {t('ex_question', { n: qIndex + 1, total: questions.length })}
          </span>
        )}
      </div>

      <div className="px-4 max-w-lg mx-auto">
        {phase === 'reading' ? (
          <>
            <h1 className="font-heading font-black text-2xl text-center mt-5 mb-1">
              {reading.emoji} {reading.title}
            </h1>
            <GuidedReader text={reading.text} onFinishedListening={onFinishedListening} />
            <motion.button
              whileTap={{ scale: 0.97 }}
              animate={listened ? { scale: [1, 1.04, 1] } : {}}
              transition={listened ? { repeat: 2, duration: 0.6 } : {}}
              onClick={() => { tts.stop(); setPhase('questions'); window.scrollTo({ top: 0 }); }}
              className="w-full mt-8 py-3.5 rounded-[14px] bg-mint text-white font-heading font-extrabold"
            >
              ✅ {t('read_done')} →
            </motion.button>
          </>
        ) : (
          <div className="py-6 space-y-4">
            {/* The text stays available while answering */}
            <details className="rounded-[14px] border border-border bg-bg-card px-4 py-2.5">
              <summary className="cursor-pointer text-sm font-bold text-accent">📖 {reading.title}</summary>
              <div className="mt-2 text-base leading-loose whitespace-pre-line">{reading.text}</div>
            </details>
            <ExerciseCard
              key={questions[qIndex].id}
              exercise={questions[qIndex]}
              questionNumber={qIndex + 1}
              totalQuestions={questions.length}
              onAnswer={handleAnswer}
            />
          </div>
        )}
      </div>
    </div>
  );
}
