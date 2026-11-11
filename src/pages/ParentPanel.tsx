import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppStore, useLevelCount, usePracticeLang } from '@/stores/useAppStore';
import { calculateXPLevel } from '@/services/gamification';
import {MODULES, MODULE_TEXT } from '@/data/modules';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Stars } from '@/components/ui/Stars';
import { ModuleBarChart } from '@/components/charts/ModuleBarChart';
import { SkillRadar } from '@/components/charts/SkillRadar';
import { generateParentReport, downloadReport, printReport } from '@/services/pdfExport';
import { useI18n } from '@/i18n';
import { WeeklySummary, HomeTips, useWeeklyLines, FamilyLanguagePicker } from '@/components/family/WeeklySummary';
import { StartingPoint } from '@/components/family/StartingPoint';
import { ReadAloudSetting } from '@/components/family/ReadAloudSetting';
import { SkillMap } from '@/components/skills/SkillMap';
import { useExerciseIndex, skillStats } from '@/services/skills';
import { skillNameKey } from '@/data/skills';

export default function ParentPanel() {
  const navigate = useNavigate();
  const user = useAppStore((s) => s.user);
  const levelCount = useLevelCount();
  const progress = useAppStore((s) => s.progress);
  const totalXP = user?.total_xp || 0;
  const { level } = calculateXPLevel(totalXP);
  const { t, language } = useI18n();
  const weekly = useWeeklyLines(true);
  const skillIndex = useExerciseIndex(usePracticeLang());
  const skillLines = (() => {
    if (!skillIndex) return undefined;
    const st = skillStats(useAppStore.getState().sessionHistory, skillIndex);
    const weak = st.filter((s) => s.status === 'weak').slice(0, 3).map((s) => `${t(skillNameKey(s.id))} (${s.pct}%)`);
    const strong = [...st].reverse().filter((s) => s.status === 'strong').slice(0, 3).map((s) => `${t(skillNameKey(s.id))} (${s.pct}%)`);
    const lines = [];
    if (weak.length) lines.push(`${t('skill_map_weak')}: ${weak.join(', ')}`);
    if (strong.length) lines.push(`${t('skill_map_strong')}: ${strong.join(', ')}`);
    return { title: t('skill_map_title'), lines };
  })();

  const sessionHistory = useAppStore((s) => s.sessionHistory);
  const totalStars = progress.reduce((sum, p) => sum + p.stars, 0);
  const maxStars = MODULES.length * levelCount * 3;
  const completedLevels = progress.filter((p) => p.stars > 0).length;
  const totalLevels = MODULES.length * levelCount;
  const avgScore = progress.length > 0
    ? Math.round(progress.reduce((sum, p) => sum + p.best_score, 0) / progress.length)
    : 0;

  // Compute average time per exercise from session history
  const sessionsWithTime = sessionHistory.filter(s => s.avg_time_per_exercise && s.avg_time_per_exercise > 0);
  const overallAvgTime = sessionsWithTime.length > 0
    ? Math.round(sessionsWithTime.reduce((s, r) => s + (r.avg_time_per_exercise || 0), 0) / sessionsWithTime.length / 1000)
    : 0;

  return (
    <div className="min-h-screen pb-24">
      <Header title={t('parent_title')} showBack />

      <div className="px-4 py-5 max-w-lg mx-auto space-y-4">
        {/* Export buttons */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2 justify-end">
          <button
            onClick={() => {
              const html = generateParentReport({ user, progress, language, weekly, skills: skillLines, levelCount });
              const name = user?.display_name || 'estudiante';
              const date = new Date().toISOString().slice(0, 10);
              downloadReport(html, `informe-lectorix-${name}-${date}.html`);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent text-white text-xs font-bold hover:bg-accent/90 transition-colors"
          >
            {t('parent_download')}
          </button>
          <button
            onClick={() => {
              const html = generateParentReport({ user, progress, language, weekly, skills: skillLines, levelCount });
              printReport(html);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-bg-card border border-border text-xs font-bold hover:bg-accent-pale/30 transition-colors"
          >
            {t('parent_print')}
          </button>
        </motion.div>

        {/* Student summary */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="bg-accent-pale/30 border-accent/20">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-accent-pale flex items-center justify-center text-3xl">
                {user?.avatar || '🧑‍🎓'}
              </div>
              <div>
                <h2 className="font-heading font-black text-lg">{user?.display_name || t('parent_student')}</h2>
                <p className="text-xs text-fg-muted">{t('dash_level', { level })} · {totalXP} XP · 🔥 {t('parent_days', { n: user?.streak_days || 0 })}</p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Weekly plain-language summary */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <div className="space-y-3">
            <FamilyLanguagePicker />
            <WeeklySummary />
          </div>
        </motion.div>

        {/* Family guide */}
        <Card hover onClick={() => navigate('/guia-familias')} className="border-sky/30">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🧭</span>
            <div className="flex-1">
              <h3 className="font-heading font-extrabold text-sm">{t('hil_family_title')}</h3>
              <p className="text-xs text-fg-muted">{t('hil_family_desc')}</p>
            </div>
            <span className="text-accent font-extrabold">→</span>
          </div>
        </Card>

        <ReadAloudSetting />

        {/* Global stats */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <h3 className="font-heading font-extrabold text-sm mb-3">{t('parent_summary')}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-heading font-black text-accent">{avgScore}%</div>
                <div className="text-[10px] text-fg-muted">{t('parent_avg_score')}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-heading font-black text-yellow">⭐ {totalStars}/{maxStars}</div>
                <div className="text-[10px] text-fg-muted">{t('parent_stars')}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-heading font-black text-mint">{completedLevels}/{totalLevels}</div>
                <div className="text-[10px] text-fg-muted">{t('parent_levels')}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-heading font-black text-sky">
                  {progress.reduce((s, p) => s + p.attempts, 0)}
                </div>
                <div className="text-[10px] text-fg-muted">{t('parent_sessions')}</div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Module Progress Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card>
            <h3 className="font-heading font-extrabold text-sm mb-3">{t('parent_module_progress')}</h3>
            <ModuleBarChart
              data={MODULES.map((mod) => {
                const modProgress = progress.filter((p) => p.module === mod.id);
                const completed = modProgress.filter((p) => p.stars > 0).length;
                return {
                  id: mod.id,
                  name: t(MODULE_TEXT[mod.id].name),
                  icon: mod.icon,
                  color: mod.color,
                  value: Math.round((completed / levelCount) * 100),
                };
              })}
            />
          </Card>
        </motion.div>

        {/* Skill Radar */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <h3 className="font-heading font-extrabold text-sm mb-3">{t('parent_skill_map')}</h3>
            <SkillRadar
              skills={MODULES.map((mod) => {
                const modProgress = progress.filter((p) => p.module === mod.id);
                const modAvg = modProgress.length > 0
                  ? Math.round(modProgress.reduce((s, p) => s + p.best_score, 0) / modProgress.length)
                  : 0;
                return {
                  label: t(MODULE_TEXT[mod.id].name).split(' ')[0],
                  value: modAvg,
                  color: mod.color,
                };
              })}
            />
            <p className="text-[10px] text-fg-muted text-center mt-2">
              {t('parent_skill_avg')}
            </p>
          </Card>
        </motion.div>

        {/* Time statistics */}
        {sessionsWithTime.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}>
            <Card>
              <h3 className="font-heading font-extrabold text-sm mb-3">{t('parent_time_by_type')}</h3>
              <div className="text-center mb-3">
                <div className="text-2xl font-heading font-black text-sky">{overallAvgTime}s</div>
                <div className="text-[10px] text-fg-muted">{t('parent_time_per_ex')}</div>
              </div>
              <div className="space-y-2">
                {MODULES.map((mod) => {
                  const modSessions = sessionsWithTime.filter(s => s.module === mod.id);
                  const modAvgTime = modSessions.length > 0
                    ? Math.round(modSessions.reduce((s, r) => s + (r.avg_time_per_exercise || 0), 0) / modSessions.length / 1000)
                    : 0;
                  if (modAvgTime === 0) return null;
                  const maxTime = 30; // 30s scale
                  return (
                    <div key={mod.id} className="flex items-center gap-2">
                      <span className="text-xs w-20 truncate">{mod.icon} {t(MODULE_TEXT[mod.id].name).split(' ')[0]}</span>
                      <div className="flex-1 h-3 bg-border rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${Math.min(100, (modAvgTime / maxTime) * 100)}%`,
                            backgroundColor: mod.color,
                          }}
                        />
                      </div>
                      <span className="text-xs font-bold w-8 text-right">{modAvgTime}s</span>
                    </div>
                  );
                })}
              </div>
            </Card>
          </motion.div>
        )}

        {/* Starting level per area, adjustable */}
        <SkillMap />

        <StartingPoint />

        {/* Per-module detail */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <Card>
            <h3 className="font-heading font-extrabold text-sm mb-3">{t('parent_detail')}</h3>
            <div className="space-y-4">
              {MODULES.map((mod) => {
                const modProgress = progress.filter((p) => p.module === mod.id);
                const completed = modProgress.filter((p) => p.stars > 0).length;
                const modStars = modProgress.reduce((s, p) => s + p.stars, 0);
                const modAvg = modProgress.length > 0
                  ? Math.round(modProgress.reduce((s, p) => s + p.best_score, 0) / modProgress.length)
                  : 0;

                return (
                  <div key={mod.id}>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-lg">{mod.icon}</span>
                      <span className="font-heading font-extrabold text-sm">{t(MODULE_TEXT[mod.id].name)}</span>
                      <span className="ml-auto text-xs text-fg-muted">{t('parent_levels_label', { n: completed, total: levelCount })}</span>
                    </div>
                    <ProgressBar value={(completed / levelCount) * 100} color={mod.color} height={5} />
                    <div className="flex gap-4 mt-1 text-[10px] text-fg-muted">
                      <span>⭐ {modStars}/{levelCount * 3}</span>
                      <span>{t('parent_avg_label', { score: modAvg })}</span>
                      <span>{t('parent_attempts_label', { n: modProgress.reduce((s, p) => s + p.attempts, 0) })}</span>
                    </div>

                    {/* Level breakdown */}
                    {modProgress.length > 0 && (
                      <div className="mt-2 ml-7 space-y-1">
                        {modProgress.map((p) => (
                          <div key={`${p.module}-${p.level}`} className="flex items-center gap-2 text-[11px]">
                            <span className="text-fg-muted w-16">{t('parent_level_label', { level: p.level })}</span>
                            <Stars count={p.stars} size={10} />
                            <span className="font-bold">{p.best_score}%</span>
                            <span className="text-fg-muted">({p.attempts}x)</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        </motion.div>

        {/* Offline activities for home */}
        <HomeTips />

        {/* Recommendations */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="border-mint/20 bg-mint-pale/20">
            <h3 className="font-heading font-extrabold text-sm mb-2">{t('parent_recs')}</h3>
            <ul className="text-xs text-fg-muted space-y-1.5">
              {completedLevels === 0 && (
                <li>• {t('parent_rec_first')}</li>
              )}
              {(user?.streak_days || 0) < 3 && (
                <li>• {t('parent_rec_practice')}</li>
              )}
              {avgScore > 0 && avgScore < 70 && (
                <li>• {t('parent_rec_low')}</li>
              )}
              {avgScore >= 80 && (
                <li>• {t('parent_rec_great')}</li>
              )}
              <li>• {t('parent_rec_important')}</li>
            </ul>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
