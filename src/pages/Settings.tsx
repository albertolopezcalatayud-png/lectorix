import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/stores/useAppStore';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { isSoundEnabled, setSoundEnabled } from '@/services/sounds';
import { isTTSEnabled, setTTSEnabled, isTTSAvailable, getTTSRate, setTTSRate } from '@/services/tts';

export default function Settings() {
  const navigate = useNavigate();
  const theme = useAppStore((s) => s.theme);
  const setTheme = useAppStore((s) => s.setTheme);
  const language = useAppStore((s) => s.language);
  const setLanguage = useAppStore((s) => s.setLanguage);
  const user = useAppStore((s) => s.user);
  const setUser = useAppStore((s) => s.setUser);

  const [soundOn, setSoundOn] = useState(isSoundEnabled());
  const [ttsOn, setTtsOn] = useState(isTTSEnabled());
  const [ttsRate, setTtsRate] = useState(getTTSRate());

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

        {/* Audio */}
        <Card>
          <h3 className="font-heading font-extrabold text-sm mb-3">Audio</h3>
          <div className="space-y-3">
            {/* Sound effects toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">🔊</span>
                <span className="text-sm font-bold">Efectos de sonido</span>
              </div>
              <button
                onClick={() => {
                  const next = !soundOn;
                  setSoundOn(next);
                  setSoundEnabled(next);
                }}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  soundOn ? 'bg-accent' : 'bg-border'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                    soundOn ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* TTS toggle */}
            {isTTSAvailable() && (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🗣️</span>
                    <span className="text-sm font-bold">Leer en voz alta</span>
                  </div>
                  <button
                    onClick={() => {
                      const next = !ttsOn;
                      setTtsOn(next);
                      setTTSEnabled(next);
                    }}
                    className={`relative w-11 h-6 rounded-full transition-colors ${
                      ttsOn ? 'bg-accent' : 'bg-border'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                        ttsOn ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* TTS Speed */}
                {ttsOn && (
                  <div className="pl-8">
                    <div className="flex items-center justify-between text-xs text-fg-muted mb-1">
                      <span>Velocidad de lectura</span>
                      <span className="font-bold">{ttsRate.toFixed(1)}x</span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="1.5"
                      step="0.1"
                      value={ttsRate}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        setTtsRate(val);
                        setTTSRate(val);
                      }}
                      className="w-full accent-accent"
                    />
                    <div className="flex justify-between text-[10px] text-fg-muted">
                      <span>🐢 Lento</span>
                      <span>🐇 Rápido</span>
                    </div>
                  </div>
                )}
              </>
            )}
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
