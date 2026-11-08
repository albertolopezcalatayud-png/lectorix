import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppStore } from '@/stores/useAppStore';
import { calculateXPLevel } from '@/services/gamification';
import { MODULES } from '@/data/modules';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Header } from '@/components/layout/Header';

export default function Dashboard() {
  const navigate = useNavigate();
  const user = useAppStore((s) => s.user);
  const progress = useAppStore((s) => s.progress);
  const xpInfo = user ? calculateXPLevel(user.total_xp) : { level: 1, currentXP: 0, nextLevelXP: 100, progress: 0 };

  return (
    <div className="min-h-screen pb-24">
      <Header />

      <div className="px-4 py-5 max-w-lg mx-auto space-y-5">
        {/* Welcome */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h2 className="font-heading font-black text-xl">
            ¡Hola, {user?.display_name || 'Estudiante'}! 👋
          </h2>
          <p className="text-fg-muted text-sm mt-1">¿Listo para practicar hoy?</p>
        </motion.div>

        {/* XP Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <div className="flex items-center justify-between mb-2">
              <span className="font-heading font-extrabold text-sm">Nivel {xpInfo.level}</span>
              <span className="text-xs text-fg-muted">{xpInfo.currentXP}/{xpInfo.nextLevelXP} XP</span>
            </div>
            <ProgressBar value={xpInfo.progress * 100} />
            <div className="flex gap-3 mt-3">
              <div className="flex items-center gap-1.5 text-sm">
                <span>🔥</span>
                <span className="font-bold">{user?.streak_days || 0} días</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm">
                <span>⭐</span>
                <span className="font-bold">{user?.total_xp || 0} XP total</span>
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
                <h3 className="font-heading font-extrabold">Reto del día</h3>
                <p className="text-xs text-fg-muted">5 preguntas aleatorias · Gana 50 XP extra</p>
              </div>
              <span className="text-accent font-extrabold text-sm">Jugar →</span>
            </div>
          </Card>
        </motion.div>

        {/* Modules */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-heading font-extrabold">Módulos</h3>
            <button onClick={() => navigate('/modulos')} className="text-xs font-bold text-accent">
              Ver todos →
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
                        <h4 className="font-heading font-extrabold text-sm">{mod.name}</h4>
                        <p className="text-xs text-fg-muted truncate">{mod.description}</p>
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
