import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/stores/useAppStore';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { isSoundEnabled, setSoundEnabled } from '@/services/sounds';
import { isTTSEnabled, setTTSEnabled, isTTSAvailable, getTTSRate, setTTSRate } from '@/services/tts';
import { useI18n } from '@/i18n';
import notifications from '@/services/notifications';

export default function Settings() {
  const navigate = useNavigate();
  const theme = useAppStore((s) => s.theme);
  const setTheme = useAppStore((s) => s.setTheme);
  const language = useAppStore((s) => s.language);
  const setLanguage = useAppStore((s) => s.setLanguage);
  const user = useAppStore((s) => s.user);
  const setUser = useAppStore((s) => s.setUser);
  const fontFamily = useAppStore((s) => s.fontFamily);
  const setFontFamily = useAppStore((s) => s.setFontFamily);
  const fontSize = useAppStore((s) => s.fontSize);
  const setFontSize = useAppStore((s) => s.setFontSize);
  const highContrast = useAppStore((s) => s.highContrast);
  const setHighContrast = useAppStore((s) => s.setHighContrast);

  const [soundOn, setSoundOn] = useState(isSoundEnabled());
  const [ttsOn, setTtsOn] = useState(isTTSEnabled());
  const [ttsRate, setTtsRate] = useState(getTTSRate());
  const [notifOn, setNotifOn] = useState(notifications.isEnabled() && notifications.getPermission() === 'granted');
  const [notifHour, setNotifHour] = useState(notifications.getReminderHour());
  const { t } = useI18n();

  const themes = [
    { value: 'system' as const, label: t('set_theme_system'), icon: '💻' },
    { value: 'light' as const, label: t('set_theme_light'), icon: '☀️' },
    { value: 'dark' as const, label: t('set_theme_dark'), icon: '🌙' },
  ];

  const languages = [
    { value: 'es' as const, label: 'Español', flag: '🇪🇸' },
    { value: 'ca' as const, label: 'Català', flag: '🏴' },
    { value: 'en' as const, label: 'English', flag: '🇬🇧' },
  ];

  return (
    <div className="min-h-screen pb-24">
      <Header title={t('set_title')} showBack />

      <div className="px-4 py-5 max-w-lg mx-auto space-y-4">
        {/* Theme */}
        <Card>
          <h3 className="font-heading font-extrabold text-sm mb-3">{t('set_display')}</h3>
          <div className="flex gap-2">
            {themes.map((th) => (
              <button
                key={th.value}
                onClick={() => setTheme(th.value)}
                className={`flex-1 py-2.5 px-3 rounded-xl text-center text-sm font-bold transition-colors ${
                  theme === th.value
                    ? 'bg-accent text-white'
                    : 'bg-bg border border-border'
                }`}
              >
                <span className="block text-lg mb-0.5">{th.icon}</span>
                {th.label}
              </button>
            ))}
          </div>
        </Card>

        {/* Language */}
        <Card>
          <h3 className="font-heading font-extrabold text-sm mb-3">{t('set_language')}</h3>
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

        {/* Accessibility */}
        <Card>
          <h3 className="font-heading font-extrabold text-sm mb-3">{t('set_access')}</h3>
          <div className="space-y-4">
            {/* Font family */}
            <div>
              <span className="text-xs text-fg-muted block mb-2">{t('set_font')}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setFontFamily('default')}
                  className={`flex-1 py-2.5 px-3 rounded-xl text-center text-sm font-bold transition-colors ${
                    fontFamily === 'default'
                      ? 'bg-accent text-white'
                      : 'bg-bg border border-border'
                  }`}
                >
                  <span className="block text-base mb-0.5" style={{ fontFamily: 'Nunito, sans-serif' }}>Aa</span>
                  {t('set_font_default')}
                </button>
                <button
                  onClick={() => setFontFamily('dyslexic')}
                  className={`flex-1 py-2.5 px-3 rounded-xl text-center text-sm font-bold transition-colors ${
                    fontFamily === 'dyslexic'
                      ? 'bg-accent text-white'
                      : 'bg-bg border border-border'
                  }`}
                >
                  <span className="block text-base mb-0.5" style={{ fontFamily: 'OpenDyslexic, sans-serif' }}>Aa</span>
                  {t('set_font_dyslexic')}
                </button>
              </div>
              <p className="text-[10px] text-fg-muted mt-1.5">
                La fuente OpenDyslexic facilita la lectura para personas con dislexia
              </p>
            </div>

            {/* Font size */}
            <div>
              <span className="text-xs text-fg-muted block mb-2">{t('set_font_size')}</span>
              <div className="flex gap-1.5">
                {([
                  { value: 'small' as const, label: 'A', size: 'text-xs' },
                  { value: 'normal' as const, label: 'A', size: 'text-sm' },
                  { value: 'large' as const, label: 'A', size: 'text-lg' },
                  { value: 'xlarge' as const, label: 'A', size: 'text-xl' },
                ]).map((s) => (
                  <button
                    key={s.value}
                    onClick={() => setFontSize(s.value)}
                    className={`flex-1 py-2 rounded-xl text-center font-bold transition-colors ${s.size} ${
                      fontSize === s.value
                        ? 'bg-accent text-white'
                        : 'bg-bg border border-border'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* High contrast */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">◑</span>
                <span className="text-sm font-bold">{t('set_contrast')}</span>
              </div>
              <button
                onClick={() => setHighContrast(!highContrast)}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  highContrast ? 'bg-accent' : 'bg-border'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                    highContrast ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </Card>

        {/* Reminders */}
        {notifications.isSupported() && (
          <Card>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">🔔</span>
                <span className="text-sm font-bold">{notifOn ? t('push_enabled') : t('push_enable')}</span>
              </div>
              <button
                onClick={async () => {
                  if (notifOn) {
                    notifications.disable();
                    setNotifOn(false);
                  } else {
                    setNotifOn(await notifications.request());
                  }
                }}
                className={`relative w-11 h-6 rounded-full transition-colors ${notifOn ? 'bg-accent' : 'bg-border'}`}
                aria-label={notifOn ? t('push_disable') : t('push_enable')}
              >
                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${notifOn ? 'left-[22px]' : 'left-0.5'}`} />
              </button>
            </div>
            {notifOn && (
              <div className="flex items-center justify-between mt-3">
                <span className="text-sm text-fg-muted">{t('push_time')}</span>
                <select
                  value={notifHour}
                  onChange={(e) => {
                    const h = parseInt(e.target.value, 10);
                    setNotifHour(h);
                    notifications.setReminderHour(h);
                  }}
                  className="px-2 py-1 rounded-lg border border-border bg-bg-card text-sm font-bold"
                >
                  {Array.from({ length: 15 }, (_, i) => i + 8).map((h) => (
                    <option key={h} value={h}>{h}:00</option>
                  ))}
                </select>
              </div>
            )}
          </Card>
        )}

        {/* Account */}
        <Card>
          <h3 className="font-heading font-extrabold text-sm mb-3">{t('set_account')}</h3>
          <div className="space-y-2">
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
              {t('set_premium')} ⭐
            </button>
          )}
        </Card>

        {/* Privacy policy (required by Google Play to be reachable inside the app) */}
        <Card>
          <a
            href={`${import.meta.env.BASE_URL}privacidad.html`}
            target="_blank"
            rel="noopener"
            className="flex items-center justify-between text-sm font-bold text-accent"
          >
            <span>🔒 {t('set_privacy')}</span>
            <span>↗</span>
          </a>
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
