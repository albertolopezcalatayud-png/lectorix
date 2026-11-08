import { motion } from 'framer-motion';
import { useAppStore } from '@/stores/useAppStore';
import { calculateXPLevel } from '@/services/gamification';
import { MODULES } from '@/data/modules';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Stars } from '@/components/ui/Stars';

export default function ParentPanel() {
  const user = useAppStore((s) => s.user);
  const progress = useAppStore((s) => s.progress);
  const totalXP = user?.total_xp || 0;
  const { level } = calculateXPLevel(totalXP);

  const totalStars = progress.reduce((sum, p) => sum + p.stars, 0);
  const maxStars = MODULES.reduce((sum, m) => sum + m.levels * 3, 0);
  const completedLevels = progress.filter((p) => p.stars > 0).length;
  const totalLevels = MODULES.reduce((sum, m) => sum + m.levels, 0);
  const avgScore = progress.length > 0
    ? Math.round(progress.reduce((sum, p) => sum + p.best_score, 0) / progress.length)
    : 0;

  return (
    <div className="min-h-screen pb-24">
      <Header title="Panel para padres" showBack />

      <div className="px-4 py-5 max-w-lg mx-auto space-y-4">
        {/* Student summary */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="bg-accent-pale/30 border-accent/20">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-accent-pale flex items-center justify-center text-3xl">
                {user?.avatar || '🧑‍🎓'}
              </div>
              <div>
                <h2 className="font-heading font-black text-lg">{user?.display_name || 'Estudiante'}</h2>
                <p className="text-xs text-fg-muted">Nivel {level} · {totalXP} XP · 🔥 {user?.streak_days || 0} días</p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Global stats */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <h3 className="font-heading font-extrabold text-sm mb-3">Resumen general</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-heading font-black text-accent">{avgScore}%</div>
                <div className="text-[10px] text-fg-muted">Puntuación media</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-heading font-black text-yellow">⭐ {totalStars}/{maxStars}</div>
                <div className="text-[10px] text-fg-muted">Estrellas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-heading font-black text-mint">{completedLevels}/{totalLevels}</div>
                <div className="text-[10px] text-fg-muted">Niveles completados</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-heading font-black text-sky">
                  {progress.reduce((s, p) => s + p.attempts, 0)}
                </div>
                <div className="text-[10px] text-fg-muted">Sesiones totales</div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Per-module detail */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card>
            <h3 className="font-heading font-extrabold text-sm mb-3">Detalle por módulo</h3>
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
                      <span className="font-heading font-extrabold text-sm">{mod.name}</span>
                      <span className="ml-auto text-xs text-fg-muted">{completed}/{mod.levels} niveles</span>
                    </div>
                    <ProgressBar value={(completed / mod.levels) * 100} color={mod.color} height={5} />
                    <div className="flex gap-4 mt-1 text-[10px] text-fg-muted">
                      <span>⭐ {modStars}/{mod.levels * 3}</span>
                      <span>Media: {modAvg}%</span>
                      <span>{modProgress.reduce((s, p) => s + p.attempts, 0)} intentos</span>
                    </div>

                    {/* Level breakdown */}
                    {modProgress.length > 0 && (
                      <div className="mt-2 ml-7 space-y-1">
                        {modProgress.map((p) => (
                          <div key={`${p.module}-${p.level}`} className="flex items-center gap-2 text-[11px]">
                            <span className="text-fg-muted w-16">Nivel {p.level}</span>
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

        {/* Recommendations */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="border-mint/20 bg-mint-pale/20">
            <h3 className="font-heading font-extrabold text-sm mb-2">💡 Recomendaciones</h3>
            <ul className="text-xs text-fg-muted space-y-1.5">
              {completedLevels === 0 && (
                <li>• Anima a tu hijo/a a completar su primer nivel para ver su progreso aquí.</li>
              )}
              {(user?.streak_days || 0) < 3 && (
                <li>• Practicar 10-15 minutos diarios mejora significativamente la lectura.</li>
              )}
              {avgScore > 0 && avgScore < 70 && (
                <li>• La puntuación media está por debajo del 70%. Prueba a repetir los niveles para reforzar.</li>
              )}
              {avgScore >= 80 && (
                <li>• ¡Excelente rendimiento! Tu hijo/a está progresando muy bien. 🎉</li>
              )}
              <li>• Los módulos de Fonología y Comprensión Lectora son los más importantes para la dislexia.</li>
            </ul>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
