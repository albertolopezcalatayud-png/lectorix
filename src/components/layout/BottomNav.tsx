import { useLocation, useNavigate } from 'react-router-dom';
import { useI18n } from '@/i18n';
import type { TranslationKey } from '@/i18n';

export const NAV_ITEMS: { path: string; icon: string; labelKey: TranslationKey }[] = [
  { path: '/', icon: '🏠', labelKey: 'nav_home' },
  { path: '/modulos', icon: '📚', labelKey: 'nav_modules' },
  { path: '/reto-diario', icon: '📝', labelKey: 'nav_challenge' },
  { path: '/logros', icon: '🏆', labelKey: 'nav_achievements' },
  { path: '/perfil', icon: '👤', labelKey: 'nav_profile' },
];

/** The navigation is hidden while practising (exercises, readings, dictation…), on phones and on computers alike */
export const showNav = (path: string) =>
  !(path.startsWith('/ejercicio') || path === '/resultados' || path === '/reto-diario' || path === '/dictado' || path.startsWith('/lectura/'));

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useI18n();

  // Hide on exercise pages
  if (!showNav(location.pathname)) return null;

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-bg-card border-t border-border z-50 pb-[env(safe-area-inset-bottom)]">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        {NAV_ITEMS.map((item) => {
          const active = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-colors ${
                active ? 'text-accent' : 'text-fg-muted'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-[10px] font-bold">{t(item.labelKey)}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
