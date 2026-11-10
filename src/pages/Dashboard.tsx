import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppStore } from '@/stores/useAppStore';
import { calculateXPLevel } from '@/services/gamification';
import {MODULES, MODULE_TEXT } from '@/data/modules';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Header } from '@/components/layout/Header';
import { MascotAvatar } from '@/components/mascot/MascotAvatar';
import { useI18n } from '@/i18n';

export default function Dashboard() {
  const navigate = useNavigate();
  const user = useAppStore((s) => s.user);
  const progress = useAppStore((s) => s.progress);
  const mascot = useAppStore((s) => s.mascot);
  const { t } = useI18n();
  const xpInfo = user ? calculateXPLevel(user.total_xp) : { level: 1, currentXP: 0, nextLevelXP: 100, progress: 0 };

  return (
    <div className="min-h-screen pb-24">
      <Header />

      <div className="px-4 py-5 max-w-lg mx-auto space-y-5">
        {/* Welcome + Mascot */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4"
        >
          <button onClick={() => navigate('/mascota')} className="flex-shrink-0">
            <MascotAvatar customization={mascot} size={72} />
          </button>
          <div>
            <h2 className="font-heading font-black text-xl">
              {t('dash_hello', { name: user?.display_name || t('student_default') })}
            </h2>
            <p className="text-fg-muted text-sm mt-1">{t('dash_ready')}</p>
          </div>
        </motion.div>

        {/* XP Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <div className="flex items-center justify-between mb-2">
              <span className="font-heading font-extrabold text-sm">{t('dash_level', { level: xpInfo.level })}</span>
              <span className="text-xs text-fg-muted">{xpInfo.currentXP}/{xpInfo.nextLevelXP} XP</span>
            </div>
            <ProgressBar value={xpInfo.progress * 100} />
            <div className="flex gap-3 mt-3">
              <div className="flex items-center gap-1.5 text-sm">
                <span>🔥</span>
                <span className="font-bold">{t('dash_streak', { days: user?.streak_days || 0 })}</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm">
                <span>⭐</span>
                <span className="font-bold">{t('dash_xp', { xp: user?.total_xp || 0 })}</span>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Daily Challenge */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card hover onClick={() => navigate('/reto-diario')} className="border-yellow/30 bg-yellow-pale/30">
            <div className="flex items-center gap-3">
              <span className="text-3xl">⚡</span>
              <div className="flex-1">
                <h3 className="font-heading font-extrabold">{t('dash_daily')}</h3>
                <p className="text-xs text-fg-muted">{t('dash_daily_desc')}</p>
              </div>
              <span className="text-accent font-extrabold text-sm">{t('dash_play')}</span>
            </div>
          </Card>
        </motion.div>

        {/* Dictation & guided reading */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
          className="grid grid-cols-2 gap-2.5"
        >
          <Card hover onClick={() => navigate('/dictado')} className="border-sky/30">
            <span className="text-2xl">🎧</span>
            <h3 className="font-heading font-extrabold text-sm mt-1">{t('dict_title').replace('🎧 ', '')}</h3>
            <p className="text-[11px] text-fg-muted leading-snug mt-0.5">{t('dict_desc')}</p>
          </Card>
          <Card hover onClick={() => navigate('/lectura')} className="border-mint/30">
            <span className="text-2xl">📖</span>
            <h3 className="font-heading font-extrabold text-sm mt-1">{t('read_title').replace('📖 ', '')}</h3>
            <p className="text-[11px] text-fg-muted leading-snug mt-0.5">{t('read_desc')}</p>
          </Card>
        </motion.div>

        {/* Modules */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-heading font-extrabold">{t('dash_modules')}</h3>
            <button onClick={() => navigate('/modulos')} className="text-xs font-bold text-accent">
              {t('dash_view_all')}
            </button>
          </div>

          <div className="space-y-2.5">
            {MODULES.map((mod, i) => {
              const modProgress = progress.filter((p) => p.module === mod.id);
              const completedLevels = modProgress.filter((p) => p.stars > 0).length;
              const pct = (completedLevels / mod.levels) * 100;

              return (
                <motion.div
                  key={mod.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.05 }}
                >
                  <Card hover onClick={() => navigate(`/modulos/${mod.id}`)}>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl w-10 h-10 flex items-center justify-center rounded-[12px]"
                        style={{ backgroundColor: mod.colorPale }}>
                        {mod.icon}
                      </span>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-heading font-extrabold text-sm">{t(MODULE_TEXT[mod.id].name)}</h4>
                        <p className="text-xs text-fg-muted truncate">{t(MODULE_TEXT[mod.id].desc)}</p>
                        <div className="mt-1.5">
                          <ProgressBar value={pct} color={mod.color} height={4} />
                        </div>
                      </div>
                      <span className="text-xs font-bold text-fg-muted">{completedLevels}/{mod.levels}</span>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
