import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppStore } from '@/stores/useAppStore';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

const FEATURES = [
  { icon: '📚', title: 'Todos los módulos', desc: '5 módulos con 5 niveles cada uno' },
  { icon: '🎯', title: '750 ejercicios', desc: 'Biblioteca completa de ejercicios' },
  { icon: '📊', title: 'Estadísticas avanzadas', desc: 'Seguimiento detallado del progreso' },
  { icon: '👨‍👩‍👧', title: 'Panel para padres', desc: 'Monitoriza el avance de tus hijos' },
  { icon: '🔊', title: 'Lectura en voz alta', desc: 'TTS para todos los ejercicios' },
  { icon: '🚫', title: 'Sin anuncios', desc: 'Experiencia limpia y sin distracciones' },
];

export default function Premium() {
  const navigate = useNavigate();
  const isPremium = useAppStore((s) => s.isPremium);
  const setSubscription = useAppStore((s) => s.setSubscription);

  if (isPremium()) {
    return (
      <div className="min-h-screen pb-24">
        <Header title="Premium" showBack />
        <div className="px-4 py-10 max-w-lg mx-auto text-center">
          <span className="text-6xl block mb-4">🎉</span>
          <h2 className="font-heading font-black text-2xl mb-2">¡Ya eres Premium!</h2>
          <p className="text-sm text-fg-muted">Disfruta de todos los contenidos sin límites.</p>
        </div>
      </div>
    );
  }

  const handleSubscribe = (planId: 'individual' | 'family') => {
    // In production this would open Google Play billing
    // For now, simulate subscription
    setSubscription({
      plan_id: planId,
      status: 'active',
      started_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 30 * 86400000).toISOString(),
    });
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen pb-24">
      <Header title="Premium" showBack />

      <div className="px-4 py-5 max-w-lg mx-auto">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <span className="text-5xl block mb-3">⭐</span>
          <h2 className="font-heading font-black text-2xl mb-1">Lectorix Premium</h2>
          <p className="text-sm text-fg-muted">Desbloquea todo el potencial de aprendizaje</p>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <Card>
            <div className="space-y-3">
              {FEATURES.map((f) => (
                <div key={f.title} className="flex items-center gap-3">
                  <span className="text-xl">{f.icon}</span>
                  <div>
                    <p className="text-sm font-bold">{f.title}</p>
                    <p className="text-[11px] text-fg-muted">{f.desc}</p>
                  </div>
                  <span className="ml-auto text-mint text-sm">✓</span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Plans */}
        <div className="space-y-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-accent/30 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-accent text-white text-[9px] font-bold px-3 py-0.5 rounded-bl-lg">
                POPULAR
              </div>
              <h3 className="font-heading font-black text-lg">Individual</h3>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="font-heading font-black text-3xl text-accent">4,99€</span>
                <span className="text-sm text-fg-muted">/mes</span>
              </div>
              <p className="text-xs text-fg-muted mt-1 mb-3">1 estudiante · Todos los contenidos</p>
              <Button fullWidth onClick={() => handleSubscribe('individual')}>
                Suscribirse
              </Button>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <Card>
              <h3 className="font-heading font-black text-lg">Familia</h3>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="font-heading font-black text-3xl">7,99€</span>
                <span className="text-sm text-fg-muted">/mes</span>
              </div>
              <p className="text-xs text-fg-muted mt-1 mb-3">Hasta 4 estudiantes · Todos los contenidos</p>
              <Button variant="secondary" fullWidth onClick={() => handleSubscribe('family')}>
                Suscribirse
              </Button>
            </Card>
          </motion.div>
        </div>

        <p className="text-[10px] text-fg-muted text-center mt-4">
          Cancela cuando quieras. Sin compromiso. Los pagos se procesan a través de Google Play.
        </p>
      </div>
    </div>
  );
}
