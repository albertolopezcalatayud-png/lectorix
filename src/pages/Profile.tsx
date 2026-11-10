import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppStore } from '@/stores/useAppStore';
import { calculateXPLevel } from '@/services/gamification';
import {MODULES, MODULE_TEXT } from '@/data/modules';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Badge } from '@/components/ui/Badge';
import { MascotAvatar } from '@/components/mascot/MascotAvatar';
import { useI18n } from '@/i18n';

export default function Profile() {
  const navigate = useNavigate();
  const user = useAppStore((s) => s.user);
  const progress = useAppStore((s) => s.progress);
  const mascot = useAppStore((s) => s.mascot);
  const { t } = useI18n();
  const totalXP = user?.total_xp || 0;
  const streak = user?.streak_days || 0;
  const { level, currentXP, nextLevelXP } = calculateXPLevel(totalXP);

  const totalStars = progress.reduce((sum, p) => sum + p.stars, 0);
  const completedLevels = progress.filter((p) => p.stars > 0).length;
  const totalAttempts = progress.reduce((sum, p) => sum + p.attempts, 0);

  return (
    <div className="min-h-screen pb-24">
      <Header title={t('prof_title')} />

      <div className="px-4 py-5 max-w-lg mx-auto space-y-4">
        {/* Avatar & Name */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center text-center"
        >
          <button onClick={() => navigate('/mascota')} className="mb-3 relative group">
            <MascotAvatar customization={mascot} size={100} />
            <span className="absolute bottom-0 right-0 bg-accent text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold opacity-0 group-hover:opacity-100 transition-opacity">
              {t('edit')}
            </span>
          </button>
          <h2 className="font-heading font-black text-xl">{user?.display_name || t('student_default')}</h2>
          <p className="text-sm text-fg-muted">{user?.email || ''}</p>
          <div className="flex gap-2 mt-2">
            <Badge color="accent">{t('dash_level', { level })}</Badge>
            <Badge color="yellow">🔥 {t('dash_streak', { days: streak })}</Badge>
          </div>
        </motion.div>

        {/* XP Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-bold">{t('prof_experience')}</span>
              <span className="text-xs text-fg-muted">{t('prof_xp_total', { xp: totalXP })}</span>
            </div>
            <ProgressBar
              value={(currentXP / nextLevelXP) * 100}
              color="var(--color-accent)"
              height={8}
            />
            <p className="text-[10px] text-fg-muted mt-1">
              {t('prof_xp_next', { current: currentXP, next: nextLevelXP, level: level + 1 })}
            </p>
          </Card>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card>
            <h3 className="font-heading font-extrabold text-sm mb-3">{t('prof_stats')}</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-heading font-black text-yellow">⭐ {totalStars}</div>
                <div className="text-[10px] text-fg-muted">{t('prof_stars')}</div>
              </div>
              <div>
                <div className="text-2xl font-heading font-black text-mint">{completedLevels}</div>
                <div className="text-[10px] text-fg-muted">{t('prof_levels')}</div>
              </div>
              <div>
                <div className="text-2xl font-heading font-black text-sky">{totalAttempts}</div>
                <div className="text-[10px] text-fg-muted">{t('prof_attempts')}</div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Module progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <h3 className="font-heading font-extrabold text-sm mb-3">{t('prof_by_module')}</h3>
            <div className="space-y-3">
              {MODULES.map((mod) => {
                const modProgress = progress.filter((p) => p.module === mod.id);
                const completed = modProgress.filter((p) => p.stars > 0).length;
                const pct = (completed / mod.levels) * 100;

                return (
                  <div key={mod.id} className="flex items-center gap-3">
                    <span className="text-xl">{mod.icon}</span>
                    <div className="flex-1">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-bold">{t(MODULE_TEXT[mod.id].name)}</span>
                        <span className="text-fg-muted">{completed}/{mod.levels}</span>
                      </div>
                      <ProgressBar value={pct} color={mod.color} height={5} />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </motion.div>

        {/* Actions */}
        <div className="space-y-2">
          <button
            onClick={() => navigate('/mascota')}
            className="w-full text-left px-4 py-3 rounded-xl bg-bg-card border border-border flex items-center gap-3"
          >
            <span>🦉</span>
            <span className="text-sm font-bold">{t('prof_mascot')}</span>
            <span className="ml-auto text-fg-muted">→</span>
          </button>
          <button
            onClick={() => navigate('/historial')}
            className="w-full text-left px-4 py-3 rounded-xl bg-bg-card border border-border flex items-center gap-3"
          >
            <span>📋</span>
            <span className="text-sm font-bold">{t('prof_history')}</span>
            <span className="ml-auto text-fg-muted">→</span>
          </button>
          <button
            onClick={() => navigate('/ajustes')}
            className="w-full text-left px-4 py-3 rounded-xl bg-bg-card border border-border flex items-center gap-3"
          >
            <span>⚙️</span>
            <span className="text-sm font-bold">{t('prof_settings')}</span>
            <span className="ml-auto text-fg-muted">→</span>
          </button>
          <button
            onClick={() => navigate('/panel-padres')}
            className="w-full text-left px-4 py-3 rounded-xl bg-bg-card border border-border flex items-center gap-3"
          >
            <span>👨‍👩‍👧</span>
            <span className="text-sm font-bold">{t('prof_parents')}</span>
            <span className="ml-auto text-fg-muted">→</span>
          </button>
        </div>
      </div>
    </div>
  );
}
