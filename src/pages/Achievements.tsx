import { motion } from 'framer-motion';
import { useAppStore } from '@/stores/useAppStore';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';

interface AchievementDef {
  id: string;
  icon: string;
  title: string;
  description: string;
  check: (stats: Stats) => boolean;
  progress?: (stats: Stats) => { current: number; target: number };
  color: string;
}

interface Stats {
  totalXP: number;
  totalStars: number;
  completedLevels: number;
  streak: number;
  attempts: number;
  modulesStarted: number;
}

const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: 'first_step', icon: '👣', title: 'Primer paso', description: 'Completa tu primer ejercicio',
    check: (s) => s.attempts >= 1, progress: (s) => ({ current: Math.min(s.attempts, 1), target: 1 }),
    color: '#8B5CF6',
  },
  {
    id: 'star_collector', icon: '⭐', title: 'Coleccionista', description: 'Consigue 10 estrellas',
    check: (s) => s.totalStars >= 10, progress: (s) => ({ current: Math.min(s.totalStars, 10), target: 10 }),
    color: '#FBBF24',
  },
  {
    id: 'star_master', icon: '🌟', title: 'Maestro estelar', description: 'Consigue 50 estrellas',
    check: (s) => s.totalStars >= 50, progress: (s) => ({ current: Math.min(s.totalStars, 50), target: 50 }),
    color: '#FBBF24',
  },
  {
    id: 'xp_100', icon: '💎', title: 'Centenario', description: 'Acumula 100 XP',
    check: (s) => s.totalXP >= 100, progress: (s) => ({ current: Math.min(s.totalXP, 100), target: 100 }),
    color: '#38BDF8',
  },
  {
    id: 'xp_500', icon: '💠', title: 'Medio millar', description: 'Acumula 500 XP',
    check: (s) => s.totalXP >= 500, progress: (s) => ({ current: Math.min(s.totalXP, 500), target: 500 }),
    color: '#38BDF8',
  },
  {
    id: 'xp_1000', icon: '🏆', title: 'Leyenda', description: 'Acumula 1000 XP',
    check: (s) => s.totalXP >= 1000, progress: (s) => ({ current: Math.min(s.totalXP, 1000), target: 1000 }),
    color: '#FB923C',
  },
  {
    id: 'streak_3', icon: '🔥', title: 'En racha', description: '3 días seguidos practicando',
    check: (s) => s.streak >= 3, progress: (s) => ({ current: Math.min(s.streak, 3), target: 3 }),
    color: '#F87171',
  },
  {
    id: 'streak_7', icon: '🔥', title: 'Semana perfecta', description: '7 días seguidos',
    check: (s) => s.streak >= 7, progress: (s) => ({ current: Math.min(s.streak, 7), target: 7 }),
    color: '#F87171',
  },
  {
    id: 'streak_30', icon: '🔥', title: 'Imparable', description: '30 días seguidos',
    check: (s) => s.streak >= 30, progress: (s) => ({ current: Math.min(s.streak, 30), target: 30 }),
    color: '#F87171',
  },
  {
    id: 'explorer', icon: '🧭', title: 'Explorador', description: 'Prueba los 5 módulos',
    check: (s) => s.modulesStarted >= 5, progress: (s) => ({ current: Math.min(s.modulesStarted, 5), target: 5 }),
    color: '#34D399',
  },
  {
    id: 'level_5', icon: '🎓', title: 'Graduado', description: 'Completa 5 niveles',
    check: (s) => s.completedLevels >= 5, progress: (s) => ({ current: Math.min(s.completedLevels, 5), target: 5 }),
    color: '#A78BFA',
  },
  {
    id: 'level_15', icon: '🏅', title: 'Campeón', description: 'Completa 15 niveles',
    check: (s) => s.completedLevels >= 15, progress: (s) => ({ current: Math.min(s.completedLevels, 15), target: 15 }),
    color: '#A78BFA',
  },
];

function BadgeRing({ progress, color, size = 72, children }: { progress: number; color: string; size?: number; children: React.ReactNode }) {
  const strokeWidth = 3;
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - Math.min(progress, 1));

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="absolute inset-0 -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" className="stroke-border" strokeWidth={strokeWidth} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}

