import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {MODULE_TEXT, getModule, levelNameKey } from '@/data/modules';
import { useAppStore, useLevelCount, usePracticeLang } from '@/stores/useAppStore';
import { levelTag } from '@/data/modules';
import { currentStep } from '@/services/steps';
import { featureLocked } from '@/config/plans';
import { Card } from '@/components/ui/Card';
import { Stars } from '@/components/ui/Stars';
import { Header } from '@/components/layout/Header';
import { useI18n } from '@/i18n';
import { recommendedLevel } from '@/services/review';

export default function Levels() {
  const { moduleId } = useParams<{ moduleId: string }>();
  const navigate = useNavigate();
  const mod = getModule(moduleId || '');
  const progress = useAppStore((s) => s.progress);
  const isLevelUnlocked = useAppStore((s) => s.isLevelUnlocked);
  const isPremium = useAppStore((s) => s.isPremium);
  const startLevel = useAppStore((s) => s.startLevel);
  // Re-render when the starting point changes
  useAppStore((s) => s.startLevels);
  useAppStore((s) => s.schoolStage);
  const levelCount = useLevelCount();
  const lang = usePracticeLang();
  const history = useAppStore((s) => s.sessionHistory);
  const { t } = useI18n();

  if (!mod) {
    navigate('/modulos');
    return null;
  }

  const levels = Array.from({ length: levelCount }, (_, i) => i + 1);
  const start = startLevel(mod.id);
  const recommended = recommendedLevel(progress, mod.id, levelCount, isLevelUnlocked, start);

  return (
    <div className="min-h-screen pb-24">
      <Header title={t(MODULE_TEXT[mod.id].name)} showBack />

      <div className="px-4 py-5 max-w-lg mx-auto">
        {lang === 'en' && (
          <p className="mb-4 px-3 py-2 rounded-xl bg-sky-pale text-[11px] font-bold text-fg">🇬🇧 {t('cefr_note')}</p>
        )}
        {/* Module header */}
        <div className="flex items-center gap-3 mb-6">
          <div
            className="w-14 h-14 flex items-center justify-center rounded-2xl text-3xl"
            style={{ backgroundColor: mod.colorPale }}
          >
            {mod.icon}
          </div>
          <div>
            <h2 className="font-heading font-extrabold text-lg">{t(MODULE_TEXT[mod.id].name)}</h2>
            <p className="text-xs text-fg-muted">{t(MODULE_TEXT[mod.id].desc)}</p>
          </div>
        </div>

        {/* Exam mode button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4"
        >
          <Card
            hover
            onClick={() => {
              if (recommended) {
                navigate(`/ejercicio/${mod.id}/${recommended}`, {
                  state: { examMode: true, examTimeLimit: 5 * 60 * 1000 }, // 5 min
                });
              }
            }}
            className="border-accent/20 bg-accent-pale/20"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">📝</span>
              <div className="flex-1">
                <h3 className="font-heading font-extrabold text-sm">{t('exam_btn')}</h3>
                <p className="text-[10px] text-fg-muted">{t('exam_desc')}</p>
              </div>
              <span className="text-xs font-bold text-accent">→</span>
            </div>
          </Card>
        </motion.div>

        {/* Level cards */}
        <div className="space-y-3">
          {levels.map((level, i) => {
            const unlocked = isLevelUnlocked(mod.id, level);
            const levelProgress = progress.find((p) => p.module === mod.id && p.level === level);
            const needsPremium = level > 1 && featureLocked('allLevels', isPremium());

            return (
              <motion.div
                key={level}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <Card
                  hover={unlocked && !needsPremium}
                  onClick={() => {
                    if (needsPremium) {
                      navigate('/premium');
                    } else if (unlocked) {
                      navigate(`/ejercicio/${mod.id}/${level}`);
                    }
                  }}
                  className={!unlocked ? 'opacity-50' : ''}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 flex items-center justify-center rounded-xl font-heading font-black text-lg"
                      style={{
                        backgroundColor: unlocked ? mod.colorPale : 'var(--color-border)',
                        color: unlocked ? mod.color : 'var(--color-fg-muted)',
                      }}
                    >
                      {unlocked ? level : '🔒'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-heading font-extrabold text-sm">
                          {t('dash_level', { level })} · {t(levelNameKey(level))}{levelTag(lang, level)}
                        </h3>
                        {level === recommended && unlocked && !needsPremium && (
                          <span className="text-[10px] font-extrabold bg-mint-pale text-mint px-2 py-0.5 rounded-full">
                            {t('adapt_recommended')}
                          </span>
                        )}
                        {needsPremium && (
                          <span className="text-[10px] font-extrabold bg-yellow-pale text-yellow px-2 py-0.5 rounded-full">
                            PREMIUM
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-fg-muted mt-0.5">
                        {levelProgress
                          ? t('lvl_best', { score: levelProgress.best_score, attempts: levelProgress.attempts })
                          : t('lvl_info')}
                      </p>
                      {unlocked && levelProgress && (() => {
                        const st = currentStep(history, lang, mod.id, level);
                        return (
                          <div className="flex items-center gap-1.5 mt-1" aria-label={t('step_label', { n: st })}>
                            {[1, 2, 3].map((k) => (
                              <span key={k} className="h-1.5 w-5 rounded-full" style={{ backgroundColor: k <= st ? mod.color : 'var(--color-border)' }} />
                            ))}
                            <span className="text-[10px] font-bold text-fg-muted ml-1">{t('step_label', { n: st })}</span>
                          </div>
                        );
                      })()}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {levelProgress && <Stars count={levelProgress.stars} size={16} />}
                      {unlocked && !needsPremium && (
                        <span className="text-xs font-bold text-accent">
                          {levelProgress ? t('lvl_retry') : t('lvl_start')} →
                        </span>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
