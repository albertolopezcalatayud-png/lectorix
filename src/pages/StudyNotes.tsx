import { useState, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { AnswerResult } from '@/types';
import { buildStudy } from '@/services/studyGen';
import { useReviewStore } from '@/services/review';
import tts from '@/services/tts';
import { ExerciseCard } from '@/components/exercise/ExerciseCard';
import { DragDropExercise } from '@/components/exercise/DragDropExercise';
import { WriteExercise } from '@/components/exercise/WriteExercise';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useI18n } from '@/i18n';

/** "Study your notes": vocabulary + about ten questions made from a text the student brought */
export default function StudyNotes() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useI18n();
  const text: string = location.state?.text ?? '';
  const lang: string = location.state?.lang ?? 'es';
  const title: string = location.state?.title ?? '';
  const [round, setRound] = useState(0);
  const [phase, setPhase] = useState<'words' | 'quiz' | 'done'>('words');
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerResult[]>([]);
  const [saved, setSaved] = useState(false);

  const study = useMemo(() => buildStudy(text, lang, {
    cloze: t('st_cloze'), order: t('st_order'), dictation: t('st_dictation'), letters: (n) => t('st_letters', { n }),
  }), [text, lang, round, t]);

  const say = (w: string) => { void tts.speakIn(w, lang === 'ca' ? 'ca-ES' : lang === 'en' ? 'en-GB' : 'es-ES', 0.85); };

  const onAnswer = useCallback((selected: number, ok: boolean, timeMs: number) => {
    const ex = study.exercises[index];
    const next = [...answers, { exercise_id: ex.id, selected, correct: ex.correct, is_correct: ok, time_ms: timeMs }];
    setAnswers(next);
    if (index + 1 < study.exercises.length) setIndex(index + 1);
    else setPhase('done');
  }, [study, index, answers]);

  if (!text || study.exercises.length < 3) {
    return (
      <div className="min-h-screen pb-24">
        <Header title={t('st_title')} showBack />
        <div className="px-4 py-10 max-w-lg mx-auto text-center space-y-4">
          <div className="text-5xl">📄</div>
          <p className="text-sm text-fg-muted">{t('st_too_short')}</p>
          <Button fullWidth onClick={() => navigate(-1)}>{t('back')}</Button>
        </div>
      </div>
    );
  }

  if (phase === 'words') {
    return (
      <div className="min-h-screen pb-24">
        <Header title={t('st_title')} showBack />
        <div className="px-4 py-5 max-w-lg mx-auto space-y-4">
          <div className="text-center">
            <span className="text-5xl block mb-2">🎓</span>
            {title && <p className="text-xs font-bold text-fg-muted">{title}</p>}
            <h2 className="font-heading font-black text-lg">{t('st_words_title')}</h2>
            <p className="text-sm text-fg-muted">{t('st_words_desc')}</p>
          </div>
          <div className="flex flex-wrap gap-2 justify-center">
            {study.words.map((w) => (
              <button key={w} onClick={() => say(w)} className="px-3 py-2 rounded-xl bg-bg-card border border-border font-bold text-sm">
                🔊 {w}
              </button>
            ))}
          </div>
          <Button fullWidth onClick={() => setPhase('quiz')}>{t('st_start', { n: study.exercises.length })}</Button>
        </div>
      </div>
    );
  }

  if (phase === 'done') {
    const right = answers.filter((a) => a.is_correct).length;
    const missed = [...new Set(study.exercises.filter((e, i) => answers[i] && !answers[i].is_correct && study.targets[e.id]).map((e) => study.targets[e.id]))];
    return (
      <div className="min-h-screen pb-24">
        <Header title={t('st_title')} />
        <div className="px-4 py-6 max-w-lg mx-auto space-y-4 text-center">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-6xl">{right / answers.length >= 0.8 ? '🏆' : right / answers.length >= 0.5 ? '👍' : '💪'}</motion.div>
          <h2 className="font-heading font-black text-xl">{t('st_done', { right, total: answers.length })}</h2>
          {missed.length > 0 && (
            <Card className="text-left">
              <p className="text-sm font-bold mb-2">{t('st_missed')}</p>
              <div className="flex flex-wrap gap-2 mb-3">
                {missed.map((w) => <button key={w} onClick={() => say(w)} className="px-3 py-1.5 rounded-xl bg-peach-pale text-sm font-bold">🔊 {w}</button>)}
              </div>
              <button disabled={saved} onClick={() => { missed.forEach((w) => useReviewStore.getState().addWord(w, lang as never)); setSaved(true); }}
                className="w-full py-2.5 rounded-xl bg-accent text-white font-bold text-sm disabled:opacity-60">
                {saved ? t('st_saved') : `📒 ${t('st_save_words')}`}
              </button>
            </Card>
          )}
          <Button fullWidth onClick={() => { setRound(round + 1); setIndex(0); setAnswers([]); setSaved(false); setPhase('quiz'); }}>{t('st_again')}</Button>
          <Button variant="secondary" fullWidth onClick={() => navigate(-1)}>{t('st_back_text')}</Button>
        </div>
      </div>
    );
  }

  const ex = study.exercises[index];
  return (
    <div className="min-h-screen">
      <div className="flex items-center gap-3 px-4 py-3 bg-bg-card border-b border-border">
        <button onClick={() => navigate(-1)} aria-label={t('back')} className="w-9 h-9 flex items-center justify-center rounded-xl bg-accent-pale text-accent">✕</button>
        <div className="flex-1">
          <h3 className="font-heading font-extrabold text-sm">🎓 {t('st_title')}</h3>
          {title && <p className="text-[10px] text-fg-muted truncate">{title}</p>}
        </div>
      </div>
      <div className="px-4 py-6 max-w-lg mx-auto">
        {ex.type === 'write' ? (
          <WriteExercise key={ex.id} exercise={ex} questionNumber={index + 1} totalQuestions={study.exercises.length} onAnswer={onAnswer} />
        ) : ex.type === 'drag_order' ? (
          <DragDropExercise key={ex.id} exercise={ex} questionNumber={index + 1} totalQuestions={study.exercises.length} onAnswer={onAnswer} />
        ) : (
          <ExerciseCard key={ex.id} exercise={ex} questionNumber={index + 1} totalQuestions={study.exercises.length} onAnswer={onAnswer} />
        )}
      </div>
    </div>
  );
}