export default function Achievements() {
  const progress = useAppStore((s) => s.progress);
  const user = useAppStore((s) => s.user);

  const stats: Stats = {
    totalXP: user?.total_xp || 0,
    totalStars: progress.reduce((sum, p) => sum + p.stars, 0),
    completedLevels: progress.filter((p) => p.stars > 0).length,
    streak: user?.streak_days || 0,
    attempts: progress.reduce((sum, p) => sum + p.attempts, 0),
    modulesStarted: new Set(progress.map((p) => p.module)).size,
  };

  const unlocked = ACHIEVEMENTS.filter((a) => a.check(stats));
  const locked = ACHIEVEMENTS.filter((a) => !a.check(stats));
  const totalPct = Math.round((unlocked.length / ACHIEVEMENTS.length) * 100);

  return (
    <div className="min-h-screen pb-24">
      <Header title="Logros" />

      <div className="px-4 py-5 max-w-lg mx-auto">
        {/* Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-6"
        >
          <BadgeRing progress={totalPct / 100} color="#8B5CF6" size={64}>
            <span className="font-heading font-black text-sm text-accent">{totalPct}%</span>
          </BadgeRing>
          <div>
            <h2 className="font-heading font-black text-lg">
              {unlocked.length} de {ACHIEVEMENTS.length}
            </h2>
            <p className="text-xs text-fg-muted">logros desbloqueados</p>
          </div>
        </motion.div>

        {/* Unlocked */}
        {unlocked.length > 0 && (
          <div className="mb-6">
            <h3 className="font-heading font-extrabold text-xs uppercase text-fg-muted mb-3">
              Desbloqueados 🎉
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {unlocked.map((a, i) => (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  transition={{ delay: i * 0.06, type: 'spring', stiffness: 200 }}
                >
                  <Card className="text-center py-3 relative overflow-hidden">
                    {/* Shimmer effect */}
                    <motion.div
                      className="absolute inset-0 opacity-10"
                      style={{
                        background: `linear-gradient(135deg, transparent 40%, ${a.color} 50%, transparent 60%)`,
                        backgroundSize: '200% 200%',
                      }}
                      animate={{
                        backgroundPosition: ['200% 200%', '-200% -200%'],
                      }}
                      transition={{
                        repeat: Infinity,
                        duration: 3,
                        delay: i * 0.3,
                        ease: 'linear',
                      }}
                    />
                    <div className="relative">
                      <BadgeRing progress={1} color={a.color} size={52}>
                        <span className="text-2xl">{a.icon}</span>
                      </BadgeRing>
                    </div>
                    <p className="font-heading font-extrabold text-[11px] leading-tight mt-1.5 relative">
                      {a.title}
                    </p>
                    <p className="text-[9px] text-fg-muted mt-0.5 relative">{a.description}</p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Locked */}
        {locked.length > 0 && (
          <div>
            <h3 className="font-heading font-extrabold text-xs uppercase text-fg-muted mb-3">
              Por desbloquear 🔒
            </h3>
            <div className="space-y-2">
              {locked.map((a, i) => {
                const prog = a.progress?.(stats);
                const pct = prog ? prog.current / prog.target : 0;

                return (
                  <motion.div
                    key={a.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.04 }}
                  >
                    <Card className="flex items-center gap-3 py-2.5 opacity-70">
                      <BadgeRing progress={pct} color={a.color} size={44}>
                        <span className="text-lg grayscale">{a.icon}</span>
                      </BadgeRing>
                      <div className="flex-1 min-w-0">
                        <p className="font-heading font-extrabold text-sm">{a.title}</p>
                        <p className="text-[10px] text-fg-muted">{a.description}</p>
                        {prog && (
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
                              <motion.div
                                className="h-full rounded-full"
                                style={{ backgroundColor: a.color }}
                                initial={{ width: 0 }}
                                animate={{ width: `${pct * 100}%` }}
                                transition={{ delay: 0.5 + i * 0.04, duration: 0.5 }}
                              />
                            </div>
                            <span className="text-[9px] font-bold text-fg-muted">
                              {prog.current}/{prog.target}
                            </span>
                          </div>
                        )}
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
