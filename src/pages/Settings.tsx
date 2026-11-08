import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/stores/useAppStore';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';

export default function Settings() {
  const navigate = useNavigate();
  const theme = useAppStore((s) => s.theme);
  const setTheme = useAppStore((s) => s.setTheme);
  const language = useAppStore((s) => s.language);
  const setLanguage = useAppStore((s) => s.setLanguage);
  const user = useAppStore((s) => s.user);
  const setUser = useAppStore((s) => s.setUser);

  const themes = [
    { value: 'system' as const, label: 'Automático', icon: '💻' },
    { value: 'light' as const, label: 'Claro', icon: '☀️' },
    { value: 'dark' as const, label: 'Oscuro', icon: '🌙' },
  ];

  const languages = [
    { value: 'es' as const, label: 'Español', flag: '🇪🇸' },
    { value: 'ca' as const, label: 'Català', flag: '🏴' },
    { value: 'en' as const, label: 'English', flag: '🇬🇧' },
  ];

  return (
    <div className="min-h-screen pb-24">
      <Header title="Ajustes" showBack />

      <div className="px-4 py-5 max-w-lg mx-auto space-y-4">
        {/* Theme */}
        <Card>
          <h3 className="font-heading font-extrabold text-sm mb-3">Apariencia</h3>
          <div className="flex gap-2">
            {themes.map((t) => (
              <button
                key={t.value}
                onClick={() => setTheme(t.value)}
                className={`flex-1 py-2.5 px-3 rounded-xl text-center text-sm font-bold transition-colors ${
                  theme === t.value
                    ? 'bg-accent text-white'
                    : 'bg-bg border border-border'
                }`}
              >
                <span className="block text-lg mb-0.5">{t.icon}</span>
                {t.label}
              </button>
            ))}
          </div>
        </Card>

        {/* Language */}
        <Card>
          <h3 className="font-heading font-extrabold text-sm mb-3">Idioma</h3>
          <div className="space-y-1.5">
            {languages.map((l) => (
              <button
                key={l.value}
                onClick={() => setLanguage(l.value)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                  language === l.value
                    ? 'bg-accent-pale text-accent border border-accent/20'
                    : 'bg-bg border border-border'
                }`}
              >
                <span className="text-lg">{l.flag}</span>
                {l.label}
                {language === l.value && <span className="ml-auto">✓</span>}
              </button>
            ))}
          </div>
        </Card>

        {/* Account */}
        <Card>
          <h3 className="font-heading font-extrabold text-sm mb-3">Cuenta</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-fg-muted">Email</span>
              <span className="font-bold">{user?.email || 'No registrado'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-fg-muted">Plan</span>
              <span className="font-bold">{user?.plan === 'premium' ? 'Premium' : 'Gratuito'}</span>
            </div>
          </div>
          {user?.plan !== 'premium' && (
            <button
              onClick={() => navigate('/premium')}
              className="w-full mt-3 py-2.5 rounded-xl bg-accent text-white font-bold text-sm"
            >
              Hazte Premium ⭐
            </button>
          )}
        </Card>

        {/* Danger zone */}
        <Card>
          <h3 className="font-heading font-extrabold text-sm mb-3 text-red">Zona peligrosa</h3>
          <button
            onClick={() => {
              if (confirm('¿Seguro que quieres borrar todo tu progreso? Esta acción no se puede deshacer.')) {
                setUser(null);
                navigate('/');
              }
            }}
            className="w-full py-2.5 rounded-xl border border-red/30 text-red font-bold text-sm"
          >
            Borrar progreso
          </button>
        </Card>

        {/* App info */}
        <div className="text-center text-xs text-fg-muted pt-2">
          <p>Lectorix v1.0.0</p>
          <p className="mt-1">
            <button onClick={() => navigate('/legal/privacidad')} className="underline">Privacidad</button>
            {' · '}
            <button onClick={() => navigate('/legal/terminos')} className="underline">Términos</button>
          </p>
        </div>
      </div>
    </div>
  );
}
