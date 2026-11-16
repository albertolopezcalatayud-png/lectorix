import { useLocation, useNavigate } from 'react-router-dom';
import { NAV_ITEMS, showNav } from './BottomNav';
import { MascotAvatar } from '@/components/mascot/MascotAvatar';
import { useAppStore } from '@/stores/useAppStore';
import { mode, backToPicker, activeProfile } from '@/services/profiles';
import { useI18n } from '@/i18n';

/**
 * Navigation on computers and large tablets (lg and up), instead of the bottom bar:
 * a column on the left, so the page can use the width of the screen.
 */
export function SideNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useI18n();
  const user = useAppStore((s) => s.user);
  const mascot = useAppStore((s) => s.mascot);
  if (!showNav(location.pathname)) return null;
  const group = mode() === 'group';
  const avatar = group ? activeProfile()?.avatar : null;
  return (
    <nav aria-label={t('nav_main')} className="hidden wlg:flex fixed top-0 bottom-0 left-0 w-60 z-40 flex-col bg-bg-card border-r border-border px-4 py-6">
      <button onClick={() => navigate('/')} className="font-heading font-black text-2xl text-accent text-left px-3 mb-6">Lectorix</button>
      <ul className="space-y-1">
        {NAV_ITEMS.map((item) => {
          const active = location.pathname === item.path;
          return (
            <li key={item.path}>
              <button onClick={() => navigate(item.path)} aria-current={active ? 'page' : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold transition-colors ${active ? 'bg-accent-pale text-accent' : 'text-fg-muted hover:bg-surface-alt hover:text-fg'}`}>
                <span className="text-xl" aria-hidden>{item.icon}</span>
                <span className="text-[15px]">{t(item.labelKey)}</span>
              </button>
            </li>
          );
        })}
      </ul>
      <div className="mt-auto space-y-2">
        {group && (
          <button onClick={backToPicker} className="w-full text-left px-3 py-2.5 rounded-xl bg-accent-pale text-sm font-bold">👋 {t('pf_next_student')}</button>
        )}
        <button onClick={() => navigate('/perfil')} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-surface-alt text-left">
          {avatar ? <span className="text-3xl" aria-hidden>{avatar}</span> : <MascotAvatar customization={mascot} size={40} />}
          <span className="min-w-0">
            <span className="block font-heading font-extrabold text-sm truncate">{user?.display_name || t('student_default')}</span>
            <span className="block text-[11px] text-fg-muted">⭐ {t('dash_xp', { xp: user?.total_xp || 0 })}</span>
          </span>
        </button>
      </div>
    </nav>
  );
}

/** Leaves room for the side navigation on large screens when it is shown */
export function NavOffset({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  return <div className={showNav(location.pathname) ? 'wlg:pl-60' : ''}>{children}</div>;
}
