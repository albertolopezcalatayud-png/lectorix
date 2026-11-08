import { motion } from 'framer-motion';
import { useAppStore } from '@/stores/useAppStore';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';

interface AchievementDef {
  id: string;
  icon: string;
  title: string;
  description: string;
  check: (stats: { totalXP: number; totalStars: number; completedLevels: number; streak: number; attempts: number; modulesStarted: number }) => boolean;
}

const ACHIEVEMENTS: AchievementDef[] = [
  { id: 'first_step', icon: '👣', title: 'Primer paso', description: 'Completa tu primer ejercicio', check: (s) => s.attempts >= 1 },
  { id: 'star_collector', icon: '⭐', title: 'Coleccionista', description: 'Consigue 10 estrellas', check: (s) => s.totalStars >= 10 },
  { id: 'star_master', icon: '🌟', title: 'Maestro estelar', description: 'Consigue 50 estrellas', check: (s) => s.totalStars >= 50 },
  { id: 'xp_100', icon: '💎', title: 'Centenario', description: 'Acumula 100 XP', check: (s) => s.totalXP >= 100 },
  { id: 'xp_500', icon: '💠', title: 'Medio millar', description: 'Acumula 500 XP', check: (s) => s.totalXP >= 500 },
  { id: 'xp_1000', icon: '🏆', title: 'Leyenda', description: 'Acumula 1000 XP', check: (s) => s.totalXP >= 1000 },
  { id: 'streak_3', icon: '🔥', title: 'En racha', description: '3 días seguidos practicando', check: (s) => s.streak >= 3 },
  { id: 'streak_7', icon: '🔥', title: 'Semana perfecta', description: '7 días seguidos practicando', check: (s) => s.streak >= 7 },
  { id: 'streak_30', icon: '🔥', title: 'Imparable', description: '30 días seguidos practicando', check: (s) => s.streak >= 30 },
  { id: 'explorer', icon: '🧭', title: 'Explorador', description: 'Prueba los 5 módulos', check: (s) => s.modulesStarted >= 5 },
  { id: 'level_5', icon: '🎓', title: 'Graduado', description: 'Completa 5 niveles', check: (s) => s.completedLevels >= 5 },
  { id: 'level_15', icon: '🏅', title: 'Campeón', description: 'Completa 15 niveles', check: (s) => s.completedLevels >= 15 },
];

export default function Achievements() {
  const progress = useAppStore((s) => s.progress);
  const user = useAppStore((s) => s.user);

  const stats = {
    totalXP: user?.total_xp || 0,
    totalStars: progress.reduce((sum, p) => sum + p.stars, 0),
    completedLevels: progress.filter((p) => p.stars > 0).length,
    streak: user?.streak_days || 0,
    attempts: progress.reduce((sum, p) => sum + p.attempts, 0),
    modulesStarted: new Set(progress.map((p) => p.module)).size,
  };

  const unlocked = ACHIEVEMENTS.filter((a) => a.check(stats));
  const locked = ACHIEVEMENTS.filter((a) => !a.check(stats));

  return (
    <div className="min-h-screen pb-24">
      <Header title="Logros" />

      <div className="px-4 py-5 max-w-lg mx-auto">
        <p className="text-sm text-fg-muted mb-4">
          {unlocked.length} de {ACHIEVEMENTS.length} logros desbloqueados
        </p>

        {/* Unlocked */}
        {unlocked.length > 0 && (
          <div className="mb-6">
            <h3 className="font-heading font-extrabold text-xs uppercase text-fg-muted mb-2">Desbloqueados</h3>
            <div className="grid grid-cols-3 gap-2.5">
              {unlocked.map((a, i) => (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="text-center py-4">
                    <span className="text-3xl block mb-1">{a.icon}</span>
                    <p className="font-heading font-extrabold text-[11px] leading-tight">{a.title}</p>
                    <p className="text-[9px] text-fg-muted mt-0.5">{a.description}</p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Locked */}
        {locked.length > 0 && (
          <div>
            <h3 className="font-heading font-extrabold text-xs uppercase text-fg-muted mb-2">Por desbloquear</h3>
            <div className="grid grid-cols-3 gap-2.5">
              {locked.map((a) => (
                <Card key={a.id} className="text-center py-4 opacity-40">
                  <span className="text-3xl block mb-1 grayscale">🔒</span>
                  <p className="font-heading font-extrabold text-[11px] leading-tight">{a.title}</p>
                  <p className="text-[9px] text-fg-muted mt-0.5">{a.description}</p>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
