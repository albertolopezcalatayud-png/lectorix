import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { shouldUnlockNextLevel } from '@/services/gamification';
import { getModule, LEVEL_NAMES } from '@/data/modules';
import { Card } from '@/components/ui/Card';
import { Stars } from '@/components/ui/Stars';
import { Button } from '@/components/ui/Button';
import { Confetti } from '@/components/ui/Confetti';
import sounds from '@/services/sounds';
import { useI18n } from '@/i18n';

export default function Results() {
  const location = useLocation();
  const navigate = useNavigate();
  const result = location.state?.result;
  const soundPlayed = useRef(false);
  const { t } = useI18n();

  useEffect(() => {
    if (!result || soundPlayed.current) return;
    soundPlayed.current = true;

    const unlocked = shouldUnlockNextLevel(result.correct_answers, result.total_questions);

    // Play result sounds with staggered timing
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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
      {/* Confetti for 3 stars or level unlock */}
      <Confetti active={result.stars >= 3 || unlocked} />

      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
        className="text-6xl mb-4"
      >
        {result.stars >= 3 ? '🎉' : result.stars >= 1 ? '👏' : '💪'}
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="font-heading font-black text-2xl text-center mb-1"
      >
        {t('res_title')}
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-fg-muted text-sm mb-6"
      >
        {mod?.name} · {t('dash_level', { level: result.level })} · {LEVEL_NAMES[result.level]}
      </motion.p>

      {/* Stars */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mb-6"
      >
        <Stars count={result.stars} size={40} animated />
      </motion.div>

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
              <div className="text-xs text-fg-muted">{t('res_score')}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-heading font-black text-mint">+{result.xp_earned}</div>
              <div className="text-xs text-fg-muted">{t('res_xp')}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-heading font-black">{result.correct_answers}/{result.total_questions}</div>
              <div className="text-xs text-fg-muted">{t('res_stars')}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-heading font-black">{minutes}:{seconds.toString().padStart(2, '0')}</div>
              <div className="text-xs text-fg-muted">{t('res_time')}</div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Level unlocked notification */}
      {unlocked && result.level < 5 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.9, type: 'spring' }}
          className="w-full max-w-sm mt-4"
        >
          <Card className="border-mint/30 bg-mint-pale/30 text-center">
            <span className="text-2xl">🔓</span>
            <p className="font-heading font-extrabold mt-1">{t('res_unlocked', { level: result.level + 1 })}</p>
            <p className="text-xs text-fg-muted">{LEVEL_NAMES[result.level + 1]}</p>
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
        {unlocked && result.level < 5 && (
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
          onClick={() => navigate(`/ejercicio/${result.module}/${result.level}`, { replace: true })}
        >
          {t('res_retry')}
        </Button>
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
