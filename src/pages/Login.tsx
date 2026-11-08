import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppStore } from '@/stores/useAppStore';
import { Button } from '@/components/ui/Button';

export default function Login() {
  const navigate = useNavigate();
  const setUser = useAppStore((s) => s.setUser);
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Offline-first: create local user profile
    // In production this would call Supabase auth
    setTimeout(() => {
      setUser({
        id: crypto.randomUUID(),
        display_name: mode === 'register' ? name : email.split('@')[0],
        email,
        avatar: '🧑‍🎓',
        plan: 'free',
        total_xp: 0,
        streak_days: 0,
        last_session: new Date().toISOString(),
        created_at: new Date().toISOString(),
      });
      setLoading(false);
      navigate('/', { replace: true });
    }, 800);
  };

  const handleSkip = () => {
    setUser({
      id: crypto.randomUUID(),
      display_name: 'Estudiante',
      email: '',
      avatar: '🧑‍🎓',
      plan: 'free',
      total_xp: 0,
      streak_days: 0,
      last_session: new Date().toISOString(),
      created_at: new Date().toISOString(),
    });
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="font-heading font-black text-4xl text-accent mb-1">Lectorix</h1>
        <p className="text-sm text-fg-muted">Aprende a leer y escribir mejor</p>
      </motion.div>

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-3"
      >
        {mode === 'register' && (
          <input
            type="text"
            placeholder="Nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl bg-bg-card border border-border text-sm font-medium focus:outline-none focus:border-accent"
          />
        )}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-4 py-3 rounded-xl bg-bg-card border border-border text-sm font-medium focus:outline-none focus:border-accent"
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          className="w-full px-4 py-3 rounded-xl bg-bg-card border border-border text-sm font-medium focus:outline-none focus:border-accent"
        />

        <Button type="submit" fullWidth loading={loading}>
          {mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
        </Button>

        <button
          type="button"
          onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
          className="w-full text-center text-sm text-accent font-bold py-2"
        >
          {mode === 'login' ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
        </button>
      </motion.form>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        onClick={handleSkip}
        className="mt-6 text-xs text-fg-muted underline"
      >
        Continuar sin cuenta
      </motion.button>
    </div>
  );
}
