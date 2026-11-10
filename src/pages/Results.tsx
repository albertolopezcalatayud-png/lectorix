import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { shouldUnlockNextLevel } from '@/services/gamification';
import {MODULE_TEXT, getModule, levelNameKey } from '@/data/modules';
import { Card } from '@/components/ui/Card';
import { Stars } from '@/components/ui/Stars';
import { Button } from '@/components/ui/Button';
import { Confetti } from '@/components/ui/Confetti';
import sounds from '@/services/sounds';
import { useI18n } from '@/i18n';
import { useReading } from '@/data/readings';

export default function Results() {
  const location = useLocation();
  const navigate = useNavigate();
  const result = location.state?.result;
  const examMode = location.state?.examMode || false;
  const soundPlayed = useRef(false);
  const { t } = useI18n();
  const readingFound = useReading(result?.mode === 'reading' ? result.reading_id : undefined);

  useEffect(() => {
    if (!result || soundPlayed.current) return;
    soundPlayed.current = true;

    const unlocked = shouldUnlockNextLevel(result.correct_answers, result.total_questions);

    const t1 = setTimeout(() => sounds.complete(), 300);
    const t2 = setTimeout(() => {
      for (let i = 0; i < result.stars; i++) {
        setTimeout(() => sounds.star(), i * 250);
      }
    }, 700);
    const t3 = setTimeout(() => sounds.xp(), 700 + result.stars * 250 + 200);
    const t4 = unlocked && result.level < 5
      ? setTimeout(() => sounds.levelUp(), 1200 + result.stars * 250)
      : null;

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      if (t4) clearTimeout(t4);
    };
  }, [result]);

  if (!result) {
    navigate('/');
    return null;
  }

  const mod = getModule(result.module);
  const unlocked = shouldUnlockNextLevel(result.correct_answers, result.total_questions);
  const minutes = Math.floor(result.time_ms / 60000);
  const seconds = Math.floor((result.time_ms % 60000) / 1000);

  // Find failed exercise IDs for review
  const failedIds = result.answers
    .filter((a: { is_correct: boolean }) => !a.is_correct)
    .map((a: { exercise_id: string }) => a.exercise_id);
  const hasErrors = failedIds.length > 0;
  const isReview = result.mode === 'review';
  const isExam = examMode || result.mode === 'exam';
  const isDictation = result.mode === 'dictation';
  const isReading = result.mode === 'reading';
  const isDaily = result.mode === 'daily';
  // Dictation, reading and the daily challenge don't belong to a module level
  const isStandalone = isDictation || isReading || isDaily;
  const reading = readingFound ?? undefined;

  // Exam grade
  const examPassed = result.score_percent >= 50;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
      <Confetti active={result.stars >= 3 || unlocked} />

      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
        className="text-6xl mb-4"
      >
        {isExam
          ? (examPassed ? '✅' : '❌')
          : isReview
            ? (hasErrors ? '🔄' : '🎉')
            : (result.stars >= 3 ? '🎉' : result.stars >= 1 ? '👏' : '💪')
        }
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="font-heading font-black text-2xl text-center mb-1"
      >
        {isExam ? t('exam_results') : isReview ? t('rev_complete') : t('res_title')}
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-fg-muted text-sm mb-6"
      >
        {isDictation
          ? `${t('dict_title')} · ${t('dash_level', { level: result.level })}`
          : isReading
            ? `${reading?.emoji ?? '📖'} ${reading?.title ?? t('read_title')}`
            : isDaily
              ? t('daily_title')
              : `${(mod ? t(MODULE_TEXT[mod.id].name) : '')} · ${t('dash_level', { level: result.level })} · ${t(levelNameKey(result.level))}`}
      </motion.p>

      {/* Exam grade badge */}
      {isExam && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.45, type: 'spring' }}
          className={`px-4 py-1.5 rounded-full font-heading font-extrabold text-sm mb-4 ${
            examPassed ? 'bg-mint-pale text-mint' : 'bg-red-pale text-red'
          }`}
        >
          {examPassed ? t('exam_passed') : t('exam_failed')}
        </motion.div>
      )}

      {/* Stars (not shown in exam mode) */}
      {!isExam && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mb-6"
        >
          <Stars count={result.stars} size={40} animated />
        </motion.div>
      )}

      {/* Stats grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="w-full max-w-sm"
      >
        <Card>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-heading font-black text-accent">{result.score_percent}%</div>
              <div className="text-xs text-fg-muted">{isExam ? t('exam_grade') : t('res_score')}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-heading font-black text-mint">+{result.xp_earned}</div>
              <div className="text-xs text-fg-muted">{t('res_xp')}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-heading font-black">{result.correct_answers}/{result.total_questions}</div>
              <div className="text-xs text-fg-muted">{t('res_correct')}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-heading font-black">{minutes}:{seconds.toString().padStart(2, '0')}</div>
              <div className="text-xs text-fg-muted">{t('res_time')}</div>
            </div>
          </div>
          {/* Avg time per exercise */}
          {result.avg_time_per_exercise && (
            <div className="text-center mt-3 pt-3 border-t border-border">
              <span className="text-xs text-fg-muted">
                {t('parent_time_per_ex')}: {Math.round(result.avg_time_per_exercise / 1000)}s
              </span>
            </div>
          )}
        </Card>
      </motion.div>

      {/* Level unlocked notification */}
      {unlocked && result.level < 5 && !isExam && !isReview && !isStandalone && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.9, type: 'spring' }}
          className="w-full max-w-sm mt-4"
        >
          <Card className="border-mint/30 bg-mint-pale/30 text-center">
            <span className="text-2xl">🔓</span>
            <p className="font-heading font-extrabold mt-1">{t('res_unlocked', { level: result.level + 1 })}</p>
            <p className="text-xs text-fg-muted">{t(levelNameKey(result.level + 1))}</p>
          </Card>
        </motion.div>
      )}

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="w-full max-w-sm mt-6 space-y-2.5"
      >
        {/* Review mistakes button */}
        {hasErrors && !isReview && !isReading && !isDaily && (
          <Button
            fullWidth
            variant="secondary"
            onClick={() =>
              isDictation
                ? navigate('/dictado', { replace: true, state: { level: result.level, reviewIds: failedIds } })
                : navigate(`/ejercicio/${result.module}/${result.level}`, {
                    replace: true,
                    state: { reviewExerciseIds: failedIds },
                  })
            }
          >
            {t('rev_btn', { n: failedIds.length })}
          </Button>
        )}

        {unlocked && result.level < 5 && !isExam && !isReview && !isStandalone && (
          <Button
            fullWidth
            onClick={() => navigate(`/ejercicio/${result.module}/${result.level + 1}`, { replace: true })}
          >
            {t('res_next')} →
          </Button>
        )}
        <Button
          variant="secondary"
          fullWidth
          onClick={() =>
            isDictation
              ? navigate('/dictado', { replace: true, state: { level: result.level } })
              : isReading
                ? navigate(`/lectura/${result.reading_id}`, { replace: true })
                : isDaily
                  ? navigate('/reto-diario', { replace: true })
                  : navigate(`/ejercicio/${result.module}/${result.level}`, { replace: true })
          }
        >
          {t('res_retry')}
        </Button>
        {(isDictation || isReading) && (
          <Button
            variant="secondary"
            fullWidth
            onClick={() => navigate(isDictation ? '/dictado' : '/lectura', { replace: true })}
          >
            {isDictation ? t('dict_other') : t('read_other')}
          </Button>
        )}
        <Button
          variant="ghost"
          fullWidth
          onClick={() => navigate('/', { replace: true })}
        >
          {t('res_home')}
        </Button>
      </motion.div>
    </div>
  );
}
