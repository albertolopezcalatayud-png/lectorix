import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MODULES } from '@/data/modules';
import { useAppStore } from '@/stores/useAppStore';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Header } from '@/components/layout/Header';

export default function Modules() {
  const navigate = useNavigate();
  const progress = useAppStore((s) => s.progress);

  return (
    <div className="min-h-screen pb-24">
      <Header title="Módulos" showBack />

      <div className="px-4 py-5 max-w-lg mx-auto space-y-3">
        {MODULES.map((mod, i) => {
          const modProgress = progress.filter((p) => p.module === mod.id);
          const completedLevels = modProgress.filter((p) => p.stars > 0).length;
          const totalStars = modProgress.reduce((sum, p) => sum + p.stars, 0);
          const pct = (completedLevels / mod.levels) * 100;

          return (
            <motion.div
              key={mod.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <Card hover onClick={() => navigate(`/modulos/${mod.id}`)} padding="lg">
                <div className="flex items-start gap-4">
                  <div
                    className="w-14 h-14 flex items-center justify-center rounded-2xl text-3xl"
                    style={{ backgroundColor: mod.colorPale }}
                  >
                    {mod.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-heading font-extrabold">{mod.name}</h3>
                    <p className="text-xs text-fg-muted mt-0.5">{mod.description}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <ProgressBar value={pct} color={mod.color} height={6} />
                      <span className="text-xs font-bold text-fg-muted whitespace-nowrap">
                        {completedLevels}/{mod.levels}
                      </span>
                    </div>
                    <div className="flex gap-3 mt-2">
                      <span className="text-xs text-fg-muted">⭐ {totalStars} estrellas</span>
                      <span className="text-xs text-fg-muted">{mod.levels} niveles</span>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
